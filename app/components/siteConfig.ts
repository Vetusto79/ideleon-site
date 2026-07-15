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
    { label: "Каталог", href: "/catalog" },
    { label: "Решения", href: "/solutions" },
    { label: "Бренды", href: "/#brands" },
    {
      label: "Калькуляторы",
      href: "/calculators",
      children: [
        { label: "Профиль для ГКЛ", href: "/calculators/profil-gkl" },
        {
          label: "Грильято",
          href: "/calculators/grilyato",
          children: [
            { label: "Стандартное Грильято", href: "/calculators/grilyato" },
            { label: "Грильято GL", href: "/calculators/grilyato-gl" },
            { label: "Диагональное Грильято", href: "/calculators/diagonalnoe-grilyato" },
            { label: "Треугольное Грильято", href: "/calculators/treugolnoe-grilyato" },
          ],
        },
        {
          label: "Кассетные потолки",
          href: "/calculators/kassetnyy-potolok-otkrytaya-sistema",
          children: [
            { label: "Открытая подвесная система", href: "/calculators/kassetnyy-potolok-otkrytaya-sistema" },
            { label: "Закрытая подвесная система", href: "/calculators/kassetnyy-potolok-skrytaya-sistema" },
          ],
        },
        {
          label: "Металлопрокат",
          href: "/calculators/chernyy-metalloprokat",
          children: [
            { label: "Чёрный металлопрокат", href: "/calculators/chernyy-metalloprokat" },
          ],
        },
        {
          label: "Сэндвич-панели",
          href: "/calculators/sendvich-paneli",
          children: [
            { label: "Калькулятор сэндвич-панелей", href: "/calculators/sendvich-paneli" },
          ],
        },
        {
          label: "Стеновые блоки",
          href: "/calculators/stenovye-bloki",
          children: [
            { label: "Газобетон и полистиролбетон", href: "/calculators/stenovye-bloki" },
          ],
        },
        {
          label: "Реечные потолки",
          href: "/calculators/reechnyy-potolok-kuboobraznyy-dizayn",
          children: [
            { label: "Кубообразный дизайн", href: "/calculators/reechnyy-potolok-kuboobraznyy-dizayn" },
          ],
        },
      ],
    },
    { label: "Статьи", href: "/articles" },
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
