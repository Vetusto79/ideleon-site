import type { Metadata } from "next";
import CatalogProductPage from "../components/CatalogProductPage";
import { catalogProducts } from "../../data/catalogProducts";

const config = catalogProducts["raised-floors"];
export const metadata: Metadata = { title: config.metaTitle, description: config.metaDescription, alternates: { canonical: `/catalog/${config.slug}` } };
export default function Page() { return <CatalogProductPage config={config} />; }
