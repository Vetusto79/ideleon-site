import type { Metadata } from "next";

import Breadcrumbs from "../components/Breadcrumbs";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import {
  getKnowledgeTopicsByCategory,
  knowledgeCategories,
  knowledgeTopics,
} from "../data/knowledge";

export const metadata: Metadata = {
  title: "База знаний о стройматериалах и расчётах",
  description:
    "100 практических ответов Иделеон: профиль ГКЛ, потолки, люки, фальшполы, сэндвич-панели, блоки, кирпич, металлопрокат и снабжение.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "База знаний Иделеон: 100 ответов по материалам",
    description:
      "Подбор, расчёт, заявка, приёмка и поставка строительных материалов — коротко и по делу.",
    url: "/faq",
    type: "website",
  },
};

export default function KnowledgeHubPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "База знаний Иделеон",
    description: metadata.description,
    url: "https://ideleon.com/faq",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: knowledgeTopics.length,
      itemListElement: knowledgeTopics.map((topic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://ideleon.com/faq/${topic.slug}`,
        name: topic.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://ideleon.com" },
      { "@type": "ListItem", position: 2, name: "База знаний", item: "https://ideleon.com/faq" },
    ],
  };

  return (
    <main>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="pageHero knowledgeHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "База знаний" }]} />
        <p className="label">База знаний · {knowledgeTopics.length} ответов</p>
        <h1>Практические ответы о материалах, расчётах и поставках</h1>
        <p>
          Отдельный справочный раздел Иделеон: одна страница — один вопрос. Здесь можно
          проверить исходные данные, избежать типовой ошибки и сразу перейти к нужному
          товару или калькулятору.
        </p>
      </section>

      <section className="knowledgeHub" aria-label="Разделы базы знаний">
        <nav className="articleCategoryNav" aria-label="Темы базы знаний">
          {knowledgeCategories.map((category) => (
            <a href={`#${category.slug}`} key={category.slug}>
              {category.shortTitle}
              <span>{getKnowledgeTopicsByCategory(category.slug).length}</span>
            </a>
          ))}
        </nav>

        <div className="knowledgeCategoryGrid">
          {knowledgeCategories.map((category) => {
            const topics = getKnowledgeTopicsByCategory(category.slug);

            return (
              <section className="knowledgeCategory" id={category.slug} key={category.slug}>
                <div className="knowledgeCategoryHeader">
                  <div>
                    <p className="label">{topics.length} материалов</p>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>
                  <div className="knowledgeCategoryActions">
                    {category.catalogLinks.slice(0, 2).map((link) => (
                      <a href={link.href} key={link.href}>{link.label} →</a>
                    ))}
                  </div>
                </div>

                <div className="knowledgeCardGrid">
                  {topics.map((topic, index) => (
                    <a className="knowledgeCard" href={`/faq/${topic.slug}`} key={topic.slug}>
                      <span className="knowledgeCardNumber">{String(index + 1).padStart(2, "0")}</span>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                      <strong>Читать ответ →</strong>
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
