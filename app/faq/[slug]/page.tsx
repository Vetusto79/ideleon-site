import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TrackedCalculationLink from "../../articles/components/TrackedCalculationLink";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import {
  getKnowledgeTopic,
  getRelatedKnowledgeTopics,
  knowledgeCategoryBySlug,
  knowledgeTopics,
} from "../../data/knowledge";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return knowledgeTopics.map((topic) => ({ slug: topic.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const topic = getKnowledgeTopic(params.slug);
  if (!topic) return {};

  return {
    title: { absolute: topic.title },
    description: topic.description,
    alternates: { canonical: `/faq/${topic.slug}` },
    openGraph: {
      title: topic.title,
      description: topic.description,
      url: `/faq/${topic.slug}`,
      type: "article",
      publishedTime: topic.updatedAt,
      modifiedTime: topic.updatedAt,
    },
  };
}

export default function KnowledgeTopicPage({ params }: Props) {
  const topic = getKnowledgeTopic(params.slug);
  if (!topic) notFound();

  const category = knowledgeCategoryBySlug.get(topic.category);
  if (!category) notFound();

  const relatedTopics = getRelatedKnowledgeTopics(topic.slug);
  const primaryLink = category.calculatorLinks[0] ?? category.catalogLinks[0];
  const articleUrl = `https://ideleon.com/faq/${topic.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.title,
    description: topic.description,
    datePublished: topic.updatedAt,
    dateModified: topic.updatedAt,
    mainEntityOfPage: articleUrl,
    author: { "@type": "Organization", name: "Иделеон", url: "https://ideleon.com" },
    publisher: { "@type": "Organization", name: "Иделеон", url: "https://ideleon.com" },
    about: category.title,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: topic.title,
      acceptedAnswer: { "@type": "Answer", text: topic.answer },
    }],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://ideleon.com" },
      { "@type": "ListItem", position: 2, name: "База знаний", item: "https://ideleon.com/faq" },
      { "@type": "ListItem", position: 3, name: category.title, item: `https://ideleon.com/faq#${category.slug}` },
      { "@type": "ListItem", position: 4, name: topic.title, item: articleUrl },
    ],
  };

  return (
    <main>
      <SiteHeader />
      {[articleJsonLd, faqJsonLd, breadcrumbJsonLd].map((value, index) => (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }}
          key={index}
        />
      ))}

      <article className="articlePage knowledgePage">
        <header className="articleHeader">
          <Breadcrumbs items={[
            { label: "Главная", href: "/" },
            { label: "База знаний", href: "/faq" },
            { label: category.shortTitle, href: `/faq#${category.slug}` },
            { label: topic.title },
          ]} />
          <p className="label">База знаний · {category.title}</p>
          <h1>{topic.title}</h1>
          <p>{topic.description}</p>
          <p className="knowledgeMeta">
            Проверено редакцией Иделеон · <time dateTime={topic.updatedAt}>18 августа 2026</time>
          </p>
        </header>

        <div className="articleContent knowledgeContent">
          <section className="knowledgeAnswer" aria-labelledby="short-answer">
            <p className="label">Короткий ответ</p>
            <h2 id="short-answer">{topic.title}</h2>
            <p>{topic.answer}</p>
          </section>

          <section aria-labelledby="important-details">
            <h2 id="important-details">Что важно проверить</h2>
            <div className="knowledgePointGrid">
              {topic.points.map((item, index) => (
                <div className="knowledgePoint" key={item.title}>
                  <span>{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="action-plan">
            <h2 id="action-plan">Порядок действий</h2>
            <ol className="knowledgeSteps">
              {topic.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>

          <section className="knowledgeWarning" aria-labelledby="common-mistake">
            <p className="label">Типичная ошибка</p>
            <h2 id="common-mistake">Что может пойти не так</h2>
            <p>{topic.warning}</p>
          </section>

          <section aria-labelledby="request-data">
            <h2 id="request-data">Что приложить к заявке</h2>
            <p>
              Чтобы расчёт и предложения разных поставщиков можно было сравнить, подготовьте
              одинаковый набор исходных данных:
            </p>
            <ul className="knowledgeChecklist">
              {category.requestChecklist.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="knowledgeNote"><strong>Учтите:</strong> {category.commonNote}</p>
          </section>

          <section className="articleCta">
            <p className="label">Следующий шаг</p>
            <h2>{primaryLink?.label ?? "Отправьте задачу на расчёт"}</h2>
            <p>
              Проверьте ассортимент и выполните предварительный расчёт. Для точного предложения
              приложите чертёж или спецификацию — специалист Иделеон проверит комплектность.
            </p>
            {primaryLink ? (
              primaryLink.href.startsWith("/calculators/") ? (
                <TrackedCalculationLink className="button primary" href={primaryLink.href}>
                  {primaryLink.label} →
                </TrackedCalculationLink>
              ) : (
                <a className="button primary" href={primaryLink.href}>{primaryLink.label} →</a>
              )
            ) : null}
          </section>

          <div className="knowledgeResourceLinks">
            <strong>Каталог и калькуляторы</strong>
            {[...category.catalogLinks, ...category.calculatorLinks].map((link) =>
              link.href.startsWith("/calculators/") ? (
                <TrackedCalculationLink href={link.href} key={link.href}>{link.label}</TrackedCalculationLink>
              ) : (
                <a href={link.href} key={link.href}>{link.label}</a>
              ),
            )}
          </div>

          <LeadCapture
            id="request"
            title="Получить расчёт и предложение"
            text="Опишите объект и приложите спецификацию или план. Мы уточним исходные данные, проверим комплектность и подготовим предложение."
          />

          <nav className="relatedArticles" aria-label="Ответы по теме">
            <strong>Ещё по теме «{category.shortTitle}»</strong>
            {relatedTopics.map((related) => (
              <a href={`/faq/${related.slug}`} key={related.slug}>{related.title}</a>
            ))}
            <a href={`/faq#${category.slug}`}>Все материалы раздела →</a>
          </nav>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
