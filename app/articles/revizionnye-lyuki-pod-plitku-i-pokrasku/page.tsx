import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
export const metadata = {
  title: "Ревизионные люки под плитку и под покраску: что выбрать",
  description: "Ревизионный люк должен давать доступ к коммуникациям и при этом аккуратно вписываться в интерьер.",
};

export default function ArticlePage() {
  return (
    <main>
      <SiteHeader />

      <article className="articlePage">
        <div className="articleHeader">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статьи", href: "/articles" }, { label: "Ревизионные люки", href: "/articles/revizionnye-lyuki" }, { label: "Ревизионные люки под плитку и под покраску: что выбрать" }]} />
          <p className="label">Статья</p>
          <h1>Ревизионные люки под плитку и под покраску: что выбрать</h1>
          <p>Ревизионный люк должен давать доступ к коммуникациям и при этом аккуратно вписываться в интерьер.</p>
        </div>

        <div className="articleContent">
          <section>
            <h2>Зачем нужен ревизионный люк</h2>
            <p>Он обеспечивает доступ к счётчикам, вентилям, фильтрам, коллекторным группам и другим инженерным узлам.</p>
          </section>
          <section>
            <h2>Люк под плитку</h2>
            <p>Такой люк используют в санузлах, душевых, технических помещениях и местах, где стены облицованы плиткой. После отделки он почти незаметен.</p>
          </section>
          <section>
            <h2>Люк под покраску</h2>
            <p>Подходит для гипсокартонных коробов, стен и потолков, где поверхность окрашивается или шпаклюется.</p>
          </section>
          <section>
            <h2>Что важно выбрать правильно</h2>
            <p>Нужно учитывать размер проёма, вес отделочного материала, способ открывания, глубину установки и удобство доступа к коммуникациям.</p>
          </section>
          <section>
            <h2>Типичная ошибка</h2>
            <p>Ставить слишком маленький люк. Формально доступ есть, но обслуживать коммуникации неудобно.</p>
          </section>
          <section>
            <h2>Как помогает Иделеон</h2>
            <p>Мы подбираем ревизионные люки под задачу объекта: под плитку, под покраску и под разные варианты отделки.</p>
          </section>

          <LeadCapture
            title="Нужен расчёт материалов?"
            text="Пришлите задачу или спецификацию — Иделеон поможет подобрать материалы, проверить комплектность и организовать поставку."
          />

          <div className="relatedArticles">
            <strong>Ещё по теме</strong>
          <a href="/articles/kak-vybrat-podvesnoy-potolok">Как выбрать подвесную потолочную систему для коммерческого объекта</a>
          <a href="/articles/kassetnye-potolki">Кассетные потолки: где применяются и чем отличаются</a>
          <a href="/articles/grilyato">Потолки Грильято: плюсы, минусы и особенности</a>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
