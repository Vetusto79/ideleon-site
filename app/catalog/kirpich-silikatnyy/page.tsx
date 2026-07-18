aimport SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";

export const metadata = {
  title: "Силикатный кирпич для строительных объектов",
  description:
    "Поставка рядового и лицевого силикатного кирпича для стен, перегородок и облицовки. Подбор по проекту, расчёт количества и доставка.",
};

export default function SilicateBrickPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: "Кирпич силикатный" },
            ]}
          />
          <p className="label">Кирпич</p>
          <h1>Кирпич силикатный</h1>
          <p>
            Рядовой и лицевой силикатный кирпич для кладки стен, перегородок и
            облицовки. Подбираем формат, пустотность, марку и внешний вид под требования
            проекта и организуем поставку заводскими поддонами.
          </p>
          <div className="heroButtons">
            <a className="button primary" href="/#request">
              Получить расчёт
            </a>
            <a className="button secondary" href="/catalog">
              В каталог
            </a>
          </div>
        </div>
        <div className="productHeroImage">
          <img src="/images/catalog/silicate-brick.jpg" alt="Белый силикатный кирпич на поддоне" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
            <li>рядовой полнотелый кирпич</li>
            <li>рядовой пустотелый кирпич</li>
            <li>лицевой силикатный кирпич</li>
            <li>цветные и фактурные варианты</li>
            <li>поставка поддонами и машинными нормами</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Для каких задач</h2>
          <ul>
            <li>несущие и самонесущие стены по проекту</li>
            <li>межкомнатные и межквартирные перегородки</li>
            <li>облицовка фасадов</li>
            <li>общественные и коммерческие здания</li>
            <li>частное домостроение</li>
          </ul>
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Параметры для подбора</h2>
          <ul>
            <li>назначение: рядовой или лицевой</li>
            <li>полнотелый или пустотелый вариант</li>
            <li>формат и размеры</li>
            <li>марка прочности и морозостойкость</li>
            <li>цвет и фактура лицевой поверхности</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что прислать для расчёта</h2>
          <ul>
            <li>спецификацию или площадь кладки</li>
            <li>толщину стены</li>
            <li>размер и тип кирпича</li>
            <li>требования к цвету и поверхности</li>
            <li>адрес и срок поставки</li>
          </ul>
        </div>
      </section>

      <section className="productProcess">
        <p className="label">Как работаем</p>
        <h2>Подбираем кирпич и считаем поставку до поддона</h2>
        <div className="steps">
          <div>1. Получаем спецификацию</div>
          <div>2. Сверяем характеристики</div>
          <div>3. Считаем количество и поддоны</div>
          <div>4. Согласуем доставку</div>
        </div>
      </section>

      <LeadCapture
        title="Нужна цена на силикатный кирпич?"
        text="Пришлите марку, формат, количество или проект — Иделеон подберёт подходящую продукцию, рассчитает объём поставки и подготовит коммерческое предложение."
      />

      <SiteFooter />
    </main>
  );
}
