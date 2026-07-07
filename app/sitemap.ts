import type { MetadataRoute } from "next";
import { articles, getActiveCategories } from "./data/articles";

const siteUrl = "https://ideleon.com";

const staticRoutes = [
  "",
  "/about",
  "/catalog",
  "/catalog/gkl-profile",
  "/catalog/cassette-ceilings",
  "/catalog/rack-ceilings",
  "/catalog/design-ceilings",
  "/catalog/medical-ceilings",
  "/catalog/grilyato",
  "/catalog/revision-hatches",
  "/catalog/raised-floors",
  "/catalog/sandwich-panels",
  "/catalog/metal-roll",
  "/catalog/rebar",
  "/solutions",
  "/solutions/developers",
  "/solutions/contractors",
  "/solutions/shops",
  "/solutions/medical",
  "/articles",
  "/calculators",
  "/calculators/profil-gkl",
  "/calculators/grilyato",
  "/calculators/grilyato-gl",
  "/calculators/grilyato-dl15",
  "/calculators/treugolnoe-grilyato",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const articleRoutes = articles.map((article) => article.href);
  const categoryRoutes = getActiveCategories().map((category) => category.href);
  const routes = Array.from(new Set([...staticRoutes, ...categoryRoutes, ...articleRoutes]));

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/catalog") ? 0.8 : 0.7,
  }));
}
