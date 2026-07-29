import Link from "next/link";
import Breadcrumbs from "../components/Breadcrumbs";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { calculators } from "../data/calculators";

export const metadata = {
  title: "Калькуляторы строительных материалов",
  description: "Онлайн-калькуляторы Иделеон для расчёта профиля ГКЛ, потолочных систем и двухконтурного пространственного каркаса.",
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
              <p className="label">Пространственные конструкции</p>
              <h2>Строительные леса и защитные каркасы</h2>
              <p>Предварительный подбор элементов двухконтурного каркаса вокруг здания.</p>
            </div>
            <span>1 калькулятор</span>
          </header>
          <div className="calculatorHub calculatorHubGrouped">
            <Link href="/calculators/stroitelnye-lesa-zashchitnyy-karkas" className="calculatorHubCard">
              <span>Пространственный каркас</span>
              <h3>Двухконтурный каркас вокруг здания</h3>
              <p>Клиновая или хомутовая система: стойки, ригели, перемычки, диагонали, опоры и панели.</p>
              <strong>Открыть калькулятор →</strong>
            </Link>
          </div>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
