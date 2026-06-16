import { notFound } from "next/navigation";
import ArticleCategoryPage from "../../components/ArticleCategoryPage";
import { getCategoryBySlug, getCategoryStaticParams } from "../../data/articles";

type Props = {
  params: {
    categorySlug: string;
  };
};

export function generateStaticParams() {
  return getCategoryStaticParams();
}

export function generateMetadata({ params }: Props) {
  const category = getCategoryBySlug(params.categorySlug);

  if (!category) {
    return {
      title: "Статьи Иделеон",
      description: "Полезные статьи Иделеон о строительных материалах и комплектации объектов.",
    };
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
  };
}

export default function CategoryRoute({ params }: Props) {
  const category = getCategoryBySlug(params.categorySlug);

  if (!category) {
    notFound();
  }

  return <ArticleCategoryPage category={category} />;
}
