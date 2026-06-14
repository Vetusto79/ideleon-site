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
  title: "Арматура — Иделеон",
  description: "Арматура для строительных объектов и монолитных работ.",
};

export default function CatalogItemPage() {
  return (
    <main>
      <Header />

      <section className="productHero">
        <div>
        <nav className="breadcrumbs" aria-label="Навигационная цепочка">
          <a href="/">Главная</a>
          <span className="crumbSep">/</span>
          <a href="/catalog">Каталог</a>
          <span className="crumbSep">/</span>
          <span>Арматура</span>
        </nav>
          <p className="label">Каталог</p>
          <h1>Арматура</h1>
          <p>Стальная арматура для монолитного строительства и комплектации строительных объектов.</p>
          <div className="heroButtons">
            <a className="button primary" href="/#request">Получить расчёт</a>
            <a className="button secondary" href="/catalog">В каталог</a>
          </div>
        </div>

        <div className="productHeroImage">
          <img src="/images/catalog/rebar.jpg" alt="Арматура" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Для кого подходит</h2>
          <ul>
              <li>монолитных работ</li>
              <li>застройщиков</li>
              <li>строительных компаний</li>
              <li>подрядчиков</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
              <li>арматуру разных диаметров</li>
              <li>поставку партиями</li>
              <li>расчёт объёма</li>
              <li>комплектацию объекта</li>
              <li>организацию доставки</li>
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

      <section className="productCta">
        <div>
          <h2>Нужно рассчитать материалы?</h2>
          <p>
            Пришлите задачу, проект или список позиций — Иделеон поможет подобрать
            материалы и подготовить предложение.
          </p>
        </div>
        <a className="button primary" href="/#request">Получить расчёт</a>
      </section>

      <Footer />
    </main>
  );
}
