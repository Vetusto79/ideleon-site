import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
export const metadata = {
  title: "Статьи о строительных материалах и потолочных системах",
  description: "Полезные статьи Иделеон о строительных материалах, потолочных системах, ревизионных люках, профиле для ГКЛ и выборе поставщика.",
};

export default function Articles() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статьи" }]} />
        <p className="label">Статьи</p>
        <h1>Полезные материалы для строителей, подрядчиков и застройщиков</h1>
        <p>
          Здесь будут практические статьи по строительным материалам, потолочным системам,
          расчётам, подбору решений и комплектации объектов.
        </p>
      </section>

      <section className="articleListSection">
        <div className="articleGrid articleGridLarge">
          <a className="articleCard" href="/articles/kak-vybrat-podvesnoy-potolok" key="kak-vybrat-podvesnoy-potolok">
            <h3>Как выбрать подвесную потолочную систему для коммерческого объекта</h3>
            <p>Разбираем, на что смотреть при выборе подвесного потолка для офиса, торгового центра, медицинского учреждения или общественного пространства.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/kassetnye-potolki" key="kassetnye-potolki">
            <h3>Кассетные потолки: где применяются и чем отличаются</h3>
            <p>Кассетные потолочные системы остаются одним из самых практичных решений для коммерческих помещений.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/grilyato" key="grilyato">
            <h3>Потолки Грильято: плюсы, минусы и особенности</h3>
            <p>Грильято — выразительная ячеистая потолочная система для общественных и коммерческих пространств.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/reechnye-potolki" key="reechnye-potolki">
            <h3>Реечные потолки для офисов, ТЦ и общественных пространств</h3>
            <p>Реечные потолочные системы подходят для помещений с активной эксплуатацией и высокими требованиями к внешнему виду.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/revizionnye-lyuki" key="revizionnye-lyuki">
            <h3>Ревизионные люки под плитку и под покраску: что выбрать</h3>
            <p>Ревизионный люк должен давать доступ к коммуникациям и при этом аккуратно вписываться в интерьер.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/kak-rasschitat-profil-dlya-gipsokartona" key="kak-rasschitat-profil-dlya-gipsokartona">
            <h3>Как рассчитать и выбрать профиль для гипсокартона</h3>
            <p>Виды, размеры, толщина 0,6 мм, потолочные и перегородочные профили, а также подход к расчёту профиля для объекта.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/postavshchik-stroymaterialov" key="postavshchik-stroymaterialov">
            <h3>Как выбрать поставщика строительных материалов для объекта</h3>
            <p>Для строительного объекта поставщик — это не просто продавец, а участник процесса, от которого зависят сроки и комплектация.</p>
            <span>Читать статью →</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
