import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";

export const metadata = {
  title: "Газосиликатные блоки для строительства",
  description:
    "Поставка газосиликатных блоков для наружных стен, внутренних перегородок и заполнения каркасных зданий. Расчёт объёма и доставка на объект.",
};

export default function GasSilicateBlockPage() {
  return (
    <main>
      <SiteHeader />

      <section className="productHero">
        <div>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: "Газосиликатные блоки" },
            ]}
          />
          <p className="label">Стеновые материалы</p>
          <h1>Газосиликатные блоки</h1>
          <p>
            Стеновые и перегородочные блоки для частного домостроения, коммерческих
            объектов и заполнения каркасных зданий. Подбираем характеристики по проекту,
            считаем объём и организуем поставку на объект.
          </p>
          <div className="heroButtons">
            <a className="button primary" href="/calculators/stenovye-bloki">
              Рассчитать блоки
            </a>
            <a className="button secondary" href="/#request">
              Получить предложение
            </a>
          </div>
        </div>
        <div className="productHeroImage">
          <img src="/images/catalog/gas-silicate-block.jpg" alt="Газосиликатные блоки на поддоне" />
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Что можно заказать</h2>
          <ul>
            <li>стеновые газосиликатные блоки</li>
            <li>перегородочные блоки</li>
            <li>доборные и U-образные элементы</li>
            <li>клей и кладочные смеси</li>
            <li>комплектную поставку на объект</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Для каких задач</h2>
          <ul>
            <li>наружные стены малоэтажных зданий</li>
            <li>внутренние стены и перегородки</li>
            <li>заполнение монолитного каркаса</li>
            <li>частные дома и хозяйственные постройки</li>
            <li>коммерческие и общественные объекты</li>
          </ul>
        </div>
      </section>

      <section className="productInfoGrid">
        <div className="productInfoCard">
          <h2>Что учитываем при подборе</h2>
          <ul>
            <li>назначение стены и проектную нагрузку</li>
            <li>толщину кладки</li>
            <li>плотность и класс прочности по проекту</li>
            <li>геометрию и формат блока</li>
            <li>требования к теплотехнике и отделке</li>
          </ul>
        </div>

        <div className="productInfoCard">
          <h2>Что прислать для расчёта</h2>
          <ul>
            <li>проект или размеры стен</li>
            <li>площадь и толщину кладки</li>
            <li>размеры оконных и дверных проёмов</li>
            <li>требуемую марку или производителя</li>
            <li>адрес и желаемый срок поставки</li>
          </ul>
        </div>
      </section>

      <section className="productProcess">
        <p className="label">Как работаем</p>
        <h2>Считаем не только блоки, но и всю поставку</h2>
        <div className="steps">
          <div>1. Получаем проект или размеры</div>
          <div>2. Подбираем блок и толщину</div>
          <div>3. Считаем объём и комплектующие</div>
          <div>4. Организуем доставку</div>
        </div>
      </section>

      <LeadCapture
        title="Нужно рассчитать газосиликатные блоки?"
        text="Пришлите проект, размеры стен или готовую спецификацию — Иделеон проверит объём, подберёт продукцию и подготовит предложение с поставкой."
      />

      <SiteFooter />
    </main>
  );
}
