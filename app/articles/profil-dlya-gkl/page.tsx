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

export const metadata = {
  title: "Как рассчитать профиль для гипсокартона — Иделеон",
  description: "Профиль для ГКЛ нужно считать не только по площади, но и по конструкции, шагу, высоте и нагрузкам.",
};

export default function ArticlePage() {
  return (
    <main>
      <Header />

      <article className="articlePage">
        <div className="articleHeader">
        <nav className="breadcrumbs" aria-label="Навигационная цепочка">
          <a href="/">Главная</a>
          <span className="crumbSep">/</span>
          <a href="/articles">Статьи</a>
          <span className="crumbSep">/</span>
          <span>Как рассчитать профиль для гипсокартона</span>
        </nav>
          <p className="label">Статья</p>
          <h1>Как рассчитать профиль для гипсокартона</h1>
          <p>Профиль для ГКЛ нужно считать не только по площади, но и по конструкции, шагу, высоте и нагрузкам.</p>
        </div>

        <div className="articleContent">
          <section>
            <h2>Что входит в систему</h2>
            <p>Для перегородок, стен и потолков используются разные виды профиля: направляющий, стоечный, потолочный, направляющий потолочный, а также подвесы, соединители и крепёж.</p>
          </section>
          <section>
            <h2>Почему нельзя считать только по квадратным метрам</h2>
            <p>Одинаковая площадь может требовать разного количества профиля. Всё зависит от высоты, шага стоек, количества проёмов, типа облицовки и требований к жёсткости.</p>
          </section>
          <section>
            <h2>Что нужно для расчёта</h2>
            <p>Нужны размеры помещения, схема конструкции, высота, тип гипсокартона, количество слоёв, наличие дверных проёмов и требования к звукоизоляции.</p>
          </section>
          <section>
            <h2>Частые ошибки</h2>
            <p>Недостаточный запас, неправильный шаг профиля, забытые соединители, подвесы и крепёж. В итоге монтаж останавливается из-за мелких, но критичных позиций.</p>
          </section>
          <section>
            <h2>Как помогает Иделеон</h2>
            <p>Мы помогаем разобрать конструкцию, посчитать профиль и комплектующие, а затем организовать поставку.</p>
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
