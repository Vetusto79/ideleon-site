export type ArticleCategorySlug =
  | "profil-dlya-gkl"
  | "potolochnye-sistemy"
  | "revizionnye-lyuki"
  | "sendvich-paneli"
  | "falshpoly"
  | "metalloprokat"
  | "armatura"
  | "postavki-stroymaterialov";

export type ArticleItem = {
  title: string;
  href: string;
  description: string;
  category: ArticleCategorySlug;
  isMain?: boolean;
};

export type ArticleCategory = {
  slug: ArticleCategorySlug;
  title: string;
  shortTitle: string;
  href: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export const articleCategories: ArticleCategory[] = [
  {
    slug: "profil-dlya-gkl",
    title: "Профиль для ГКЛ",
    shortTitle: "Профиль ГКЛ",
    href: "/articles/profil-dlya-gkl",
    description:
      "Статьи о выборе, расчёте, толщине и применении профилей для гипсокартонных систем на объектах.",
    seoTitle: "Профиль для ГКЛ: выбор, расчёт и толщина",
    seoDescription:
      "Статьи Иделеон о профиле для ГКЛ: как рассчитать профиль, какую толщину выбрать, где применять потолочные и перегородочные профили.",
  },
  {
    slug: "potolochnye-sistemy",
    title: "Потолочные системы",
    shortTitle: "Потолки",
    href: "/articles/potolochnye-sistemy",
    description:
      "Материалы о подвесных, кассетных, реечных потолках, Грильято и других потолочных решениях для коммерческих объектов.",
    seoTitle: "Потолочные системы: выбор и применение",
    seoDescription:
      "Статьи Иделеон о потолочных системах: подвесные потолки, кассетные потолки, Грильято, реечные потолки и решения для объектов.",
  },
  {
    slug: "revizionnye-lyuki",
    title: "Ревизионные люки",
    shortTitle: "Люки",
    href: "/articles/revizionnye-lyuki",
    description:
      "Практические материалы о выборе ревизионных люков под плитку, под покраску и для доступа к инженерным коммуникациям.",
    seoTitle: "Ревизионные люки: выбор и применение",
    seoDescription:
      "Статьи Иделеон о ревизионных люках: люки под плитку, под покраску, подбор размера и применение на объектах.",
  },
  {
    slug: "sendvich-paneli",
    title: "Сендвич-панели",
    shortTitle: "Сендвич-панели",
    href: "/articles/sendvich-paneli",
    description:
      "Будущие статьи о выборе, применении и поставке сендвич-панелей для промышленных и коммерческих объектов.",
    seoTitle: "Сендвич-панели: выбор и применение",
    seoDescription:
      "Статьи Иделеон о сендвич-панелях: выбор, применение, поставка и комплектация объектов.",
  },
  {
    slug: "falshpoly",
    title: "Фальшполы",
    shortTitle: "Фальшполы",
    href: "/articles/falshpoly",
    description:
      "Будущие статьи о фальшполах, инженерных полах, подборе системы и комплектации объектов.",
    seoTitle: "Фальшполы: выбор и применение",
    seoDescription:
      "Статьи Иделеон о фальшполах: выбор системы, применение, поставка и комплектация объектов.",
  },
  {
    slug: "metalloprokat",
    title: "Металлопрокат",
    shortTitle: "Металлопрокат",
    href: "/articles/metalloprokat",
    description:
      "Будущие статьи о поставке металлопроката, подборе позиций и комплектации строительных объектов.",
    seoTitle: "Металлопрокат для объектов: выбор и поставка",
    seoDescription:
      "Статьи Иделеон о металлопрокате: подбор, поставка, комплектация объектов и работа со спецификациями.",
  },
  {
    slug: "armatura",
    title: "Арматура",
    shortTitle: "Арматура",
    href: "/articles/armatura",
    description:
      "Будущие статьи об арматуре, подборе диаметра, объёмах, поставке и комплектации объектов.",
    seoTitle: "Арматура для строительных объектов",
    seoDescription:
      "Статьи Иделеон об арматуре: выбор, поставка, комплектация объектов и работа со спецификациями.",
  },
  {
    slug: "postavki-stroymaterialov",
    title: "Поставки и комплектация объектов",
    shortTitle: "Поставки",
    href: "/articles/postavki-stroymaterialov",
    description:
      "Статьи о выборе поставщика, комплектации объектов, работе со спецификациями и снижении рисков при закупке материалов.",
    seoTitle: "Поставки строительных материалов на объект",
    seoDescription:
      "Статьи Иделеон о поставках строительных материалов, комплектации объектов, выборе поставщика и работе со спецификациями.",
  },
];

export const articles: ArticleItem[] = [
  {
    title: "Как рассчитать и выбрать профиль для гипсокартона",
    href: "/articles/kak-rasschitat-profil-dlya-gipsokartona",
    description:
      "Виды, размеры, толщина 0,6 мм, потолочные и перегородочные профили, а также подход к расчёту профиля для объекта.",
    category: "profil-dlya-gkl",
    isMain: true,
  },
  {
    title: "ПП 60×27 и ППН 28×27: потолочная пара профилей для гипсокартона",
    href: "/articles/pp-60x27-i-ppn-28x27-dlya-gipsokartona",
    description:
      "Чем отличаются потолочный профиль ПП 60×27 и направляющий ППН 28×27, где они применяются и почему работают в паре.",
    category: "profil-dlya-gkl",
  },
  {
    title: "Какой толщины выбрать профиль для ГКЛ: 0,6 мм, 0,5 мм или 0,4 мм",
    href: "/articles/tolshchina-profilya-dlya-gipsokartona",
    description:
      "Разбираем, почему экономия на тонком профиле может увеличить расход материалов, трудозатраты и итоговую стоимость конструкции.",
    category: "profil-dlya-gkl",
  },
  {
    title: "Как выбрать подвесную потолочную систему для коммерческого объекта",
    href: "/articles/kak-vybrat-podvesnoy-potolok",
    description:
      "Разбираем, на что смотреть при выборе подвесного потолка для офиса, торгового центра, медицинского учреждения или общественного пространства.",
    category: "potolochnye-sistemy",
    isMain: true,
  },
  {
    title: "Кассетные потолки: где применяются и чем отличаются",
    href: "/articles/kassetnye-potolki",
    description:
      "Кассетные потолочные системы остаются одним из самых практичных решений для коммерческих помещений.",
    category: "potolochnye-sistemy",
  },
  {
    title: "Потолки Грильято: плюсы, минусы и особенности",
    href: "/articles/grilyato",
    description:
      "Грильято — выразительная ячеистая потолочная система для общественных и коммерческих пространств.",
    category: "potolochnye-sistemy",
  },
  {
    title: "Реечные потолки для офисов, ТЦ и общественных пространств",
    href: "/articles/reechnye-potolki",
    description:
      "Реечные потолочные системы подходят для помещений с активной эксплуатацией и высокими требованиями к внешнему виду.",
    category: "potolochnye-sistemy",
  },
  {
    title: "Ревизионные люки под плитку и под покраску: что выбрать",
    href: "/articles/revizionnye-lyuki-pod-plitku-i-pokrasku",
    description:
      "Ревизионный люк должен давать доступ к коммуникациям и при этом аккуратно вписываться в интерьер.",
    category: "revizionnye-lyuki",
    isMain: true,
  },
  {
    title: "Как выбрать поставщика строительных материалов для объекта",
    href: "/articles/postavshchik-stroymaterialov",
    description:
      "Для строительного объекта поставщик — это не просто продавец, а участник процесса, от которого зависят сроки и комплектация.",
    category: "postavki-stroymaterialov",
    isMain: true,
  },
];

export function getArticlesByCategory(category: ArticleCategorySlug) {
  return articles.filter((article) => article.category === category);
}

export function getCategoryBySlug(slug: ArticleCategorySlug) {
  return articleCategories.find((category) => category.slug === slug);
}

export function getActiveCategories() {
  return articleCategories.filter((category) => getArticlesByCategory(category.slug).length > 0);
}
