import type { Metadata } from "next";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
import KnowledgeLinks from "../../components/KnowledgeLinks";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import ProfileRequestBuilder from "./ProfileRequestBuilder";
import styles from "./gklProfile.module.css";

export const metadata: Metadata = {
  title: "Профиль для ГКЛ: подбор, расчёт и поставка",
  description:
    "Профиль для гипсокартона для потолков, облицовок и перегородок. Быстрая заявка по позициям, расчёт системы или загрузка готовой спецификации.",
  alternates: { canonical: "/catalog/gkl-profile" },
  openGraph: {
    title: "Профиль для ГКЛ: подбор, расчёт и поставка",
    description:
      "Одна позиция на добор, комплектная система или готовая спецификация. Подбор и поставка профиля для гипсокартона на объект.",
    url: "/catalog/gkl-profile",
    type: "website",
  },
};

const systems = [
  {
    number: "01",
    title: "Потолочный каркас",
    profiles: "ПП 60×27 + ППН 28×27",
    text: "Профили, подвесы, соединители и крепёж для одно- и двухуровневых потолков.",
  },
  {
    number: "02",
    title: "Перегородки",
    profiles: "ПС + ПН: 50, 75 и 100 мм",
    text: "Стоечные и направляющие профили с учётом высоты, шага стоек и дверных проёмов.",
  },
  {
    number: "03",
    title: "Облицовка стен",
    profiles: "ПП/ППН или ПС/ПН",
    text: "Подберём систему под способ крепления, высоту помещения и требуемый вынос от стены.",
  },
  {
    number: "04",
    title: "Комплектующие",
    profiles: "Подвесы, соединители, тяги, крепёж",
    text: "Проверим комплектность, чтобы каркас не остановился из-за одной забытой детали.",
  },
];

const relatedArticles = [
  {
    label: "Выбор",
    title: "Какой толщины выбрать профиль для ГКЛ",
    href: "/articles/tolshchina-profilya-dlya-gipsokartona",
  },
  {
    label: "Система",
    title: "ПП 60×27 и ППН 28×27: потолочная пара без путаницы",
    href: "/articles/pp-60x27-i-ppn-28x27-dlya-gipsokartona",
  },
  {
    label: "Расчёт",
    title: "Как рассчитать профиль для гипсокартона",
    href: "/articles/kak-rasschitat-profil-dlya-gipsokartona",
  },
];

const faq = [
  {
    question: "Можно заказать только один тип профиля на добор?",
    answer:
      "Да. В форме можно оставить одну строку — например, только ПП 60×27 или ПС 75×50. Комплектную систему заказывать необязательно.",
  },
  {
    question: "Можно отправить готовую спецификацию вместо заполнения строк?",
    answer:
      "Да. Приложите PDF, Excel, Word, чертёж, изображение или архив до 25 МБ. Менеджер разберёт позиции и уточнит недостающие параметры.",
  },
  {
    question: "Калькулятор даёт окончательную спецификацию?",
    answer:
      "Калькулятор делает предварительный расчёт. Финальную комплектность лучше проверить по проекту: на расход влияют высота, шаг стоек, проёмы, количество слоёв и узлы примыканий.",
  },
  {
    question: "Почему на странице нет цены за штуку?",
    answer:
      "На объектную цену влияют производитель, толщина металла, длина, объём, регион и состав всей поставки. Поэтому сначала фиксируем задачу, затем готовим сопоставимое предложение без декоративной цены «от».",
  },
];

export default function GklProfilePage() {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: "Профиль для гипсокартона" },
            ]}
          />
          <p className="label">Профиль для ГКЛ</p>
          <h1>Профиль под задачу, а не «что было на складе»</h1>
          <p className={styles.heroLead}>
            Поставляем профиль и комплектующие для потолков, облицовок и перегородок.
            Можно заказать одну позицию на добор, собрать список из нескольких профилей
            или прислать проект целиком.
          </p>
          <div className={styles.heroActions}>
            <a className="button primary" href="#quick-request">Указать позиции</a>
            <a className="button secondary" href="/calculators/profil-gkl">Рассчитать систему</a>
            <a className="button secondary" href="#manager-request">Позвать менеджера</a>
          </div>
          <ul className={styles.heroFacts} aria-label="Условия работы">
            <li>Одна позиция или комплект</li>
            <li>Проверка совместимости</li>
            <li>Поставка на объект</li>
          </ul>
        </div>

        <div className={styles.heroVisual}>
          <img
            src="/images/catalog/gkl-profile.jpg"
            alt="Оцинкованный профиль для каркаса из гипсокартона"
          />
          <div className={styles.heroVisualNote}>
            <strong>Не нашли точное название?</strong>
            <span>Опишите конструкцию — подберём пару профилей и комплектующие.</span>
          </div>
        </div>
      </section>

      <section className={styles.routeSection} aria-labelledby="route-title">
        <div className={styles.sectionHeading}>
          <p className="label">С чего начать</p>
          <h2 id="route-title">Выберите свой короткий путь</h2>
          <p>Никакого каталожного квеста на триста карточек. Нужен результат — идём к нему.</p>
        </div>
        <div className={styles.routeGrid}>
          <a className={styles.routeCard} href="#quick-request">
            <span className={styles.routeNumber}>01</span>
            <strong>Знаю, что нужно</strong>
            <p>Заполните одну или несколько строк либо приложите готовую спецификацию.</p>
            <span className={styles.routeLink}>Составить заявку →</span>
          </a>
          <a className={styles.routeCard} href="/calculators/profil-gkl">
            <span className={styles.routeNumber}>02</span>
            <strong>Хочу посчитать сам</strong>
            <p>Если количество неизвестно, выберите конструкцию — калькулятор соберёт предварительную ведомость.</p>
            <span className={styles.routeLink}>Открыть калькулятор →</span>
          </a>
          <a className={styles.routeCard} href="#manager-request">
            <span className={styles.routeNumber}>03</span>
            <strong>Нужна помощь</strong>
            <p>Опишите задачу своими словами. Менеджер уточнит недостающее и подготовит расчёт.</p>
            <span className={styles.routeLink}>Позвать менеджера →</span>
          </a>
        </div>
      </section>

      <section className={styles.systemsSection} aria-labelledby="systems-title">
        <div className={styles.sectionHeading}>
          <p className="label">Системы</p>
          <h2 id="systems-title">Не россыпь артикулов, а понятные группы</h2>
          <p>
            Профиль выбирают не по красоте фотографии. Сначала конструкция, затем
            типоразмер, толщина металла, длина и комплектность.
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

      <ProfileRequestBuilder />

      <section className={styles.helpSection}>
        <div className={styles.helpCopy}>
          <p className="label">Если исходных данных мало</p>
          <h2>Считать самому или отдать менеджеру?</h2>
          <p>
            Хотите вспотеть сами — открывайте калькулятор. Не хотите — отправляйте
            план, ведомость или даже нормальное описание задачи. Пусть потеет менеджер:
            ему за это и выдали калькулятор, таблицы и телефон.
          </p>
          <div className={styles.helpActions}>
            <a className="button primary" href="/calculators/profil-gkl">Перейти к калькулятору</a>
            <a className="button secondary" href="#manager-request">Отдать задачу менеджеру</a>
          </div>
        </div>
        <div className={styles.helpChecklist}>
          <h3>Для точного подбора пригодятся</h3>
          <ul>
            <li>тип конструкции: потолок, облицовка или перегородка;</li>
            <li>площадь, длина и высота;</li>
            <li>типоразмер и желаемая толщина металла;</li>
            <li>дверные проёмы и особые нагрузки;</li>
            <li>адрес объекта и желаемый срок поставки.</li>
          </ul>
          <p>Нет всего списка? Присылайте то, что есть. Остальное уточним.</p>
        </div>
      </section>

      <KnowledgeLinks category="profil-gkl" />

      <LeadCapture
        id="manager-request"
        eyebrow="Помощь менеджера"
        title="Опишите задачу — остальное уточним сами"
        text="Не знаете тип профиля, размер или количество? Напишите обычными словами, что строите и что нужно получить. Менеджер задаст вопросы по делу и подготовит расчёт."
      />

      <section className={styles.knowledgeSection} aria-labelledby="knowledge-title">
        <div className={styles.sectionHeading}>
          <p className="label">Без гадания по оцинковке</p>
          <h2 id="knowledge-title">Коротко разобраться перед заказом</h2>
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

      <section className={styles.faqSection} aria-labelledby="faq-title">
        <div className={styles.sectionHeading}>
          <p className="label">Вопросы</p>
          <h2 id="faq-title">Что обычно уточняют</h2>
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
