#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deploy.py — 部署 HEYDAY 官网到阿里云（国内）+ GitHub Pages（海外）

流程：文案体检 → 刷新版本号破缓存 → 打包 → SFTP 上传(MD5 门禁)
      → 服务器备份并全量替换 → 线上验证 → git commit & push

常用：
    python3 tools/deploy.py                    # 双站部署（推荐）
    python3 tools/deploy.py -m "更新案例文案"    # 带提交信息
    python3 tools/deploy.py --aliyun-only      # 只更国内站
    python3 tools/deploy.py --github-only      # 只更海外站
    python3 tools/deploy.py --dry-run          # 只打包，不上传不提交
    python3 tools/deploy.py --skip-check       # 跳过文案体检（赶时间用）
"""
import argparse
import datetime
import hashlib
import os
import re
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from i18n_core import read_json

try:
    import paramiko
except ImportError:
    print('需要 paramiko：pip install paramiko')
    sys.exit(1)

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)

C = {'R': '\033[0m', 'G': '\033[32m', 'Y': '\033[33m', 'B': '\033[34m',
     'RED': '\033[31m', 'BOLD': '\033[1m', 'DIM': '\033[2m', 'CY': '\033[36m'}


def log(msg='', color=None):
    print((C.get(color, '') + msg + C['R']) if color else msg)


def step(msg):
    print('\n' + C['BOLD'] + C['CY'] + '══ ' + msg + C['R'])


# --------------------------------------------------------------------------

class Deployer:
    def __init__(self, config_path=None):
        self.cfg = read_json(config_path or os.path.join(HERE, 'config.json')) or {}
        self.ali = self.cfg.get('deploy', {}).get('aliyun', {})
        self.gh = self.cfg.get('deploy', {}).get('github', {})
        self.ver_cfg = self.cfg.get('deploy', {}).get('cdn_version', {})

        self.host = self.ali.get('host', '47.93.48.153')
        self.user = self.ali.get('user', 'root')
        self.pwd = self.ali.get('password') or os.environ.get(
            self.ali.get('password_env', 'HEYDAY_SSH_PASS'), '')
        self.remote_dir = self.ali.get('remote_dir', '/www/wwwroot/heydaygroup')
        self.backup_dir = self.ali.get('backup_dir', '/www/backup')
        self.remote_tmp = self.ali.get('remote_tmp', '/tmp')

        self.stamp = datetime.datetime.now().strftime('%Y%m%d')
        self.cli = None
        self.sftp = None

    # ---------------- SSH ----------------
    def connect(self):
        """连接服务器，带老版 OpenSSH 的算法兼容回退。"""
        if not self.pwd:
            log('  ✗ 缺少服务器密码：请在 tools/config.json 填 deploy.aliyun.password，'
                f'或设置环境变量 {self.ali.get("password_env")}', 'RED')
            return False
        attempts = [
            ('默认', dict(timeout=30, allow_agent=False, look_for_keys=False)),
            ('兼容旧算法', dict(timeout=30, allow_agent=False, look_for_keys=False,
                              disabled_algorithms={'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']})),
            ('兼容旧 kex', dict(timeout=30, allow_agent=False, look_for_keys=False,
                              disabled_algorithms={
                                  'kex': ['diffie-hellman-group16-sha512',
                                          'diffie-hellman-group18-sha512',
                                          'curve25519-sha256',
                                          'curve25519-sha256@libssh.org'],
                                  'pubkeys': ['rsa-sha2-256', 'rsa-sha2-512']})),
        ]
        for name, kw in attempts:
            try:
                cli = paramiko.SSHClient()
                cli.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                cli.connect(self.host, username=self.user, password=self.pwd, **kw)
                self.cli, self.sftp = cli, cli.open_sftp()
                if name != '默认':
                    log(f'  （以{name}模式连接）', 'DIM')
                return True
            except Exception as e:
                last = f'{type(e).__name__}: {e}'
        log(f'  ✗ SSH 连接失败：{last}', 'RED')
        return False

    def run(self, cmd, timeout=600):
        stdin, stdout, stderr = self.cli.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode('utf-8', 'replace')
        err = stderr.read().decode('utf-8', 'replace')
        return stdout.channel.recv_exit_status(), out, err

    def close(self):
        if self.sftp:
            self.sftp.close()
        if self.cli:
            self.cli.close()

    # ---------------- 版本号 ----------------
    def bump_version(self):
        """刷新 index.html 里 ?v=20260903x 形式的版本号，破浏览器缓存。

        只动「8 位日期 + 可选字母」的资源版本号，图片的小版本号（?v=3）不动。
        """
        idx = os.path.join(SITE, 'index.html')
        src = open(idx, encoding='utf-8').read()
        # 现有版本号（取出现最多的那个日期版本号）
        found = re.findall(r'\?v=(\d{8})([a-z]?)', src)
        if not found:
            log('  ! 未找到日期型版本号，跳过刷新', 'Y')
            return None

        today = self.stamp
        same_day = [ltr for (d, ltr) in found if d == today]
        if same_day:
            base = max(same_day) or '`'
            nxt = chr(ord(base) + 1) if base and base != 'z' else 'a'
        else:
            nxt = 'a'
        new_ver = today + nxt

        src2, n = re.subn(r'\?v=\d{8}[a-z]?', '?v=' + new_ver, src)
        open(idx, 'w', encoding='utf-8', newline='\n').write(src2)
        log(f'  ✓ 版本号 → ?v={new_ver}（替换 {n} 处）', 'G')
        return new_ver

    # ---------------- 打包 ----------------
    def pack(self):
        tarball = f'/tmp/heyday_site_{self.stamp}.tar.gz'
        excludes = ["--exclude=.git", "--exclude=.DS_Store", "--exclude=preview",
                    "--exclude=content", "--exclude=tools", "--exclude=*.bak*"]
        cmd = f'cd "{SITE}" && tar czf {tarball} {" ".join(excludes)} .'
        rc, out, err = subprocess.run(cmd, shell=True, capture_output=True,
                                      text=True).returncode, '', ''
        if rc != 0:
            log(f'  ✗ 打包失败：{err}', 'RED')
            return None, None
        size = os.path.getsize(tarball)
        h = hashlib.md5()
        with open(tarball, 'rb') as f:
            for chunk in iter(lambda: f.read(1 << 20), b''):
                h.update(chunk)
        log(f'  ✓ 打包完成 {size / 1024 / 1024:.1f} MB  md5={h.hexdigest()[:12]}', 'G')
        return tarball, h.hexdigest()

    # ---------------- 阿里云部署 ----------------
    def deploy_aliyun(self, tarball, local_md5):
        step('部署到阿里云（国内主站）')
        name = os.path.basename(tarball)
        remote = f'{self.remote_tmp}/{name}'
        size = os.path.getsize(tarball)

        if not self.connect():
            return False
        try:
            log('  0) 服务器现状')
            c, o, e = self.run(f'df -h /www | tail -1; ls {self.remote_dir}/js/ 2>/dev/null | head -3')
            log('     ' + o.strip().replace('\n', ' | '), 'DIM')

            log('  1) SFTP 上传（最多重试 4 次，MD5 门禁）')
            ok = False
            for attempt in range(1, 5):
                t0 = time.time()
                try:
                    self.sftp.put(tarball, remote, confirm=True)
                except Exception as ex:
                    log(f'     第 {attempt} 次失败：{ex}', 'Y')
                    time.sleep(3)
                    continue
                rsz = self.sftp.stat(remote).st_size
                c, o, e = self.run(f'md5sum {remote}')
                rm5 = o.split()[0] if c == 0 and o.strip() else None
                dt = time.time() - t0
                log(f'     {size / 1024 / 1024:.1f}MB / {dt:.0f}s / md5={str(rm5)[:12]}')
                if rsz == size and rm5 == local_md5:
                    log('     ✓ MD5 校验通过', 'G')
                    ok = True
                    break
                log('     ! 大小或 MD5 不一致，重试', 'Y')
            if not ok:
                log('  ✗ 上传失败：4 次均未通过 MD5 校验', 'RED')
                return False

            log('  2) 备份 + 解压 + 全量替换 + chown')
            cmd = (f'cd {os.path.dirname(self.remote_dir)} && '
                   f'rm -rf {self.backup_dir}/heydaygroup_{self.stamp}_pre && '
                   f'cp -a {os.path.basename(self.remote_dir)} {self.backup_dir}/heydaygroup_{self.stamp}_pre && '
                   f'rm -rf /tmp/heyday_new && mkdir -p /tmp/heyday_new && '
                   f'tar xzf {remote} -C /tmp/heyday_new && '
                   f'rm -rf {self.remote_dir}/* && cp -a /tmp/heyday_new/. {self.remote_dir}/ && '
                   f'chown -R www:www {self.remote_dir} && echo DEPLOY_OK')
            c, o, e = self.run(cmd, timeout=900)
            if 'DEPLOY_OK' not in o:
                log(f'  ✗ 部署命令失败：{o[-500:]} {e[-300:]}', 'RED')
                return False
            log('     ✓ 已替换完成（旧版已备份）', 'G')

            log('  3) 线上验证')
            c, o, e = self.run(
                f'ls {self.remote_dir}/js/ ; '
                f'grep -o "v={self.stamp}" {self.remote_dir}/index.html | head -1; '
                f'curl -s -o /dev/null -w "http:%{{http_code}}" --max-time 8 '
                f'-H "Host: heydaygroup.bydtyr.com" http://127.0.0.1/')
            log('     ' + o.strip().replace('\n', ' | '), 'DIM')

            self.run(f'rm -f {remote} && rm -rf /tmp/heyday_new')
            log('  4) 已清理临时文件')
            return True
        finally:
            self.close()

    # ---------------- GitHub ----------------
    def deploy_github(self, message):
        step('推送到 GitHub Pages（海外备站）')
        def sh(cmd):
            r = subprocess.run(cmd, shell=True, cwd=SITE, capture_output=True, text=True)
            return r.returncode, (r.stdout or '').strip(), (r.stderr or '').strip()

        rc, o, e = sh('git status --porcelain')
        if not o:
            log('  ! 工作区无改动，跳过提交', 'Y')
            return True

        log('  变更文件：')
        for line in o.split('\n')[:15]:
            log(f'     {line}', 'DIM')
        if o.count('\n') > 15:
            log(f'     … 另有 {o.count(chr(10)) - 14} 个')

        if not message:
            message = f'内容更新 {datetime.datetime.now().strftime("%Y-%m-%d %H:%M")}'
        rc, o, e = sh('git add -A')
        rc, o, e = sh(f'git commit -m "{message}"')
        if rc != 0:
            log(f'  ✗ commit 失败：{e or o}', 'RED')
            return False
        log(f'  ✓ 已提交：{message}', 'G')

        branch = self.gh.get('branch', 'main')
        rc, o, e = sh(f'git push {self.gh.get("remote", "origin")} {branch}')
        if rc != 0:
            log(f'  ✗ push 失败：{e or o}', 'RED')
            log('    提示：若 SSH 22 端口不通，可改用 443：', 'Y')
            log('    git remote set-url origin ssh://git@ssh.github.com:443/kinozhao9205/heyday-site.git', 'DIM')
            return False
        log('  ✓ 已推送，GitHub Pages 将在 1-2 分钟内更新', 'G')
        return True


# --------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description='部署 HEYDAY 官网到阿里云 + GitHub Pages')
    ap.add_argument('-m', '--message', default='', help='git 提交信息')
    ap.add_argument('--aliyun-only', action='store_true', help='只部署国内站')
    ap.add_argument('--github-only', action='store_true', help='只部署海外站')
    ap.add_argument('--dry-run', action='store_true', help='只打包，不上传不提交')
    ap.add_argument('--skip-check', action='store_true', help='跳过文案体检')
    ap.add_argument('--no-version', action='store_true', help='不刷新资源版本号')
    args = ap.parse_args()

    d = Deployer()

    # 1) 文案体检门禁
    if not args.skip_check:
        step('文案体检（部署前门禁）')
        rc = subprocess.run([sys.executable, os.path.join(HERE, 'i18n.py'), 'check'],
                            cwd=SITE).returncode
        if rc != 0:
            log('  ✗ 文案体检未通过。确认无误可加 --skip-check 强制部署。', 'RED')
            return 1
        log('  ✓ 体检通过', 'G')

    # 2) 刷新版本号
    if not args.no_version and not args.github_only:
        step('刷新资源版本号（破浏览器缓存）')
        d.bump_version()
    elif not args.no_version:
        d.bump_version()

    # 3) 打包
    step('打包站点')
    tarball, md5 = d.pack()
    if not tarball:
        return 1

    if args.dry_run:
        log(f'\n  --dry-run：已停在打包阶段，未上传未提交。\n  包路径：{tarball}', 'Y')
        return 0

    ok = True
    if not args.github_only:
        ok = d.deploy_aliyun(tarball, md5)
    if not args.aliyun_only:
        ok = d.deploy_github(args.message) and ok

    print()
    if ok:
        log('✅ 部署完成', 'G')
        log('   国内：https://heydaygroup.bydtyr.com/', 'CY')
        log('   海外：https://kinozhao9205.github.io/heyday-site/', 'CY')
    else:
        log('❌ 部署未全部完成，请看上方报错', 'RED')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
