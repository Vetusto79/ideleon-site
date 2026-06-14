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
  title: "Статьи о строительных материалах и потолочных системах",
  description: "Полезные статьи Иделеон о строительных материалах, потолочных системах, ревизионных люках, профиле для ГКЛ и выборе поставщика.",
};

export default function Articles() {
  return (
    <main>
      <Header />

      <section className="pageHero">
        <nav className="breadcrumbs" aria-label="Навигационная цепочка">
          <a href="/">Главная</a>
          <span className="crumbSep">/</span>
          <span>Статьи</span>
        </nav>
        <p className="label">Статьи</p>
        <h1>Полезные материалы для строителей, подрядчиков и застройщиков</h1>
        <p>
          Здесь будут практические статьи по строительным материалам, потолочным системам,
          расчётам, подбору решений и комплектации объектов.
        </p>
      </section>

      <section className="articleListSection">
        <div className="articleGrid articleGridLarge">
          <a className="articleCard" href="/articles/kak-vybrat-podvesnoy-potolok" key="kak-vybrat-podvesnoy-potolok">
            <h3>Как выбрать подвесную потолочную систему для коммерческого объекта</h3>
            <p>Разбираем, на что смотреть при выборе подвесного потолка для офиса, торгового центра, медицинского учреждения или общественного пространства.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/kassetnye-potolki" key="kassetnye-potolki">
            <h3>Кассетные потолки: где применяются и чем отличаются</h3>
            <p>Кассетные потолочные системы остаются одним из самых практичных решений для коммерческих помещений.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/grilyato" key="grilyato">
            <h3>Потолки Грильято: плюсы, минусы и особенности</h3>
            <p>Грильято — выразительная ячеистая потолочная система для общественных и коммерческих пространств.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/reechnye-potolki" key="reechnye-potolki">
            <h3>Реечные потолки для офисов, ТЦ и общественных пространств</h3>
            <p>Реечные потолочные системы подходят для помещений с активной эксплуатацией и высокими требованиями к внешнему виду.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/revizionnye-lyuki" key="revizionnye-lyuki">
            <h3>Ревизионные люки под плитку и под покраску: что выбрать</h3>
            <p>Ревизионный люк должен давать доступ к коммуникациям и при этом аккуратно вписываться в интерьер.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/profil-dlya-gkl" key="profil-dlya-gkl">
            <h3>Как рассчитать профиль для гипсокартона</h3>
            <p>Профиль для ГКЛ нужно считать не только по площади, но и по конструкции, шагу, высоте и нагрузкам.</p>
            <span>Читать статью →</span>
          </a>
          <a className="articleCard" href="/articles/postavshchik-stroymaterialov" key="postavshchik-stroymaterialov">
            <h3>Как выбрать поставщика строительных материалов для объекта</h3>
            <p>Для строительного объекта поставщик — это не просто продавец, а участник процесса, от которого зависят сроки и комплектация.</p>
            <span>Читать статью →</span>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
