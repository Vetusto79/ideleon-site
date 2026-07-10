import Link from "next/link";
import Breadcrumbs from "../components/Breadcrumbs";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { calculators } from "../data/calculators";

export const metadata = {
  title: "Калькуляторы строительных материалов | Иделеон",
  description: "Онлайн-калькуляторы Иделеон для предварительного расчёта профиля ГКЛ, потолков Грильято, Грильято GL, диагонального и треугольного Грильято.",
};

export default function CalculatorsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Калькуляторы" }]} />
        <p className="label">Калькуляторы</p>
        <h1>Калькуляторы строительных материалов</h1>
        <p>
          Предварительные расчёты расхода материалов для объектов. Результат можно скачать в Excel
          и отправить в Иделеон для проверки и подготовки предложения.
        </p>
      </section>

      <section className="calculatorHub">
        {calculators.map((calculator) => (
          <Link key={calculator.slug} href={`/calculators/${calculator.slug}`} className="calculatorHubCard">
            <span>{calculator.group === "gkl" ? "ГКЛ" : "Грильято"}</span>
            <h2>{calculator.title}</h2>
            <p>{calculator.description}</p>
            <strong>Открыть калькулятор →</strong>
          </Link>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}
