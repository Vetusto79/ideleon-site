import type { MetadataRoute } from "next";
import { knowledgeTopics } from "./data/knowledge";

const baseUrl = "https://ideleon.com";
const siteUpdatedAt = new Date("2026-08-18T00:00:00.000Z");

const routes: Array<{
  path: string;
  priority: number;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "", priority: 1 },
  { path: "/catalog", priority: 0.7 },
  { path: "/articles", priority: 0.7 },
  { path: "/faq", priority: 0.8 },
  { path: "/articles/profil-dlya-gkl", priority: 0.65 },
  { path: "/articles/potolochnye-sistemy", priority: 0.65 },
  { path: "/articles/revizionnye-lyuki", priority: 0.65 },
  { path: "/articles/postavki-stroymaterialov", priority: 0.65 },
  { path: "/about", priority: 0.7 },
  { path: "/privacy", priority: 0.7 },
  { path: "/solutions", priority: 0.7 },
  { path: "/solutions/developers", priority: 0.7 },
  { path: "/solutions/contractors", priority: 0.7 },
  { path: "/solutions/shops", priority: 0.7 },
  { path: "/solutions/medical", priority: 0.7 },
  { path: "/calculators", priority: 0.8 },
  { path: "/catalog/gkl-profile", priority: 0.7 },
  { path: "/catalog/cassette-ceilings", priority: 0.7 },
  { path: "/catalog/rack-ceilings", priority: 0.7 },
  { path: "/catalog/grilyato", priority: 0.7 },
  { path: "/catalog/design-ceilings", priority: 0.7 },
  { path: "/catalog/medical-ceilings", priority: 0.7 },
  { path: "/catalog/revision-hatches", priority: 0.7 },
  { path: "/catalog/raised-floors", priority: 0.7 },
  { path: "/catalog/sandwich-panels", priority: 0.7 },
  { path: "/catalog/gazosilikatnyy-blok", priority: 0.7 },
  { path: "/catalog/kirpich-silikatnyy", priority: 0.7 },
  { path: "/catalog/kirpich-keramicheskiy", priority: 0.7 },
  { path: "/catalog/metal-roll", priority: 0.7 },
  { path: "/catalog/rebar", priority: 0.7 },
  { path: "/articles/kak-rasschitat-profil-dlya-gipsokartona", priority: 0.7 },
  { path: "/articles/pp-60x27-i-ppn-28x27-dlya-gipsokartona", priority: 0.7 },
  { path: "/articles/tolshchina-profilya-dlya-gipsokartona", priority: 0.7 },
  { path: "/articles/postavshchik-stroymaterialov", priority: 0.7 },
  { path: "/articles/kak-vybrat-podvesnoy-potolok", priority: 0.7 },
  { path: "/articles/kassetnye-potolki", priority: 0.7 },
  { path: "/articles/grilyato", priority: 0.7 },
  { path: "/articles/reechnye-potolki", priority: 0.7 },
  { path: "/articles/revizionnye-lyuki-pod-plitku-i-pokrasku", priority: 0.7 },
  { path: "/articles/kak-vybrat-revizionnyy-lyuk", priority: 0.8 },
  { path: "/articles/kak-vybrat-potolok-grilyato", priority: 0.7 },
  { path: "/articles/kassetnyy-potolok-otkrytaya-sistema", priority: 0.7 },
  { path: "/articles/meditsinskie-potolki-dlya-bolnits-i-klinik", priority: 0.8 },
  { path: "/articles/sendvich-paneli-dlya-stroitelstva", priority: 0.7 },
  { path: "/articles/metalloprokat-dlya-stroitelnogo-obekta", priority: 0.7 },
  { path: "/calculators/stenovye-bloki", priority: 0.8 },
  { path: "/calculators/sendvich-paneli", priority: 0.8 },
  { path: "/calculators/chernyy-metalloprokat", priority: 0.8 },
  { path: "/calculators/profil-gkl", priority: 0.8 },
  { path: "/calculators/grilyato", priority: 0.8 },
  { path: "/calculators/grilyato-gl", priority: 0.8 },
  { path: "/calculators/diagonalnoe-grilyato", priority: 0.8 },
  { path: "/calculators/treugolnoe-grilyato", priority: 0.8 },
  { path: "/calculators/kassetnyy-potolok-otkrytaya-sistema", priority: 0.8 },
  { path: "/calculators/reechnyy-potolok-kuboobraznyy-dizayn", priority: 0.8 },
  { path: "/calculators/reechnyy-potolok-s-dizayn", priority: 0.8 },
  { path: "/calculators/kassetnyy-potolok-skrytaya-sistema", priority: 0.8 },
  { path: "/calculators/stroitelnye-lesa-zashchitnyy-karkas", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: siteUpdatedAt,
    changeFrequency: route.changeFrequency ?? (route.path.startsWith("/articles/") ? "monthly" : "weekly"),
    priority: route.priority,
  }));

  const knowledgeRoutes: MetadataRoute.Sitemap = knowledgeTopics.map((topic) => ({
    url: `${baseUrl}/faq/${topic.slug}`,
    lastModified: new Date(`${topic.updatedAt ?? "2026-08-18"}T00:00:00.000Z`),
    changeFrequency: "monthly",
    priority: topic.searchIntent === "transactional" ? 0.75 : 0.65,
  }));

  return [...staticRoutes, ...knowledgeRoutes];
}
