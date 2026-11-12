import ExcelJS from "exceljs";
import type { CalculatorConfig, CalculatorResultRow, OfferColumn } from "../data/calculators";

export type CalculatorProjectItem = {
  id: string;
  title: string;
  paramsText: string;
  values: Record<string, string>;
  rows: CalculatorResultRow[];
  createdAt: string;
};

const LOGO_URL = "/wp-content/themes/ideleon-static/static/images/logo/ideleon-logo-horizontal.webp";

function columnWidth(column: OfferColumn) {
  return column.width ?? 16;
}

function getValue(row: CalculatorResultRow, key: string, rowNumber: number) {
  if (key === "name") return row.name;
  if (key === "size") return row.size ?? "";
  if (key === "catalogName") return row.catalogName ?? "";
  if (key === "lengthM") return row.lengthM ?? "";
  if (key === "unit") return row.unit;
  if (key === "coefficient") return row.coefficient;
  if (key === "quantity") return row.quantity;
  if (key === "priceUnit") return row.priceUnit ?? row.unit;
  if (key === "index") return rowNumber;
  return "";
}

function columnSearchIndex(columns: OfferColumn[], key: string) {
  const index = columns.findIndex((column) => column.key === key);
  return index >= 0 ? index + 1 : 1;
}

function excelColumn(index: number) {
  let result = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function asNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

async function loadLogoBase64() {
  const response = await fetch(LOGO_URL, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Не удалось загрузить логотип: ${LOGO_URL}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const part = bytes.subarray(i, i + chunk);
    for (let j = 0; j < part.length; j += 1) binary += String.fromCharCode(part[j]);
  }
  return `data:image/webp;base64,${btoa(binary)}`;
}

function setupWorksheet(workbook: ExcelJS.Workbook, calculator: CalculatorConfig) {
  const worksheet = workbook.addWorksheet("КП");
  worksheet.views = [{ showGridLines: false }];
  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
  };
  worksheet.pageMargins = {
    left: 0.35,
    right: 0.35,
    top: 0.45,
    bottom: 0.45,
    header: 0.2,
    footer: 0.2,
  };
  worksheet.columns = calculator.offerColumns.map((column) => ({
    key: column.key,
    width: columnWidth(column),
  }));
  return worksheet;
}

function styleTitle(cell: ExcelJS.Cell) {
  cell.font = { name: "Arial", size: 20, bold: true, color: { argb: "FF0F1B33" } };
  cell.alignment = { vertical: "middle", wrapText: true };
}

function styleMeta(cell: ExcelJS.Cell) {
  cell.font = { name: "Arial", size: 11, color: { argb: "FF49627F" } };
  cell.alignment = { vertical: "middle", wrapText: true };
}

function styleHeader(cell: ExcelJS.Cell) {
  cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F1B33" } };
  cell.border = { left: { style: "thin", color: { argb: "FFCBD5E1" } }, right: { style: "thin", color: { argb: "FFCBD5E1" } }, top: { style: "thin", color: { argb: "FFCBD5E1" } }, bottom: { style: "thin", color: { argb: "FFCBD5E1" } } };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
}

function styleBody(cell: ExcelJS.Cell, wrap = false) {
  cell.font = { name: "Arial", size: 11 };
  cell.border = { left: { style: "thin", color: { argb: "FFCBD5E1" } }, right: { style: "thin", color: { argb: "FFCBD5E1" } }, top: { style: "thin", color: { argb: "FFCBD5E1" } }, bottom: { style: "thin", color: { argb: "FFCBD5E1" } } };
  cell.alignment = { vertical: "center", wrapText: wrap };
}

function styleNote(cell: ExcelJS.Cell) {
  cell.font = { name: "Arial", size: 11, color: { argb: "FF49627F" } };
  cell.alignment = { vertical: "middle", wrapText: true };
}

async function addLogo(worksheet: ExcelJS.Worksheet, workbook: ExcelJS.Workbook) {
  const base64 = await loadLogoBase64();
  const imageId = workbook.addImage({ base64, extension: "webp" });
  worksheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 300, height: 82 },
  });
}

function addMergedText(
  worksheet: ExcelJS.Worksheet,
  row: number,
  lastColumn: number,
  value: string,
  style: "title" | "meta" | "note",
  height: number,
) {
  worksheet.mergeCells(row, 1, row, lastColumn);
  const cell = worksheet.getCell(row, 1);
  cell.value = value;
  cell.alignment = { vertical: "middle", wrapText: true };
  if (style === "title") styleTitle(cell);
  else if (style === "meta") styleMeta(cell);
  else styleNote(cell);
  worksheet.getRow(row).height = height;
}

function addTableHeader(worksheet: ExcelJS.Worksheet, calculator: CalculatorConfig, rowNumber: number) {
  calculator.offerColumns.forEach((column, index) => {
    const cell = worksheet.getCell(rowNumber, index + 1);
    cell.value = column.title;
    styleHeader(cell);
  });
  worksheet.getRow(rowNumber).height = 30;
}

function addOfferRows(
  worksheet: ExcelJS.Worksheet,
  calculator: CalculatorConfig,
  rows: CalculatorResultRow[],
  startRow: number,
) {
  const priceColumnIndex = columnSearchIndex(calculator.offerColumns, "price");
  const quantityColumnIndex = columnSearchIndex(calculator.offerColumns, "quantity");
  const lengthColumnIndex = columnSearchIndex(calculator.offerColumns, "lengthM");
  const sumColumnIndex = columnSearchIndex(calculator.offerColumns, "sum");

  rows.forEach((row, rowOffset) => {
    const rowNumber = startRow + rowOffset;
    calculator.offerColumns.forEach((column, colOffset) => {
      const cell = worksheet.getCell(rowNumber, colOffset + 1);
      const key = column.key;
      if (key === "index") {
        cell.value = rowOffset + 1;
        cell.numFmt = "0";
      } else if (key === "quantity") {
        cell.value = asNumber(row.quantity);
        cell.numFmt = "0.00";
      } else if (key === "lengthM") {
        cell.value = row.lengthM ? asNumber(row.lengthM) : "-";
        if (typeof cell.value === "number") cell.numFmt = "0.00";
      } else if (key === "price") {
        cell.value = null;
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF1E6" } };
        cell.numFmt = "#,##0.00";
      } else if (key === "sum") {
        const priceRef = `${excelColumn(priceColumnIndex)}${rowNumber}`;
        const quantityRef = `${excelColumn(quantityColumnIndex)}${rowNumber}`;
        const lengthRef = `${excelColumn(lengthColumnIndex)}${rowNumber}`;
        cell.value = {
          formula: row.priceMode === "meter" && row.lengthM
            ? `IF(${priceRef}="","",${quantityRef}*${lengthRef}*${priceRef})`
            : `IF(${priceRef}="","",${quantityRef}*${priceRef})`,
          result: 0,
        };
        cell.numFmt = "#,##0.00";
      } else {
        const value = getValue(row, key, rowOffset + 1);
        cell.value = typeof value === "number" ? value : String(value ?? "");
      }
      styleBody(cell, key === "name" || key === "catalogName");
    });
    worksheet.getRow(rowNumber).height = 26;
  });
}

async function buildWorkbook(
  calculator: CalculatorConfig,
  buildContent: (worksheet: ExcelJS.Worksheet) => void,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ИДЕЛЕОН";
  workbook.company = "ООО «ИДЕЛЕОН»";
  workbook.subject = calculator.offerTitle;
  workbook.title = calculator.offerTitle;
  workbook.created = new Date();
  workbook.modified = new Date();
  const worksheet = setupWorksheet(workbook, calculator);
  buildContent(worksheet);
  await addLogo(worksheet, workbook);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function buildCalculatorOfferExcel({
  calculator,
  values,
  rows,
}: {
  calculator: CalculatorConfig;
  values: Record<string, string>;
  rows: CalculatorResultRow[];
}) {
  const date = new Date().toLocaleDateString("ru-RU");
  const offerRows = rows.filter((row) => row.includeInOffer !== false);
  const lastColumn = calculator.offerColumns.length;

  return buildWorkbook(calculator, (worksheet) => {
    [1, 2, 3].forEach((row) => { worksheet.getRow(row).height = 38; });
    addMergedText(worksheet, 4, lastColumn, calculator.offerTitle, "title", 34);
    addMergedText(worksheet, 5, lastColumn, "ООО «ИДЕЛЕОН»", "meta", 22);
    addMergedText(worksheet, 6, lastColumn, `Дата: ${date}`, "meta", 22);
    addMergedText(worksheet, 7, lastColumn, calculator.getParamsText(values), "meta", 28);
    worksheet.getRow(8).height = 10;

    addTableHeader(worksheet, calculator, 9);
    addOfferRows(worksheet, calculator, offerRows, 10);

    const footerStart = 11 + offerRows.length;
    worksheet.getRow(footerStart).height = 8;
    addMergedText(worksheet, footerStart + 1, lastColumn, "Заполняйте только столбец «Цена». Столбец «Цена за» подсказывает, в каких единицах вводить стоимость.", "note", 22);
    addMergedText(worksheet, footerStart + 2, lastColumn, "Для профильных элементов цена может вводиться за м.п. — Excel сам рассчитает сумму по длине и количеству.", "note", 22);
    addMergedText(worksheet, footerStart + 3, lastColumn, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "note", 22);
    addMergedText(worksheet, footerStart + 4, lastColumn, "ООО «ИДЕЛЕОН» · ideleon.com · zakaz@ideleon.com · +7-926-696-13-86", "note", 22);
  });
}

function aggregateProjectRows(items: CalculatorProjectItem[]) {
  const map = new Map<string, CalculatorResultRow & { sourceCount: number }>();
  items.forEach((item) => {
    item.rows.filter((row) => row.includeInOffer !== false).forEach((row) => {
      const key = [
        row.name, row.size ?? "", row.catalogName ?? "", row.lengthM ?? "",
        row.unit, row.priceUnit ?? row.unit, row.priceMode ?? "quantity",
      ].join("|");
      const existing = map.get(key);
      if (existing) {
        existing.quantity = Number((existing.quantity + row.quantity).toFixed(4));
        existing.sourceCount += 1;
      } else {
        map.set(key, { ...row, sourceCount: 1 });
      }
    });
  });
  return Array.from(map.values()).map((row) => ({
    ...row,
    coefficient: row.sourceCount > 1 ? `Сводно по ${row.sourceCount} расчётам` : "Из одного расчёта",
  }));
}

export async function buildCalculatorProjectOfferExcel({
  calculator,
  projectName,
  items,
}: {
  calculator: CalculatorConfig;
  projectName: string;
  items: CalculatorProjectItem[];
}) {
  const date = new Date().toLocaleDateString("ru-RU");
  const lastColumn = calculator.offerColumns.length;

  return buildWorkbook(calculator, (worksheet) => {
    let currentRow = 1;
    [1, 2, 3].forEach((row) => { worksheet.getRow(row).height = 38; });
    currentRow = 4;
    addMergedText(worksheet, currentRow++, lastColumn, "Единое коммерческое предложение / профиль для ГКЛ", "title", 34);
    addMergedText(worksheet, currentRow++, lastColumn, "ООО «ИДЕЛЕОН»", "meta", 22);
    addMergedText(worksheet, currentRow++, lastColumn, `Дата: ${date}`, "meta", 22);
    addMergedText(worksheet, currentRow++, lastColumn, `Объект / проект: ${projectName || "Проект ГКЛ"}`, "meta", 24);
    addMergedText(worksheet, currentRow++, lastColumn, `Количество сохранённых расчётов: ${items.length}`, "meta", 22);
    worksheet.getRow(currentRow++).height = 10;

    addMergedText(worksheet, currentRow++, lastColumn, "СОСТАВ ПРОЕКТА", "meta", 28);
    worksheet.getCell(currentRow, 1).value = "№";
    worksheet.getCell(currentRow, 2).value = "Конструкция";
    worksheet.getCell(currentRow, 3).value = "Параметры расчёта";
    [1, 2, 3].forEach((column) => styleHeader(worksheet.getCell(currentRow, column)));
    worksheet.mergeCells(currentRow, 3, currentRow, lastColumn);
    worksheet.getRow(currentRow).height = 28;
    currentRow += 1;

    items.forEach((item, index) => {
      worksheet.getCell(currentRow, 1).value = index + 1;
      worksheet.getCell(currentRow, 2).value = item.title;
      worksheet.getCell(currentRow, 3).value = item.paramsText;
      worksheet.mergeCells(currentRow, 3, currentRow, lastColumn);
      [1, 2, 3].forEach((column) => styleBody(worksheet.getCell(currentRow, column), true));
      worksheet.getRow(currentRow).height = 30;
      currentRow += 1;
    });

    items.forEach((item, index) => {
      worksheet.getRow(currentRow++).height = 10;
      addMergedText(worksheet, currentRow++, lastColumn, `РАСЧЁТ №${index + 1} — ${item.title}`, "title", 32);
      addMergedText(worksheet, currentRow++, lastColumn, item.paramsText, "meta", 30);
      addTableHeader(worksheet, calculator, currentRow++);
      const rows = item.rows.filter((row) => row.includeInOffer !== false);
      addOfferRows(worksheet, calculator, rows, currentRow);
      currentRow += rows.length;
    });

    const summaryRows = aggregateProjectRows(items);
    worksheet.getRow(currentRow++).height = 12;
    addMergedText(worksheet, currentRow++, lastColumn, "ИТОГО К ЗАКАЗУ — СВОДНАЯ СПЕЦИФИКАЦИЯ", "title", 34);
    addMergedText(worksheet, currentRow++, lastColumn, "Одинаковые материалы суммированы только при полном совпадении наименования, размера, длины и единицы измерения.", "meta", 28);
    addTableHeader(worksheet, calculator, currentRow++);
    const summaryStart = currentRow;
    addOfferRows(worksheet, calculator, summaryRows, summaryStart);
    currentRow += summaryRows.length;

    if (summaryRows.length > 0) {
      const sumColumnIndex = columnSearchIndex(calculator.offerColumns, "sum");
      const totalRow = currentRow++;
      worksheet.mergeCells(totalRow, 1, totalRow, Math.max(1, sumColumnIndex - 1));
      const totalLabel = worksheet.getCell(totalRow, 1);
      totalLabel.value = "ОБЩАЯ СУММА";
      totalLabel.font = { name: "Arial", size: 11, bold: true };
      totalLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      worksheet.getCell(totalRow, sumColumnIndex).value = {
        formula: `SUM(${excelColumn(sumColumnIndex)}${summaryStart}:${excelColumn(sumColumnIndex)}${currentRow - 1})`,
        result: 0,
      };
      worksheet.getCell(totalRow, sumColumnIndex).numFmt = "#,##0.00";
      styleBody(worksheet.getCell(totalRow, sumColumnIndex));
      worksheet.getRow(totalRow).height = 30;
    }

    worksheet.getRow(currentRow++).height = 10;
    addMergedText(worksheet, currentRow++, lastColumn, "Заполняйте столбец «Цена» в нужных блоках или только в сводной спецификации. Столбец «Сумма» рассчитывается автоматически.", "note", 24);
    addMergedText(worksheet, currentRow++, lastColumn, "Все расчёты размещены на одном листе отдельными блоками. В конце листа находится суммарная спецификация для закупки.", "note", 24);
    addMergedText(worksheet, currentRow++, lastColumn, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "note", 22);
    addMergedText(worksheet, currentRow++, lastColumn, "ООО «ИДЕЛЕОН» · ideleon.com · zakaz@ideleon.com · +7-926-696-13-86", "note", 22);
  });
}
