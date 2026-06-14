import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Решения для застройщиков",
  description: "Комплектация строительных объектов материалами и потолочными системами для застройщиков: расчёт, подбор и поставка по России.",
};

export default function Page() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Решения", href: "/solutions" }, { label: "Застройщиков" }]} />
        <p className="label">Решения для клиентов</p>
        <h1>Решения для застройщиков</h1>
        <p>Комплектуем строительные объекты материалами и потолочными системами с учётом сроков, проектных требований и логистики.</p>
        <div className="heroButtons">
          <a className="button primary" href="/#request">Получить расчёт для объекта</a>
          <a className="button secondary" href="tel:+79266961386">Позвонить</a>
        </div>
      </section>

      <section className="detailSection">
        <div>
          <h2>Что берём на себя</h2>
          <ul>
            <li>Подбор материалов под требования объекта</li>
            <li>Поэлементный расчёт комплектации</li>
            <li>Поставка напрямую от производителей</li>
            <li>Доставка материалов на объект по России</li>
            <li>Сопровождение на этапе согласования спецификации</li>
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
