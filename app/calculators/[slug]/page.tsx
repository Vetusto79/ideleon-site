import { notFound } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import UniversalCalculator from "../../components/UniversalCalculator";
import { calculators, getCalculator, getCalculatorSlugs } from "../../data/calculators";

export function generateStaticParams() {
  return getCalculatorSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const calculator = getCalculator(params.slug);

  if (!calculator) {
    return {
      title: "Калькулятор не найден",
    };
  }

  return {
    title: calculator.seoTitle,
    description: calculator.seoDescription,
  };
}

export default function CalculatorPage({ params }: { params: { slug: string } }) {
  const calculator = getCalculator(params.slug);

  if (!calculator) {
    notFound();
  }

  return (
    <main>
      <SiteHeader />

      <section className="pageHero calculatorHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Калькуляторы", href: "/calculators" }, { label: calculator.shortTitle }]} />
        <p className="label">Калькулятор</p>
        <h1>{calculator.h1}</h1>
        <p>{calculator.intro}</p>
      </section>

      <UniversalCalculator calculatorSlug={calculator.slug} />

      <SiteFooter />
    </main>
  );
}
