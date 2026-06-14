const catalog = [
  { title: "Профиль для гипсокартона", image: "/images/catalog/gkl-profile.jpg" },
  { title: "Подвесные кассетные потолочные системы", image: "/images/catalog/cassette-ceiling.jpg" },
  { title: "Реечные потолочные системы", image: "/images/catalog/rack-ceiling.jpg" },
  { title: "Дизайнерские потолочные решения", image: "/images/catalog/design-ceiling.jpg" },
  { title: "Потолочные решения для медицинских учреждений", image: "/images/catalog/medical-ceiling.jpg" },
  { title: "Потолки Грильято", image: "/images/catalog/grilyato.jpg" },
  { title: "Ревизионные люки", image: "/images/catalog/revision-hatch.jpg" },
  { title: "Фальшполы", image: "/images/catalog/raised-floor.jpg" },
  { title: "Сендвич-панели", image: "/images/catalog/sandwich-panel.jpg" },
  { title: "Металлопрокат", image: "/images/catalog/metal-roll.jpg" },
  { title: "Арматура", image: "/images/catalog/rebar.jpg" },
];

const brands = ["Knauf", "Албес", "ТехноНиколь", "КТЗ", "СПК", "МеталлТрейд"];

const solutionCards = [
  {
    title: "Застройщикам",
    href: "/solutions/developers",
    text: "Комплектация ЖК, коммерческих объектов и крупных строительных проектов.",
  },
  {
    title: "Подрядчикам",
    href: "/solutions/contractors",
    text: "Подбор материалов, расчёты и поставка под график выполнения работ.",
  },
  {
    title: "Строительным магазинам",
    href: "/solutions/shops",
    text: "Оптовые поставки, партнёрские условия и развитие ассортимента.",
  },
  {
    title: "Медицинским объектам",
    href: "/solutions/medical",
    text: "Потолочные системы и материалы для помещений с особыми требованиями.",
  },
];

const articles = [
  {
    title: "Как выбрать подвесную потолочную систему для коммерческого объекта",
    href: "/articles/kak-vybrat-podvesnoy-potolok",
  },
  {
    title: "Кассетные потолки: где применяются и чем отличаются",
    href: "/articles/kassetnye-potolki",
  },
  {
    title: "Ревизионные люки под покраску и под плитку: что выбрать",
    href: "/articles/revizionnye-lyuki",
  },
];

const faq = [
  {
    question: "Работаете ли вы с регионами?",
    answer: "Да. Организуем поставки строительных материалов по всей России через проверенных перевозчиков.",
  },
  {
    question: "Можно ли получить расчёт по проекту?",
    answer: "Да. Мы разбираем задачу, подбираем решения и выполняем поэлементный расчёт материалов.",
  },
  {
    question: "Есть ли монтаж?",
    answer: "Собственного монтажа нет, но при необходимости можем рекомендовать подрядные организации.",
  },
  {
    question: "Можно ли заказать проектирование потолочных систем?",
    answer: "Да. Мы можем помогать с проектированием подвесных потолочных систем под требования объекта.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="header">
        <a className="logo" href="/">
          <img src="/images/logo/ideleon-logo-horizontal.svg" alt="Иделеон" />
        </a>

        <nav className="nav">
          <a href="#catalog">Каталог</a>
          <a href="/solutions">Решения</a>
          <a href="#brands">Бренды</a>
          <a href="/articles">Статьи</a>
          <a href="#about">О компании</a>
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
          <h1>Надёжный поставщик строительных материалов для профессиональных строителей</h1>
          <p className="lead">
            Иделеон поставляет строительные и потолочные системы для застройщиков,
            подрядчиков, коммерческих объектов и строительных компаний. Помогаем
            подобрать материалы, выполнить расчёт и организовать поставку точно в срок.
          </p>
          <div className="heroButtons">
            <a className="button primary" href="#request">Получить расчёт проекта</a>
            <a className="button secondary" href="tel:+79266961386">Перезвоните мне</a>
          </div>
        </div>
        <div className="heroImage">
          <img src="/images/hero-construction.jpg" alt="Строительный объект" />
        </div>
      </section>

      <section className="features">
        <div><strong>Прямые поставки</strong><p>Работаем напрямую с ведущими производителями.</p></div>
        <div><strong>Доставка по России</strong><p>Организуем перевозку через проверенных партнёров.</p></div>
        <div><strong>Расчёт проектов</strong><p>Помогаем разложить сложные задачи на понятные шаги.</p></div>
        <div><strong>Проектирование</strong><p>Разрабатываем решения для подвесных потолочных систем.</p></div>
      </section>

      <section id="catalog" className="section">
        <p className="label">Каталог продукции</p>
        <h2>Материалы и решения для строительства</h2>
        <div className="catalogGrid">
          {catalog.map((item, index) => (
            <article className="catalogCard" key={item.title}>
              <div className="catalogImage"><img src={item.image} alt={item.title} /></div>
              <div className="catalogText">
                <span>{index + 1}.</span>
                <h3>{item.title}</h3>
                <p>Подберём материалы, рассчитаем объём и организуем поставку на объект.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="solutions" className="solutionsPreview">
        <p className="label">Решения для клиентов</p>
        <h2>Под разные задачи — разные сценарии поставки</h2>
        <div className="solutionPreviewGrid">
          {solutionCards.map((item) => (
            <a className="solutionPreviewCard" href={item.href} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span>Подробнее →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="darkSection">
        <p className="label">Наш подход</p>
        <h2>Помогаем разобраться со сложными проектами</h2>
        <p>
          Иделеон не просто продаёт материалы. Мы анализируем задачу, подбираем
          решение, выполняем поэлементный расчёт и организуем поставку.
        </p>
        <div className="steps">
          <div>1. Получаем задачу</div>
          <div>2. Разбираем проект</div>
          <div>3. Делаем расчёт</div>
          <div>4. Организуем поставку</div>
        </div>
      </section>

      <section id="brands" className="section">
        <p className="label">Производители</p>
        <h2>Работаем с ведущими брендами</h2>
        <div className="brandGrid">
          {brands.map((brand) => <div className="brandCard" key={brand}>{brand}</div>)}
        </div>
      </section>

      <section id="about" className="aboutSection">
        <div>
          <p className="label">О компании</p>
          <h2>Молодая компания с честным подходом к работе</h2>
          <p>
            Иделеон работает на рынке строительных материалов один год, но уже
            делает ставку на открытость, точные сроки и внимательное отношение
            к задачам заказчика.
          </p>
          <p>
            Мы работаем по прямым контрактам с производителями, помогаем
            застройщикам и подрядчикам разбираться со сложными проектами,
            раскладываем задачи на понятные шаги и выполняем поэлементный расчёт материалов.
          </p>
        </div>
        <div className="aboutCards">
          <div>Прямые контракты с производителями</div>
          <div>Доставка строительных материалов по России</div>
          <div>Проектирование подвесных потолочных систем</div>
        </div>
      </section>

      <section id="articles" className="section">
        <p className="label">Статьи и полезные материалы</p>
        <h2>Экспертный контент для SEO и клиентов</h2>
        <div className="articleGrid">
          {articles.map((article) => (
            <a className="articleCard" href={article.href} key={article.title}>
              <h3>{article.title}</h3>
              <p>Практический материал для выбора, расчёта и комплектации объекта.</p>
              <span>Читать →</span>
            </a>
          ))}
        </div>
        <div className="sectionAction">
          <a className="button secondary" href="/articles">Все статьи</a>
        </div>
      </section>

      <section className="faqSection">
        <p className="label">FAQ</p>
        <h2>Частые вопросы</h2>
        <div className="faqGrid">
          {faq.map((item) => (
            <div className="faqCard" key={item.question}>
              <strong>{item.question}</strong>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="request" className="request">
        <div>
          <p className="label">Заявка</p>
          <h2>Рассчитаем материалы для вашего объекта</h2>
          <p>Оставьте контакты — специалист Иделеон свяжется с вами, уточнит задачу и подготовит предложение.</p>
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
    </main>
  );
}
