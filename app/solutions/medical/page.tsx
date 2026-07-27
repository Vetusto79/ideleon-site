import type { Metadata } from "next";

import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "Решения для медицинских объектов | Иделеон",
  description:
    "Подбор и поставка потолочных систем и строительных материалов для больниц, клиник, лабораторий и других медицинских объектов.",
};

export default function MedicalSolutionsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Решения", href: "/solutions" },
            { label: "Медицинские объекты" },
          ]}
        />
        <p className="label">Решения для клиентов</p>
        <h1>Решения для медицинских объектов</h1>
        <p>
          Подбираем потолочные системы и строительные материалы для медицинских
          учреждений, где важны практичность, чистота и эксплуатационные
          требования.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <a className="button primary" href="#medical-solutions-request">
            Получить консультацию
          </a>
          <a className="button secondary" href="tel:+79266961386">
            Позвонить
          </a>
        </div>
      </section>

      <section className="articleContent" style={{ paddingTop: 24 }}>
        <section>
          <h2>Что берём на себя</h2>
          <ul>
            <li>Потолочные решения для медицинских учреждений.</li>
            <li>Подбор систем под требования помещений.</li>
            <li>Расчёт комплектующих и материалов.</li>
            <li>Поставка продукции ведущих производителей.</li>
            <li>Консультация по применению решений.</li>
          </ul>
        </section>

        <section
          style={{
            margin: "36px 0",
            padding: "28px",
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.97), rgba(30, 58, 95, 0.94))",
            color: "#fff",
            boxShadow: "0 20px 56px rgba(15, 23, 42, 0.18)",
          }}
        >
          <p className="label" style={{ color: "#fb923c" }}>
            Полезный материал
          </p>
          <h2 style={{ color: "#fff", marginTop: 8 }}>
            Как выбрать потолочную систему для больницы или клиники
          </h2>
          <p style={{ color: "rgba(255,255,255,0.86)", maxWidth: 780 }}>
            В отдельной статье разобрали открытые, скрытые и герметичные системы,
            требования к очистке и документы, которые нужно проверить перед
            закупкой.
          </p>
          <a
            className="button primary"
            href="/articles/meditsinskie-potolki-dlya-bolnits-i-klinik"
            style={{ marginTop: 10 }}
          >
            Читать статью
          </a>
        </section>

        <section>
          <p className="label">Как работаем</p>
          <p>
            Получаем задачу, разбираем проект, предлагаем решение, выполняем
            расчёт и организуем поставку на объект.
          </p>
        </section>

        <LeadCapture
          id="medical-solutions-request"
          title="Обсудим вашу задачу?"
          text="Оставьте контакты — мы уточним потребность, предложим решение и подготовим расчёт."
        />
      </section>

      <SiteFooter />
    </main>
  );
}
