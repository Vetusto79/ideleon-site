import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Решения для медицинских объектов",
  description: "Потолочные системы и строительные материалы для медицинских учреждений, клиник, лабораторий и помещений с особыми требованиями.",
};

export default function Page() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Решения", href: "/solutions" }, { label: "Медицинских объектов" }]} />
        <p className="label">Решения для клиентов</p>
        <h1>Решения для медицинских объектов</h1>
        <p>Подбираем потолочные системы и строительные материалы для медицинских учреждений, где важны практичность, чистота и эксплуатационные требования.</p>
        <div className="heroButtons">
          <a className="button primary" href="/#request">Получить консультацию</a>
          <a className="button secondary" href="tel:+79266961386">Позвонить</a>
        </div>
      </section>

      <section className="detailSection">
        <div>
          <h2>Что берём на себя</h2>
          <ul>
            <li>Потолочные решения для медицинских учреждений</li>
            <li>Подбор систем под требования помещений</li>
            <li>Расчёт комплектующих и материалов</li>
            <li>Поставка продукции ведущих производителей</li>
            <li>Консультация по применению решений</li>
          </ul>
        </div>
        <div className="detailBox">
          <strong>Как работаем</strong>
          <p>Получаем задачу, разбираем проект, предлагаем решение, выполняем расчёт и организуем поставку на объект.</p>
        </div>
      </section>


      <LeadCapture
        title="Обсудим вашу задачу?"
        text="Оставьте контакты — мы уточним потребность, предложим решение и подготовим расчёт."
      />

      <SiteFooter />
    </main>
  );
}
