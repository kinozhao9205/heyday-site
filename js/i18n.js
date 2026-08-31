/* HEYDAY GROUP i18n — EN / 繁中 / RU / UZ switcher with floating widget */
(function () {
  'use strict';

  var I18N = {
    /* ================= ENGLISH (default) ================= */
    en: {
      _title: 'HEYDAY GROUP | Integrated Marketing',
      _desc: 'HEYDAY GROUP — Integrated marketing company with both strategic and resource attributes. Creating value for clients continuously for 24 years.',

      ls_en: 'EN', ls_zh: '繁', ls_ru: 'RU', ls_uz: 'UZ',

      nav_about: 'About', nav_history: 'History', nav_services: 'Services',
      nav_cases: 'Cases', nav_team: 'Team', nav_contact: 'Contact',

      hero_eyebrow: 'BRAND MANUAL',
      hero_subtitle: 'Integrated Marketing Company with Both Strategic and Resource Attributes',
      hero_cta1: 'Explore HEYDAY', hero_cta2: 'View Cases', hero_scroll: 'Scroll',

      about_eyebrow: 'ABOUT HEYDAY',
      about_title: 'What is HEYDAY?',
      about_desc: 'HEYDAY is an integrated marketing company with both strategic and resource attributes.',
      about_card1_title: 'Communication Strategy Formulation',
      about_card1_desc: 'Strategic planning that aligns brand positioning, audience insights, and market trends into executable roadmaps.',
      about_card2_title: 'Experiential Scenario Implementation',
      about_card2_desc: 'From mobile exhibitions to large-scale conferences, we build immersive physical and digital brand experiences.',
      about_card3_title: 'Communication Content Production',
      about_card3_desc: 'Video production, social media distribution, and live-streaming operations that amplify reach and engagement.',

      tl_eyebrow: 'HEYDAY MAJOR EVENTS', tl_title: 'Continuous Progress',
      tl_desc: 'A journey from mobile exhibition pioneer to global integrated marketing partner.',
      tl_2002_title: 'Delves into the Market',
      tl_2002_desc: 'Set up headquarters in Beijing and officially entered the field of mobile exhibition.',
      tl_2008_title: 'Enter the Car Enterprise',
      tl_2008_desc: 'Cooperated with car companies, broke through regional limitations, and achieved nationwide coverage.',
      tl_2015_title: 'Proposed Great Integration',
      tl_2015_desc: 'Evaluated the situation, kept up with digital trends, cooperated with e-commerce, and implemented the concept of great integration.',
      tl_2019_title: 'Brand Upgrading',
      tl_2019_desc: "Completed the new brand image upgrade, becoming the keeper of Chinese culture and striving to be a century-old shop in China's advertising industry.",
      tl_2023_title: 'Strategic Transformation',
      tl_2023_desc: 'Truly transformed into an integrated marketing company with resource attributes and policy attributes.',
      tl_2024_title: 'To Set Sail',
      tl_2024_desc: 'Overseas projects in Europe, America, and Southeast Asia — comprehensively promote and assist brands in gaining international recognition.',
      tl_vision: "The company's vision is to become a century-old brand in China's advertising industry, adhering to the principles of continuous improvement and daily renewal.",

      adv_eyebrow: 'CONTINUOUS PROGRESS', adv_title: 'Exclusive Advantage',
      adv_desc: "Working with the world's finest talent, we create extraordinary product experiences that elevate value for our clients.",
      adv_card1_title: 'Automated Experience Exhibits & Business Space Operations',
      adv_card1_desc: 'Self-contained, transportable brand pavilions engineered for rapid deployment and immersive storytelling.',
      adv_card2_title: 'Domestic Dissemination',
      adv_card2_desc: 'Nationwide roadshows, test-drive events, and pop-up experiences reaching every tier of the market.',
      adv_card3_title: 'Live Streaming Operation',
      adv_card3_desc: 'End-to-end live commerce and broadcast production that turns viewers into customers.',
      adv_card4_title: 'Overseas Communication',
      adv_card4_desc: 'Localized experience marketing across Europe, America, and Southeast Asia for global brand growth.',
      adv_card5_title: 'Video Production & Social Media Distribution',
      adv_card5_desc: 'High-impact content creation and precision distribution across social platforms.',

      gl_eyebrow: 'GLOBAL LAYOUT',
      gl_title: 'Delivering integrated marketing solutions worldwide',
      gl_item1_label: 'China Regional Headquarters', gl_item1_city: 'Beijing',
      gl_item1_addr: 'Building B, Xinhua Technology Building, No. 8 Tuofangying Road, Chaoyang District',
      gl_item2_label: 'Execution Center', gl_item2_city: 'Shenyang',
      gl_item2_addr: 'Jinlang Vanke Center, No. 1-26, Xinlong Street, Hunnan New District',
      gl_item3_label: 'Customer Center', gl_item3_city: 'Shanghai',
      gl_item3_addr: 'No. 1329, Middle Huaihai Road',
      gl_item4_label: 'International Headquarters — HEYDAY GROUP', gl_item4_city: 'China · Hong Kong',
      gl_item4_addr: '13A Floor, South Tower, International Finance Centre, Harbour City, 17 Canton Road, Tsim Sha Tsui',
      gl_item5_label: 'European Headquarters — HEYDAY CREATIVE', gl_item5_city: 'Madrid · Spain',
      gl_item5_addr: 'Calle de Alcalá 618, 28022 Madrid, Spain',

      pt_eyebrow: 'BUSINESS PARTNERS',
      pt_title: 'Trusted by over a hundred brands worldwide',
      brand_midea: 'Midea', brand_wuling: 'Wuling', brand_faw_toyota: 'FAW Toyota',
      brand_gac_honda: 'GAC Honda', brand_hongqi: 'FAW Hongqi', brand_yadea: 'Yadea',
      brand_jd: 'JD.com', brand_tmall: 'Tmall', brand_wuliangye: 'Wuliangye',

      case_eyebrow: 'MARKETING CASE', case_title: 'Systematic Experience & Communication',
      case_desc: 'How we evolve with our partners from market education to global expansion.',
      tag_auto: 'Automotive', tag_appliance: 'Home Appliances', tag_energy: 'New Energy', tag_multi: 'Multi-Industry',
      case1_title: 'BYD Systematic Experience', case1_sub: 'Super Experience Day Series',
      case1_desc: 'From head-to-head comparisons with ultra-luxury vehicles to county-to-county connectivity and localized experience marketing in Mexico, Brazil, Uzbekistan and Germany.',
      case2_title: 'Midea Channel-Based Marketing', case2_sub: 'Multi-Brand Themed Roadshow Series',
      case2_desc: 'Roadshows plus cross-industry cooperation, premium scenarios for Toshiba and COLMO, and group-wide campaigns across 80,000+ stores.',
      case3_title: 'SGMW Systematized Dissemination', case3_sub: 'Viral Communication Campaign Series',
      case3_desc: 'From the "King of Mini Vehicles" to MINI EV youth marketing and flexible lower-tier channel expansion.',
      case4_title: 'CATL Customer Group Systematization', case4_sub: 'User Mindset Education Series',
      case4_desc: 'Immersive battery technology exhibitions in high-traffic districts and targeted commercial-vehicle communication.',
      case5_title: 'FTMS Meeting Systematization', case5_sub: 'Large-scale Conference Series',
      case5_desc: 'Annual dealer conferences and intelligent electric technology launches — executed at scale with speed and precision.',
      case6_title: 'More Marketing Cases', case6_sub: 'Yadea · GAC Honda · Wuliangye · FAW Hongqi · JD.com · Tmall',
      case6_desc: 'Cycling festivals, global embassy events, national tour exhibitions, and cross-industry roadshows.',
      case1_era: 'Tang · Counties · Global',
      case2_era: 'Stores · Premium · Group',
      case3_era: 'Mini-car · MINI EV · Channels',
      case4_era: 'C-end · Commercial',
      case5_era: 'Dealer · Tech Launch',

      more_eyebrow: 'HEYDAY', more_title: 'More Marketing Cases',
      more_desc: 'Cycling festivals, embassy events, national tours and cross-industry activations.',

      team_eyebrow: 'ABOUT OUR TEAM', team_title: 'Infinite Progress',
      team_desc: 'Leveraging brand exposure as the marketing catalyst and sales conversion as the ultimate objective, we deliver deeply impressive experiences to create greater business value.',
      team_scroll_hint: 'Scroll to explore',
      team_heading: 'Full-chain capabilities, one team.',
      team_lead: "From strategic planning to on-the-ground execution, HEYDAY's teams work as a unified engine — turning insight into creative, creative into experience, and experience into measurable growth.",
      tc1: 'Strategic planning', tc2: 'Creative design', tc3: 'Resource expansion', tc4: 'Product R&D',
      tc5: 'Summary & optimization', tc6: 'Communication management', tc7: 'Market intelligence',
      tc8: 'Overseas markets', tc9: 'Scene implementation', tc10: 'Breakthrough team',
      tc11: 'Operation team', tc12: 'Support team',
      tg_support: 'Support Team', tg_breakthrough: 'Breakthrough Team', tg_operation: 'Operation Team',

      ach_eyebrow: 'OUR ACHIEVEMENTS',
      ach_domestic: 'Domestic', ach_overseas: 'Overseas',
      ach_title: 'Creating value for clients continuously for 24 years',
      ach_card1_title: 'Events Per Year', ach_card1_desc: 'Domestic event execution peak annual average',
      ach_card2_title: 'Channel Stores', ach_card2_desc: 'Midea peak nationwide store network coverage',
      ach_card3_title: 'Partner Brands', ach_card3_desc: 'Long-term trusted brands worldwide',
      ach_card4_title: 'Years of Experience', ach_card4_desc: 'Since 2002, continuous value creation',

      ct_eyebrow: 'THANKS', ct_title: 'Looking Forward to Starting Our Collaboration',
      ct_desc: "HEYDAY GROUP is ready to turn your brand's next chapter into an extraordinary experience.",
      ct_btn: 'Start a Project',

      ft_brand: 'Integrated marketing with strategic and resource attributes.',
      ft_nav_title: 'Navigate',
      ft_hq_title: 'Headquarters',
      ft_hq1: 'Beijing · Shanghai · Shenyang',
      ft_hq2: 'Hong Kong · Madrid',
      ft_copyright: '© 2026 HEYDAY GROUP. All rights reserved.'
    },

    /* ================= TRADITIONAL CHINESE (繁體中文) ================= */
    zh: {
      _title: 'HEYDAY GROUP | 整合營銷',
      _desc: 'HEYDAY GROUP——兼具戰略屬性與資源屬性的整合行銷公司，24年持續為客戶創造價值。',

      ls_en: 'EN', ls_zh: '繁', ls_ru: 'RU', ls_uz: 'UZ',

      nav_about: '關於我們', nav_history: '發展歷程', nav_services: '業務優勢',
      nav_cases: '營銷案例', nav_team: '團隊', nav_contact: '聯絡我們',

      hero_eyebrow: '品牌手冊',
      hero_subtitle: '兼具戰略屬性與資源屬性的整合行銷公司',
      hero_cta1: '探索 HEYDAY', hero_cta2: '查看案例', hero_scroll: '向下滾動',

      about_eyebrow: '關於 HEYDAY',
      about_title: '什麼是 HEYDAY？',
      about_desc: 'HEYDAY 是一家兼具戰略屬性與資源屬性的整合行銷公司。',
      about_card1_title: '傳播策略制定',
      about_card1_desc: '將品牌定位、受眾洞察與市場趨勢對齊為可執行路線圖的策略規劃。',
      about_card2_title: '體驗場景落地',
      about_card2_desc: '從移動巡展到大型會議，打造沉浸式的線下與線上品牌體驗。',
      about_card3_title: '傳播內容生產',
      about_card3_desc: '視頻製作、社群媒體分發與直播運營，持續放大品牌聲量與互動。',

      tl_eyebrow: 'HEYDAY 大事記', tl_title: '持續精進',
      tl_desc: '從移動巡展開創者到全球化整合行銷夥伴的進階之路。',
      tl_2002_title: '深耕市場',
      tl_2002_desc: '總部設於北京，正式進軍移動巡展領域。',
      tl_2008_title: '進軍車企',
      tl_2008_desc: '與車企展開合作，突破區域限制，實現全國覆蓋。',
      tl_2015_title: '提出大整合',
      tl_2015_desc: '審時度勢，緊跟數位化趨勢，攜手電商，落實大整合理念。',
      tl_2019_title: '品牌升級',
      tl_2019_desc: '完成全新品牌形象升級，成為中國文化的守護者，力爭成為中國廣告行業的百年老店。',
      tl_2023_title: '戰略轉型',
      tl_2023_desc: '真正轉型為兼具資源屬性與政策屬性的整合行銷公司。',
      tl_2024_title: '揚帆出海',
      tl_2024_desc: '歐美、東南亞海外項目全面推進，助力品牌贏得國際認可。',
      tl_vision: '公司願景是成為中國廣告行業的百年品牌，秉承持續改進、日日常新的原則。',

      adv_eyebrow: '持續精進', adv_title: '獨家優勢',
      adv_desc: '與全球頂尖人才協作，打造非凡的產品體驗，為客戶創造更高價值。',
      adv_card1_title: '自動化體驗展具及商業空間運營',
      adv_card1_desc: '自成一體的可運輸品牌展館，快速部署，沉浸式敘事。',
      adv_card2_title: '國內傳播',
      adv_card2_desc: '覆蓋全國各線市場的巡展、試駕活動與快閃體驗。',
      adv_card3_title: '直播運營',
      adv_card3_desc: '端到端的直播電商與節目製作，讓觀眾轉化為客戶。',
      adv_card4_title: '海外傳播',
      adv_card4_desc: '覆蓋歐美、東南亞的本地化體驗行銷，助力品牌全球化增長。',
      adv_card5_title: '視頻製作與社群媒體分發',
      adv_card5_desc: '高衝擊力的內容創作與社群平台精準分發。',

      gl_eyebrow: '全球佈局',
      gl_title: '在全球範圍內提供整合行銷解決方案',
      gl_item1_label: '中國區總部', gl_item1_city: '北京',
      gl_item1_addr: '朝陽區駝房營路8號新華科技大廈B座',
      gl_item2_label: '執行中心', gl_item2_city: '瀋陽',
      gl_item2_addr: '渾南新區新隆街1-26號金浪萬科中心',
      gl_item3_label: '客戶中心', gl_item3_city: '上海',
      gl_item3_addr: '淮海中路1329號',
      gl_item4_label: '國際總部 — HEYDAY GROUP', gl_item4_city: '中國 · 香港',
      gl_item4_addr: '尖沙咀廣東道17號海港城國際金融中心南塔13A樓',
      gl_item5_label: '歐洲總部 — HEYDAY CREATIVE', gl_item5_city: '西班牙 · 馬德里',
      gl_item5_addr: 'Calle de Alcalá 618, 28022 Madrid, Spain',

      pt_eyebrow: '商業合作夥伴',
      pt_title: '全球百餘家品牌的信賴之選',
      brand_midea: '美的', brand_wuling: '五菱', brand_faw_toyota: '一汽豐田',
      brand_gac_honda: '廣汽本田', brand_hongqi: '一汽紅旗', brand_yadea: '雅迪',
      brand_jd: '京東', brand_tmall: '天貓', brand_wuliangye: '五糧液',

      case_eyebrow: '營銷案例', case_title: '系統化體驗與傳播',
      case_desc: '我們如何與夥伴共同進化——從市場教育到全球拓展。',
      tag_auto: '汽車', tag_appliance: '家電', tag_energy: '新能源', tag_multi: '多行業',
      case1_title: 'BYD 系統化體驗', case1_sub: '超級體驗日系列',
      case1_desc: '從與超豪華車型的對標，到縣縣通工程，再到墨西哥、巴西、烏茲別克斯坦與德國的本地化體驗行銷。',
      case2_title: '美的渠道化行銷', case2_sub: '多品牌主題路演系列',
      case2_desc: '路演與跨界合作、東芝與COLMO的高端場景行銷，以及覆蓋全國8萬+門店的集團級活動。',
      case3_title: '五菱系統化傳播', case3_sub: '病毒式傳播系列',
      case3_desc: '從「微車之王」到MINI EV青年行銷，再到靈活下沉的渠道拓展。',
      case4_title: '寧德時代客戶群體系統化', case4_sub: '用戶心智教育系列',
      case4_desc: '在高流量商圈打造沉浸式電池技術展覽，並進行商用車定向傳播。',
      case5_title: '一汽豐田會議系統化', case5_sub: '大型會議系列',
      case5_desc: '年度經銷商大會與智能電動技術發佈會——規模化、高速度、高精度執行。',
      case6_title: '更多營銷案例', case6_sub: '雅迪 · 廣汽本田 · 五糧液 · 一汽紅旗 · 京東 · 天貓',
      case6_desc: '騎行節、全球大使館活動、全國巡迴展覽與跨界路演。',
      case1_era: '唐戰番邦 · 縣域聯動 · 全球化',
      case2_era: '萬店升級 · 高端形象 · 集團發展',
      case3_era: '微車之王 · MINI EV · 渠道下沉',
      case4_era: 'C端轉型 · 商用車',
      case5_era: '經銷商大會 · 技術發佈',

      more_eyebrow: 'HEYDAY', more_title: '更多營銷案例',
      more_desc: '騎行節、大使館活動、全國巡迴展覽與跨界路演。',

      team_eyebrow: '關於我們的團隊', team_title: '無限進步',
      team_desc: '以品牌曝光為行銷催化劑、銷售轉化為最終目標，交付令人印象深刻的體驗，創造更大的商業價值。',
      team_scroll_hint: '橫向滑動查看',
      team_heading: '全鏈路能力，一支團隊。',
      team_lead: '從策略規劃到一線執行，HEYDAY 的團隊如同一台精密運轉的引擎——讓洞察成為創意，創意成為體驗，體驗成為可衡量的增長。',
      tc1: '戰略策劃', tc2: '創意設計', tc3: '資源拓展', tc4: '產品研發',
      tc5: '總結優化', tc6: '傳播管理', tc7: '市場情報',
      tc8: '海外市場', tc9: '場景落地', tc10: '突破團隊',
      tc11: '運營團隊', tc12: '保障團隊',
      tg_support: '保障團隊', tg_breakthrough: '突破團隊', tg_operation: '運營團隊',

      ach_eyebrow: '我們的成就',
      ach_domestic: '國內', ach_overseas: '海外',
      ach_title: '24年持續為客戶創造價值',
      ach_card1_title: '年均活動場次', ach_card1_desc: '國內活動執行峰值年均',
      ach_card2_title: '渠道門店', ach_card2_desc: '美的全國門店網絡峰值覆蓋',
      ach_card3_title: '合作品牌', ach_card3_desc: '長期信賴的全球品牌',
      ach_card4_title: '從業年限', ach_card4_desc: '自2002年起持續創造價值',

      ct_eyebrow: '致謝', ct_title: '期待與您攜手啟程',
      ct_desc: 'HEYDAY GROUP 隨時準備將您品牌的下一個篇章打造成非凡體驗。',
      ct_btn: '開啟合作',

      ft_brand: '兼具戰略與資源屬性的整合行銷。',
      ft_nav_title: '快速導航',
      ft_hq_title: '總部',
      ft_hq1: '北京 · 上海 · 瀋陽',
      ft_hq2: '中國香港 · 馬德里',
      ft_copyright: '© 2026 HEYDAY GROUP 版權所有。'
    },

    /* ================= RUSSIAN (Русский) ================= */
    ru: {
      _title: 'HEYDAY GROUP | Интегрированный маркетинг',
      _desc: 'HEYDAY GROUP — интегрированная маркетинговая компания со стратегическим и ресурсным потенциалом. Более 24 лет создаём ценность для клиентов.',

      ls_en: 'EN', ls_zh: '繁', ls_ru: 'RU', ls_uz: 'UZ',

      nav_about: 'О нас', nav_history: 'История', nav_services: 'Услуги',
      nav_cases: 'Кейсы', nav_team: 'Команда', nav_contact: 'Контакты',

      hero_eyebrow: 'БРЕНД-БУК',
      hero_subtitle: 'Интегрированная маркетинговая компания со стратегическим и ресурсным потенциалом',
      hero_cta1: 'Узнать о HEYDAY', hero_cta2: 'Наши кейсы', hero_scroll: 'Листайте',

      about_eyebrow: 'О HEYDAY',
      about_title: 'Что такое HEYDAY?',
      about_desc: 'HEYDAY — интегрированная маркетинговая компания, сочетающая стратегический и ресурсный потенциал.',
      about_card1_title: 'Разработка коммуникационной стратегии',
      about_card1_desc: 'Стратегическое планирование, объединяющее позиционирование бренда, понимание аудитории и рыночные тренды в выполнимые дорожные карты.',
      about_card2_title: 'Реализация иммерсивных сценариев',
      about_card2_desc: 'От мобильных выставок до масштабных конференций — создаём захватывающий физический и цифровой бренд-опыт.',
      about_card3_title: 'Создание коммуникационного контента',
      about_card3_desc: 'Производство видео, продвижение в соцсетях и управление трансляциями для роста охвата и вовлечённости.',

      tl_eyebrow: 'КЛЮЧЕВЫЕ СОБЫТИЯ HEYDAY', tl_title: 'Постоянное развитие',
      tl_desc: 'Путь от пионера мобильных выставок до глобального интегрированного маркетингового партнёра.',
      tl_2002_title: 'Выход на рынок',
      tl_2002_desc: 'Открыли штаб-квартиру в Пекине и официально вошли в сферу мобильных выставок.',
      tl_2008_title: 'Вход в автомобильную отрасль',
      tl_2008_desc: 'Начали сотрудничество с автопроизводителями, преодолели региональные ограничения и достигли общенационального охвата.',
      tl_2015_title: 'Великая интеграция',
      tl_2015_desc: 'Оценили ситуацию, пошли в ногу с цифровыми трендами, начали сотрудничество с e-commerce и реализовали концепцию великой интеграции.',
      tl_2019_title: 'Обновление бренда',
      tl_2019_desc: 'Завершили обновление имиджа бренда, став хранителем китайской культуры и стремясь стать вековым домом рекламной индустрии Китая.',
      tl_2023_title: 'Стратегическая трансформация',
      tl_2023_desc: 'Полностью трансформировались в интегрированную маркетинговую компанию с ресурсным и политическим потенциалом.',
      tl_2024_title: 'Выход в мир',
      tl_2024_desc: 'Зарубежные проекты в Европе, Америке и Юго-Восточной Азии — всесторонне помогаем брендам получить международное признание.',
      tl_vision: 'Видение компании — стать вековым брендом рекламной индустрии Китая, следуя принципам постоянного совершенствования и ежедневного обновления.',

      adv_eyebrow: 'ПОСТОЯННОЕ РАЗВИТИЕ', adv_title: 'Наши преимущества',
      adv_desc: 'Работая с лучшими специалистами мира, мы создаём выдающиеся продуктовые впечатления и повышаем ценность для клиентов.',
      adv_card1_title: 'Автоматизированные выставочные стенды и управление бизнес-пространством',
      adv_card1_desc: 'Автономные транспортируемые бренд-павильоны для быстрого развёртывания и иммерсивного сторителлинга.',
      adv_card2_title: 'Коммуникация по всему Китаю',
      adv_card2_desc: 'Общенациональные роуд-шоу, тест-драйвы и поп-ап мероприятия на всех уровнях рынка.',
      adv_card3_title: 'Управление онлайн-трансляциями',
      adv_card3_desc: 'Полный цикл прямых продаж и производства трансляций — превращаем зрителей в клиентов.',
      adv_card4_title: 'Зарубежная коммуникация',
      adv_card4_desc: 'Локализованный иммерсивный маркетинг в Европе, Америке и Юго-Восточной Азии для глобального роста бренда.',
      adv_card5_title: 'Видеопроизводство и продвижение в соцсетях',
      adv_card5_desc: 'Создание контента высокой вовлечённости и точное распространение по социальным платформам.',

      gl_eyebrow: 'ГЛОБАЛЬНАЯ СЕТЬ',
      gl_title: 'Интегрированные маркетинговые решения по всему миру',
      gl_item1_label: 'Региональная штаб-квартира Китая', gl_item1_city: 'Пекин',
      gl_item1_addr: 'Корпус B, Технологический центр «Синьхуа», ул. Тофаньин, 8, район Чаоян',
      gl_item2_label: 'Центр реализации', gl_item2_city: 'Шэньян',
      gl_item2_addr: 'Центр «Цзиньлан Ванкэ», ул. Синьлун, 1-26, район Хуньнань',
      gl_item3_label: 'Центр работы с клиентами', gl_item3_city: 'Шанхай',
      gl_item3_addr: 'Средняя улица Хуайхай, 1329',
      gl_item4_label: 'Международная штаб-квартира — HEYDAY GROUP', gl_item4_city: 'Китай · Гонконг',
      gl_item4_addr: '13A, Южная башня, Международный финансовый центр, Harbour City, 17 Canton Road, Tsim Sha Tsui',
      gl_item5_label: 'Европейская штаб-квартира — HEYDAY CREATIVE', gl_item5_city: 'Мадрид · Испания',
      gl_item5_addr: 'Calle de Alcalá 618, 28022 Madrid, Spain',

      pt_eyebrow: 'БИЗНЕС-ПАРТНЁРЫ',
      pt_title: 'Нам доверяют более ста брендов по всему миру',
      brand_midea: 'Midea', brand_wuling: 'Wuling', brand_faw_toyota: 'FAW Toyota',
      brand_gac_honda: 'GAC Honda', brand_hongqi: 'FAW Hongqi', brand_yadea: 'Yadea',
      brand_jd: 'JD.com', brand_tmall: 'Tmall', brand_wuliangye: 'Wuliangye',

      case_eyebrow: 'МАРКЕТИНГОВЫЕ КЕЙСЫ', case_title: 'Системный опыт и коммуникация',
      case_desc: 'Как мы развиваемся вместе с партнёрами — от обучения рынка до глобальной экспансии.',
      tag_auto: 'Авто', tag_appliance: 'Бытовая техника', tag_energy: 'Новая энергетика', tag_multi: 'Разные отрасли',
      case1_title: 'BYD: системный опыт', case1_sub: 'Серия «Супер-день опыта»',
      case1_desc: 'От сравнения с автомобилями класса люкс до программы «уезд за уездом» и локализованного маркетинга в Мексике, Бразилии, Узбекистане и Германии.',
      case2_title: 'Midea: канальный маркетинг', case2_sub: 'Серия тематических роуд-шоу',
      case2_desc: 'Роуд-шоу и кросс-индустриальные партнёрства, премиальные сценарии для Toshiba и COLMO, кампании в 80 000+ магазинах.',
      case3_title: 'SGMW: системная коммуникация', case3_sub: 'Серия вирусных кампаний',
      case3_desc: 'От «короля микрокаров» до молодёжного маркетинга MINI EV и гибкого расширения в нижних сегментах рынка.',
      case4_title: 'CATL: систематизация клиентов', case4_sub: 'Серия по формированию мышления потребителей',
      case4_desc: 'Иммерсивные выставки аккумуляторных технологий в зонах с высоким трафиком и адресная коммуникация для коммерческого транспорта.',
      case5_title: 'FTMS: систематизация мероприятий', case5_sub: 'Серия масштабных конференций',
      case5_desc: 'Ежегодные конференции дилеров и запуски интеллектуальных электротехнологий — масштабно, быстро и точно.',
      case6_title: 'Больше кейсов', case6_sub: 'Yadea · GAC Honda · Wuliangye · FAW Hongqi · JD.com · Tmall',
      case6_desc: 'Велофестивали, мероприятия в посольствах, национальные выставки и кросс-индустриальные роуд-шоу.',

      team_eyebrow: 'НАША КОМАНДА', team_title: 'Бесконечный прогресс',
      team_desc: 'Используя охват бренда как катализатор маркетинга, а конверсию продаж как конечную цель, мы создаём впечатляющий опыт и большую бизнес-ценность.',
      team_scroll_hint: 'Листайте для просмотра',
      team_heading: 'Полный цикл компетенций — одна команда.',
      team_lead: 'От стратегического планирования до полевой реализации команды HEYDAY работают как единый механизм — превращая инсайты в креатив, креатив в опыт, а опыт в измеримый рост.',
      tc1: 'Стратегическое планирование', tc2: 'Креативный дизайн', tc3: 'Расширение ресурсов', tc4: 'Разработка продуктов',
      tc5: 'Анализ и оптимизация', tc6: 'Управление коммуникацией', tc7: 'Рыночная аналитика',
      tc8: 'Зарубежные рынки', tc9: 'Реализация сценариев', tc10: 'Команда прорыва',
      tc11: 'Операционная команда', tc12: 'Команда поддержки',

      ach_eyebrow: 'НАШИ ДОСТИЖЕНИЯ',
      ach_title: 'Создаём ценность для клиентов уже 24 года',
      ach_card1_title: 'Мероприятий в год', ach_card1_desc: 'Пиковое среднегодовое число мероприятий в Китае',
      ach_card2_title: 'Магазинов в сети', ach_card2_desc: 'Пиковый охват сети магазинов Midea по стране',
      ach_card3_title: 'Брендов-партнёров', ach_card3_desc: 'Долгосрочно доверяющие бренды по всему миру',
      ach_card4_title: 'Лет опыта', ach_card4_desc: 'Непрерывное создание ценности с 2002 года',

      ct_eyebrow: 'СПАСИБО', ct_title: 'Ждём начала сотрудничества',
      ct_desc: 'HEYDAY GROUP готова превратить следующую главу вашего бренда в выдающийся опыт.',
      ct_btn: 'Начать проект',

      ft_brand: 'Интегрированный маркетинг со стратегическим и ресурсным потенциалом.',
      ft_nav_title: 'Навигация',
      ft_hq_title: 'Штаб-квартиры',
      ft_hq1: 'Пекин · Шанхай · Шэньян',
      ft_hq2: 'Гонконг · Мадрид',
      ft_copyright: '© 2026 HEYDAY GROUP. Все права защищены.'
    },

    /* ================= UZBEK (O‘zbekcha) ================= */
    uz: {
      _title: 'HEYDAY GROUP | Integratsiyalashgan marketing',
      _desc: 'HEYDAY GROUP — strategik va resurs salohiyatiga ega integratsiyalashgan marketing kompaniyasi. 24 yil davomida mijozlar uchun qiymat yaratamiz.',

      ls_en: 'EN', ls_zh: '繁', ls_ru: 'RU', ls_uz: 'UZ',

      nav_about: "Biz haqimizda", nav_history: 'Tariximiz', nav_services: 'Xizmatlar',
      nav_cases: 'Loyihalar', nav_team: 'Jamoa', nav_contact: 'Aloqa',

      hero_eyebrow: 'BREND KITOBCHASI',
      hero_subtitle: "Strategik va resurs salohiyatiga ega integratsiyalashgan marketing kompaniyasi",
      hero_cta1: 'HEYDAY bilan tanishing', hero_cta2: "Loyihalarni ko'rish", hero_scroll: 'Pastga suring',

      about_eyebrow: 'HEYDAY HAQIDA',
      about_title: 'HEYDAY nima?',
      about_desc: "HEYDAY — strategik va resurs salohiyatiga ega integratsiyalashgan marketing kompaniyasi.",
      about_card1_title: "Kommunikatsiya strategiyasini ishlab chiqish",
      about_card1_desc: "Brend pozitsiyasini, auditoriya tushunchasini va bozor tendensiyalarini bajariladigan yo'l xaritasiga birlashtiruvchi strategik rejalashtirish.",
      about_card2_title: "Immersiv ssenariylarni amalga oshirish",
      about_card2_desc: "Mobil ko'rgazmalardan yirik konferensiyalargacha — jozibali jismoniy va raqamli brend tajribasini yaratamiz.",
      about_card3_title: 'Kommunikatsiya kontentini ishlab chiqarish',
      about_card3_desc: "Video ishlab chiqarish, ijtimoiy tarmoqlarda tarqatish va translyatsiyalarni boshqarish orqali qamrov va ishtirokni oshiramiz.",

      tl_eyebrow: "HEYDAY MUXIM VOQEALARI", tl_title: 'Doimiy taraqqiyot',
      tl_desc: "Mobil ko'rgazmalar kashshofidan global integratsiyalashgan marketing hamkorigacha bo'lgan yo'l.",
      tl_2002_title: 'Bozorga kirish',
      tl_2002_desc: "Bosh ofisni Pekinda ochdik va rasman mobil ko'rgazmalar sohasiga kirdik.",
      tl_2008_title: 'Avtomobil sanoatiga kirish',
      tl_2008_desc: "Avtomobil ishlab chiqaruvchilar bilan hamkorlik qildik, mintaqaviy cheklovlarni yengib, butun mamlakat qamroviga erishdik.",
      tl_2015_title: 'Buyuk integratsiya',
      tl_2015_desc: "Vaziyatni baholab, raqamli tendensiyalardan ortda qolmadi, e-tijorat bilan hamkorlik qildi va buyuk integratsiya kontseptsiyasini amalga oshirdi.",
      tl_2019_title: 'Brend yangilanishi',
      tl_2019_desc: "Yangi brend imidjini yangiladik, Xitoy madaniyati qo'riqchisiga aylandik va Xitoy reklama sanoatining yuz yillik uyiga aylanishga intilamiz.",
      tl_2023_title: 'Strategik transformatsiya',
      tl_2023_desc: "Resurs va siyosiy salohiyatga ega integratsiyalashgan marketing kompaniyasiga to'liq aylandik.",
      tl_2024_title: 'Dengizga chiqish',
      tl_2024_desc: "Yevropa, Amerika va Janubi-Sharqiy Osiyodagi xorijiy loyihalar — brendlarga xalqaro e'tirof orttirishda har tomonlama yordam beramiz.",
      tl_vision: "Kompaniya orzusi — Xitoy reklama sanoatining yuz yillik brendiga aylanish, doimiy takomillashish va har kuni yangilanish tamoyillariga amal qilish.",

      adv_eyebrow: 'DOIMIY TARAQQIYOT', adv_title: "Bizning afzalliklarimiz",
      adv_desc: "Dunyoning eng yaxshi mutaxassislari bilan ishlab, mijozlarimiz uchun qiymatni oshiradigan ajoyib mahsulot tajribasini yaratamiz.",
      adv_card1_title: "Avtomatlashtirilgan ko'rgazma stendlari va biznes maydonlarini boshqarish",
      adv_card1_desc: "Tez joylashtirish va immersiv hikoya qilish uchun mo'ljallangan mustaqil, ko'chma brend pavilonlari.",
      adv_card2_title: "Butun Xitoy bo'ylab tarqatish",
      adv_card2_desc: "Bozorning barcha darajalariga yetib boruvchi milliy road-showlar, test-drayvlar va pop-up tajribalar.",
      adv_card3_title: 'Translyatsiyalarni boshqarish',
      adv_card3_desc: "To'liq sikl jonli savdo va translyatsiya ishlab chiqarish — tomoshabinlarni mijozlarga aylantiramiz.",
      adv_card4_title: 'Xorijiy kommunikatsiya',
      adv_card4_desc: "Yevropa, Amerika va Janubi-Sharqiy Osiyoda brendning global o'sishi uchun lokalizatsiyalangan tajriba marketingi.",
      adv_card5_title: "Video ishlab chiqarish va ijtimoiy tarmoqlarda tarqatish",
      adv_card5_desc: "Yuqori ta'sirli kontent yaratish va ijtimoiy platformalarda aniq tarqatish.",

      gl_eyebrow: 'GLOBAL TARMOQ',
      gl_title: "Butun dunyoda integratsiyalashgan marketing yechimlari",
      gl_item1_label: "Xitoy mintaqaviy bosh ofisi", gl_item1_city: 'Pekin',
      gl_item1_addr: "B korpus, Xinhua Texnologiya markazi, Tuofangying ko'chasi 8, Chaoyang tumani",
      gl_item2_label: 'Amalga oshirish markazi', gl_item2_city: 'Shenyan',
      gl_item2_addr: "Jinlang Vanke markazi, Xinlong ko'chasi 1-26, Hunnan tumani",
      gl_item3_label: "Mijozlar markazi", gl_item3_city: 'Shanxay',
      gl_item3_addr: "Xuayxay o'rta ko'chasi 1329",
      gl_item4_label: 'Xalqaro bosh ofis — HEYDAY GROUP', gl_item4_city: 'Xitoy · Gonkong',
      gl_item4_addr: "13A qavat, Janubiy minora, Xalqaro moliya markazi, Harbour City, 17 Canton Road, Tsim Sha Tsui",
      gl_item5_label: "Yevropa bosh ofisi — HEYDAY CREATIVE", gl_item5_city: 'Madrid · Ispaniya',
      gl_item5_addr: 'Calle de Alcalá 618, 28022 Madrid, Ispaniya',

      pt_eyebrow: "BIZNES HAMKORLAR",
      pt_title: "Dunyodagi yuzdan ortiq brendlar ishonchi",
      brand_midea: 'Midea', brand_wuling: 'Wuling', brand_faw_toyota: 'FAW Toyota',
      brand_gac_honda: 'GAC Honda', brand_hongqi: 'FAW Hongqi', brand_yadea: 'Yadea',
      brand_jd: 'JD.com', brand_tmall: 'Tmall', brand_wuliangye: 'Wuliangye',

      case_eyebrow: 'MARKETING LOYIHALARI', case_title: 'Tizimli tajriba va kommunikatsiya',
      case_desc: "Bozorni o'rgatishdan global kengayishgacha hamkorlarimiz bilan qanday rivojlanamiz.",
      tag_auto: 'Avto', tag_appliance: 'Maishiy texnika', tag_energy: 'Yangi energiya', tag_multi: "Ko'p tarmoqli",
      case1_title: 'BYD: tizimli tajriba', case1_sub: '"Super tajriba kuni" seriyasi',
      case1_desc: "Hashamatli avtomobillar bilan taqqoslashdan tortib, tumanma-tuman qamrov va Meksika, Braziliya, O'zbekiston hamda Germaniyadagi lokalizatsiyalangan tajriba marketingigacha.",
      case2_title: 'Midea: kanal marketingi', case2_sub: "Ko'p brendli tematik road-show seriyasi",
      case2_desc: "Road-showlar va sohalararo hamkorlik, Toshiba va COLMO uchun premium ssenariylar hamda 80 000+ do'konni qamrab olgan kampaniyalar.",
      case3_title: 'SGMW: tizimli tarqatish', case3_sub: 'Virusli kommunikatsiya seriyasi',
      case3_desc: '"Mikroavtomobillar qiroli"dan MINI EV yoshlar marketingi va moslashuvchan quyi bozor kengayishigacha.',
      case4_title: 'CATL: mijozlar tizimlashtirish', case4_sub: "Foydalanuvchi ongini shakllantirish seriyasi",
      case4_desc: "Yuqori trafikli hududlarda immersiv batareya texnologiyalari ko'rgazmalari va tijoriy transport uchun maqsadli kommunikatsiya.",
      case5_title: 'FTMS: tadbirlar tizimlashtirish', case5_sub: 'Yirik konferensiyalar seriyasi',
      case5_desc: "Yillik diler konferensiyalari va intellektual elektr texnologiyalar taqdimotlari — keng miqyosda, tez va aniq.",
      case6_title: 'Boshqa loyihalar', case6_sub: 'Yadea · GAC Honda · Wuliangye · FAW Hongqi · JD.com · Tmall',
      case6_desc: "Velosiped festivallari, elchixona tadbirlari, milliy ko'rgazmalar va sohalararo road-showlar.",

      team_eyebrow: "BIZNING JAMOAMIZ", team_title: 'Cheksiz taraqqiyot',
      team_desc: "Brend qamrovini marketing katalizatori, savdo konversiyasini yakuniy maqsad sifatida ishlatib, ta'sirchan tajriba va katta biznes qiymati yaratamiz.",
      team_scroll_hint: "Ko'rish uchun suring",
      team_heading: "To'liq zanjir kompetensiyalari — bitta jamoa.",
      team_lead: "Strategik rejalashtirishdan joylarda amalga oshirishgacha HEYDAY jamoalari yagona mexanizm bo'lib ishlaydi — tushunchani kreativga, kreativni tajribaga, tajribani o'lchanadigan o'sishga aylantiradi.",
      tc1: 'Strategik rejalashtirish', tc2: 'Kreativ dizayn', tc3: "Resurslarni kengaytirish", tc4: "Mahsulotni ishlab chiqish",
      tc5: 'Tahlil va optimallashtirish', tc6: 'Kommunikatsiya boshqaruvi', tc7: 'Bozor tahlili',
      tc8: 'Xorijiy bozorlar', tc9: "Ssenariylarni amalga oshirish", tc10: 'Yutuq jamoasi',
      tc11: 'Operatsion jamoa', tc12: "Qo'llab-quvvatlash jamoasi",

      ach_eyebrow: 'YUTUQLARIMIZ',
      ach_title: '24 yil davomida mijozlar uchun qiymat yaratamiz',
      ach_card1_title: 'Yillik tadbirlar', ach_card1_desc: "Xitoyda o'rtacha yillik eng yuqori tadbirlar soni",
      ach_card2_title: "Do'konlar tarmog'i", ach_card2_desc: "Midea do'konlari tarmog'ining eng yuqori qamrovi",
      ach_card3_title: 'Hamkor brendlar', ach_card3_desc: "Dunyo bo'ylab uzoq muddatli ishonchli brendlar",
      ach_card4_title: 'Tajriba yillari', ach_card4_desc: '2002-yildan beri uzluksiz qiymat yaratish',

      ct_eyebrow: 'RAHMAT', ct_title: "Hamkorlikni boshlashni kutamiz",
      ct_desc: "HEYDAY GROUP brendingizning navbatdagi bobini ajoyib tajribaga aylantirishga tayyor.",
      ct_btn: 'Loyihani boshlash',

      ft_brand: "Strategik va resurs salohiyatiga ega integratsiyalashgan marketing.",
      ft_nav_title: 'Navigatsiya',
      ft_hq_title: 'Bosh ofislar',
      ft_hq1: 'Pekin · Shanxay · Shenyan',
      ft_hq2: 'Gonkong · Madrid',
      ft_copyright: '© 2026 HEYDAY GROUP. Barcha huquqlar himoyalangan.'
    }
  };

  var STORAGE_KEY = 'heyday-lang';
  var LANGS = ['en', 'zh', 'ru', 'uz'];
  var currentLang = 'en';

  function detectLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) { /* localStorage unavailable */ }
    return 'en'; // default language is English
  }

  function langAttr(lang) {
    if (lang === 'zh') return 'zh-Hant';
    if (lang === 'ru') return 'ru';
    if (lang === 'uz') return 'uz';
    return 'en';
  }

  function applyLang(lang, animate) {
    currentLang = lang;
    var dict = I18N[lang];

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (!key || !dict.hasOwnProperty(key)) continue;
      if (el.textContent === dict[key]) continue;
      if (animate && typeof gsap !== 'undefined') {
        (function (node, text) {
          gsap.to(node, {
            opacity: 0, y: -6, duration: 0.18, ease: 'power2.in',
            onComplete: function () {
              node.textContent = text;
              gsap.to(node, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' });
            }
          });
        })(el, dict[key]);
      } else {
        el.textContent = dict[key];
      }
    }

    document.documentElement.lang = langAttr(lang);
    document.title = dict._title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', dict._desc);

    // Switcher state
    var switcher = document.getElementById('lang-switcher');
    if (switcher) {
      for (var l = 0; l < LANGS.length; l++) {
        switcher.classList.toggle('lang-' + LANGS[l], lang === LANGS[l]);
      }
    }
    var btns = document.querySelectorAll('[data-lang-btn]');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('active', btns[j].getAttribute('data-lang-btn') === lang);
    }

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(detectLang(), false);

    var btns = document.querySelectorAll('[data-lang-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var lang = this.getAttribute('data-lang-btn');
        if (lang !== currentLang) applyLang(lang, true);
      });
    }
  });
})();
