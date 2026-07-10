import type { MetadataRoute } from "next";
import { calculators } from "./data/calculators";

const baseUrl = "https://ideleon.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/catalog",
    "/articles",
    "/about",
    "/privacy",
    "/solutions",
    "/solutions/developers",
    "/solutions/contractors",
    "/solutions/shops",
    "/solutions/medical",
    "/calculators",
    "/catalog/gkl-profile",
    "/catalog/cassette-ceilings",
    "/catalog/rack-ceilings",
    "/catalog/grilyato",
    "/catalog/design-ceilings",
    "/catalog/medical-ceilings",
    "/catalog/revision-hatches",
    "/catalog/raised-floors",
    "/catalog/sandwich-panels",
    "/catalog/metal-roll",
    "/catalog/rebar",
    "/articles/kak-rasschitat-profil-dlya-gipsokartona",
    "/articles/tolshchina-profilya-dlya-gipsokartona",
    "/articles/postavshchik-stroymaterialov",
    "/articles/kak-vybrat-podvesnoy-potolok",
    "/articles/kassetnye-potolki",
    "/articles/grilyato",
    "/articles/reechnye-potolki",
    "/articles/revizionnye-lyuki-pod-plitku-i-pokrasku",
  ];

  const calculatorRoutes = calculators.map((calculator) => `/calculators/${calculator.slug}`);

  return [...staticRoutes, ...calculatorRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route.startsWith("/calculators") ? 0.8 : 0.7,
  }));
}
