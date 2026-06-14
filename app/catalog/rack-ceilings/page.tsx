import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Реечные потолочные системы — Иделеон",
  description: "Реечные потолки с подбором и поставкой комплектующих.",
};

export default function CatalogItemPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, { label: "Реечные потолочные системы" }]} />
          <p className="label">Каталог</p>
          <h1>Реечные потолочные системы</h1>
          <p>Реечные потолки для общественных пространств, офисов, торговых объектов и помещений с активной эксплуатацией.</p>
          <div className="heroButtons">
            <a className="button primary" href="/#request">Получить расчёт</a>
            <a className="button secondary" href="/catalog">В каталог</a>
          </div>
        </div>

        <div className="productHeroImage">
          <img src="/images/catalog/rack-ceiling.jpg" alt="Реечные потолочные системы" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Для кого подходит</h2>
          <ul>
              <li>торговых центров</li>
              <li>офисов</li>
              <li>санузлов и коридоров</li>
              <li>общественных зданий</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
              <li>реечные панели</li>
              <li>несущие шины</li>
              <li>подвесы</li>
              <li>пристенные элементы</li>
              <li>комплектующие для монтажа</li>
          </ul>
        </div>
      </section>

      <section className="productProcess">
        <p className="label">Как работаем</p>
        <h2>Берём на себя подбор, расчёт и поставку</h2>
        <div className="steps">
          <div>1. Получаем задачу</div>
          <div>2. Подбираем материалы</div>
          <div>3. Считаем комплектность</div>
          <div>4. Организуем поставку</div>
        </div>
      </section>

      <LeadCapture
        title="Нужно рассчитать материалы?"
        text="Пришлите задачу, проект или список позиций — Иделеон поможет подобрать материалы и подготовить предложение."
      />

      <SiteFooter />
    </main>
  );
}
