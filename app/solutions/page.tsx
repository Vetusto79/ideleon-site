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
            <div>
          <strong>Документы</strong>
          <p><a href="/privacy">Политика обработки персональных данных</a></p>
        </div>
      </footer>
  );
}

const solutions = [
  {
    title: "Застройщикам",
    href: "/solutions/developers",
    text: "Комплектация жилых комплексов, коммерческих объектов и крупных строительных проектов.",
  },
  {
    title: "Подрядчикам",
    href: "/solutions/contractors",
    text: "Расчёты, подбор материалов, техническая консультация и поставка под график работ.",
  },
  {
    title: "Строительным магазинам",
    href: "/solutions/shops",
    text: "Оптовые поставки, расширение ассортимента и партнёрские условия.",
  },
  {
    title: "Медицинским объектам",
    href: "/solutions/medical",
    text: "Потолочные решения и материалы для объектов с особыми требованиями к эксплуатации.",
  },
];

export const metadata = {
  title: "Решения для застройщиков, подрядчиков и строительных магазинов",
  description: "Решения Иделеон для застройщиков, подрядчиков, строительных магазинов и медицинских объектов: подбор материалов, расчёт и поставка.",
};

export default function Solutions() {
  return (
    <main>
      <Header />

      <section className="pageHero">
        <nav className="breadcrumbs" aria-label="Навигационная цепочка">
          <a href="/">Главная</a>
          <span className="crumbSep">/</span>
          <span>Решения</span>
        </nav>
        <p className="label">Решения для клиентов</p>
        <h1>Помогаем разным участникам строительного рынка решать свои задачи</h1>
        <p>
          У застройщика, подрядчика, магазина и медицинского объекта разные требования.
          Поэтому мы разделили решения по типам клиентов.
        </p>
      </section>

      <section className="solutionPageGrid">
        {solutions.map((item) => (
          <a className="solutionPageCard" href={item.href} key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <span>Перейти →</span>
          </a>
        ))}
      </section>

      <Footer />
    </main>
  );
}
