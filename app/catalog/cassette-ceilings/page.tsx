import type { Metadata } from "next";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import CassetteCeilingRequestBuilder from "./CassetteCeilingRequestBuilder";
import styles from "../gkl-profile/gklProfile.module.css";

export const metadata: Metadata = {
  title: "Кассетные потолки: открытые и закрытые системы",
  description:
    "Кассетные потолочные системы из оцинкованной стали и алюминия. Заявка по параметрам, расчёт открытой или закрытой системы и поставка на объект.",
  alternates: { canonical: "/catalog/cassette-ceilings" },
  openGraph: {
    title: "Кассетные потолки: подбор, расчёт и поставка",
    description:
      "Открытые и закрытые кассетные потолки. Подбор класса, материала, цвета, размера кассет и комплектующих под объект.",
    url: "/catalog/cassette-ceilings",
    type: "website",
  },
};

const systems = [
  {
    number: "01",
    title: "Открытая система",
    profiles: "Кассеты + видимая Т-система",
    text: "Каркас Т-15 или Т-24 остаётся видимым. Подходит для BOARD, LINE, TEGULAR и других совместимых кромок.",
  },
  {
    number: "02",
    title: "Закрытая система",
    profiles: "Кассеты CLIP-IN + скрытый стрингер",
    text: "Кассеты защёлкиваются в стрингер, несущий каркас закрыт. Возможен простой или усиленный монтаж.",
  },
  {
    number: "03",
    title: "Материал кассет",
    profiles: "Оцинкованная сталь или алюминий",
    text: "Материал выбирают по требованиям объекта, влажности, весу, исполнению и бюджету.",
  },
  {
    number: "04",
    title: "Цвет и исполнение",
    profiles: "RAL 9003, 9006, 9007 и другие",
    text: "Подберём гладкие или перфорированные кассеты, стандартный цвет, другой RAL или специальный декор.",
  },
];

const relatedArticles = [
  {
    label: "Выбор",
    title: "Как выбрать подвесную потолочную систему",
    href: "/articles/kak-vybrat-podvesnoy-potolok",
  },
  {
    label: "Система",
    title: "Кассетные потолки: устройство и применение",
    href: "/articles/kassetnye-potolki",
  },
  {
    label: "Сравнение",
    title: "Кассетный потолок на открытой системе",
    href: "/articles/kassetnyy-potolok-otkrytaya-sistema",
  },
];

const faq = [
  {
    question: "Что делать, если периметр неизвестен?",
    answer:
      "Оставьте поле пустым. Для предварительной комплектации численно примем периметр равным площади и отдельно отметим это допущение. Перед заказом значение лучше уточнить по плану.",
  },
  {
    question: "Зачем указывать опускание потолка?",
    answer:
      "От опускания зависит исполнение и длина подвесов. Количество точек подвеса рассчитывается по системе, а длина подбирается под фактическое расстояние от основания до плоскости потолка.",
  },
  {
    question: "Чем открытая система отличается от закрытой?",
    answer:
      "В открытой системе между кассетами виден профиль Т-15 или Т-24. В закрытой кассеты защёлкиваются в скрытый стрингер, поэтому несущая сетка снизу не видна.",
  },
  {
    question: "Класс Эконом, Стандарт или Премиум меняет расход?",
    answer:
      "Обычно класс меняет производителя, исполнение, жёсткость и стоимость элементов, но не геометрию типовой раскладки. Совместимость выбранного комплекта всё равно проверяем перед предложением.",
  },
];

export default function CassetteCeilingsPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: "Кассетные потолочные системы" },
            ]}
          />
          <p className="label">Кассетные потолки</p>
          <h1>Потолочная система целиком, без ручной переписи комплектующих</h1>
          <p className={styles.heroLead}>
            Подбираем открытые и закрытые кассетные потолки. Укажите основные
            параметры системы — кассеты, каркас, уголки и подвесы разложим сами.
          </p>
          <div className={styles.heroActions}>
            <a className="button primary" href="#quick-request">Указать параметры</a>
            <a className="button secondary" href="#calculators">Рассчитать систему</a>
            <a className="button secondary" href="#manager-request">Позвать менеджера</a>
          </div>
          <ul className={styles.heroFacts} aria-label="Параметры кассетного потолка">
            <li>Открытая или закрытая система</li>
            <li>Сталь или алюминий</li>
            <li>Поставка на объект</li>
          </ul>
        </div>

        <div className={styles.heroVisual}>
          <img
            src="/images/catalog/cassette-ceiling.jpg"
            alt="Кассетная потолочная система в современном интерьере"
          />
          <div className={styles.heroVisualNote}>
            <strong>Не знаете состав системы?</strong>
            <span>Это нормально. Нам нужны параметры потолка, а не диктант из артикулов.</span>
          </div>
        </div>
      </section>

      <section className={styles.routeSection} aria-labelledby="ceiling-route-title">
        <div className={styles.sectionHeading}>
          <p className="label">С чего начать</p>
          <h2 id="ceiling-route-title">Три сценария — без потолочного квеста</h2>
          <p>Выбирайте путь по количеству исходных данных и желанию разбираться самостоятельно.</p>
        </div>
        <div className={styles.routeGrid}>
          <a className={styles.routeCard} href="#quick-request">
            <span className={styles.routeNumber}>01</span>
            <strong>Знаю параметры</strong>
            <p>Укажите тип системы, класс, материал, цвет, размер кассет, площадь и опускание.</p>
            <span className={styles.routeLink}>Составить заявку →</span>
          </a>
          <a className={styles.routeCard} href="#calculators">
            <span className={styles.routeNumber}>02</span>
            <strong>Хочу посчитать сам</strong>
            <p>Выберите открытый или закрытый потолок — калькулятор соберёт комплектующие и Excel-КП.</p>
            <span className={styles.routeLink}>Выбрать калькулятор →</span>
          </a>
          <a className={styles.routeCard} href="#manager-request">
            <span className={styles.routeNumber}>03</span>
            <strong>Нужна помощь</strong>
            <p>Опишите помещение и задачу обычными словами. Остальное выяснит менеджер.</p>
            <span className={styles.routeLink}>Позвать менеджера →</span>
          </a>
        </div>
      </section>

      <section className={styles.systemsSection} aria-labelledby="ceiling-systems-title">
        <div className={styles.sectionHeading}>
          <p className="label">Что выбираем</p>
          <h2 id="ceiling-systems-title">Сначала система, затем её комплект</h2>
          <p>
            Размер кассеты и тип каркаса меняют состав и расход. Материал, цвет и
            класс определяют конкретное исполнение и итоговую стоимость.
          </p>
        </div>
        <div className={styles.systemGrid}>
          {systems.map((system) => (
            <article className={styles.systemCard} key={system.number}>
              <span>{system.number}</span>
              <h3>{system.title}</h3>
              <strong>{system.profiles}</strong>
              <p>{system.text}</p>
            </article>
          ))}
        </div>
      </section>

      <CassetteCeilingRequestBuilder />

      <section className={styles.knowledgeSection} id="calculators" aria-labelledby="ceiling-calculators-title">
        <div className={styles.sectionHeading}>
          <p className="label">Посчитать самостоятельно</p>
          <h2 id="ceiling-calculators-title">Выберите тип подвесной системы</h2>
          <p>Калькулятор выдаст комплект элементов, сформирует Excel-КП и позволит сразу отправить расчёт менеджеру.</p>
        </div>
        <div className={`${styles.routeGrid} ${styles.calculatorRouteGrid}`}>
          <a className={styles.routeCard} href="/calculators/kassetnyy-potolok-otkrytaya-sistema">
            <span className={styles.routeNumber}>Т-15 / Т-24</span>
            <strong>Открытая система</strong>
            <p>Кассеты, видимые Т-профили, пристенный уголок и подвесы.</p>
            <span className={styles.routeLink}>Открыть калькулятор →</span>
          </a>
          <a className={styles.routeCard} href="/calculators/kassetnyy-potolok-skrytaya-sistema">
            <span className={styles.routeNumber}>CLIP-IN</span>
            <strong>Закрытая система</strong>
            <p>Кассеты, стрингер ВТ-600 и простой либо усиленный монтаж.</p>
            <span className={styles.routeLink}>Открыть калькулятор →</span>
          </a>
        </div>
      </section>

      <section className={styles.helpSection}>
        <div className={styles.helpCopy}>
          <p className="label">Если исходных данных мало</p>
          <h2>Разбираться самому или отдать менеджеру?</h2>
          <p>
            Хотите понять каждую кассету и подвес — открывайте калькулятор. Не хотите —
            пришлите план или нормальное описание задачи. Менеджер переживёт.
          </p>
          <div className={styles.helpActions}>
            <a className="button primary" href="#calculators">Выбрать калькулятор</a>
            <a className="button secondary" href="#manager-request">Отдать задачу менеджеру</a>
          </div>
        </div>
        <div className={styles.helpChecklist}>
          <h3>Для подбора пригодятся</h3>
          <ul>
            <li>назначение помещения и требования к потолку;</li>
            <li>площадь и, если есть, периметр;</li>
            <li>открытая или закрытая система;</li>
            <li>материал, цвет и размер кассет;</li>
            <li>опускание потолка и адрес объекта.</li>
          </ul>
          <p>Нет половины данных? Присылайте оставшуюся половину — начнём с неё.</p>
        </div>
      </section>

      <LeadCapture
        id="manager-request"
        eyebrow="Помощь менеджера"
        title="Опишите потолок — систему соберём сами"
        text="Напишите, для какого помещения нужен потолок, примерную площадь и что важно получить. Можно приложить план, проект, фотографию или спецификацию."
      />

      <section className={styles.knowledgeSection} aria-labelledby="ceiling-knowledge-title">
        <div className={styles.sectionHeading}>
          <p className="label">Без гадания по кассетам</p>
          <h2 id="ceiling-knowledge-title">Коротко разобраться перед заказом</h2>
        </div>
        <div className={styles.articleGrid}>
          {relatedArticles.map((article) => (
            <a className={styles.articleCard} href={article.href} key={article.href}>
              <span>{article.label}</span>
              <strong>{article.title}</strong>
              <i>Читать →</i>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="ceiling-faq-title">
        <div className={styles.sectionHeading}>
          <p className="label">Вопросы</p>
          <h2 id="ceiling-faq-title">Что важно до расчёта</h2>
        </div>
        <div className={styles.faqList}>
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
