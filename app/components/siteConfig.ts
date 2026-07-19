export const siteConfig = {
  company: {
    name: "Иделеон",
    fullName: "ООО «ИДЕЛЕОН»",
    inn: "7751381987",
    ogrn: "1257700589266",
    city: "г. Москва",
  },

  contacts: {
    phones: [
      {
        label: "+7-926-696-13-86",
        href: "tel:+79266961386",
      },
      {
        label: "+7-915-038-40-30",
        href: "tel:+79150384030",
      },
    ],
    emails: ["ilya@ideleon.com", "alexei@ideleon.com"],
    orderEmail: "zakaz@ideleon.com",
  },

  logo: {
    horizontal: "/images/logo/ideleon-logo-horizontal.png",
  },

  menu: [
    {
      label: "Каталог",
      href: "/catalog",
      children: [
        { label: "Все материалы", href: "/catalog" },
        { label: "Профиль для ГКЛ", href: "/catalog/gkl-profile" },
        {
          label: "Потолочные системы",
          href: "/catalog/cassette-ceilings",
          children: [
            { label: "Кассетные потолки", href: "/catalog/cassette-ceilings" },
            { label: "Реечные потолки", href: "/catalog/rack-ceilings" },
            { label: "Дизайнерские потолки", href: "/catalog/design-ceilings" },
            { label: "Потолки для медучреждений", href: "/catalog/medical-ceilings" },
            { label: "Потолки Грильято", href: "/catalog/grilyato" },
          ],
        },
        { label: "Ревизионные люки", href: "/catalog/revision-hatches" },
        { label: "Фальшполы", href: "/catalog/raised-floors" },
        { label: "Сэндвич-панели", href: "/catalog/sandwich-panels" },
        {
          label: "Блоки и кирпич",
          href: "/catalog/gazosilikatnyy-blok",
          children: [
            { label: "Газосиликатный блок", href: "/catalog/gazosilikatnyy-blok" },
            { label: "Кирпич силикатный", href: "/catalog/kirpich-silikatnyy" },
            { label: "Кирпич керамический", href: "/catalog/kirpich-keramicheskiy" },
          ],
        },
        {
          label: "Металлопрокат",
          href: "/catalog/metal-roll",
          children: [
            { label: "Металлопрокат", href: "/catalog/metal-roll" },
            { label: "Арматура", href: "/catalog/rebar" },
          ],
        },
      ],
    },
    { label: "Решения", href: "/solutions" },
    { label: "Бренды", href: "/#brands" },
    {
      label: "Калькуляторы",
      href: "/calculators",
      children: [
        { label: "Все калькуляторы", href: "/calculators" },
        { label: "Профиль для ГКЛ", href: "/calculators/profil-gkl" },
        {
          label: "Потолочные системы",
          href: "/calculators/grilyato",
          children: [
            { label: "Грильято — стандартное", href: "/calculators/grilyato" },
            { label: "Грильято — GL", href: "/calculators/grilyato-gl" },
            { label: "Грильято — диагональное", href: "/calculators/diagonalnoe-grilyato" },
            { label: "Грильято — треугольное", href: "/calculators/treugolnoe-grilyato" },
            { label: "Кассетный потолок — открытая система", href: "/calculators/kassetnyy-potolok-otkrytaya-sistema" },
            { label: "Кассетный потолок — скрытая система", href: "/calculators/kassetnyy-potolok-skrytaya-sistema" },
            { label: "Реечный потолок — кубообразная рейка", href: "/calculators/reechnyy-potolok-kuboobraznyy-dizayn" },
            { label: "Реечный потолок — S-дизайн", href: "/calculators/reechnyy-potolok-s-dizayn" },
          ],
        },
        {
          label: "Стеновые и ограждающие материалы",
          href: "/calculators/sendvich-paneli",
          children: [
            { label: "Сэндвич-панели", href: "/calculators/sendvich-paneli" },
            { label: "Газобетон и полистиролбетон", href: "/calculators/stenovye-bloki" },
          ],
        },
        { label: "Чёрный металлопрокат", href: "/calculators/chernyy-metalloprokat" },
      ],
    },
    {
      label: "Статьи",
      href: "/articles",
      children: [
        { label: "Все статьи", href: "/articles" },
        {
          label: "Профиль для ГКЛ",
          href: "/articles/kak-rasschitat-profil-dlya-gipsokartona",
          children: [
            {
              label: "Как рассчитать профиль для ГКЛ",
              href: "/articles/kak-rasschitat-profil-dlya-gipsokartona",
            },
            {
              label: "Толщина профиля: 0,6 / 0,5 / 0,4 мм",
              href: "/articles/tolshchina-profilya-dlya-gipsokartona",
            },
            {
              label: "ПП 60×27 и ППН 28×27",
              href: "/articles/pp-60x27-i-ppn-28x27-dlya-gipsokartona",
            },
          ],
        },
        {
          label: "Поставки и снабжение",
          href: "/articles/postavshchik-stroymaterialov",
          children: [
            {
              label: "Поставщик материалов для объектов",
              href: "/articles/postavshchik-stroymaterialov",
            },
          ],
        },
      ],
    },
    { label: "О компании", href: "/about" },
    { label: "Контакты", href: "/#contacts" },
  ],

  documents: [
    { label: "Политика обработки персональных данных", href: "/privacy" },
  ],

  brands: [
    {
      name: "Албес",
      logo: "/images/brands/albes.png",
    },
    {
      name: "КНАУФ",
      logo: "/images/brands/knauf.png",
    },
    {
      name: "ТЕХНОНИКОЛЬ",
      logo: "/images/brands/technonikol.png",
    },
    {
      name: "Северсталь",
      logo: "/images/brands/severstal.png",
    },
    {
      name: "STYNERGY GROUP",
      logo: "/images/brands/stynergy.png",
    },
    {
      name: "Grand Line",
      logo: "/images/brands/grandline.png",
    },
    {
      name: "Металл Трейд",
      logo: "/images/brands/metalltrade.png",
    },
    {
      name: "ЕВРАЗ",
      logo: "/images/brands/evraz.png",
    },
    {
      name: "ММК",
      logo: "/images/brands/mmk.png",
    },
    {
      name: "НЛМК Липецк",
      logo: "/images/brands/nlmk.png",
    },
  ],
};
