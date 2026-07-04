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
  profileLengthMm?: number | null;
};

function toNumber(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeLength(value: string, fallback: number) {
  const parsed = toNumber(value);
  return parsed > 0 ? Math.round(parsed) : fallback;
}

function addReserve(value: number, reservePercent: number) {
  return value * (1 + reservePercent / 100);
}

function roundUp(value: number, unit: string) {
  if (unit === "шт." || unit === "лист") return Math.ceil(value);
  return Math.ceil(value * 10) / 10;
}

function formatNumber(value: number | null) {
  if (value === null) return "-";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
}

function profileLengthLabel(lengthMm?: number | null) {
  return lengthMm ? `L=${lengthMm} мм` : "";
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
      const rowNumber = index + 10;
      const unit = row.unit === "пог. м" ? "м.п." : row.unit;
      const sumFormula = `=F${rowNumber}*H${rowNumber}`;

      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${escapeHtml(row.name)}</td>
          <td class="center">${escapeHtml(profileLengthLabel(row.profileLengthMm) || "-")}</td>
          <td class="center">${escapeHtml(row.unit)}</td>
          <td>${escapeHtml(row.coefficient)}</td>
          <td class="number">${formatNumber(row.rounded)}</td>
          <td class="center">${escapeHtml(unit)}</td>
          <td class="price"></td>
          <td class="sum" x:num x:fmla="${sumFormula}"></td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>КП профиль ГКЛ</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines>False</x:DisplayGridlines>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #0f172a;
          }

          table {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
          }

          td,
          th {
            font-size: 11pt;
            vertical-align: middle;
          }

          .logoRow td {
            height: 78px;
            border: 0;
            padding: 0 0 12px 0;
          }

          .logo {
            width: 230px;
            height: auto;
            display: block;
          }

          .title {
            font-size: 20pt;
            font-weight: 700;
            color: #0f172a;
            border: 0;
            padding: 12px 0 6px 0;
          }

          .muted {
            color: #64748b;
            border: 0;
            padding: 3px 0;
          }

          .params {
            color: #0f172a;
            border: 0;
            padding: 6px 0 12px 0;
          }

          .spacer td {
            height: 10px;
            border: 0;
          }

          .dataTable th {
            background: #0f1b33;
            color: #ffffff;
            font-weight: 700;
            text-align: center;
            border: 1px solid #0f1b33;
            padding: 8px 8px;
          }

          .dataTable td {
            border: 1px solid #475569;
            padding: 7px 8px;
            background: #f8fafc;
          }

          .dataTable .price {
            background: #fff3e6;
            font-weight: 700;
          }

          .dataTable .sum {
            background: #f8fafc;
            font-weight: 700;
          }

          .center {
            text-align: center;
          }

          .number {
            text-align: right;
            mso-number-format: "0.00";
          }

          .note {
            color: #64748b;
            border: 0;
            padding: 4px 0;
          }
        </style>
      </head>
      <body>
        <table>
          <tr class="logoRow">
            <td colspan="9">
              <img class="logo" src="https://ideleon.com/images/logo/ideleon-logo-horizontal.png" />
            </td>
          </tr>

          <tr>
            <td colspan="9" class="title">${escapeHtml(title)}</td>
          </tr>
          <tr>
            <td colspan="9" class="muted">${escapeHtml(subtitle)}</td>
          </tr>
          <tr>
            <td colspan="9" class="params">Дата: ${date}</td>
          </tr>
          <tr>
            <td colspan="9" class="params">${escapeHtml(params)}</td>
          </tr>

          <tr class="spacer"><td colspan="9"></td></tr>

          <tr>
            <td colspan="9">
              <table class="dataTable">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Наименование</th>
                    <th>Длина</th>
                    <th>Ед. изм.</th>
                    <th>Коэффициент</th>
                    <th>Количество</th>
                    <th>Цена за</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  ${bodyRows}
                </tbody>
              </table>
            </td>
          </tr>

          <tr class="spacer"><td colspan="9"></td></tr>
          <tr>
            <td colspan="9" class="note">Заполняйте только столбец «Цена». Столбец «Цена за» подсказывает, в каких единицах вводить стоимость.</td>
          </tr>
          <tr>
            <td colspan="9" class="note">Для профиля количество уже указано в погонных метрах — сумма считается как «Количество × Цена».</td>
          </tr>
          <tr>
            <td colspan="9" class="note">Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.</td>
          </tr>
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
  const [ceilingProfileLengthPreset, setCeilingProfileLengthPreset] = useState("3000");
  const [ceilingProfileLengthCustom, setCeilingProfileLengthCustom] = useState("3000");
  const [studProfileLengthPreset, setStudProfileLengthPreset] = useState("3000");
  const [studProfileLengthCustom, setStudProfileLengthCustom] = useState("3000");
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
  const ceilingProfileLengthMm = ceilingProfileLengthPreset === "other" ? normalizeLength(ceilingProfileLengthCustom, 3000) : Number(ceilingProfileLengthPreset);
  const studProfileLengthMm = studProfileLengthPreset === "other" ? normalizeLength(studProfileLengthCustom, 3000) : Number(studProfileLengthPreset);

  const result = useMemo(() => {
    const rows: ResultRow[] = [];
    function push(name: string, unit: string, coefficient: string, quantity: number, profileLengthMm: number | null = null) {
      const withReserve = addReserve(quantity, reserve);
      rows.push({ name, unit, coefficient, quantity, rounded: roundUp(withReserve, unit), profileLengthMm });
    }

    if (constructionType === "ceiling") {
      const area = toNumber(ceilingArea);
      const perimeter = toNumber(ceilingPerimeter);
      push("Лист ГКЛ", "м²", "Площадь потолка × 1", area);
      push(`Профиль ПП 60×27, ${profileLengthLabel(ceilingProfileLengthMm)}`, "пог. м", "Площадь потолка × 2,9", area * 2.9, ceilingProfileLengthMm);
      push("Профиль ППН 27×28", "пог. м", "Периметр потолка × 1", perimeter);
      push("Удлинитель ПП", "шт.", "Площадь потолка × 0,2", area * 0.2);
      push("Соединитель одноуровневый / краб", "шт.", "Площадь потолка × 1,7", area * 1.7);
      if (suspensionType === "direct") push("Прямой подвес", "шт.", "Площадь потолка × 0,7", area * 0.7);
      else {
        push("Анкерный подвес", "шт.", "Площадь потолка × 0,7", area * 0.7);
        push("Тяга подвеса", "шт.", "Площадь потолка × 0,7", area * 0.7);
      }
    }

    if (constructionType === "cladding") {
      const area = wallArea;
      push("Лист ГКЛ", "м²", "Площадь стены × 1", area);
      push(`Профиль ПП 60×27, ${profileLengthLabel(ceilingProfileLengthMm)}`, "пог. м", "Площадь стены × 2", area * 2, ceilingProfileLengthMm);
      push("Профиль ППН 27×28", "пог. м", "Площадь стены × 0,7", area * 0.7);
      push("Прямой подвес", "шт.", "Площадь стены × 0,7", area * 0.7);
    }

    if (constructionType === "partition") {
      const area = wallArea;
      const guideName = partitionWidth === "50" ? "Профиль ПН 50×40" : partitionWidth === "75" ? "Профиль ПН 75×40" : "Профиль ПН 100×40";
      const studName = partitionWidth === "50" ? "Профиль ПС 50×50" : partitionWidth === "75" ? "Профиль ПС 75×50" : "Профиль ПС 100×50";
      push("Лист ГКЛ", "м²", "Площадь перегородки × 2,1", area * 2.1);
      push(guideName, "пог. м", "Площадь перегородки × 0,7", area * 0.7);
      push(`${studName}, ${profileLengthLabel(studProfileLengthMm)}`, "пог. м", "Площадь перегородки × 2", area * 2, studProfileLengthMm);
    }
    return rows;
  }, [constructionType, ceilingArea, ceilingPerimeter, wallArea, partitionWidth, ceilingProfileLengthMm, studProfileLengthMm, suspensionType, reserve]);

  const calcTitle = constructionType === "ceiling" ? "Потолок из ГКЛ" : constructionType === "cladding" ? "Облицовка стены ГКЛ" : `Перегородка ГКЛ, профиль ${partitionWidth} мм`;
  const paramsText = constructionType === "ceiling"
    ? `Площадь потолка: ${ceilingArea} м²; периметр: ${ceilingPerimeter} м; подвес: ${suspensionType === "direct" ? "прямой" : "анкерный с тягой"}; длина ПП 60×27: ${ceilingProfileLengthMm} мм; запас: ${reserve}%`
    : `Высота: ${wallHeight} м; длина: ${wallLength} м; площадь: ${formatNumber(wallArea)} м²; ${constructionType === "partition" ? `длина ПС: ${studProfileLengthMm} мм; ` : `длина ПП 60×27: ${ceilingProfileLengthMm} мм; `}запас: ${reserve}%`;

  function makeExcelBlob() {
    return createExcelBlob({ title: "Коммерческое предложение / расчёт профиля для ГКЛ", subtitle: "ООО «ИДЕЛЕОН»", params: `${calcTitle}; ${paramsText}`, rows: result });
  }

  function downloadExcelOffer() { downloadBlob(makeExcelBlob(), "KP_profil_GKL_ideleon.xls"); }

  async function sendExcelOffer() {
    setSendStatus("idle"); setSendMessage("");
    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) { setSendStatus("error"); setSendMessage("Заполните имя, телефон и e-mail."); return; }
    if (!consent) { setSendStatus("error"); setSendMessage("Нужно согласие на обработку персональных данных."); return; }
    const file = new File([makeExcelBlob()], "KP_profil_GKL_ideleon.xls", { type: "application/vnd.ms-excel" });
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
      const response = await fetch("/api/request", { method: "POST", body: formData });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Не удалось отправить расчёт.");
      setSendStatus("success"); setSendMessage("Расчёт отправлен. Мы свяжемся с вами.");
    } catch (error) {
      setSendStatus("error"); setSendMessage(error instanceof Error ? error.message : "Не удалось отправить расчёт.");
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="pageHero">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Калькуляторы", href: "/calculators" }, { label: "Профиль для ГКЛ" }]} />
        <p className="label">Калькулятор</p>
        <h1>Калькулятор профиля для ГКЛ</h1>
        <p>Предварительный расчёт расхода материалов для потолка, облицовки стены и перегородки из гипсокартона. Расчёт универсальный и не привязан к толщине профиля.</p>
      </section>

      <section className="calculatorSection">
        <div className="calculatorGrid">
          <div className="calculatorPanel">
            <h2>Параметры расчёта</h2>
            <div className="calculatorField"><span>Тип конструкции</span><div className="calculatorTabs">
              <button type="button" className={constructionType === "ceiling" ? "active" : ""} onClick={() => setConstructionType("ceiling")}>Потолок</button>
              <button type="button" className={constructionType === "cladding" ? "active" : ""} onClick={() => setConstructionType("cladding")}>Облицовка</button>
              <button type="button" className={constructionType === "partition" ? "active" : ""} onClick={() => setConstructionType("partition")}>Перегородка</button>
            </div></div>

            {constructionType === "ceiling" ? (
              <>
                <label className="calculatorField"><span>Площадь потолка, м²</span><input value={ceilingArea} onChange={(e) => setCeilingArea(e.target.value)} /></label>
                <label className="calculatorField"><span>Периметр потолка, м</span><input value={ceilingPerimeter} onChange={(e) => setCeilingPerimeter(e.target.value)} /></label>
                <div className="calculatorField"><span>Тип подвеса</span><div className="calculatorTabs">
                  <button type="button" className={suspensionType === "direct" ? "active" : ""} onClick={() => setSuspensionType("direct")}>Прямой подвес</button>
                  <button type="button" className={suspensionType === "anchor" ? "active" : ""} onClick={() => setSuspensionType("anchor")}>Анкерный + тяга</button>
                </div></div>
                <div className="calculatorField"><span>Длина профиля ПП 60×27</span><div className="calculatorTabs">
                  <button type="button" className={ceilingProfileLengthPreset === "3000" ? "active" : ""} onClick={() => setCeilingProfileLengthPreset("3000")}>3000 мм</button>
                  <button type="button" className={ceilingProfileLengthPreset === "4000" ? "active" : ""} onClick={() => setCeilingProfileLengthPreset("4000")}>4000 мм</button>
                  <button type="button" className={ceilingProfileLengthPreset === "other" ? "active" : ""} onClick={() => setCeilingProfileLengthPreset("other")}>Другое</button>
                </div>{ceilingProfileLengthPreset === "other" ? <input value={ceilingProfileLengthCustom} onChange={(e) => setCeilingProfileLengthCustom(e.target.value)} placeholder="Введите длину, мм" /> : null}</div>
              </>
            ) : (
              <>
                <label className="calculatorField"><span>{constructionType === "partition" ? "Высота перегородки, м" : "Высота стены, м"}</span><input value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} /></label>
                <label className="calculatorField"><span>{constructionType === "partition" ? "Длина перегородки, м" : "Длина стены, м"}</span><input value={wallLength} onChange={(e) => setWallLength(e.target.value)} /></label>
                <div className="calculatorAreaNote">Расчётная площадь: <strong>{formatNumber(wallArea)} м²</strong></div>
                {constructionType === "cladding" ? <div className="calculatorField"><span>Длина профиля ПП 60×27</span><div className="calculatorTabs">
                  <button type="button" className={ceilingProfileLengthPreset === "3000" ? "active" : ""} onClick={() => setCeilingProfileLengthPreset("3000")}>3000 мм</button>
                  <button type="button" className={ceilingProfileLengthPreset === "4000" ? "active" : ""} onClick={() => setCeilingProfileLengthPreset("4000")}>4000 мм</button>
                  <button type="button" className={ceilingProfileLengthPreset === "other" ? "active" : ""} onClick={() => setCeilingProfileLengthPreset("other")}>Другое</button>
                </div>{ceilingProfileLengthPreset === "other" ? <input value={ceilingProfileLengthCustom} onChange={(e) => setCeilingProfileLengthCustom(e.target.value)} placeholder="Введите длину, мм" /> : null}</div> : null}
                {constructionType === "partition" ? <>
                  <div className="calculatorField"><span>Ширина профиля</span><div className="calculatorTabs">
                    <button type="button" className={partitionWidth === "50" ? "active" : ""} onClick={() => setPartitionWidth("50")}>50 мм</button>
                    <button type="button" className={partitionWidth === "75" ? "active" : ""} onClick={() => setPartitionWidth("75")}>75 мм</button>
                    <button type="button" className={partitionWidth === "100" ? "active" : ""} onClick={() => setPartitionWidth("100")}>100 мм</button>
                  </div></div>
                  <div className="calculatorField"><span>Длина стоечного профиля ПС {partitionWidth}×50</span><div className="calculatorTabs">
                    <button type="button" className={studProfileLengthPreset === "3000" ? "active" : ""} onClick={() => setStudProfileLengthPreset("3000")}>3000 мм</button>
                    <button type="button" className={studProfileLengthPreset === "4000" ? "active" : ""} onClick={() => setStudProfileLengthPreset("4000")}>4000 мм</button>
                    <button type="button" className={studProfileLengthPreset === "other" ? "active" : ""} onClick={() => setStudProfileLengthPreset("other")}>Другое</button>
                  </div>{studProfileLengthPreset === "other" ? <input value={studProfileLengthCustom} onChange={(e) => setStudProfileLengthCustom(e.target.value)} placeholder="Введите длину, мм" /> : null}</div>
                </> : null}
              </>
            )}
            <label className="calculatorField"><span>Запас, %</span><input value={reservePercent} onChange={(e) => setReservePercent(e.target.value)} /></label>
            <p className="calculatorHint">Версия расчёта: стабильное КП в формате Excel без рискованной сборки .xlsx. Цена вводится в одном столбце.</p>
          </div>

          <div className="calculatorPanel calculatorResultPanel">
            <h2>Результат</h2>
            <div className="calculatorTableWrap"><table className="calculatorTable"><thead><tr><th>Материал</th><th>Длина</th><th>Коэффициент</th><th>Количество с запасом</th></tr></thead><tbody>
              {result.map((row) => <tr key={row.name}><td>{row.name}</td><td>{profileLengthLabel(row.profileLengthMm) || "-"}</td><td>{row.coefficient}</td><td><strong>{formatNumber(row.rounded)}</strong> {row.unit}</td></tr>)}
            </tbody></table></div>
            <div className="calculatorActions"><button type="button" className="btn secondary" onClick={downloadExcelOffer}>Скачать КП</button></div>
            <div className="calculatorSendBox"><h3>Отправить расчёт в Иделеон</h3><p>Мы получим Excel-файл с расчётом и сможем подготовить предложение.</p>
              <div className="calculatorSendGrid"><input placeholder="Ваше имя" value={clientName} onChange={(e) => setClientName(e.target.value)} /><input placeholder="Телефон" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /><input placeholder="E-mail" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div>
              <label className="calculatorConsent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Согласен на обработку персональных данных</span></label>
              <button type="button" className="btn primary calculatorSendButton" onClick={sendExcelOffer} disabled={sendStatus === "sending"}>{sendStatus === "sending" ? "Отправляем..." : "Отправить в Иделеон"}</button>
              {sendMessage ? <p className={`calculatorStatus ${sendStatus}`}>{sendMessage}</p> : null}
            </div>
            <p className="calculatorDisclaimer">Расчёт ориентировочный. На расход могут влиять раскладка листов, проёмы, высота, усиления, шаг профилей, потери на подрезку и требования проекта.</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
