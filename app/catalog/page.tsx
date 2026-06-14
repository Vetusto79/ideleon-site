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
  title: "Каталог строительных материалов — Иделеон",
  description: "Каталог строительных материалов и потолочных систем Иделеон: профиль для ГКЛ, потолки, люки, фальшполы, сендвич-панели, металлопрокат и арматура.",
};

export default function Catalog() {
  return (
    <main>
      <Header />

      <section className="pageHero">
        <p className="label">Каталог</p>
        <h1>Строительные материалы и потолочные системы для объектов</h1>
        <p>
          Подбираем материалы, выполняем поэлементный расчёт и организуем поставку
          для застройщиков, подрядчиков, строительных компаний и магазинов.
        </p>
      </section>

      <section className="catalogListSection">
        <div className="catalogGrid">
          <a className="catalogCard" href="/catalog/gkl-profile" key="gkl-profile">
            <div className="catalogImage">
              <img src="/images/catalog/gkl-profile.jpg" alt="Профиль для гипсокартона" />
            </div>
            <div className="catalogText">
              <h3>Профиль для гипсокартона</h3>
              <p>Поставляем профиль для гипсокартона и комплектующие для перегородок, облицовок и потолочных систем.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/cassette-ceilings" key="cassette-ceilings">
            <div className="catalogImage">
              <img src="/images/catalog/cassette-ceiling.jpg" alt="Подвесные кассетные потолочные системы" />
            </div>
            <div className="catalogText">
              <h3>Подвесные кассетные потолочные системы</h3>
              <p>Кассетные потолки для офисов, торговых помещений, медицинских учреждений и общественных объектов.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/rack-ceilings" key="rack-ceilings">
            <div className="catalogImage">
              <img src="/images/catalog/rack-ceiling.jpg" alt="Реечные потолочные системы" />
            </div>
            <div className="catalogText">
              <h3>Реечные потолочные системы</h3>
              <p>Реечные потолки для общественных пространств, офисов, торговых объектов и помещений с активной эксплуатацией.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/design-ceilings" key="design-ceilings">
            <div className="catalogImage">
              <img src="/images/catalog/design-ceiling.jpg" alt="Дизайнерские потолочные решения" />
            </div>
            <div className="catalogText">
              <h3>Дизайнерские потолочные решения</h3>
              <p>Потолочные решения для проектов, где важны архитектура, внешний вид и индивидуальная конфигурация.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/medical-ceilings" key="medical-ceilings">
            <div className="catalogImage">
              <img src="/images/catalog/medical-ceiling.jpg" alt="Потолочные решения для медицинских учреждений" />
            </div>
            <div className="catalogText">
              <h3>Потолочные решения для медицинских учреждений</h3>
              <p>Потолочные системы и материалы для медицинских объектов, где важны эксплуатационные требования и практичность.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/grilyato" key="grilyato">
            <div className="catalogImage">
              <img src="/images/catalog/grilyato.jpg" alt="Потолки Грильято" />
            </div>
            <div className="catalogText">
              <h3>Потолки Грильято</h3>
              <p>Ячеистые потолочные системы Грильято для торговых центров, офисов, холлов и общественных пространств.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/revision-hatches" key="revision-hatches">
            <div className="catalogImage">
              <img src="/images/catalog/revision-hatch.jpg" alt="Ревизионные люки" />
            </div>
            <div className="catalogText">
              <h3>Ревизионные люки</h3>
              <p>Потайные ревизионные люки под плитку и под покраску для доступа к инженерным коммуникациям.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/raised-floors" key="raised-floors">
            <div className="catalogImage">
              <img src="/images/catalog/raised-floor.jpg" alt="Фальшполы" />
            </div>
            <div className="catalogText">
              <h3>Фальшполы</h3>
              <p>Модульные фальшполы для офисов, серверных, технических помещений и объектов с инженерными коммуникациями под полом.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/sandwich-panels" key="sandwich-panels">
            <div className="catalogImage">
              <img src="/images/catalog/sandwich-panel.jpg" alt="Сендвич-панели" />
            </div>
            <div className="catalogText">
              <h3>Сендвич-панели</h3>
              <p>Сендвич-панели для быстровозводимых зданий, складов, производственных и коммерческих объектов.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/metal-roll" key="metal-roll">
            <div className="catalogImage">
              <img src="/images/catalog/metal-roll.jpg" alt="Металлопрокат" />
            </div>
            <div className="catalogText">
              <h3>Металлопрокат</h3>
              <p>Металлопрокат для строительных объектов: трубы, листы, профиль, уголок, швеллер и другие позиции.</p>
              <span>Подробнее →</span>
            </div>
          </a>
          <a className="catalogCard" href="/catalog/rebar" key="rebar">
            <div className="catalogImage">
              <img src="/images/catalog/rebar.jpg" alt="Арматура" />
            </div>
            <div className="catalogText">
              <h3>Арматура</h3>
              <p>Стальная арматура для монолитного строительства и комплектации строительных объектов.</p>
              <span>Подробнее →</span>
            </div>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

