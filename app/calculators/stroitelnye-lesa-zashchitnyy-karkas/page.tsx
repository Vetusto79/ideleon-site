import type { Metadata } from "next";
import Breadcrumbs from "../../components/Breadcrumbs";
import ScaffoldProtectionCalculator from "../../components/ScaffoldProtectionCalculator";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "Калькулятор защиты здания от БПЛА | ИДЕЛЕОН",
  description: "Предварительный расчёт двухконтурного защитного каркаса для прямоугольных, Г-, П-образных и произвольных контуров здания.",
  alternates: { canonical: "/calculators/stroitelnye-lesa-zashchitnyy-karkas" },
};

export default function ScaffoldProtectionCalculatorPage() {
  return (
    <main>
      <SiteHeader />
      <section className="pageHero scaffoldHero">
        <Breadcrumbs items={[
          { label: "Главная", href: "/" },
          { label: "Калькуляторы", href: "/calculators" },
          { label: "Защита зданий от БПЛА" },
        ]} />
        <p className="label">Предварительный инженерно-коммерческий расчёт</p>
        <h1>Калькулятор защиты здания от БПЛА</h1>
        <p>Подбирает двухконтурный защитный каркас на базе клиновой или хомутовой системы для прямоугольных, Г-, П-образных и произвольных контуров. Результат предназначен для инженерной проверки и подготовки коммерческого предложения.</p>
      </section>

      <ScaffoldProtectionCalculator />

      <section className="calculatorSeoSection scaffoldSeo">
        <article>
          <h2>Что именно считает калькулятор</h2>
          <p>Модель строит внутренний и наружный контуры по форме здания, разбивает каждый фасадный участок на пролёты и рассчитывает стойки, продольные и поперечные ригели, опоры, диагонали и ориентировочное количество панелей верхнего уровня.</p>
        </article>
        <article>
          <h2>Как задать сложную форму здания</h2>
          <p>Можно выбрать готовую Г- или П-образную форму либо собрать произвольный замкнутый контур. Основной способ ввода использует длину и направление каждого участка; для переноса данных из чертежа предусмотрены координаты X/Y.</p>
        </article>
        <article>
          <h2>Почему результат предварительный</h2>
          <p>До заказа инженер должен проверить региональные ветровые и снеговые нагрузки, основания, раскрепление, верхнее покрытие, узлы углов и технический паспорт конкретной системы строительных лесов.</p>
        </article>
      </section>
      <SiteFooter />
    </main>
  );
}
