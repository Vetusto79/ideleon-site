import Link from "next/link";
import Breadcrumbs from "../components/Breadcrumbs";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { calculators } from "../data/calculators";

export const metadata = {
  title: "Калькуляторы строительных материалов",
  description: "Онлайн-калькуляторы Иделеон для расчёта строительных материалов и предварительного подбора защитного каркаса от БПЛА.",
};

const groups = [
  {
    id: "gkl",
    label: "Гипсокартонные конструкции",
    title: "Профиль для ГКЛ",
    description: "Потолок, выравнивание стены и перегородка.",
  },
  {
    id: "grilyato",
    label: "Открытые ячеистые потолки",
    title: "Потолки Грильято",
    description: "Стандартное, GL, диагональное и треугольное Грильято.",
  },
  {
    id: "cassette",
    label: "Модульные металлические потолки",
    title: "Кассетные потолки",
    description: "Открытая система Т-15/Т-24 и закрытая система с простым или усиленным монтажом.",
  },
] as const;

export default function CalculatorsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Калькуляторы" }]} />
        <p className="label">Калькуляторы</p>
        <h1>Калькуляторы строительных материалов</h1>
        <p>Выберите направление, получите предварительную комплектацию, скачайте Excel-КП или отправьте расчёт специалисту Иделеон.</p>
      </section>

      <section className="calculatorGroupedHub">
        {groups.map((group) => {
          const groupCalculators = calculators.filter((calculator) => calculator.group === group.id);
          return (
            <section className="calculatorGroupBlock" key={group.id}>
              <header className="calculatorGroupHeader">
                <div>
                  <p className="label">{group.label}</p>
                  <h2>{group.title}</h2>
                  <p>{group.description}</p>
                </div>
                <span>{groupCalculators.length} {groupCalculators.length === 1 ? "калькулятор" : "калькулятора"}</span>
              </header>

              <div className="calculatorHub calculatorHubGrouped">
                {groupCalculators.map((calculator) => (
                  <Link key={calculator.slug} href={`/calculators/${calculator.slug}`} className="calculatorHubCard">
                    <span>{group.title}</span>
                    <h3>{calculator.title}</h3>
                    <p>{calculator.description}</p>
                    <strong>Открыть калькулятор →</strong>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section className="calculatorGroupBlock">
          <header className="calculatorGroupHeader">
            <div>
              <p className="label">Безопасность объектов</p>
              <h2>Защита зданий от БПЛА</h2>
              <p>Предварительный подбор двухконтурного каркаса на базе элементов строительных лесов.</p>
            </div>
            <span>1 калькулятор</span>
          </header>
          <div className="calculatorHub calculatorHubGrouped">
            <Link href="/calculators/stroitelnye-lesa-zashchitnyy-karkas" className="calculatorHubCard">
              <span>Защитные конструкции</span>
              <h3>Калькулятор защиты здания от БПЛА</h3>
              <p>Предварительный расчёт внутреннего и внешнего контуров, стоек, ригелей, перемычек, диагоналей, опор и панелей.</p>
              <strong>Открыть калькулятор →</strong>
            </Link>
          </div>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
