import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Металлопрокат — Иделеон",
  description: "Металлопрокат для строительных объектов с поставкой по России.",
};

export default function CatalogItemPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, { label: "Металлопрокат" }]} />
          <p className="label">Каталог</p>
          <h1>Металлопрокат</h1>
          <p>Металлопрокат для строительных объектов: трубы, листы, профиль, уголок, швеллер и другие позиции.</p>
          <div className="heroButtons">
            <a className="button primary" href="/#request">Получить расчёт</a>
            <a className="button secondary" href="/catalog">В каталог</a>
          </div>
        </div>

        <div className="productHeroImage">
          <img src="/images/catalog/metal-roll.jpg" alt="Металлопрокат" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Для кого подходит</h2>
          <ul>
              <li>строительных компаний</li>
              <li>застройщиков</li>
              <li>производственных объектов</li>
              <li>монтажных организаций</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
              <li>трубы</li>
              <li>листы</li>
              <li>профиль</li>
              <li>уголок</li>
              <li>швеллер</li>
              <li>другой металлопрокат под задачу</li>
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
