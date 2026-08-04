"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { reachGoal } from "../../components/metrika";

const styles = {
  actions: "actions",
  articleLink: "articleLink",
  benefits: "benefits",
  card: "card",
  cardNo: "cardNo",
  cards: "cards",
  close: "close",
  consent: "consent",
  container: "container",
  cta: "cta",
  ctaInner: "ctaInner",
  dark: "dark",
  error: "error",
  eyebrow: "eyebrow",
  field: "field",
  fileHelp: "fileHelp",
  fileName: "fileName",
  form: "form",
  hero: "hero",
  heroCopy: "heroCopy",
  heroInner: "heroInner",
  heroVisual: "heroVisual",
  hiddenField: "hiddenField",
  lead: "lead",
  micro: "micro",
  mobileBar: "mobileBar",
  modal: "modal",
  modalBackdrop: "modalBackdrop",
  modalLead: "modalLead",
  page: "page",
  pill: "pill",
  primary: "primary",
  roomGrid: "roomGrid",
  secondary: "secondary",
  section: "section",
  sectionHead: "sectionHead",
  soft: "soft",
  status: "status",
  step: "step",
  steps: "steps",
  success: "success",
  valueGrid: "valueGrid",
} as const;

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
      <style jsx>{`
        .page{--navy:#0b1f3a;--navy2:#12345b;--orange:#f58220;--ink:#142033;--muted:#64748b;--line:#dbe4ee;background:#fff;color:var(--ink)}
        .container{width:min(1180px,calc(100% - 40px));margin:0 auto}
        .hero{position:relative;overflow:hidden;display:block;width:100%;max-width:none;min-height:0;margin:0;grid-template-columns:none;gap:0;align-items:initial;background:linear-gradient(112deg,#081a31 0%,#12345b 72%,#174771 100%);color:#fff;padding:54px 0 60px}
        .hero:after{content:"";position:absolute;right:-180px;top:-220px;width:620px;height:620px;border:1px solid rgba(255,255,255,.12);border-radius:50%;box-shadow:0 0 0 80px rgba(255,255,255,.025),0 0 0 160px rgba(255,255,255,.02)}
        .heroInner{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);align-items:center;gap:44px}
        .heroCopy{min-width:0}
        .eyebrow{margin:0 0 14px;color:#ffad68;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:13px}
        .hero h1{max-width:850px;margin:0;font-size:clamp(36px,4.4vw,60px);line-height:1.04;letter-spacing:-.035em;color:#fff}
        .lead{max-width:850px;margin:22px 0 0;color:rgba(255,255,255,.84);font-size:clamp(18px,2vw,23px);line-height:1.5}
        .benefits{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px 24px;max-width:870px;margin:27px 0 0;padding:0;list-style:none}
        .benefits li{position:relative;padding-left:25px;color:#fff;font-size:16px}
        .benefits li:before{content:"✓";position:absolute;left:0;color:#ff9a45;font-weight:900}
        .actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:31px}
        .primary,.secondary{appearance:none;border-radius:12px;min-height:52px;padding:13px 22px;border:1px solid transparent;font:inherit;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
        .primary{background:var(--orange);color:#fff;box-shadow:0 12px 30px rgba(245,130,32,.25)}
        .primary:hover{transform:translateY(-2px);background:#ff8d2c}
        .secondary{background:#fff;color:var(--navy);border-color:#fff}
        .secondary:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.18)}
        .micro{margin:15px 0 0;color:rgba(255,255,255,.62);font-size:13px}
        .heroVisual{position:relative;margin:0;overflow:hidden;border-radius:22px;border:1px solid rgba(255,255,255,.16);background:#0d2948;box-shadow:0 30px 70px rgba(0,0,0,.28)}
        .heroVisual img{display:block;width:100%;height:460px;object-fit:cover;object-position:center}
        .heroVisual figcaption{position:absolute;left:14px;right:14px;bottom:14px;padding:12px 14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(7,23,42,.82);backdrop-filter:blur(8px);color:#fff;font-size:13px;font-weight:750;line-height:1.35}
        .section{width:100%;max-width:none;margin:0;padding:76px 0}
        .soft{background:#f5f8fb}
        .dark{background:var(--navy);color:#fff}
        .sectionHead{max-width:790px;margin-bottom:34px}
        .sectionHead p{margin:10px 0 0;color:var(--muted);font-size:18px;line-height:1.55}
        .dark .sectionHead p{color:rgba(255,255,255,.7)}
        .section h2{margin:0;color:var(--navy);font-size:clamp(29px,3.5vw,44px);line-height:1.12;letter-spacing:-.025em}
        .dark h2{color:#fff}
        .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
        .card{position:relative;overflow:hidden;min-height:300px;padding:28px;border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 16px 48px rgba(19,43,72,.07)}
        .cardNo{display:flex;width:42px;height:42px;align-items:center;justify-content:center;border-radius:12px;background:#eef4fa;color:var(--orange);font-weight:900}
        .card h3{margin:54px 0 12px;color:var(--navy);font-size:24px;line-height:1.2}
        .card p{margin:0;color:var(--muted);line-height:1.55}
        .card:after{content:"";position:absolute;right:-42px;top:-42px;width:140px;height:140px;border-radius:50%;background:linear-gradient(145deg,rgba(245,130,32,.14),rgba(18,52,91,.03))}
        .roomGrid,.valueGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
        .pill{min-height:126px;border-radius:16px;padding:20px;background:#fff;border:1px solid var(--line);font-weight:750;line-height:1.35;display:flex;flex-direction:column;justify-content:space-between}
        .pill span{color:var(--orange);font-size:13px}
        .valueGrid .pill{background:#102c4d;border-color:rgba(255,255,255,.1);color:#fff}
        .valueGrid .pill span{color:#ff9c4b}
        .steps{display:grid;max-width:none;margin:0;grid-template-columns:repeat(5,1fr);gap:0;counter-reset:step}
        .step{position:relative;padding:0 24px 0 0;counter-increment:step}
        .step:before{content:counter(step);display:flex;width:42px;height:42px;align-items:center;justify-content:center;border-radius:50%;background:var(--orange);color:#fff;font-weight:900;margin-bottom:18px}
        .step:not(:last-child):after{content:"";position:absolute;left:52px;right:12px;top:20px;height:2px;background:#d7e1ec}
        .step h3{margin:0;color:var(--navy);font-size:18px;line-height:1.35}
        .cta{padding:48px 0;background:linear-gradient(112deg,#f58220,#e96608);color:#fff}
        .ctaInner{display:flex;align-items:center;justify-content:space-between;gap:28px}
        .cta h2{color:#fff;max-width:720px}
        .cta p{margin:10px 0 0;color:rgba(255,255,255,.84)}
        .cta .secondary{flex:0 0 auto}
        .articleLink{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:28px;border:1px solid var(--line);border-radius:18px;background:#fff;text-decoration:none;color:var(--navy);transition:border-color .18s ease,transform .18s ease}
        .articleLink:hover{border-color:var(--orange);transform:translateY(-2px)}
        .articleLink strong{font-size:21px}
        .articleLink span{color:var(--orange);font-size:28px}
        .modalBackdrop{position:fixed;inset:0;z-index:1000;background:rgba(5,17,31,.72);padding:22px;display:grid;place-items:center;overflow-y:auto}
        .modal{position:relative;width:min(620px,100%);max-height:calc(100vh - 44px);overflow-y:auto;border-radius:22px;background:#fff;padding:30px;box-shadow:0 28px 90px rgba(0,0,0,.35)}
        .close{position:absolute;right:16px;top:14px;width:40px;height:40px;border:0;border-radius:50%;background:#eef3f8;color:var(--navy);font-size:25px;cursor:pointer}
        .modal h2{padding-right:42px;margin:0;color:var(--navy);font-size:30px}
        .modalLead{color:var(--muted);line-height:1.5;margin:10px 0 22px}
        .form{display:grid;grid-template-columns:1fr;gap:15px}
        .field{display:grid;gap:7px}
        .field label{font-weight:750;font-size:14px}
        .field input,.field textarea{width:100%;box-sizing:border-box;border:1px solid #cbd7e4;border-radius:11px;background:#fff;padding:13px 14px;font:inherit;color:var(--ink);outline:none}
        .field input:focus,.field textarea:focus{border-color:var(--orange);box-shadow:0 0 0 3px rgba(245,130,32,.12)}
        .field textarea{resize:vertical;min-height:98px}
        .fileHelp{font-size:12px;color:var(--muted)}
        .consent{display:flex;align-items:flex-start;gap:9px;color:var(--muted);font-size:13px;line-height:1.4}
        .consent input{margin-top:3px}
        .consent a{color:var(--navy)}
        .status{margin:0;font-weight:700}
        .success{color:#15803d}
        .error{color:#b91c1c}
        .fileName{font-size:13px;font-weight:750;color:var(--navy);overflow-wrap:anywhere}
        .hiddenField{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
        .primary:focus-visible,.secondary:focus-visible,.close:focus-visible,.mobileBar button:focus-visible,.articleLink:focus-visible,.field input:focus-visible,.field textarea:focus-visible,.consent a:focus-visible{outline:3px solid #ffd0a8;outline-offset:3px}
        .mobileBar{display:none}
        @media(max-width:1050px){.heroInner{grid-template-columns:1fr}.heroVisual{display:none}}
        @media(max-width:900px){.cards{grid-template-columns:1fr}.card{min-height:230px}.card h3{margin-top:34px}.roomGrid,.valueGrid{grid-template-columns:repeat(2,1fr)}.steps{grid-template-columns:1fr;gap:20px}.step{padding-left:62px;min-height:46px}.step:before{position:absolute;left:0;top:0;margin:0}.step:not(:last-child):after{left:20px;right:auto;top:47px;width:2px;height:20px}.ctaInner{align-items:flex-start;flex-direction:column}}
        @media(max-width:640px){.container{width:min(100% - 28px,1180px)}.page{padding-bottom:72px}.hero{padding:34px 0 46px}.hero h1{font-size:38px}.lead{font-size:17px}.benefits{grid-template-columns:1fr;gap:9px}.actions{display:grid}.primary,.secondary{width:100%;padding-inline:14px}.section{padding:54px 0}.roomGrid,.valueGrid{grid-template-columns:1fr 1fr}.pill{min-height:102px;padding:16px;font-size:14px}.cta{padding:38px 0}.articleLink{align-items:flex-start}.articleLink strong{font-size:18px}.modalBackdrop{padding:10px}.modal{padding:24px 18px;border-radius:18px}.modal h2{font-size:25px}.mobileBar{position:fixed;z-index:900;left:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:9px 10px calc(9px + env(safe-area-inset-bottom));background:rgba(8,26,49,.96);box-shadow:0 -8px 28px rgba(0,0,0,.2)}.mobileBar button{border:0;border-radius:9px;padding:11px 8px;font:inherit;font-size:12px;font-weight:800;line-height:1.2}.mobileBar button:first-child{background:var(--orange);color:#fff}.mobileBar button:last-child{background:#fff;color:var(--navy)}}
        @media(max-width:390px){.hero h1{font-size:34px}.roomGrid,.valueGrid{grid-template-columns:1fr}.mobileBar button{font-size:11px}}
        @media(prefers-reduced-motion:reduce){.primary,.secondary,.articleLink{transition:none}.primary:hover,.secondary:hover,.articleLink:hover{transform:none}}
      `}</style>
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
