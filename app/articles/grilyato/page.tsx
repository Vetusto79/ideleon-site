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
  title: "Потолки Грильято: плюсы, минусы и особенности — Иделеон",
  description: "Грильято — выразительная ячеистая потолочная система для общественных и коммерческих пространств.",
};

export default function ArticlePage() {
  return (
    <main>
      <Header />

      <article className="articlePage">
        <div className="articleHeader">
          <p className="label">Статья</p>
          <h1>Потолки Грильято: плюсы, минусы и особенности</h1>
          <p>Грильято — выразительная ячеистая потолочная система для общественных и коммерческих пространств.</p>
        </div>

        <div className="articleContent">
          <section>
            <h2>Что такое Грильято</h2>
            <p>Это подвесная ячеистая потолочная система, которая скрывает коммуникации, но сохраняет визуальную лёгкость пространства.</p>
          </section>
          <section>
            <h2>Где используется</h2>
            <p>Грильято часто применяют в торговых центрах, холлах, ресторанах, офисах, коридорах, аэропортах, автосалонах и общественных зданиях.</p>
          </section>
          <section>
            <h2>Преимущества</h2>
            <p>Система выглядит современно, даёт доступ к коммуникациям, хорошо сочетается со светильниками и помогает визуально структурировать большое пространство.</p>
          </section>
          <section>
            <h2>Что учитывать</h2>
            <p>Важны размер ячейки, высота помещения, цвет, тип профиля, освещение и инженерные системы над потолком.</p>
          </section>
          <section>
            <h2>Минусы</h2>
            <p>Грильято не всегда подходит для низких помещений и требует аккуратного расчёта. При неправильном подборе ячейки потолок может выглядеть слишком тяжёлым или, наоборот, слишком пустым.</p>
          </section>
          <section>
            <h2>Как помогает Иделеон</h2>
            <p>Мы подбираем тип Грильято под задачу, считаем комплектующие и помогаем организовать поставку.</p>
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
          <a href="/articles/reechnye-potolki">Реечные потолки для офисов, ТЦ и общественных пространств</a>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

