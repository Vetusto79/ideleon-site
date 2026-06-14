const catalog = [
  {
    title: "Профиль для гипсокартона",
    image: "/images/catalog/gkl-profile.jpg",
  },
  {
    title: "Подвесные кассетные потолочные системы",
    image: "/images/catalog/cassette-ceiling.jpg",
  },
  {
    title: "Реечные потолочные системы",
    image: "/images/catalog/rack-ceiling.jpg",
  },
  {
    title: "Дизайнерские потолочные решения",
    image: "/images/catalog/design-ceiling.jpg",
  },
  {
    title: "Потолочные решения для медицинских учреждений",
    image: "/images/catalog/medical-ceiling.jpg",
  },
  {
    title: "Потолки Грильято",
    image: "/images/catalog/grilyato.jpg",
  },
  {
    title: "Ревизионные люки",
    image: "/images/catalog/revision-hatch.jpg",
  },
  {
    title: "Фальшполы",
    image: "/images/catalog/raised-floor.jpg",
  },
  {
    title: "Сендвич-панели",
    image: "/images/catalog/sandwich-panel.jpg",
  },
  {
    title: "Металлопрокат",
    image: "/images/catalog/metal-roll.jpg",
  },
  {
    title: "Арматура",
    image: "/images/catalog/rebar.jpg",
  },
];

const brands = [
  "Knauf",
  "Албес",
  "ТехноНиколь",
  "КТЗ",
  "СПК",
  "МеталлТрейд",
];

export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="logo">
          <div className="logoIcon">ID</div>
          <div>
            <strong>ИДЕЛЕОН</strong>
            <span>строительные материалы</span>
          </div>
        </div>

        <nav className="nav">
          <a href="#catalog">Каталог</a>
          <a href="#solutions">Решения</a>
          <a href="#brands">Бренды</a>
          <a href="#contacts">Контакты</a>
        </nav>

        <div className="headerContacts">
          <a href="tel:+79266961386">+7-926-696-13-86</a>
          <a href="tel:+79150384030">+7-915-038-40-30</a>
        </div>
      </header>

      <section className="hero">
        <div className="heroText">
          <p className="label">Комплексные поставки по всей России</p>

          <h1>
            Надёжный поставщик строительных материалов для профессиональных
            строителей
          </h1>

          <p className="lead">
            Иделеон поставляет строительные и потолочные системы для
            застройщиков, подрядчиков, коммерческих объектов и строительных
            компаний. Помогаем подобрать материалы, выполнить расчёт и
            организовать поставку точно в срок.
          </p>

          <div className="heroButtons">
            <a className="button primary" href="#request">
              Получить расчёт проекта
            </a>
            <a className="button secondary" href="tel:+79266961386">
              Перезвоните мне
            </a>
          </div>
        </div>

        <div className="heroImage">
          <img
            src="/images/hero-construction.jpg"
            alt="Строительный объект"
          />
        </div>
      </section>

      <section className="features">
        <div>
          <strong>Прямые поставки</strong>
          <p>Работаем напрямую с ведущими производителями.</p>
        </div>

        <div>
          <strong>Доставка по России</strong>
          <p>Организуем перевозку через проверенных партнёров.</p>
        </div>

        <div>
          <strong>Расчёт проектов</strong>
          <p>Помогаем разложить сложные задачи на понятные шаги.</p>
        </div>

        <div>
          <strong>Проектирование</strong>
          <p>Разрабатываем решения для подвесных потолочных систем.</p>
        </div>
      </section>

      <section id="catalog" className="section">
        <p className="label">Каталог продукции</p>
        <h2>Материалы и решения для строительства</h2>

        <div className="catalogGrid">
          {catalog.map((item, index) => (
            <article className="catalogCard" key={item.title}>
              <div className="catalogImage">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="catalogText">
                <span>{index + 1}.</span>
                <h3>{item.title}</h3>
                <p>
                  Подберём материалы, рассчитаем объём и организуем поставку на
                  объект.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="solutions" className="darkSection">
        <p className="label">Наш подход</p>
        <h2>Помогаем разобраться со сложными проектами</h2>

        <p>
          Иделеон не просто продаёт материалы. Мы анализируем задачу,
          подбираем решение, выполняем поэлементный расчёт и организуем
          поставку.
        </p>

        <div className="steps">
          <div>1. Анализ проекта</div>
          <div>2. Подбор решения</div>
          <div>3. Расчёт материалов</div>
          <div>4. Поставка на объект</div>
        </div>
      </section>

      <section id="brands" className="section">
        <p className="label">Производители</p>
        <h2>Работаем с ведущими брендами</h2>

        <div className="brandGrid">
          {brands.map((brand) => (
            <div className="brandCard" key={brand}>
              {brand}
            </div>
          ))}
        </div>
      </section>

      <section id="request" className="request">
        <div>
          <p className="label">Заявка</p>
          <h2>Рассчитаем материалы для вашего объекта</h2>
          <p>
            Оставьте контакты — специалист Иделеон свяжется с вами, уточнит
            задачу и подготовит предложение.
          </p>
        </div>

        <form className="form">
          <input placeholder="Ваше имя" />
          <input placeholder="Телефон" />
          <input placeholder="Компания" />
          <textarea placeholder="Кратко опишите задачу" />
          <button type="button">Получить расчёт</button>
        </form>
      </section>

      <footer id="contacts" className="footer">
        <div>
          <strong>ООО «ИДЕЛЕОН»</strong>
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
          <p>ИНН: 7751381987</p>
          <p>ОГРН: 1257700589266</p>
        </div>
      </footer>
    </main>
  );
}
