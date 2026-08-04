"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { reachGoal } from "../../components/metrika";
import styles from "./MedicalLanding.module.css";

type FormKind = "precalc" | "project";
type FormStatus = "idle" | "sending" | "success" | "error";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".dwg",
  ".dxf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
  ".jpg",
  ".jpeg",
  ".png",
];
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid",
  "gclid",
] as const;

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".0", "")} МБ`;
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function validateFile(file: File | null) {
  if (!file || file.size === 0) return "";
  if (file.size > MAX_FILE_SIZE) {
    return `Файл слишком большой. Максимальный размер — ${formatFileSize(MAX_FILE_SIZE)}.`;
  }
  if (!ALLOWED_FILE_EXTENSIONS.includes(getFileExtension(file.name))) {
    return "Можно приложить PDF, DWG, DXF, Word, Excel, ZIP, RAR, JPG или PNG.";
  }
  return "";
}

function rememberAttribution() {
  try {
    const current = new URLSearchParams(window.location.search);
    const hasCurrentAttribution = ATTRIBUTION_KEYS.some((key) => Boolean(current.get(key)));
    if (hasCurrentAttribution) {
      ATTRIBUTION_KEYS.forEach((key) => {
        const value = current.get(key);
        if (value) sessionStorage.setItem(`ideleon_${key}`, value);
        else sessionStorage.removeItem(`ideleon_${key}`);
      });
      sessionStorage.setItem("ideleon_landing_page", window.location.href);
      sessionStorage.setItem("ideleon_referrer", document.referrer || "direct");
    } else {
      if (!sessionStorage.getItem("ideleon_landing_page")) {
        sessionStorage.setItem("ideleon_landing_page", window.location.href);
      }
      if (!sessionStorage.getItem("ideleon_referrer")) {
        sessionStorage.setItem("ideleon_referrer", document.referrer || "direct");
      }
    }
  } catch {
    // Блокировка sessionStorage не должна мешать работе формы.
  }
}

function appendAttribution(data: FormData) {
  const current = new URLSearchParams(window.location.search);
  ATTRIBUTION_KEYS.forEach((key) => {
    let value = current.get(key) || "";
    try {
      value = sessionStorage.getItem(`ideleon_${key}`) || value;
    } catch {
      // Используем значение из текущего URL.
    }
    if (value) data.set(key, value);
  });

  let landingPage = window.location.href;
  let referrer = document.referrer || "direct";
  try {
    landingPage = sessionStorage.getItem("ideleon_landing_page") || landingPage;
    referrer = sessionStorage.getItem("ideleon_referrer") || referrer;
  } catch {
    // Текущего URL и document.referrer достаточно как резервного варианта.
  }
  data.set("landingPage", landingPage);
  data.set("referrer", referrer);
}

export default function MedicalLanding() {
  const [openForm, setOpenForm] = useState<FormKind | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    rememberAttribution();
  }, []);

  useEffect(() => {
    if (!openForm) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeForm();
    };
    document.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [openForm]);

  function showForm(kind: FormKind, event?: MouseEvent<HTMLElement>) {
    openerRef.current = event?.currentTarget || null;
    setStatus("idle");
    setMessage("");
    setFileName("");
    setOpenForm(kind);
    reachGoal(kind === "precalc" ? "medical_precalc_click" : "medical_project_click", {
      source: window.location.href,
    });
  }

  function closeForm() {
    setOpenForm(null);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    const validationMessage = validateFile(file);
    if (validationMessage) {
      event.target.value = "";
      setFileName("");
      setStatus("error");
      setMessage(validationMessage);
      return;
    }
    setFileName(file ? `${file.name} · ${formatFileSize(file.size)}` : "");
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!openForm || status === "sending" || status === "success") return;

    const form = event.currentTarget;
    const file = fileInputRef.current?.files?.[0] || null;
    const validationMessage = validateFile(file);
    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    const data = new FormData(form);
    data.set("requestType", openForm === "precalc" ? "medical_precalc" : "medical_project");
    data.set("sourcePage", window.location.href);
    data.set("consent", "yes");
    appendAttribution(data);

    setStatus("sending");
    setMessage("Отправляем заявку…");

    try {
      const response = await fetch("/api/request", { method: "POST", body: data });
      let result: { ok?: boolean; message?: string } = {};
      try {
        result = await response.json();
      } catch {
        throw new Error(
          response.status === 413
            ? "Файл слишком большой. Максимальный размер — 25 МБ."
            : "Сервер не смог обработать заявку. Попробуйте ещё раз."
        );
      }
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Не удалось отправить заявку.");
      }

      const specificGoal = openForm === "precalc" ? "medical_precalc_submit" : "medical_project_submit";
      reachGoal(specificGoal, { source: window.location.href });
      reachGoal("lead_form_submit", { form: specificGoal, source: window.location.href });
      form.reset();
      setFileName("");
      setStatus("success");
      setMessage("Спасибо! Заявка отправлена. Мы свяжемся с вами.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам."
      );
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Комплектация медицинских объектов</p>
            <h1>Потолочные системы для больниц, клиник и лабораторий</h1>
            <p className={styles.lead}>
              Подберём открытую, скрытую или Clip-in систему по проекту. Рассчитаем кассеты,
              подсистему и комплектующие. Организуем поставку по России.
            </p>
            <ul className={styles.benefits}>
              <li>Расчёт по плану или спецификации</li>
              <li>Открытые, скрытые и специализированные системы</li>
              <li>Помощь с нестандартными элементами</li>
              <li>Прямые поставки от производителей</li>
            </ul>
            <div className={styles.actions}>
              <button className={styles.primary} onClick={(event) => showForm("precalc", event)}>
                Получить предварительный расчёт
              </button>
              <button className={styles.secondary} onClick={(event) => showForm("project", event)}>
                Отправить проект или спецификацию
              </button>
            </div>
            <p className={styles.micro}>
              Ответим по задаче и запросим только данные, необходимые для расчёта.
            </p>
          </div>
          <figure className={styles.heroVisual}>
            <img
              src="/images/articles/medical-ceilings/medical-ceiling-hero.webp"
              alt="Кассетный потолок в коридоре медицинского учреждения"
              width="1200"
              height="675"
              fetchPriority="high"
            />
            <figcaption>Открытые, скрытые и специализированные потолочные системы</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Три типа решений</p>
            <h2>Подберём систему под режим эксплуатации помещения</h2>
          </div>
          <div className={styles.cards}>
            <article className={styles.card}>
              <div className={styles.cardNo}>01</div>
              <h3>Открытая кассетная система</h3>
              <p>Функциональное решение с доступом в запотолочное пространство. Подбираем кассеты, кромку и несущую систему.</p>
            </article>
            <article className={styles.card}>
              <div className={styles.cardNo}>02</div>
              <h3>Скрытая система Clip-in</h3>
              <p>Ровная плоскость со скрытой подсистемой и съёмными кассетами. Рассчитываем полный комплект для объекта.</p>
            </article>
            <article className={styles.card}>
              <div className={styles.cardNo}>03</div>
              <h3>Решения для чистых помещений</h3>
              <p>Специализированные потолочные решения под проектные требования, инженерные узлы и режим регулярной очистки.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.soft}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Области применения</p>
            <h2>Для каких помещений</h2>
          </div>
          <div className={styles.roomGrid}>
            {["Палаты и кабинеты", "Коридоры и холлы", "Процедурные", "Лаборатории", "Операционные и чистые помещения"].map((item, index) => (
              <div className={styles.pill} key={item}><span>0{index + 1}</span>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Результат работы</p>
            <h2>Что получает заказчик</h2>
            <p>Не отдельные позиции, а согласованный комплект для закупки и поставки.</p>
          </div>
          <div className={styles.valueGrid}>
            {["Подбор системы", "Поэлементный расчёт", "Спецификацию", "Предложение по поставке", "Помощь с проектными узлами"].map((item, index) => (
              <div className={styles.pill} key={item}><span>0{index + 1}</span>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Пять шагов</p>
            <h2>Как организована работа</h2>
          </div>
          <div className={styles.steps}>
            {["Получаем проект", "Уточняем требования", "Подбираем систему", "Рассчитываем комплект", "Организуем поставку"].map((item) => (
              <div className={styles.step} key={item}><h3>{item}</h3></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`${styles.container} ${styles.ctaInner}`}>
          <div>
            <h2>Получите предварительный расчёт потолочной системы</h2>
            <p>Пришлите план, спецификацию или коротко опишите объект.</p>
          </div>
          <button className={styles.secondary} onClick={(event) => showForm("precalc", event)}>
            Запросить расчёт
          </button>
        </div>
      </section>

      <section className={`${styles.section} ${styles.soft}`}>
        <div className={styles.container}>
          <a className={styles.articleLink} href="/articles/meditsinskie-potolki-dlya-bolnits-i-klinik">
            <strong>Подробно о выборе потолков для медицинских помещений</strong>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <div className={styles.mobileBar} aria-label="Быстрые действия">
        <button onClick={(event) => showForm("precalc", event)}>Получить расчёт</button>
        <button onClick={(event) => showForm("project", event)}>Отправить проект</button>
      </div>

      {openForm && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="medical-form-title"
            aria-describedby="medical-form-description"
          >
            <button className={styles.close} type="button" aria-label="Закрыть форму" onClick={closeForm}>×</button>
            <h2 id="medical-form-title">
              {openForm === "precalc" ? "Получить предварительный расчёт" : "Отправить проект или спецификацию"}
            </h2>
            <p className={styles.modalLead} id="medical-form-description">
              {openForm === "precalc"
                ? "Оставьте телефон или e-mail. Мы уточним исходные данные и свяжемся с вами."
                : "Приложите проект, план или спецификацию. Можно добавить комментарий к задаче."}
            </p>
            <form className={styles.form} onSubmit={submit}>
              <div className={styles.field}>
                <label htmlFor="medical-contact">Телефон или e-mail *</label>
                <input
                  id="medical-contact"
                  name="contact"
                  required
                  autoFocus
                  autoComplete="on"
                  placeholder="+7 999 000-00-00 или name@company.ru"
                />
              </div>
              {openForm === "project" && (
                <div className={styles.field}>
                  <label htmlFor="medical-file">Проект или спецификация *</label>
                  <input
                    ref={fileInputRef}
                    id="medical-file"
                    name="attachment"
                    type="file"
                    required
                    accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                    onChange={handleFileChange}
                  />
                  <span className={styles.fileHelp}>PDF, DWG, DXF, Word, Excel, ZIP, RAR или изображение до 25 МБ.</span>
                  {fileName && <span className={styles.fileName}>{fileName}</span>}
                </div>
              )}
              <div className={styles.field}>
                <label htmlFor="medical-comment">Комментарий <span className={styles.fileHelp}>(необязательно)</span></label>
                <textarea id="medical-comment" name="task" placeholder="Площадь, тип помещений, сроки или особые требования" />
              </div>
              <label className={styles.consent}>
                <input name="consent" type="checkbox" value="yes" required />
                <span>
                  Согласен на обработку персональных данных в соответствии с{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer">политикой конфиденциальности</a>.
                </span>
              </label>
              <input className={styles.hiddenField} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <button className={styles.primary} type="submit" disabled={status === "sending" || status === "success"}>
                {status === "sending" ? "Отправляем…" : openForm === "precalc" ? "Получить расчёт" : "Отправить проект"}
              </button>
              <div aria-live="polite">
                {message && (
                  <p className={`${styles.status} ${status === "success" ? styles.success : status === "error" ? styles.error : ""}`}>
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
