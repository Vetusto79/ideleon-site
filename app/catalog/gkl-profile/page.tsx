import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Профиль для гипсокартона — Иделеон",
  description: "Профиль для гипсокартона с расчётом и поставкой по России.",
};

export default function CatalogItemPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, { label: "Профиль для гипсокартона" }]} />
          <p className="label">Каталог</p>
          <h1>Профиль для гипсокартона</h1>
          <p>Поставляем профиль для гипсокартона и комплектующие для перегородок, облицовок и потолочных систем.</p>
          <div className="heroButtons">
            <a className="button primary" href="/#request">Получить расчёт</a>
            <a className="button secondary" href="/catalog">В каталог</a>
          </div>
        </div>

        <div className="productHeroImage">
          <img src="/images/catalog/gkl-profile.jpg" alt="Профиль для гипсокартона" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Для кого подходит</h2>
          <ul>
              <li>подрядчиков по внутренней отделке</li>
              <li>строительных компаний</li>
              <li>застройщиков</li>
              <li>магазинов строительных материалов</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
              <li>потолочный профиль</li>
              <li>направляющий профиль</li>
              <li>стоечный профиль</li>
              <li>профиль для перегородок</li>
              <li>подвесы, соединители и крепёж</li>
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
