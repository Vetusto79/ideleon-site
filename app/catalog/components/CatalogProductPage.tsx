import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import KnowledgeLinks from "../../components/KnowledgeLinks";
import type { CatalogProductConfig } from "../../data/catalogProducts";
import type { KnowledgeCategorySlug } from "../../data/knowledge";
import CatalogRequestBuilder from "./CatalogRequestBuilder";
import styles from "../gkl-profile/gklProfile.module.css";

export default function CatalogProductPage({ config }: { config: CatalogProductConfig }) {
  const hasCalculators = config.calculators.length > 0;
  const secondHref = hasCalculators ? "#calculators" : "#specification";
  const knowledgeCategory: Partial<Record<string, KnowledgeCategorySlug>> = {
    "design-ceilings": "reechnye-dizaynerskie-potolki",
    "rack-ceilings": "reechnye-dizaynerskie-potolki",
    grilyato: "grilyato",
    "medical-ceilings": "meditsinskie-potolki",
    "revision-hatches": "revizionnye-lyuki",
    "raised-floors": "falshpoly",
    "sandwich-panels": "sendvich-paneli",
    "gazosilikatnyy-blok": "gazosilikatnye-bloki",
    "kirpich-keramicheskiy": "kirpich",
    "kirpich-silikatnyy": "kirpich",
    "metal-roll": "metalloprokat",
    rebar: "armatura",
  };

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, { label: config.eyebrow }]} />
          <p className="label">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p className={styles.heroLead}>{config.lead}</p>
          <div className={styles.heroActions}>
            <a className="button primary" href="#quick-request">Указать параметры</a>
            <a className="button secondary" href={secondHref}>{hasCalculators ? "Открыть калькулятор" : "Приложить проект"}</a>
            <a className="button secondary" href="#manager-request">Позвать менеджера</a>
          </div>
          <ul className={styles.heroFacts} aria-label={`Преимущества раздела ${config.eyebrow}`}>
            {config.facts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
        </div>

        <div className={styles.heroVisual}>
          <img src={config.image} alt={config.imageAlt} />
          <div className={styles.heroVisualNote}>
            <strong>{config.visualTitle}</strong>
            <span>{config.visualText}</span>
          </div>
        </div>
      </section>

      <section className={styles.routeSection} aria-labelledby={`${config.slug}-route-title`}>
        <div className={styles.sectionHeading}>
          <p className="label">С чего начать</p>
          <h2 id={`${config.slug}-route-title`}>Три сценария — выбирайте свой</h2>
          <p>Каталог не заставляет клиента разбираться глубже, чем требуется для его задачи.</p>
        </div>
        <div className={styles.routeGrid}>
          <a className={styles.routeCard} href="#quick-request">
            <span className={styles.routeNumber}>01</span>
            <strong>Знаю, что нужно</strong>
            <p>Заполните короткую форму по основным параметрам и добавьте нужное количество позиций или зон.</p>
            <span className={styles.routeLink}>Составить заявку →</span>
          </a>
          <a className={styles.routeCard} href={secondHref}>
            <span className={styles.routeNumber}>02</span>
            <strong>{hasCalculators ? "Не знаю количество" : "Есть проект или размеры"}</strong>
            <p>{hasCalculators ? "Откройте калькулятор: он соберёт предварительный комплект и сформирует Excel-КП." : "Прикрепите проект, ведомость, эскиз или размеры — считать вручную в каталоге не придётся."}</p>
            <span className={styles.routeLink}>{hasCalculators ? "Выбрать калькулятор →" : "Приложить файл →"}</span>
          </a>
          <a className={styles.routeCard} href="#manager-request">
            <span className={styles.routeNumber}>03</span>
            <strong>Не хочу разбираться</strong>
            <p>Опишите задачу обычными словами. Менеджер сам определит, какие исходные данные действительно нужны.</p>
            <span className={styles.routeLink}>Позвать менеджера →</span>
          </a>
        </div>
      </section>

      <section className={styles.systemsSection} aria-labelledby={`${config.slug}-details-title`}>
        <div className={styles.sectionHeading}>
          <p className="label">Что важно для расчёта</p>
          <h2 id={`${config.slug}-details-title`}>Ключевые параметры — без перегруза</h2>
          <p>Показываем только то, что помогает сформировать заявку и влияет на подбор.</p>
        </div>
        <div className={styles.systemGrid}>
          {config.infoCards.map((card, index) => (
            <article className={styles.systemCard} key={card.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{card.title}</h3>
              <strong>{card.strong}</strong>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <CatalogRequestBuilder config={config} />

      {hasCalculators ? (
        <section className={styles.knowledgeSection} id="calculators" aria-labelledby={`${config.slug}-calculators-title`}>
          <div className={styles.sectionHeading}>
            <p className="label">Посчитать самостоятельно</p>
            <h2 id={`${config.slug}-calculators-title`}>Выберите подходящий калькулятор</h2>
            <p>Калькулятор рассчитает состав или пересчитает известную величину. Результат можно скачать и отправить менеджеру.</p>
          </div>
          <div className={`${styles.routeGrid} ${config.calculators.length === 1 ? styles.singleRouteGrid : config.calculators.length !== 3 ? styles.calculatorRouteGrid : ""}`}>
            {config.calculators.map((calculator) => (
              <a className={styles.routeCard} href={calculator.href} key={calculator.href}>
                <span className={styles.routeNumber}>{calculator.label}</span>
                <strong>{calculator.title}</strong>
                <p>{calculator.text}</p>
                <span className={styles.routeLink}>Открыть калькулятор →</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.helpSection}>
        <div className={styles.helpCopy}>
          <p className="label">Как работаем</p>
          <h2>{config.processTitle}</h2>
          <p>{config.processText}</p>
        </div>
        <div className={styles.helpChecklist}>
          <h3>Что произойдёт после заявки</h3>
          <ul>{config.processSteps.map((step) => <li key={step}>{step}</li>)}</ul>
          <p>На выходе — проверенная заявка и понятное коммерческое предложение.</p>
        </div>
      </section>

      {knowledgeCategory[config.slug] ? (
        <KnowledgeLinks category={knowledgeCategory[config.slug]!} />
      ) : null}

      <LeadCapture id="manager-request" eyebrow="Можно проще" title={config.managerTitle} text={config.managerText} />
      <SiteFooter />
    </main>
  );
}
