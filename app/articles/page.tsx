import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";

export const metadata = {
  title: "Статьи о строительных материалах и потолочных системах",
  description:
    "Полезные статьи Иделеон о строительных материалах, потолочных системах, сэндвич-панелях, металлопрокате, профиле для ГКЛ и выборе поставщика.",
};

type ArticleCard = {
  href: string;
  title: string;
  text: string;
  featured?: boolean;
};

type ArticleCategory = {
  id: string;
  navLabel: string;
  label: string;
  title: string;
  description: string;
  categoryHref?: string;
  articles: ArticleCard[];
};

const categories: ArticleCategory[] = [
  {
    id: "profil-dlya-gkl",
    navLabel: "Профиль ГКЛ",
    label: "Профиль ГКЛ",
    title: "Профиль для ГКЛ",
    description:
      "Статьи о выборе, расчёте, толщине и применении профилей для гипсокартонных систем на объектах.",
    categoryHref: "/articles/profil-dlya-gkl",
    articles: [
      {
        href: "/articles/kak-rasschitat-profil-dlya-gipsokartona",
        title: "Как рассчитать и выбрать профиль для гипсокартона",
        text: "Виды, размеры, толщина 0,6 мм, потолочные и перегородочные профили, а также подход к расчёту профиля для объекта.",
        featured: true,
      },
      {
        href: "/articles/pp-60x27-i-ppn-28x27-dlya-gipsokartona",
        title: "ПП 60×27 и ППН 28×27: потолочная пара профилей для гипсокартона",
        text: "Чем отличаются потолочный профиль ПП 60×27 и направляющий ППН 28×27, где они применяются и почему работают в паре.",
      },
      {
        href: "/articles/tolshchina-profilya-dlya-gipsokartona",
        title: "Какой толщины выбрать профиль для ГКЛ: 0,6 мм, 0,5 мм или 0,4 мм",
        text: "Разбираем, почему экономия на тонком профиле может увеличить расход материалов, трудозатраты и итоговую стоимость конструкции.",
      },
    ],
  },
  {
    id: "potolochnye-sistemy",
    navLabel: "Потолки",
    label: "Потолки",
    title: "Потолочные системы",
    description:
      "Материалы о подвесных, кассетных, реечных потолках, Грильято и других потолочных решениях для коммерческих объектов.",
    categoryHref: "/articles/potolochnye-sistemy",
    articles: [
      {
        href: "/articles/kak-vybrat-podvesnoy-potolok",
        title: "Как выбрать подвесную потолочную систему для коммерческого объекта",
        text: "Разбираем, на что смотреть при выборе подвесного потолка для офиса, торгового центра, медицинского учреждения или общественного пространства.",
        featured: true,
      },
      {
        href: "/articles/kak-vybrat-potolok-grilyato",
        title: "Как выбрать потолок Грильято: ячейка, профиль, расчёт и поставка",
        text: "Размер ячейки, высота профиля, тип системы, цвет, комплектующие и предварительный расчёт для объекта.",
      },
      {
        href: "/articles/kassetnyy-potolok-otkrytaya-sistema",
        title: "Кассетный потолок на открытой системе: кромки, Т-профиль и расчёт",
        text: "Кромки Board, Tegular и Line, выбор Т-15 или Т-24, расчёт кассет, подвесов и комплектующих.",
      },
      {
        href: "/articles/kassetnye-potolki",
        title: "Кассетные потолки: где применяются и чем отличаются",
        text: "Кассетные потолочные системы остаются одним из самых практичных решений для коммерческих помещений.",
      },
      {
        href: "/articles/grilyato",
        title: "Потолки Грильято: плюсы, минусы и особенности",
        text: "Грильято — выразительная ячеистая потолочная система для общественных и коммерческих пространств.",
      },
      {
        href: "/articles/reechnye-potolki",
        title: "Реечные потолки для офисов, ТЦ и общественных пространств",
        text: "Реечные потолочные системы подходят для помещений с активной эксплуатацией и высокими требованиями к внешнему виду.",
      },
    ],
  },
  {
    id: "revizionnye-lyuki",
    navLabel: "Люки",
    label: "Люки",
    title: "Ревизионные люки",
    description:
      "Практические материалы о выборе ревизионных люков под плитку, под покраску и для доступа к инженерным коммуникациям.",
    categoryHref: "/articles/revizionnye-lyuki",
    articles: [
      {
        href: "/articles/revizionnye-lyuki-pod-plitku-i-pokrasku",
        title: "Ревизионные люки под плитку и под покраску: что выбрать",
        text: "Ревизионный люк должен давать доступ к коммуникациям и при этом аккуратно вписываться в интерьер.",
        featured: true,
      },
    ],
  },
  {
    id: "sendvich-paneli",
    navLabel: "Сэндвич-панели",
    label: "Ограждающие конструкции",
    title: "Сэндвич-панели",
    description:
      "Выбор стеновых и кровельных панелей, утеплителя, толщины, доборных элементов и комплектации поставки.",
    articles: [
      {
        href: "/articles/sendvich-paneli-dlya-stroitelstva",
        title: "Сэндвич-панели для строительства: как выбрать и рассчитать поставку",
        text: "Что учесть при выборе панели и почему вместе с площадью нужно считать доборы, крепёж, проёмы и логистику.",
        featured: true,
      },
    ],
  },
  {
    id: "metalloprokat",
    navLabel: "Металлопрокат",
    label: "Металлопрокат",
    title: "Металлопрокат для строительных объектов",
    description:
      "Практические материалы о расчёте веса, длины, количества, стоимости и логистики металлопроката.",
    articles: [
      {
        href: "/articles/metalloprokat-dlya-stroitelnogo-obekta",
        title: "Металлопрокат для строительного объекта: как рассчитать и заказать",
        text: "Арматура, трубы, уголок, швеллер, лист и балка: что указать в заявке и как связаны длина, вес и доставка.",
        featured: true,
      },
    ],
  },
  {
    id: "postavki-stroymaterialov",
    navLabel: "Поставки",
    label: "Поставки",
    title: "Поставки и комплектация объектов",
    description:
      "Статьи о выборе поставщика, комплектации объектов, работе со спецификациями и снижении рисков при закупке материалов.",
    categoryHref: "/articles/postavki-stroymaterialov",
    articles: [
      {
        href: "/articles/postavshchik-stroymaterialov",
        title: "Как выбрать поставщика строительных материалов для объекта",
        text: "Для строительного объекта поставщик — это не просто продавец, а участник процесса, от которого зависят сроки и комплектация.",
        featured: true,
      },
    ],
  },
];

export default function ArticlesPage() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статьи" }]} />
        <p className="label">Статьи</p>
        <h1>Полезные материалы для строителей, подрядчиков и застройщиков</h1>
        <p>
          Практические статьи по строительным материалам, потолочным системам,
          расчётам, подбору решений и комплектации объектов. Материалы разложены по
          тематическим рубрикам, чтобы нужную информацию было проще найти.
        </p>
      </section>

      <section className="articleHubSection">
        <div className="articleCategoryNav">
          {categories.map((category) => (
            <a href={`#${category.id}`} key={category.id}>
              {category.navLabel}
            </a>
          ))}
        </div>

        <div className="articleCategoryGrid">
          {categories.map((category) => (
            <section className="articleCategoryBlock" id={category.id} key={category.id}>
              <div className="articleCategoryHeader">
                <div>
                  <p className="label">{category.label}</p>
                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                </div>
                {category.categoryHref ? (
                  <a className="articleCategoryLink" href={category.categoryHref}>
                    Все статьи рубрики →
                  </a>
                ) : null}
              </div>

              <div className="articleGrid articleGridLarge">
                {category.articles.map((article) => (
                  <a
                    className={
                      article.featured ? "articleCard articleCardFeatured" : "articleCard"
                    }
                    href={article.href}
                    key={article.href}
                  >
                    {article.featured ? <span className="articleBadge">Главная статья</span> : null}
                    <h3>{article.title}</h3>
                    <p>{article.text}</p>
                    <span>Читать статью →</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
