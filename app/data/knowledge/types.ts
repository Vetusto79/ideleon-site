export type KnowledgeCategorySlug =
  | "profil-gkl"
  | "kassetnye-potolki"
  | "grilyato"
  | "reechnye-dizaynerskie-potolki"
  | "meditsinskie-potolki"
  | "revizionnye-lyuki"
  | "falshpoly"
  | "sendvich-paneli"
  | "gazosilikatnye-bloki"
  | "kirpich"
  | "metalloprokat"
  | "armatura"
  | "snabzhenie";

export type KnowledgeLink = {
  href: string;
  label: string;
};

export type KnowledgePoint = {
  title: string;
  text: string;
};

export type KnowledgeTopic = {
  category: KnowledgeCategorySlug;
  slug: string;
  title: string;
  description: string;
  answer: string;
  points: [KnowledgePoint, KnowledgePoint, KnowledgePoint];
  steps: [string, string, string];
  warning: string;
  searchIntent: "informational" | "commercial" | "transactional";
  updatedAt?: string;
};

export type KnowledgeCategory = {
  slug: KnowledgeCategorySlug;
  title: string;
  shortTitle: string;
  description: string;
  catalogLinks: KnowledgeLink[];
  calculatorLinks: KnowledgeLink[];
  requestChecklist: string[];
  commonNote: string;
};

export const point = (title: string, text: string): KnowledgePoint => ({ title, text });

export const topic = (
  category: KnowledgeCategorySlug,
  slug: string,
  title: string,
  description: string,
  answer: string,
  points: [KnowledgePoint, KnowledgePoint, KnowledgePoint],
  steps: [string, string, string],
  warning: string,
  searchIntent: KnowledgeTopic["searchIntent"] = "informational",
): KnowledgeTopic => ({
  category,
  slug,
  title,
  description,
  answer,
  points,
  steps,
  warning,
  searchIntent,
  updatedAt: "2026-08-18",
});
