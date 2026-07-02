"use client";

import { useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";

type ConstructionType = "ceiling" | "cladding" | "partition";
type SuspensionType = "direct" | "anchor";
type PartitionWidth = "50" | "75" | "100";

type ResultRow = {
  name: string;
  unit: string;
  coefficient: string;
  quantity: number;
  rounded: number;
};

function toNumber(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function addReserve(value: number, reservePercent: number) {
  return value * (1 + reservePercent / 100);
}

function roundUp(value: number, unit: string) {
  if (unit === "шт." || unit === "лист") {
    return Math.ceil(value);
  }

  return Math.ceil(value * 10) / 10;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
  }).format(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createExcelBlob({
  title,
  subtitle,
  params,
  rows,
}: {
  title: string;
  subtitle: string;
  params: string;
  rows: ResultRow[];
}) {
  const date = new Date().toLocaleDateString("ru-RU");

  const bodyRows = rows
    .map((row, index) => {
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.unit)}</td>
          <td style='mso-number-format:"\\@";'>${escapeHtml(row.coefficient)}</td>
          <td>${formatNumber(row.rounded)}</td>
          <td></td>
          <td></td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          td, th { border: 1px solid #999; padding: 8px; font-size: 12pt; vertical-align: top; }
          .title { font-size: 18pt; font-weight: bold; color: #111827; }
          .brand { font-size: 14pt; font-weight: bold; color: #111827; }
          .muted { color: #64748b; }
          .header { background: #111827; color: #ffffff; font-weight: bold; }
          .text { mso-number-format:"\\@"; }
        </style>
      </head>
      <body>
        <table>
          <tr style="height: 76px;">
            <td colspan="7" class="brand" style="height: 76px; vertical-align: middle;">
              <img src="https://ideleon.com/images/logo/ideleon-logo-horizontal.png" width="220" style="display: block;" />
            </td>
          </tr>
          <tr><td colspan="7" style="height: 16px;"></td></tr>
          <tr><td colspan="7" style="height: 16px;"></td></tr>
          <tr><td colspan="7" class="title">${escapeHtml(title)}</td></tr>
          <tr><td colspan="7" class="muted">${escapeHtml(subtitle)}</td></tr>
          <tr><td colspan="7">Дата: ${date}</td></tr>
          <tr><td colspan="7">${escapeHtml(params)}</td></tr>
          <tr><td colspan="7"></td></tr>
          <tr class="header">
            <th>№</th>
            <th>Наименование</th>
            <th>Ед. изм.</th>
            <th>Коэффициент</th>
            <th>Количество</th>
            <th>Цена</th>
            <th>Сумма</th>
          </tr>
          ${bodyRows}
          <tr><td colspan="7"></td></tr>
          <tr><td colspan="7" class="muted">Цена и сумма оставлены пустыми для заполнения менеджером.</td></tr>
          <tr><td colspan="7" class="muted">Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.</td></tr>
        </table>
      </body>
    </html>
  `;

  return new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export default function GklProfileCalculatorPage() {
  const [constructionType, setConstructionType] = useState<ConstructionType>("ceiling");
  const [ceilingArea, setCeilingArea] = useState("200");
  const [ceilingPerimeter, setCeilingPerimeter] = useState("40");
  const [wallHeight, setWallHeight] = useState("3");
  const [wallLength, setWallLength] = useState("10");
  const [partitionWidth, setPartitionWidth] = useState<PartitionWidth>("50");
  const [suspensionType, setSuspensionType] = useState<SuspensionType>("direct");
  const [reservePercent, setReservePercent] = useState("5");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendMessage, setSendMessage] = useState("");

  const reserve = Math.min(Math.max(toNumber(reservePercent), 0), 30);
  const wallArea = toNumber(wallHeight) * toNumber(wallLength);

  const result = useMemo(() => {
    const rows: ResultRow[] = [];

    function push(name: string, unit: string, coefficient: string, quantity: number) {
      const withReserve = addReserve(quantity, reserve);
      rows.push({
        name,
        unit,
        coefficient,
        quantity,
        rounded: roundUp(withReserve, unit),
      });
    }

    if (constructionType === "ceiling") {
      const area = toNumber(ceilingArea);
      const perimeter = toNumber(ceilingPerimeter);

      push("Лист ГКЛ", "м²", "Площадь потолка × 1", area * 1);
      push("Профиль ПП 60×27", "пог. м", "Площадь потолка × 2,9", area * 2.9);
      push("Профиль ППН 27×28", "пог. м", "Периметр потолка × 1", perimeter);
      push("Удлинитель ПП", "шт.", "Площадь потолка × 0,2", area * 0.2);
      push("Соединитель одноуровневый / краб", "шт.", "Площадь потолка × 1,7", area * 1.7);

      if (suspensionType === "direct") {
        push("Прямой подвес", "шт.", "Площадь потолка × 0,7", area * 0.7);
      } else {
        push("Анкерный подвес", "шт.", "Площадь потолка × 0,7", area * 0.7);
        push("Тяга подвеса", "шт.", "Площадь потолка × 0,7", area * 0.7);
      }
    }

    if (constructionType === "cladding") {
      const area = wallArea;

      push("Лист ГКЛ", "м²", "Площадь стены × 1", area * 1);
      push("Профиль ПП 60×27", "пог. м", "Площадь стены × 2", area * 2);
      push("Профиль ППН 27×28", "пог. м", "Площадь стены × 0,7", area * 0.7);
      push("Прямой подвес", "шт.", "Площадь стены × 0,7", area * 0.7);
    }

    if (constructionType === "partition") {
      const area = wallArea;
      const guideName =
        partitionWidth === "50"
          ? "Профиль ПН 50×40"
          : partitionWidth === "75"
            ? "Профиль ПН 75×40"
            : "Профиль ПН 100×40";
      const studName =
        partitionWidth === "50"
          ? "Профиль ПС 50×50"
          : partitionWidth === "75"
            ? "Профиль ПС 75×50"
            : "Профиль ПС 100×50";

      push("Лист ГКЛ", "м²", "Площадь перегородки × 2,1", area * 2.1);
      push(guideName, "пог. м", "Площадь перегородки × 0,7", area * 0.7);
      push(studName, "пог. м", "Площадь перегородки × 2", area * 2);
    }

    return rows;
  }, [
    constructionType,
    ceilingArea,
    ceilingPerimeter,
    wallArea,
    partitionWidth,
    suspensionType,
    reserve,
  ]);

  const calcTitle =
    constructionType === "ceiling"
      ? "Потолок из ГКЛ"
      : constructionType === "cladding"
        ? "Облицовка стены ГКЛ"
        : `Перегородка ГКЛ, профиль ${partitionWidth} мм`;

  const paramsText =
    constructionType === "ceiling"
      ? `Площадь потолка: ${ceilingArea} м²; периметр: ${ceilingPerimeter} м; подвес: ${
          suspensionType === "direct" ? "прямой" : "анкерный с тягой"
        }; запас: ${reserve}%`
      : `Высота: ${wallHeight} м; длина: ${wallLength} м; площадь: ${formatNumber(
          wallArea
        )} м²; запас: ${reserve}%`;

  function makeExcelBlob() {
    return createExcelBlob({
      title: "Коммерческое предложение / расчёт профиля для ГКЛ",
      subtitle: "ООО «ИДЕЛЕОН»",
      params: `${calcTitle}; ${paramsText}`,
      rows: result,
    });
  }

  function downloadExcelOffer() {
    downloadBlob(makeExcelBlob(), "KP_profil_GKL_ideleon.xls");
  }

  async function sendExcelOffer() {
    setSendStatus("idle");
    setSendMessage("");

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      setSendStatus("error");
      setSendMessage("Заполните имя, телефон и e-mail.");
      return;
    }

    if (!consent) {
      setSendStatus("error");
      setSendMessage("Нужно согласие на обработку персональных данных.");
      return;
    }

    const file = new File([makeExcelBlob()], "KP_profil_GKL_ideleon.xls", {
      type: "application/vnd.ms-excel",
    });

    const formData = new FormData();
    formData.append("requestType", "calculation");
    formData.append("name", clientName);
    formData.append("phone", clientPhone);
    formData.append("email", clientEmail);
    formData.append("task", `Клиент отправил расчёт профиля для ГКЛ из калькулятора.\n\n${calcTitle}\n${paramsText}`);
    formData.append("consent", "yes");
    formData.append("sourcePage", "/calculators/profil-gkl");
    formData.append("website", "");
    formData.append("attachment", file);

    try {
      setSendStatus("sending");
      const response = await fetch("/api/request", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || "Не удалось отправить расчёт. Проверьте, что API /api/request поддерживает Excel-вложения.");
      }

      setSendStatus("success");
      setSendMessage("Расчёт отправлен. Мы свяжемся с вами.");
    } catch (error) {
      setSendStatus("error");
      setSendMessage(error instanceof Error ? error.message : "Не удалось отправить расчёт.");
    }
  }

  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Калькуляторы", href: "/calculators" },
            { label: "Профиль для ГКЛ" },
          ]}
        />
        <p className="label">Калькулятор</p>
        <h1>Калькулятор профиля для ГКЛ</h1>
        <p>
          Предварительный расчёт расхода материалов для потолка, облицовки стены и перегородки
          из гипсокартона. Расчёт универсальный и не привязан к толщине профиля.
        </p>
      </section>

      <section className="calculatorSection">
        <div className="calculatorGrid">
          <div className="calculatorPanel">
            <h2>Параметры расчёта</h2>

            <div className="calculatorField">
              <span>Тип конструкции</span>
              <div className="calculatorTabs">
                <button
                  type="button"
                  className={constructionType === "ceiling" ? "active" : ""}
                  onClick={() => setConstructionType("ceiling")}
                >
                  Потолок
                </button>
                <button
                  type="button"
                  className={constructionType === "cladding" ? "active" : ""}
                  onClick={() => setConstructionType("cladding")}
                >
                  Облицовка
                </button>
                <button
                  type="button"
                  className={constructionType === "partition" ? "active" : ""}
                  onClick={() => setConstructionType("partition")}
                >
                  Перегородка
                </button>
              </div>
            </div>

            {constructionType === "ceiling" ? (
              <>
                <label className="calculatorField">
                  <span>Площадь потолка, м²</span>
                  <input value={ceilingArea} onChange={(event) => setCeilingArea(event.target.value)} />
                </label>

                <label className="calculatorField">
                  <span>Периметр потолка, м</span>
                  <input
                    value={ceilingPerimeter}
                    onChange={(event) => setCeilingPerimeter(event.target.value)}
                  />
                </label>

                <div className="calculatorField">
                  <span>Тип подвеса</span>
                  <div className="calculatorTabs">
                    <button
                      type="button"
                      className={suspensionType === "direct" ? "active" : ""}
                      onClick={() => setSuspensionType("direct")}
                    >
                      Прямой подвес
                    </button>
                    <button
                      type="button"
                      className={suspensionType === "anchor" ? "active" : ""}
                      onClick={() => setSuspensionType("anchor")}
                    >
                      Анкерный + тяга
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <label className="calculatorField">
                  <span>
                    {constructionType === "partition" ? "Высота перегородки, м" : "Высота стены, м"}
                  </span>
                  <input value={wallHeight} onChange={(event) => setWallHeight(event.target.value)} />
                </label>

                <label className="calculatorField">
                  <span>
                    {constructionType === "partition" ? "Длина перегородки, м" : "Длина стены, м"}
                  </span>
                  <input value={wallLength} onChange={(event) => setWallLength(event.target.value)} />
                </label>

                <div className="calculatorAreaNote">
                  Расчётная площадь: <strong>{formatNumber(wallArea)} м²</strong>
                </div>

                {constructionType === "partition" ? (
                  <div className="calculatorField">
                    <span>Ширина профиля</span>
                    <div className="calculatorTabs">
                      <button
                        type="button"
                        className={partitionWidth === "50" ? "active" : ""}
                        onClick={() => setPartitionWidth("50")}
                      >
                        50 мм
                      </button>
                      <button
                        type="button"
                        className={partitionWidth === "75" ? "active" : ""}
                        onClick={() => setPartitionWidth("75")}
                      >
                        75 мм
                      </button>
                      <button
                        type="button"
                        className={partitionWidth === "100" ? "active" : ""}
                        onClick={() => setPartitionWidth("100")}
                      >
                        100 мм
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            <label className="calculatorField">
              <span>Запас, %</span>
              <input value={reservePercent} onChange={(event) => setReservePercent(event.target.value)} />
            </label>

            <p className="calculatorHint">
              Коэффициенты взяты из рабочего расчётного файла и предназначены для предварительной
              оценки расхода. Для точной комплектации лучше проверить расчёт по проекту.
            </p>
          </div>

          <div className="calculatorPanel calculatorResultPanel">
            <h2>Результат</h2>

            <div className="calculatorTableWrap">
              <table className="calculatorTable">
                <thead>
                  <tr>
                    <th>Материал</th>
                    <th>Коэффициент</th>
                    <th>Количество с запасом</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.coefficient}</td>
                      <td>
                        <strong>{formatNumber(row.rounded)}</strong> {row.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="calculatorActions">
              <button type="button" className="btn secondary" onClick={downloadExcelOffer}>
                Скачать КП
              </button>
            </div>

            <div className="calculatorSendBox">
              <h3>Отправить расчёт в Иделеон</h3>
              <p>Мы получим Excel-файл с расчётом и сможем подготовить предложение.</p>

              <div className="calculatorSendGrid">
                <input placeholder="Ваше имя" value={clientName} onChange={(event) => setClientName(event.target.value)} />
                <input placeholder="Телефон" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} />
                <input placeholder="E-mail" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} />
              </div>

              <label className="calculatorConsent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>Согласен на обработку персональных данных</span>
              </label>

              <button type="button" className="btn primary calculatorSendButton" onClick={sendExcelOffer} disabled={sendStatus === "sending"}>
                {sendStatus === "sending" ? "Отправляем..." : "Отправить в Иделеон"}
              </button>

              {sendMessage ? <p className={`calculatorStatus ${sendStatus}`}>{sendMessage}</p> : null}
            </div>

            <p className="calculatorDisclaimer">
              Расчёт ориентировочный. На расход могут влиять раскладка листов, проёмы, высота,
              усиления, шаг профилей, потери на подрезку и требования проекта.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
