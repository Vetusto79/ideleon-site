import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import { getActiveCategories, getArticlesByCategory } from "../data/articles";

export const metadata = {
  title: "Статьи о строительных материалах и потолочных системах",
  description:
    "Полезные статьи Иделеон о строительных материалах, потолочных системах, ревизионных люках, профиле для ГКЛ и выборе поставщика.",
};

export default function Articles() {
  const activeCategories = getActiveCategories();

  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Статьи" }]} />
        <p className="label">Статьи</p>
        <h1>Полезные материалы для строителей, подрядчиков и застройщиков</h1>
        <p>
          Практические статьи по строительным материалам, потолочным системам, расчётам,
          подбору решений и комплектации объектов. Материалы разложены по тематическим рубрикам,
          чтобы нужную информацию было проще найти.
        </p>
      </section>

      <section className="articleHubSection">
        <div className="articleCategoryNav">
          {activeCategories.map((category) => (
            <a href={`#${category.slug}`} key={category.slug}>
              {category.shortTitle}
            </a>
          ))}
        </div>

        <div className="articleCategoryGrid">
          {activeCategories.map((category) => {
            const categoryArticles = getArticlesByCategory(category.slug);
            const mainArticle = categoryArticles.find((article) => article.isMain);
            const otherArticles = categoryArticles.filter((article) => !article.isMain);

            return (
              <section className="articleCategoryBlock" id={category.slug} key={category.slug}>
                <div className="articleCategoryHeader">
                  <div>
                    <p className="label">{category.shortTitle}</p>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>
                  <a className="articleCategoryLink" href={category.href}>
                    Все статьи рубрики →
                  </a>
                </div>

                <div className="articleGrid articleGridLarge">
                  {mainArticle && (
                    <a className="articleCard articleCardFeatured" href={mainArticle.href}>
                      <span className="articleBadge">Главная статья</span>
                      <h3>{mainArticle.title}</h3>
                      <p>{mainArticle.description}</p>
                      <span>Читать статью →</span>
                    </a>
                  )}

                  {otherArticles.map((article) => (
                    <a className="articleCard" href={article.href} key={article.href}>
                      <h3>{article.title}</h3>
                      <p>{article.description}</p>
                      <span>Читать статью →</span>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
