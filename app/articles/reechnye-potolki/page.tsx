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
  title: "Реечные потолки для офисов, ТЦ и общественных пространств — Иделеон",
  description: "Реечные потолочные системы подходят для помещений с активной эксплуатацией и высокими требованиями к внешнему виду.",
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
          <span>Реечные потолки для офисов, ТЦ и общественных пространств</span>
        </nav>
          <p className="label">Статья</p>
          <h1>Реечные потолки для офисов, ТЦ и общественных пространств</h1>
          <p>Реечные потолочные системы подходят для помещений с активной эксплуатацией и высокими требованиями к внешнему виду.</p>
        </div>

        <div className="articleContent">
          <section>
            <h2>Где применяются</h2>
            <p>Реечные потолки используют в коридорах, санузлах, входных группах, торговых зонах, офисах, общественных зданиях и помещениях с повышенной влажностью.</p>
          </section>
          <section>
            <h2>Почему их выбирают</h2>
            <p>Они долговечны, аккуратно выглядят, устойчивы к влаге и позволяют создавать разные визуальные решения.</p>
          </section>
          <section>
            <h2>Виды реечных потолков</h2>
            <p>Системы отличаются шириной рейки, цветом, фактурой, типом стыка, наличием вставок и направлением монтажа.</p>
          </section>
          <section>
            <h2>Что важно в проекте</h2>
            <p>Нужно учитывать площадь, направление реек, светильники, вентиляцию, примыкания, подвесную систему и запас материала.</p>
          </section>
          <section>
            <h2>Частая ошибка</h2>
            <p>Выбирать только по картинке. На объекте важнее не только внешний вид, но и комплектность системы, сроки поставки и совместимость элементов.</p>
          </section>
          <section>
            <h2>Как помогает Иделеон</h2>
            <p>Мы помогаем подобрать реечную систему, рассчитать материалы и организовать поставку.</p>
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
