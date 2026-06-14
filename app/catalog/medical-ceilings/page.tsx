import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Потолочные решения для медицинских учреждений — Иделеон",
  description: "Потолочные системы для медицинских учреждений.",
};

export default function CatalogItemPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, { label: "Потолочные решения для медицинских учреждений" }]} />
          <p className="label">Каталог</p>
          <h1>Потолочные решения для медицинских учреждений</h1>
          <p>Потолочные системы и материалы для медицинских объектов, где важны эксплуатационные требования и практичность.</p>
          <div className="heroButtons">
            <a className="button primary" href="/#request">Получить расчёт</a>
            <a className="button secondary" href="/catalog">В каталог</a>
          </div>
        </div>

        <div className="productHeroImage">
          <img src="/images/catalog/medical-ceiling.jpg" alt="Потолочные решения для медицинских учреждений" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Для кого подходит</h2>
          <ul>
              <li>клиник</li>
              <li>медицинских центров</li>
              <li>лабораторий</li>
              <li>чистых и технических помещений</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
              <li>потолочные системы</li>
              <li>влагостойкие решения</li>
              <li>комплектующие</li>
              <li>расчёт под проект</li>
              <li>поставку материалов</li>
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
