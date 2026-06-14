import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Решения для строительных магазинов",
  description: "Оптовые поставки строительных материалов и потолочных систем для строительных магазинов и торговых организаций.",
};

export default function Page() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Решения", href: "/solutions" }, { label: "Строительных магазинов" }]} />
        <p className="label">Решения для клиентов</p>
        <h1>Решения для строительных магазинов</h1>
        <p>Предлагаем оптовые поставки строительных материалов и потолочных систем для торговых организаций.</p>
        <div className="heroButtons">
          <a className="button primary" href="/#request">Запросить оптовые условия</a>
          <a className="button secondary" href="tel:+79266961386">Позвонить</a>
        </div>
      </section>

      <section className="detailSection">
        <div>
          <h2>Что берём на себя</h2>
          <ul>
            <li>Партнёрские условия для магазинов</li>
            <li>Поставка популярных категорий строительных материалов</li>
            <li>Возможность расширять ассортимент постепенно</li>
            <li>Работа с заявками и регулярными поставками</li>
            <li>Поддержка по брендам и товарным направлениям</li>
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
