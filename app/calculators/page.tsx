import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";

export const metadata = {
  title: "Калькуляторы строительных материалов",
  description:
    "Калькуляторы Иделеон для ориентировочного расчёта расхода строительных материалов: профиль для ГКЛ, потолок Грильято и другие решения.",
};

export default function CalculatorsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Калькуляторы" }]} />
        <p className="label">Калькуляторы</p>
        <h1>Калькуляторы расхода строительных материалов</h1>
        <p>
          Быстрые расчёты для предварительной оценки расхода материалов. Результат лучше проверять
          по проекту или спецификации — особенно на объектах со сложной геометрией.
        </p>
      </section>

      <section className="articleListSection">
        <div className="articleGrid articleGridLarge">
          <a className="articleCard articleCardFeatured" href="/calculators/profil-gkl">
            <span className="articleBadge">Калькулятор</span>
            <h3>Профиль для ГКЛ</h3>
            <p>
              Расчёт ориентировочного расхода материалов для потолка, облицовки стены и перегородки
              из гипсокартона.
            </p>
            <span>Открыть калькулятор →</span>
          </a>

          <a className="articleCard articleCardFeatured" href="/calculators/grilyato">
            <span className="articleBadge">Калькулятор</span>
            <h3>Потолок Грильято</h3>
            <p>
              Расчёт решёток, профилей «мама» и «папа», направляющих, подвесов, соединителей и
              периметрального уголка.
            </p>
            <span>Открыть калькулятор →</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
