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
  title: "Как выбрать поставщика строительных материалов для объекта — Иделеон",
  description: "Для строительного объекта поставщик — это не просто продавец, а участник процесса, от которого зависят сроки и комплектация.",
};

export default function ArticlePage() {
  return (
    <main>
      <Header />

      <article className="articlePage">
        <div className="articleHeader">
          <p className="label">Статья</p>
          <h1>Как выбрать поставщика строительных материалов для объекта</h1>
          <p>Для строительного объекта поставщик — это не просто продавец, а участник процесса, от которого зависят сроки и комплектация.</p>
        </div>

        <div className="articleContent">
          <section>
            <h2>Смотрите не только на цену</h2>
            <p>Низкая цена не спасает, если поставка сорвана, спецификация неполная или материалы не соответствуют задаче.</p>
          </section>
          <section>
            <h2>Важна работа с проектом</h2>
            <p>Хороший поставщик помогает читать задачу, проверяет комплектность, предлагает аналоги и предупреждает о рисках.</p>
          </section>
          <section>
            <h2>Логистика имеет значение</h2>
            <p>Для объекта важно понимать сроки, условия доставки, возможность отгрузки партиями и ответственность за организацию поставки.</p>
          </section>
          <section>
            <h2>Наличие брендов и контрактов</h2>
            <p>Прямые отношения с производителями помогают быстрее решать вопросы по наличию, срокам и комплектации.</p>
          </section>
          <section>
            <h2>Коммуникация</h2>
            <p>Если менеджер исчезает после выставления счёта — это плохой знак. В B2B-поставках важна постоянная связь.</p>
          </section>
          <section>
            <h2>Как работает Иделеон</h2>
            <p>Мы помогаем подобрать материалы, выполнить расчёт и организовать поставку по России через проверенных партнёров.</p>
          </section>

          <div className="articleCta">
            <h2>Нужен расчёт материалов?</h2>
            <p>
              Пришлите задачу или спецификацию — Иделеон поможет подобрать материалы,
              проверить комплектность и организовать поставку.
            </p>
            <a className="button primary" href="/#request">Получить расчёт</a>
          </div>

          <div className="relatedArticles">
            <strong>Ещё по теме</strong>
          <a href="/articles/kak-vybrat-podvesnoy-potolok">Как выбрать подвесную потолочную систему для коммерческого объекта</a>
          <a href="/articles/kassetnye-potolki">Кассетные потолки: где применяются и чем отличаются</a>
          <a href="/articles/grilyato">Потолки Грильято: плюсы, минусы и особенности</a>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

