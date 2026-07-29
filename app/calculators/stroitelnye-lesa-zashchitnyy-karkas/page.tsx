import type { Metadata } from "next";
import Breadcrumbs from "../../components/Breadcrumbs";
import ScaffoldProtectionCalculator from "../../components/ScaffoldProtectionCalculator";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "Калькулятор защиты здания от БПЛА | ИДЕЛЕОН",
  description: "Предварительный расчёт двухконтурного защитного каркаса вокруг здания на базе элементов строительных лесов.",
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
        <p className="label">Инженерно-коммерческая модель V1</p>
        <h1>Калькулятор защиты здания от БПЛА</h1>
        <p>Предварительно подбирает двухконтурный защитный каркас на базе клиновой или хомутовой системы вокруг прямоугольного здания. Результат предназначен для проверки специалистом и подготовки коммерческого предложения.</p>
      </section>

      <ScaffoldProtectionCalculator />

      <section className="calculatorSeoSection scaffoldSeo">
        <article>
          <h2>Что именно считает калькулятор</h2>
          <p>Модель строит внутренний контур с отступом от фасада, затем наружный контур с заданной шириной. Каждая сторона округляется вверх до целого числа пролётов. По полученной сетке рассчитываются стойки, горизонтальные и поперечные ригели, опоры, диагонали и ориентировочное количество панелей верхнего уровня.</p>
        </article>
        <article>
          <h2>Почему результат предварительный</h2>
          <p>Размеров здания достаточно для оценки комплектации, но недостаточно для подтверждения устойчивости. До заказа инженер должен учесть регион строительства, ветер, снег, основания, раскрепление, тип верхнего покрытия, узлы углов и технический паспорт конкретной системы.</p>
        </article>
        <article>
          <h2>Как считать здание сложной формы</h2>
          <p>В версии V1 прямоугольные участки неправильного здания рассчитываются отдельно, а пересечения и общие стороны исключаются специалистом. Следующая версия редактора контура сможет строить Г-, П-образные и произвольные планы по точкам.</p>
        </article>
      </section>
      <SiteFooter />
    </main>
  );
}
