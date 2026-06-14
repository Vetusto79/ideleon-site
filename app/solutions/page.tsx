import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
const solutions = [
  {
    title: "Застройщикам",
    href: "/solutions/developers",
    text: "Комплектация жилых комплексов, коммерческих объектов и крупных строительных проектов.",
  },
  {
    title: "Подрядчикам",
    href: "/solutions/contractors",
    text: "Расчёты, подбор материалов, техническая консультация и поставка под график работ.",
  },
  {
    title: "Строительным магазинам",
    href: "/solutions/shops",
    text: "Оптовые поставки, расширение ассортимента и партнёрские условия.",
  },
  {
    title: "Медицинским объектам",
    href: "/solutions/medical",
    text: "Потолочные решения и материалы для объектов с особыми требованиями к эксплуатации.",
  },
];

export const metadata = {
  title: "Решения для застройщиков, подрядчиков и строительных магазинов",
  description: "Решения Иделеон для застройщиков, подрядчиков, строительных магазинов и медицинских объектов: подбор материалов, расчёт и поставка.",
};

export default function Solutions() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Решения" }]} />
        <p className="label">Решения для клиентов</p>
        <h1>Помогаем разным участникам строительного рынка решать свои задачи</h1>
        <p>
          У застройщика, подрядчика, магазина и медицинского объекта разные требования.
          Поэтому мы разделили решения по типам клиентов.
        </p>
      </section>

      <section className="solutionPageGrid">
        {solutions.map((item) => (
          <a className="solutionPageCard" href={item.href} key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <span>Перейти →</span>
          </a>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}
