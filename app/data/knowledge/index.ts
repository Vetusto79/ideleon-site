import { knowledgeCategories, knowledgeCategoryBySlug } from "./categories";
import { profileAndCeilingTopics } from "./profile-and-ceilings";
import { medicalHatchesFloorsTopics } from "./medical-hatches-floors";
import { panelsAndMasonryTopics } from "./panels-and-masonry";
import { metalAndSupplyTopics } from "./metal-and-supply";
import type { KnowledgeCategorySlug } from "./types";

export * from "./types";
export { knowledgeCategories, knowledgeCategoryBySlug };

export const knowledgeTopics = [
  ...profileAndCeilingTopics,
  ...medicalHatchesFloorsTopics,
  ...panelsAndMasonryTopics,
  ...metalAndSupplyTopics,
];

export function getKnowledgeTopic(slug: string) {
  return knowledgeTopics.find((topic) => topic.slug === slug);
}

export function getKnowledgeTopicsByCategory(category: KnowledgeCategorySlug) {
  return knowledgeTopics.filter((topic) => topic.category === category);
}

export function getRelatedKnowledgeTopics(slug: string, limit = 4) {
  const current = getKnowledgeTopic(slug);
  if (!current) return [];

  const sameCategory = getKnowledgeTopicsByCategory(current.category).filter(
    (topic) => topic.slug !== slug,
  );
  const currentIndex = getKnowledgeTopicsByCategory(current.category).findIndex(
    (topic) => topic.slug === slug,
  );

  return Array.from({ length: Math.min(limit, sameCategory.length) }, (_, offset) => {
    const index = (Math.max(0, currentIndex) + offset) % sameCategory.length;
    return sameCategory[index];
  });
}
