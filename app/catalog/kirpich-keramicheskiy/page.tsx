import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";

export const metadata = {
  title: "Керамический кирпич для строительства и фасадов",
  description:
    "Поставка рядового и лицевого керамического кирпича для кладки стен, перегородок и фасадов. Подбор характеристик, расчёт и доставка на объект.",
};

export default function CeramicBrickPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: "Кирпич керамический" },
            ]}
          />
          <p className="label">Кирпич</p>
          <h1>Кирпич керамический</h1>
          <p>
            Рядовой и лицевой керамический кирпич для несущих конструкций,
            перегородок и фасадов. Подбираем формат, прочность, пустотность, цвет и
            фактуру под проект, считаем количество и организуем доставку.
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
          <img src="/images/catalog/ceramic-brick.jpg" alt="Красный керамический кирпич на поддоне" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
            <li>рядовой полнотелый кирпич</li>
            <li>рядовой пустотелый кирпич</li>
            <li>лицевой керамический кирпич</li>
            <li>клинкерные и фактурные решения</li>
            <li>разные форматы и цветовые коллекции</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Для каких задач</h2>
          <ul>
            <li>кладка наружных и внутренних стен</li>
            <li>перегородки и конструктивные элементы</li>
            <li>облицовка фасадов</li>
            <li>малоэтажные и многоэтажные объекты</li>
            <li>архитектурные и дизайнерские решения</li>
          </ul>
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Параметры для подбора</h2>
          <ul>
            <li>рядовой или лицевой кирпич</li>
            <li>формат и пустотность</li>
            <li>марка прочности и морозостойкость</li>
            <li>водопоглощение по требованиям проекта</li>
            <li>цвет, фактура и партия для фасада</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что прислать для расчёта</h2>
          <ul>
            <li>проект или спецификацию</li>
            <li>площадь и толщину кладки</li>
            <li>формат и назначение кирпича</li>
            <li>цвет и фактуру для лицевой кладки</li>
            <li>адрес и график поставки</li>
          </ul>
        </div>
      </section>

      <section className="productProcess">
        <p className="label">Как работаем</p>
        <h2>Комплектуем объект рядовым и лицевым кирпичом</h2>
        <div className="steps">
          <div>1. Получаем проект или заявку</div>
          <div>2. Подбираем формат и характеристики</div>
          <div>3. Считаем количество и резерв</div>
          <div>4. Планируем поставку партиями</div>
        </div>
      </section>

      <LeadCapture
        title="Нужно подобрать керамический кирпич?"
        text="Пришлите спецификацию, площадь кладки или требования к фасаду — Иделеон предложит подходящие варианты и подготовит расчёт поставки."
      />

      <SiteFooter />
    </main>
  );
}
