"use client";

import { useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";

type GrilyatoType =
  | "standard"
  | "nonstandard"
  | "pyramidal"
  | "multilevel";

type ResultRow = {
  element: string;
  size: string;
  catalogName: string;
  unit: string;
  consumption: string;
  quantityWithoutReserve: number | null;
  quantityWithReserve: number | null;
};

const typeLabels: Record<GrilyatoType, string> = {
  standard: "Стандартная ячейка",
  nonstandard: "Нестандартная ячейка",
  pyramidal: "Пирамидальное",
  multilevel: "Разноуровневое",
};

const cellOptions: Record<GrilyatoType, string[]> = {
  standard: ["30х30", "50х50", "60х60", "75х75", "86х86", "100х100", "120х120", "150х150", "200х200"],
  nonstandard: [
    "Модель 1 (100х50)",
    "Модель 2 (150х50)",
    "Модель 3 (150х75)",
    "Модель 4 (180х60)",
    "Модель 5 (200х100)",
    "Модель 6 (50х200)",
    "Модель 7 (30х200)",
    "Модель 8 (50х50х100)",
    "Модель 9 (30-35-40-90)",
    "Модель 10-1 (1200)",
    "Модель 10-2 (1200)",
  ],
  pyramidal: ["75х75", "86х86", "100х100", "120х120", "150х150", "200х200"],
  multilevel: ["50х50", "60х60", "75х75", "86х86", "100х100", "120х120", "150х150", "200х200"],
};

function toNumber(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function ceilTo(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

function withReserve(quantity: number, reservePercent: number, step = 1) {
  return ceilTo(quantity + quantity * reservePercent / 100, step);
}

function formatNumber(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);
}

function isSmallCell(cell: string) {
  return ["30х30", "50х50", "60х60", "75х75"].includes(cell);
}

function isModel10(cell: string) {
  return cell === "Модель 10-1 (1200)" || cell === "Модель 10-2 (1200)";
}

function mamaCoeff(cell: string) {
  if (cell === "30х30") return 19;
  if (cell === "50х50") return 11;
  if (cell === "60х60") return 9;
  if (cell === "75х75" || cell === "Модель 1 (100х50)") return 7;
  if (cell === "86х86") return 6;
  if (["100х100", "Модель 2 (150х50)", "Модель 3 (150х75)", "Модель 4 (180х60)"].includes(cell)) return 5;
  if (cell === "120х120") return 4;
  if (cell === "150х150" || cell === "Модель 5 (200х100)") return 3;
  if (cell === "200х200") return 2;
  if (["Модель 6 (50х200)", "Модель 10-1 (1200)", "Модель 10-2 (1200)"].includes(cell)) return 12;
  if (cell === "Модель 7 (30х200)") return 20;
  if (cell === "Модель 8 (50х50х100)") return 10;
  if (cell === "Модель 9 (30-35-40-90)") return 13;
  return 0;
}

function papaCoeff(cell: string) {
  if (cell === "30х30") return 19;
  if (cell === "50х50") return 11;
  if (cell === "60х60") return 9;
  if (cell === "75х75" || cell === "Модель 1 (100х50)") return 7;
  if (cell === "86х86") return 6;
  if (["100х100", "Модель 2 (150х50)", "Модель 3 (150х75)", "Модель 4 (180х60)"].includes(cell)) return 5;
  if (cell === "120х120") return 4;
  if (["150х150", "Модель 5 (200х100)", "Модель 6 (50х200)", "Модель 7 (30х200)"].includes(cell)) return 3;
  if (cell === "200х200") return 2;
  if (cell === "Модель 8 (50х50х100)") return 10;
  if (cell === "Модель 9 (30-35-40-90)") return 13;
  if (isModel10(cell)) return 12;
  return 0;
}

function row(
  element: string,
  size: string,
  catalogName: string,
  unit: string,
  consumptionValue: number | "периметр" | null,
  quantityWithoutReserve: number | null,
  reservePercent: number,
  step = 1
): ResultRow {
  return {
    element,
    size,
    catalogName,
    unit,
    consumption:
      consumptionValue === null
        ? "-"
        : consumptionValue === "периметр"
          ? "периметр"
          : String(consumptionValue).replace(".", ","),
    quantityWithoutReserve,
    quantityWithReserve:
      quantityWithoutReserve === null ? null : withReserve(quantityWithoutReserve, reservePercent, step),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default function GrilyatoCalculatorPage() {
  const [area, setArea] = useState("100");
  const [perimeter, setPerimeter] = useState("40");
  const [grilyatoType, setGrilyatoType] = useState<GrilyatoType>("standard");
  const [cellSize, setCellSize] = useState("100х100");
  const [reservePercent, setReservePercent] = useState("5");

  const reserve = Math.min(Math.max(toNumber(reservePercent), 0), 30);
  const areaNumber = toNumber(area);
  const perimeterNumber = toNumber(perimeter);

  const availableCells = cellOptions[grilyatoType];

  function changeType(nextType: GrilyatoType) {
    setGrilyatoType(nextType);
    setCellSize(cellOptions[nextType][0]);
  }

  const result = useMemo(() => {
    const rows: ResultRow[] = [];

    const latticeCoeff = isModel10(cellSize) ? 0.7 : 2.78;
    const latticeQty = ceilTo(areaNumber * latticeCoeff, 1);

    rows.push(row("Решётка", isModel10(cellSize) ? "1.2×1.2" : "0.6×0.6", "РГ", "шт.", latticeCoeff, latticeQty, reserve));

    const mama = mamaCoeff(cellSize);
    const papa = papaCoeff(cellSize);
    const mamaQty = ceilTo(latticeQty * mama, 1);
    const papaQty = ceilTo(latticeQty * papa, 1);

    rows.push(row("Профиль «мама»", "0.6", grilyatoType === "multilevel" ? "мама (10×30)" : "мама", "шт.", mama, mamaQty, reserve));
    rows.push(row("Профиль «папа»", "0.6", grilyatoType === "multilevel" ? "папа (10×30)" : "папа", "шт.", papa, papaQty, reserve));

    const n1Coeff = isSmallCell(cellSize) ? 0.7 : 0.35;
    rows.push(row("Несущая направляющая №1", "2.4", grilyatoType === "multilevel" ? "№1 (10×50)" : "№1", "шт.", n1Coeff, ceilTo(areaNumber * n1Coeff, 1), reserve));

    if (!isSmallCell(cellSize)) {
      const n2Coeff = isModel10(cellSize) ? 0.7 : 1.39;
      rows.push(row("Несущая направляющая №2", "1.2", grilyatoType === "multilevel" ? "№2 (10×50)" : "№2", "шт.", n2Coeff, ceilTo(areaNumber * n2Coeff, 1), reserve));
    }

    if (!isModel10(cellSize)) {
      const n3Coeff = isSmallCell(cellSize) ? 2.78 : 1.39;
      rows.push(row("Несущая направляющая №3", "0.6", grilyatoType === "multilevel" ? "№3 (10×50)" : "№3", "шт.", n3Coeff, ceilTo(areaNumber * n3Coeff, 1), reserve));
    }

    const pgCoeff = isSmallCell(cellSize) ? 0.7 : 0.35;
    rows.push(row("Соединительный элемент", "-", "PG", "шт.", pgCoeff, ceilTo(areaNumber * pgCoeff, 1), reserve));

    const hangerCoeff = isSmallCell(cellSize) ? 1.85 : 0.93;
    rows.push(row("Подвес", "по проекту", "АП-Г", "комп.", hangerCoeff, ceilTo(areaNumber * hangerCoeff, 10), reserve, 10));

    rows.push(row("Уголок", "3", "PL", "м.п.", "периметр", ceilTo(perimeterNumber, 3), reserve, 3));

    return rows;
  }, [areaNumber, perimeterNumber, grilyatoType, cellSize, reserve]);

  const summaryText = useMemo(() => {
    const lines = result.map((item) => `${item.element} ${item.catalogName}: ${formatNumber(item.quantityWithReserve)} ${item.unit}`);

    return [
      "Расчёт потолка Грильято",
      `Площадь: ${area} м²`,
      `Периметр: ${perimeter} м`,
      `Тип: ${typeLabels[grilyatoType]}`,
      `Ячейка: ${cellSize}`,
      `Запас: ${reserve}%`,
      "",
      ...lines,
    ].join("\\n");
  }, [area, perimeter, grilyatoType, cellSize, reserve, result]);

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(summaryText);
    } catch {
      // Если браузер не дал доступ к буферу обмена — просто ничего не ломаем.
    }
  }

  function downloadExcelOffer() {
    const date = new Date().toLocaleDateString("ru-RU");

    const bodyRows = result
      .map((item, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.element)}</td>
            <td>${escapeHtml(item.size)}</td>
            <td>${escapeHtml(item.catalogName)}</td>
            <td>${escapeHtml(item.unit)}</td>
            <td>${formatNumber(item.quantityWithReserve)}</td>
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
            td, th { border: 1px solid #999; padding: 8px; font-size: 12pt; }
            .title { font-size: 18pt; font-weight: bold; color: #111827; }
            .muted { color: #64748b; }
            .header { background: #111827; color: #ffffff; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="8" class="title">Коммерческое предложение / расчёт потолка Грильято</td></tr>
            <tr><td colspan="8" class="muted">ООО «ИДЕЛЕОН»</td></tr>
            <tr><td colspan="8">Дата: ${date}</td></tr>
            <tr><td colspan="8">Площадь: ${escapeHtml(area)} м²; периметр: ${escapeHtml(perimeter)} м; тип: ${escapeHtml(typeLabels[grilyatoType])}; ячейка: ${escapeHtml(cellSize)}; запас: ${reserve}%</td></tr>
            <tr><td colspan="8"></td></tr>
            <tr class="header">
              <th>№</th>
              <th>Наименование элемента</th>
              <th>Размер</th>
              <th>Название по каталогу</th>
              <th>Ед. изм.</th>
              <th>Количество</th>
              <th>Цена</th>
              <th>Сумма</th>
            </tr>
            ${bodyRows}
            <tr><td colspan="8"></td></tr>
            <tr><td colspan="8" class="muted">Цена и сумма оставлены пустыми для заполнения менеджером.</td></tr>
            <tr><td colspan="8" class="muted">Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.</td></tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\\ufeff", html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "KP_grilyato_ideleon.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main>
      <SiteHeader />

      <section className="pageHero">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Калькуляторы", href: "/calculators" },
            { label: "Потолок Грильято" },
          ]}
        />
        <p className="label">Калькулятор</p>
        <h1>Калькулятор потолка Грильято</h1>
        <p>
          Предварительный расчёт расхода элементов потолка Грильято по площади, периметру, типу
          системы и размеру ячейки. По результату можно скачать Excel-файл в формате КП.
        </p>
      </section>

      <section className="calculatorSection">
        <div className="calculatorGrid">
          <div className="calculatorPanel">
            <h2>Параметры расчёта</h2>

            <label className="calculatorField">
              <span>Площадь помещения, м²</span>
              <input value={area} onChange={(event) => setArea(event.target.value)} />
            </label>

            <label className="calculatorField">
              <span>Периметр помещения, м</span>
              <input value={perimeter} onChange={(event) => setPerimeter(event.target.value)} />
            </label>

            <div className="calculatorField">
              <span>Тип Грильято</span>
              <div className="calculatorTabs">
                <button type="button" className={grilyatoType === "standard" ? "active" : ""} onClick={() => changeType("standard")}>
                  Стандарт
                </button>
                <button type="button" className={grilyatoType === "nonstandard" ? "active" : ""} onClick={() => changeType("nonstandard")}>
                  Нестандарт
                </button>
                <button type="button" className={grilyatoType === "pyramidal" ? "active" : ""} onClick={() => changeType("pyramidal")}>
                  Пирамидальное
                </button>
                <button type="button" className={grilyatoType === "multilevel" ? "active" : ""} onClick={() => changeType("multilevel")}>
                  Разноуровневое
                </button>
              </div>
            </div>

            <label className="calculatorField">
              <span>Размер ячейки</span>
              <select className="calculatorSelect" value={cellSize} onChange={(event) => setCellSize(event.target.value)}>
                {availableCells.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="calculatorField">
              <span>Запас, %</span>
              <input value={reservePercent} onChange={(event) => setReservePercent(event.target.value)} />
            </label>

            <p className="calculatorHint">
              Формулы перенесены из расчётного файла. Калькулятор нужен для предварительной оценки
              расхода, а финальную комплектацию лучше проверять по проекту.
            </p>
          </div>

          <div className="calculatorPanel calculatorResultPanel">
            <h2>Результат</h2>

            <div className="calculatorTableWrap">
              <table className="calculatorTable">
                <thead>
                  <tr>
                    <th>Материал</th>
                    <th>Каталог</th>
                    <th>Расход</th>
                    <th>Количество</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((item) => (
                    <tr key={`${item.element}-${item.catalogName}`}>
                      <td>{item.element}</td>
                      <td>{item.catalogName}</td>
                      <td>{item.consumption}</td>
                      <td>
                        <strong>{formatNumber(item.quantityWithReserve)}</strong> {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="calculatorActions">
              <button type="button" className="btn primary" onClick={downloadExcelOffer}>
                Скачать КП в Excel
              </button>
              <button type="button" className="btn secondary" onClick={copyResult}>
                Скопировать расчёт
              </button>
              <a className="btn secondary" href="/#contacts">
                Отправить в Иделеон
              </a>
            </div>

            <p className="calculatorDisclaimer">
              В Excel-файле будут заполнены наименования и количества. Столбцы «Цена» и «Сумма»
              останутся пустыми для заполнения менеджером.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
