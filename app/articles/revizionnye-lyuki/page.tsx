import ArticleCategoryPage from "../../components/ArticleCategoryPage";
import { getCategoryBySlug } from "../../data/articles";

const category = getCategoryBySlug("revizionnye-lyuki");

export const metadata = {
  title: category?.seoTitle || "Ревизионные люки",
  description:
    category?.seoDescription ||
    "Статьи Иделеон о ревизионных люках: люки под плитку, под покраску, подбор размера и применение на объектах.",
};

export default function RevisionHatchesCategoryPage() {
  if (!category) {
    return null;
  }

  return <ArticleCategoryPage category={category} />;
}
