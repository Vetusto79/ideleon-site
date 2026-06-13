const catalog = [
  "Профиль для гипсокартона",
  "Подвесные кассетные потолочные системы",
  "Реечные потолочные системы",
  "Дизайнерские потолочные решения",
  "Потолочные решения для медицинских учреждений",
  "Потолки Грильято",
  "Ревизионные люки",
  "Фальшполы",
  "Сендвич-панели",
  "Металлопрокат",
  "Арматура",
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
            <article className="catalogCard" key={item}>
              <div className="catalogImage">{index + 1}</div>
              <h3>{item}</h3>
              <p>
                Подберём материалы, рассчитаем объём и организуем поставку на
                объект.
              </p>
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
