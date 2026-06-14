function Header() {
  return (
    <header className="header">
      <a className="logo" href="/">
        <img src="/images/logo/ideleon-logo-horizontal.svg" alt="Иделеон" />
      </a>

      <nav className="nav">
        <a href="/catalog">Каталог</a>
        <a href="/solutions">Решения</a>
        <a href="/#brands">Бренды</a>
        <a href="/articles">Статьи</a>
        <a href="/#about">О компании</a>
        <a href="/#contacts">Контакты</a>
      </nav>

      <div className="headerContacts">
        <a href="tel:+79266961386">+7-926-696-13-86</a>
        <a href="tel:+79150384030">+7-915-038-40-30</a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer id="contacts" className="footer">
      <div>
        <img className="footerLogo" src="/images/logo/ideleon-logo-horizontal.svg" alt="Иделеон" />
        <p>Комплексные поставки строительных материалов и решений.</p>
      </div>
      <div>
        <strong>Контакты</strong>
        <p>+7-926-696-13-86</p>
        <p>+7-915-038-40-30</p>
        <p>ilya@ideleon.com</p>
        <p>alexei@ideleon.com</p>
        <p>г. Москва</p>
      </div>
      <div>
        <strong>Реквизиты</strong>
        <p>ООО «ИДЕЛЕОН»</p>
        <p>ИНН: 7751381987</p>
        <p>ОГРН: 1257700589266</p>
      </div>
    </footer>
  );
}

export const metadata = {
  title: "Решения для подрядчиков",
  description: "Помогаем подрядчикам подобрать строительные материалы, рассчитать комплектацию и организовать поставку под график работ.",
};

export default function Page() {
  return (
    <main>
      <Header />

      <section className="pageHero">
        <nav className="breadcrumbs" aria-label="Навигационная цепочка">
          <a href="/">Главная</a>
          <span className="crumbSep">/</span>
          <a href="/solutions">Решения</a>
          <span className="crumbSep">/</span>
          <span>Подрядчиков</span>
        </nav>
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

      <Footer />
    </main>
  );
}
