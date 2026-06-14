import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Подвесные кассетные потолочные системы — Иделеон",
  description: "Кассетные потолочные системы для коммерческих объектов.",
};

export default function CatalogItemPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, { label: "Подвесные кассетные потолочные системы" }]} />
          <p className="label">Каталог</p>
          <h1>Подвесные кассетные потолочные системы</h1>
          <p>Кассетные потолки для офисов, торговых помещений, медицинских учреждений и общественных объектов.</p>
          <div className="heroButtons">
            <a className="button primary" href="/#request">Получить расчёт</a>
            <a className="button secondary" href="/catalog">В каталог</a>
          </div>
        </div>

        <div className="productHeroImage">
          <img src="/images/catalog/cassette-ceiling.jpg" alt="Подвесные кассетные потолочные системы" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Для кого подходит</h2>
          <ul>
              <li>офисных центров</li>
              <li>торговых помещений</li>
              <li>административных зданий</li>
              <li>медицинских учреждений</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
              <li>кассеты</li>
              <li>подвесную систему</li>
              <li>пристенный уголок</li>
              <li>комплектующие</li>
              <li>расчёт материалов под проект</li>
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
