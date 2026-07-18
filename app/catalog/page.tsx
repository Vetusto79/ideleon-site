import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";

export const metadata = {
  title: "Каталог строительных материалов",
  description:
    "Каталог строительных материалов и потолочных систем Иделеон: профиль для ГКЛ, потолки, люки, фальшполы, сендвич-панели, газосиликатные блоки, силикатный и керамический кирпич, металлопрокат и арматура.",
};

const catalogItems = [
  {
    slug: "gkl-profile",
    image: "/images/catalog/gkl-profile.jpg",
    alt: "Профиль для гипсокартона",
    title: "Профиль для гипсокартона",
    description:
      "Поставляем профиль для гипсокартона и комплектующие для перегородок, облицовок и потолочных систем.",
  },
  {
    slug: "cassette-ceilings",
    image: "/images/catalog/cassette-ceiling.jpg",
    alt: "Подвесные кассетные потолочные системы",
    title: "Подвесные кассетные потолочные системы",
    description:
      "Кассетные потолки для офисов, торговых помещений, медицинских учреждений и общественных объектов.",
  },
  {
    slug: "rack-ceilings",
    image: "/images/catalog/rack-ceiling.jpg",
    alt: "Реечные потолочные системы",
    title: "Реечные потолочные системы",
    description:
      "Реечные потолки для общественных пространств, офисов, торговых объектов и помещений с активной эксплуатацией.",
  },
  {
    slug: "design-ceilings",
    image: "/images/catalog/design-ceiling.jpg",
    alt: "Дизайнерские потолочные решения",
    title: "Дизайнерские потолочные решения",
    description:
      "Потолочные решения для проектов, где важны архитектура, внешний вид и индивидуальная конфигурация.",
  },
  {
    slug: "medical-ceilings",
    image: "/images/catalog/medical-ceiling.jpg",
    alt: "Потолочные решения для медицинских учреждений",
    title: "Потолочные решения для медицинских учреждений",
    description:
      "Потолочные системы и материалы для медицинских объектов, где важны эксплуатационные требования и практичность.",
  },
  {
    slug: "grilyato",
    image: "/images/catalog/grilyato.jpg",
    alt: "Потолки Грильято",
    title: "Потолки Грильято",
    description:
      "Ячеистые потолочные системы Грильято для торговых центров, офисов, холлов и общественных пространств.",
  },
  {
    slug: "revision-hatches",
    image: "/images/catalog/revision-hatch.jpg",
    alt: "Ревизионные люки",
    title: "Ревизионные люки",
    description:
      "Потайные ревизионные люки под плитку и под покраску для доступа к инженерным коммуникациям.",
  },
  {
    slug: "raised-floors",
    image: "/images/catalog/raised-floor.jpg",
    alt: "Фальшполы",
    title: "Фальшполы",
    description:
      "Модульные фальшполы для офисов, серверных, технических помещений и объектов с инженерными коммуникациями под полом.",
  },
  {
    slug: "sandwich-panels",
    image: "/images/catalog/sandwich-panel.jpg",
    alt: "Сендвич-панели",
    title: "Сендвич-панели",
    description:
      "Сендвич-панели для быстровозводимых зданий, складов, производственных и коммерческих объектов.",
  },
  {
    slug: "gazosilikatnyy-blok",
    image: "/images/catalog/gas-silicate-block.jpg",
    alt: "Газосиликатные блоки на поддоне",
    title: "Газосиликатный блок",
    description:
      "Стеновые и перегородочные газосиликатные блоки для малоэтажного строительства и заполнения каркасных зданий.",
  },
  {
    slug: "kirpich-silikatnyy",
    image: "/images/catalog/silicate-brick.jpg",
    alt: "Белый силикатный кирпич на поддоне",
    title: "Кирпич силикатный",
    description:
      "Рядовой и лицевой силикатный кирпич для стен, перегородок и облицовки по требованиям проекта.",
  },
  {
    slug: "kirpich-keramicheskiy",
    image: "/images/catalog/ceramic-brick.jpg",
    alt: "Красный керамический кирпич на поддоне",
    title: "Кирпич керамический",
    description:
      "Рядовой и лицевой керамический кирпич для кладки стен, перегородок и оформления фасадов.",
  },
  {
    slug: "metal-roll",
    image: "/images/catalog/metal-roll.jpg",
    alt: "Металлопрокат",
    title: "Металлопрокат",
    description:
      "Металлопрокат для строительных объектов: трубы, листы, профиль, уголок, швеллер и другие позиции.",
  },
  {
    slug: "rebar",
    image: "/images/catalog/rebar.jpg",
    alt: "Арматура",
    title: "Арматура",
    description:
      "Стальная арматура для монолитного строительства и комплектации строительных объектов.",
  },
];

export default function Catalog() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
        <p className="label">Каталог</p>
        <h1>Строительные материалы и потолочные системы для объектов</h1>
        <p>
          Подбираем материалы, выполняем поэлементный расчёт и организуем поставку
          для застройщиков, подрядчиков, строительных компаний и магазинов.
        </p>
      </section>

      <section className="catalogListSection">
        <div className="catalogGrid">
          {catalogItems.map((item) => (
            <a className="catalogCard" href={`/catalog/${item.slug}`} key={item.slug}>
              <div className="catalogImage">
                <img src={item.image} alt={item.alt} />
              </div>
              <div className="catalogText">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span>Подробнее →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
