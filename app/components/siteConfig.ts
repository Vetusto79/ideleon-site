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
    horizontal: "/images/logo/ideleon-logo-horizontal.svg",
  },

  menu: [
    { label: "Каталог", href: "/catalog" },
    { label: "Решения", href: "/solutions" },
    { label: "Бренды", href: "/#brands" },
    { label: "Статьи", href: "/articles" },
    { label: "О компании", href: "/#about" },
    { label: "Контакты", href: "/#contacts" },
  ],

  documents: [
    { label: "Политика обработки персональных данных", href: "/privacy" },
  ],

  brands: ["Knauf", "Албес", "ТехноНиколь", "КТЗ", "СПК", "МеталлТрейд"],
};
