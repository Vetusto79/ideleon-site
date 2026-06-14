import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Решения для подрядчиков",
  description: "Помогаем подрядчикам подобрать строительные материалы, рассчитать комплектацию и организовать поставку под график работ.",
};

export default function Page() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Решения", href: "/solutions" }, { label: "Подрядчиков" }]} />
        <p className="label">Решения для клиентов</p>
        <h1>Решения для подрядчиков</h1>
        <p>Помогаем подрядным организациям быстро подобрать материалы, закрыть спецификацию и получить поставку под график выполнения работ.</p>
        <div className="heroButtons">
          <a className="button primary" href="/#request">Обсудить задачу</a>
          <a className="button secondary" href="tel:+79266961386">Позвонить</a>
        </div>
      </section>

      <section className="detailSection">
        <div>
          <h2>Что берём на себя</h2>
          <ul>
            <li>Подбор аналогов и оптимальных решений</li>
            <li>Расчёт объёмов материалов</li>
            <li>Поставка потолочных систем, профиля, люков и других материалов</li>
            <li>Оперативная коммуникация с менеджером</li>
            <li>Организация доставки на объект</li>
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
