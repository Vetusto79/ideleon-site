import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import Breadcrumbs from "./Breadcrumbs";
import { getArticlesByCategory, type ArticleCategory } from "../data/articles";

type Props = {
  category: ArticleCategory;
};

export default function ArticleCategoryPage({ category }: Props) {
  const categoryArticles = getArticlesByCategory(category.slug);
  const mainArticle = categoryArticles.find((article) => article.isMain);
  const otherArticles = categoryArticles.filter((article) => !article.isMain);

  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Статьи", href: "/articles" },
            { label: category.title },
          ]}
        />
        <p className="label">Рубрика</p>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
      </section>

      <section className="articleListSection">
        {categoryArticles.length === 0 ? (
          <div className="emptyCategoryNotice">
            <h2>Статьи этой рубрики скоро появятся</h2>
            <p>
              Мы уже заложили рубрику в структуру сайта. Когда появятся материалы, они автоматически
              попадут на эту страницу.
            </p>
          </div>
        ) : (
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
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
