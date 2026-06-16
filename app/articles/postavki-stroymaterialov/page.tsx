import ArticleCategoryPage from "../../components/ArticleCategoryPage";
import { getCategoryBySlug } from "../../data/articles";

const category = getCategoryBySlug("postavki-stroymaterialov");

export const metadata = {
  title: category?.seoTitle || "Статьи Иделеон",
  description:
    category?.seoDescription ||
    "Полезные статьи Иделеон о строительных материалах и комплектации объектов.",
};

export default function CategoryPage() {
  if (!category) {
    return null;
  }

  return <ArticleCategoryPage category={category} />;
}
