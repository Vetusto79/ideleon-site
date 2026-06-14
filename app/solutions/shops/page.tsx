function Header() {
  return (
    <header className="header">
      <a className="logo" href="/">
        <img src="/images/logo/ideleon-logo-horizontal.svg" alt="Иделеон" />
      </a>

      <nav className="nav">
        <a href="/#catalog">Каталог</a>
        <a href="/solutions">Решения</a>
        <a href="/#brands">Бренды</a>
        <a href="/#articles">Статьи</a>
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

export default function Page() {
  return (
    <main>
      <Header />

      <section className="pageHero">
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

      <Footer />
    </main>
  );
}

