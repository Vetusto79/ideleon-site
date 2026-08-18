import {
  getKnowledgeTopicsByCategory,
  knowledgeCategoryBySlug,
  type KnowledgeCategorySlug,
} from "../data/knowledge";

type Props = {
  category: KnowledgeCategorySlug;
  limit?: number;
};

export default function KnowledgeLinks({ category, limit = 5 }: Props) {
  const categoryData = knowledgeCategoryBySlug.get(category);
  const topics = getKnowledgeTopicsByCategory(category).slice(0, limit);
  if (!categoryData || topics.length === 0) return null;

  return (
    <section className="catalogKnowledgeLinks" aria-labelledby={`knowledge-${category}`}>
      <div>
        <p className="label">База знаний</p>
        <h2 id={`knowledge-${category}`}>Проверьте важное перед заказом</h2>
        <p>{categoryData.description}</p>
        <a className="catalogKnowledgeAll" href={`/faq#${category}`}>Все ответы по теме →</a>
      </div>
      <div className="catalogKnowledgeList">
        {topics.map((topic, index) => (
          <a href={`/faq/${topic.slug}`} key={topic.slug}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{topic.title}</strong>
            <em>Читать →</em>
          </a>
        ))}
      </div>
    </section>
  );
}
