import type { MetadataRoute } from "next";

const siteUrl = "https://ideleon.com";

const routes = [
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
    "/articles/kak-vybrat-podvesnoy-potolok",
    "/articles/kassetnye-potolki",
    "/articles/grilyato",
    "/articles/reechnye-potolki",
    "/articles/revizionnye-lyuki",
    "/articles/profil-dlya-gkl",
    "/articles/postavshchik-stroymaterialov",
    "/privacy"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/catalog") ? 0.8 : 0.7,
  }));
}

