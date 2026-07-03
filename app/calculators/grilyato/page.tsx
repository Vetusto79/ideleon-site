"use client";

import { useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";

type GrilyatoType = "standard" | "nonstandard" | "pyramidal" | "multilevel";

type ResultRow = {
  element: string;
  size: string;
  lengthMeters: number | null;
  catalogName: string;
  unit: string;
  consumption: string;
  quantityWithReserve: number | null;
  includeInOffer: boolean;
};

const typeLabels: Record<GrilyatoType, string> = {
  standard: "Стандартная ячейка",
  nonstandard: "Нестандартная ячейка",
  pyramidal: "Пирамидальное",
  multilevel: "Разноуровневое",
};

const cellOptions: Record<GrilyatoType, string[]> = {
  standard: ["30х30", "50х50", "60х60", "75х75", "86х86", "100х100", "120х120", "150х150", "200х200"],
  nonstandard: ["Модель 1 (100х50)", "Модель 2 (150х50)", "Модель 3 (150х75)", "Модель 4 (180х60)", "Модель 5 (200х100)", "Модель 6 (50х200)", "Модель 7 (30х200)", "Модель 8 (50х50х100)", "Модель 9 (30-35-40-90)", "Модель 10-1 (1200)", "Модель 10-2 (1200)"],
  pyramidal: ["75х75", "86х86", "100х100", "120х120", "150х150", "200х200"],
  multilevel: ["50х50", "60х60", "75х75", "86х86", "100х100", "120х120", "150х150", "200х200"],
};

function toNumber(value: string) { const parsed = Number(value.replace(",", ".").trim()); return Number.isFinite(parsed) && parsed > 0 ? parsed : 0; }
function ceilTo(value: number, step: number) { return Math.ceil(value / step) * step; }
function withReserve(quantity: number, reservePercent: number, step = 1) { return ceilTo(quantity + quantity * reservePercent / 100, step); }
function formatNumber(value: number | null) { if (value === null) return "-"; return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value); }
function isSmallCell(cell: string) { return ["30х30", "50х50", "60х60", "75х75"].includes(cell); }
function isModel10(cell: string) { return cell === "Модель 10-1 (1200)" || cell === "Модель 10-2 (1200)"; }
function mamaCoeff(cell: string) { if (cell === "30х30") return 19; if (cell === "50х50") return 11; if (cell === "60х60") return 9; if (cell === "75х75" || cell === "Модель 1 (100х50)") return 7; if (cell === "86х86") return 6; if (["100х100", "Модель 2 (150х50)", "Модель 3 (150х75)", "Модель 4 (180х60)"].includes(cell)) return 5; if (cell === "120х120") return 4; if (cell === "150х150" || cell === "Модель 5 (200х100)") return 3; if (cell === "200х200") return 2; if (["Модель 6 (50х200)", "Модель 10-1 (1200)", "Модель 10-2 (1200)"].includes(cell)) return 12; if (cell === "Модель 7 (30х200)") return 20; if (cell === "Модель 8 (50х50х100)") return 10; if (cell === "Модель 9 (30-35-40-90)") return 13; return 0; }
function papaCoeff(cell: string) { if (cell === "30х30") return 19; if (cell === "50х50") return 11; if (cell === "60х60") return 9; if (cell === "75х75" || cell === "Модель 1 (100х50)") return 7; if (cell === "86х86") return 6; if (["100х100", "Модель 2 (150х50)", "Модель 3 (150х75)", "Модель 4 (180х60)"].includes(cell)) return 5; if (cell === "120х120") return 4; if (["150х150", "Модель 5 (200х100)", "Модель 6 (50х200)", "Модель 7 (30х200)"].includes(cell)) return 3; if (cell === "200х200") return 2; if (cell === "Модель 8 (50х50х100)") return 10; if (cell === "Модель 9 (30-35-40-90)") return 13; if (isModel10(cell)) return 12; return 0; }
function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }

function row(element: string, size: string, lengthMeters: number | null, catalogName: string, unit: string, consumptionValue: number | "периметр" | null, quantityWithoutReserve: number | null, reservePercent: number, step = 1, includeInOffer = true): ResultRow {
  return { element, size, lengthMeters, catalogName, unit, consumption: consumptionValue === null ? "-" : consumptionValue === "периметр" ? "периметр" : String(consumptionValue).replace(".", ","), quantityWithReserve: quantityWithoutReserve === null ? null : withReserve(quantityWithoutReserve, reservePercent, step), includeInOffer };
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i];

    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);

  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  return { time, date: dosDate };
}

function stringToBytes(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;

  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });

  return result;
}

function u16(value: number) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function u32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
  return bytes;
}

function makeZip(files: { name: string; data: Uint8Array }[]) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  const { time, date } = dosDateTime();

  files.forEach((file) => {
    const nameBytes = stringToBytes(file.name);
    const data = file.data;
    const crc = crc32(data);

    const localHeader = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
    ]);

    localParts.push(localHeader, data);

    const centralHeader = concatBytes([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes,
    ]);

    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const localData = concatBytes(localParts);
  const end = concatBytes([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDirectory.length),
    u32(localData.length),
    u16(0),
  ]);

  return concatBytes([localData, centralDirectory, end]);
}

function xml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cell(ref: string, value: string | number, style = "0") {
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
}

function numberCell(ref: string, value: number, style = "5") {
  return `<c r="${ref}" s="${style}"><v>${String(value).replace(",", ".")}</v></c>`;
}

function emptyCell(ref: string, style = "0") {
  return `<c r="${ref}" s="${style}"/>`;
}

function formulaCell(ref: string, formula: string, style = "6") {
  return `<c r="${ref}" s="${style}"><f>${xml(formula)}</f></c>`;
}

function rowXml(rowNumber: number, cells: string[], height?: number) {
  return `<row r="${rowNumber}"${height ? ` ht="${height}" customHeight="1"` : ""}>${cells.join("")}</row>`;
}

function createExcelBlob({
  area,
  perimeter,
  grilyatoType,
  cellSize,
  reserve,
  result,
}: {
  area: string;
  perimeter: string;
  grilyatoType: GrilyatoType;
  cellSize: string;
  reserve: number;
  result: ResultRow[];
}) {
  const date = new Date().toLocaleDateString("ru-RU");
  const offerRows = result.filter((item) => item.includeInOffer);
  const rows: string[] = [];

  rows.push(rowXml(1, [cell("A1", "IDELEON", "1"), cell("B1", "строительные материалы", "4")], 32));
  rows.push(rowXml(2, [], 18));
  rows.push(rowXml(3, [cell("A3", "Коммерческое предложение / расчёт потолка Грильято", "2")], 32));
  rows.push(rowXml(4, [cell("A4", "ООО «ИДЕЛЕОН»", "4")], 22));
  rows.push(rowXml(5, [cell("A5", `Дата: ${date}`)], 22));
  rows.push(rowXml(6, [cell("A6", `Площадь: ${area} м²; периметр: ${perimeter} м; тип: ${typeLabels[grilyatoType]}; ячейка: ${cellSize}; запас: ${reserve}%`)], 24));
  rows.push(rowXml(7, [], 14));

  rows.push(rowXml(8, [
    cell("A8", "№", "3"),
    cell("B8", "Наименование элемента", "3"),
    cell("C8", "Размер", "3"),
    cell("D8", "Длина, м", "3"),
    cell("E8", "Ед. изм.", "3"),
    cell("F8", "Количество", "3"),
    cell("G8", "Цена за м.п.", "3"),
    cell("H8", "Цена за шт.", "3"),
    cell("I8", "Сумма", "3"),
  ], 38));

  offerRows.forEach((item, index) => {
    const rowNumber = 9 + index;
    const length = item.lengthMeters ?? null;
    const isMeterUnit = item.unit === "м.п.";
    const isProfile = Boolean(length && length > 0);

    const pricePerPieceCell = isProfile
      ? formulaCell(`H${rowNumber}`, `IF(G${rowNumber}="","",D${rowNumber}*G${rowNumber})`, "6")
      : emptyCell(`H${rowNumber}`, isMeterUnit ? "9" : "8");

    const sumCell = isMeterUnit
      ? formulaCell(`I${rowNumber}`, `IF(G${rowNumber}="","",F${rowNumber}*G${rowNumber})`, "6")
      : isProfile
        ? formulaCell(`I${rowNumber}`, `IF(H${rowNumber}="","",F${rowNumber}*H${rowNumber})`, "6")
        : formulaCell(`I${rowNumber}`, `IF(H${rowNumber}="","",F${rowNumber}*H${rowNumber})`, "6");

    rows.push(rowXml(rowNumber, [
      numberCell(`A${rowNumber}`, index + 1, "7"),
      cell(`B${rowNumber}`, item.element, "0"),
      cell(`C${rowNumber}`, item.size, "0"),
      length === null ? emptyCell(`D${rowNumber}`, "5") : numberCell(`D${rowNumber}`, length, "5"),
      cell(`E${rowNumber}`, item.unit, "7"),
      numberCell(`F${rowNumber}`, Number(item.quantityWithReserve ?? 0), "5"),
      emptyCell(`G${rowNumber}`, isMeterUnit || isProfile ? "8" : "9"),
      pricePerPieceCell,
      sumCell,
    ], 28));
  });

  const noteRow = 10 + offerRows.length;
  rows.push(rowXml(noteRow, [], 14));
  rows.push(rowXml(noteRow + 1, [cell(`A${noteRow + 1}`, "Для профильных элементов менеджер заполняет «Цена за м.п.», Excel считает «Цена за шт.» и «Сумма».", "4")], 22));
  rows.push(rowXml(noteRow + 2, [cell(`A${noteRow + 2}`, "Для штучных элементов без длины менеджер заполняет «Цена за шт.», Excel считает «Сумма».", "4")], 22));
  rows.push(rowXml(noteRow + 3, [cell(`A${noteRow + 3}`, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "4")], 22));

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="5" customWidth="1"/>
    <col min="2" max="2" width="42" customWidth="1"/>
    <col min="3" max="3" width="18" customWidth="1"/>
    <col min="4" max="4" width="12" customWidth="1"/>
    <col min="5" max="5" width="12" customWidth="1"/>
    <col min="6" max="6" width="14" customWidth="1"/>
    <col min="7" max="7" width="16" customWidth="1"/>
    <col min="8" max="8" width="16" customWidth="1"/>
    <col min="9" max="9" width="16" customWidth="1"/>
  </cols>
  <sheetData>${rows.join("")}</sheetData>
  <mergeCells count="8">
    <mergeCell ref="B1:C1"/>
    <mergeCell ref="A3:I3"/>
    <mergeCell ref="A4:I4"/>
    <mergeCell ref="A5:I5"/>
    <mergeCell ref="A6:I6"/>
    <mergeCell ref="A${noteRow + 1}:I${noteRow + 1}"/>
    <mergeCell ref="A${noteRow + 2}:I${noteRow + 2}"/>
    <mergeCell ref="A${noteRow + 3}:I${noteRow + 3}"/>
  </mergeCells>
</worksheet>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="6">
    <font><sz val="11"/><name val="Arial"/></font>
    <font><b/><sz val="20"/><color rgb="FF111827"/><name val="Arial"/></font>
    <font><b/><sz val="18"/><color rgb="FF111827"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><sz val="11"/><color rgb="FF64748B"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><name val="Arial"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF111827"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF7ED"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FF999999"/></left>
      <right style="thin"><color rgb="FF999999"/></right>
      <top style="thin"><color rgb="FF999999"/></top>
      <bottom style="thin"><color rgb="FF999999"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="10">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="2" fontId="5" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const files = [
    { name: "[Content_Types].xml", data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`) },
    { name: "_rels/.rels", data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`) },
    { name: "docProps/core.xml", data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>КП Грильято IDELEON</dc:title><dc:creator>IDELEON</dc:creator></cp:coreProperties>`) },
    { name: "docProps/app.xml", data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>IDELEON calculator</Application></Properties>`) },
    { name: "xl/workbook.xml", data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="КП Грильято" sheetId="1" r:id="rId1"/></sheets><calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>`) },
    { name: "xl/_rels/workbook.xml.rels", data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`) },
    { name: "xl/worksheets/sheet1.xml", data: stringToBytes(sheet) },
    { name: "xl/styles.xml", data: stringToBytes(styles) },
  ];

  const zipBytes = makeZip(files);
  return new Blob([zipBytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}


function downloadBlob(blob: Blob, filename: string) { const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href); }

export default function GrilyatoCalculatorPage() {
  const [area, setArea] = useState("100");
  const [perimeter, setPerimeter] = useState("40");
  const [grilyatoType, setGrilyatoType] = useState<GrilyatoType>("standard");
  const [cellSize, setCellSize] = useState("100х100");
  const [reservePercent, setReservePercent] = useState("5");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendMessage, setSendMessage] = useState("");

  const reserve = Math.min(Math.max(toNumber(reservePercent), 0), 30);
  const areaNumber = toNumber(area);
  const perimeterNumber = toNumber(perimeter);
  const availableCells = cellOptions[grilyatoType];
  function changeType(nextType: GrilyatoType) { setGrilyatoType(nextType); setCellSize(cellOptions[nextType][0]); }

  const result = useMemo(() => {
    const rows: ResultRow[] = [];
    const latticeCoeff = isModel10(cellSize) ? 0.7 : 2.78;
    const latticeQty = ceilTo(areaNumber * latticeCoeff, 1);
    rows.push(row("Решётка", isModel10(cellSize) ? "1200×1200 мм" : "600×600 мм", null, "РГ", "шт.", latticeCoeff, latticeQty, reserve, 1, false));
    const mama = mamaCoeff(cellSize); const papa = papaCoeff(cellSize);
    rows.push(row("Профиль «мама»", "600 мм", 0.6, grilyatoType === "multilevel" ? "мама (10×30)" : "мама", "шт.", mama, ceilTo(latticeQty * mama, 1), reserve));
    rows.push(row("Профиль «папа»", "600 мм", 0.6, grilyatoType === "multilevel" ? "папа (10×30)" : "папа", "шт.", papa, ceilTo(latticeQty * papa, 1), reserve));
    const n1Coeff = isSmallCell(cellSize) ? 0.7 : 0.35;
    rows.push(row("Несущая направляющая L=2400 мм", "2400 мм", 2.4, grilyatoType === "multilevel" ? "№1 (10×50)" : "№1", "шт.", n1Coeff, ceilTo(areaNumber * n1Coeff, 1), reserve));
    if (!isSmallCell(cellSize)) { const n2Coeff = isModel10(cellSize) ? 0.7 : 1.39; rows.push(row("Несущая направляющая L=1200 мм", "1200 мм", 1.2, grilyatoType === "multilevel" ? "№2 (10×50)" : "№2", "шт.", n2Coeff, ceilTo(areaNumber * n2Coeff, 1), reserve)); }
    if (!isModel10(cellSize)) { const n3Coeff = isSmallCell(cellSize) ? 2.78 : 1.39; rows.push(row("Несущая направляющая L=600 мм", "600 мм", 0.6, grilyatoType === "multilevel" ? "№3 (10×50)" : "№3", "шт.", n3Coeff, ceilTo(areaNumber * n3Coeff, 1), reserve)); }
    const pgCoeff = isSmallCell(cellSize) ? 0.7 : 0.35;
    rows.push(row("Соединительный элемент", "-", null, "PG", "шт.", pgCoeff, ceilTo(areaNumber * pgCoeff, 1), reserve));
    const hangerCoeff = isSmallCell(cellSize) ? 1.85 : 0.93;
    rows.push(row("Подвес", "по проекту", null, "АП-Г", "комп.", hangerCoeff, ceilTo(areaNumber * hangerCoeff, 10), reserve, 10));
    rows.push(row("Уголок", "3000 мм", null, "PL", "м.п.", "периметр", ceilTo(perimeterNumber, 3), reserve, 3));
    return rows;
  }, [areaNumber, perimeterNumber, grilyatoType, cellSize, reserve]);

  function makeExcelBlob() { return createExcelBlob({ area, perimeter, grilyatoType, cellSize, reserve, result }); }
  function downloadExcelOffer() { downloadBlob(makeExcelBlob(), "KP_grilyato_ideleon.xlsx"); }
  async function sendExcelOffer() {
    setSendStatus("idle"); setSendMessage("");
    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) { setSendStatus("error"); setSendMessage("Заполните имя, телефон и e-mail."); return; }
    if (!consent) { setSendStatus("error"); setSendMessage("Нужно согласие на обработку персональных данных."); return; }
    const file = new File([makeExcelBlob()], "KP_grilyato_ideleon.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const formData = new FormData();
    formData.append("requestType", "calculation"); formData.append("name", clientName); formData.append("phone", clientPhone); formData.append("email", clientEmail);
    formData.append("task", `Клиент отправил расчёт потолка Грильято из калькулятора.\n\nПлощадь: ${area} м²\nПериметр: ${perimeter} м\nТип: ${typeLabels[grilyatoType]}\nЯчейка: ${cellSize}\nЗапас: ${reserve}%`);
    formData.append("consent", "yes"); formData.append("sourcePage", "/calculators/grilyato"); formData.append("website", ""); formData.append("attachment", file);
    try { setSendStatus("sending"); const response = await fetch("/api/request", { method: "POST", body: formData }); const data = await response.json().catch(() => null); if (!response.ok || !data?.ok) throw new Error(data?.message || "Не удалось отправить расчёт."); setSendStatus("success"); setSendMessage("Расчёт отправлен. Мы свяжемся с вами."); }
    catch (error) { setSendStatus("error"); setSendMessage(error instanceof Error ? error.message : "Не удалось отправить расчёт."); }
  }

  return <main><SiteHeader />
    <section className="pageHero"><Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Калькуляторы", href: "/calculators" }, { label: "Потолок Грильято" }]} /><p className="label">Калькулятор</p><h1>Калькулятор потолка Грильято</h1><p>Предварительный расчёт расхода элементов потолка Грильято по площади, периметру, типу системы и размеру ячейки. По результату можно скачать Excel-файл в формате КП.</p></section>
    <section className="calculatorSection"><div className="calculatorGrid">
      <div className="calculatorPanel"><h2>Параметры расчёта</h2>
        <label className="calculatorField"><span>Площадь помещения, м²</span><input value={area} onChange={(e) => setArea(e.target.value)} /></label>
        <label className="calculatorField"><span>Периметр помещения, м</span><input value={perimeter} onChange={(e) => setPerimeter(e.target.value)} /></label>
        <div className="calculatorField"><span>Тип Грильято</span><div className="calculatorTabs"><button type="button" className={grilyatoType === "standard" ? "active" : ""} onClick={() => changeType("standard")}>Стандарт</button><button type="button" className={grilyatoType === "nonstandard" ? "active" : ""} onClick={() => changeType("nonstandard")}>Нестандарт</button><button type="button" className={grilyatoType === "pyramidal" ? "active" : ""} onClick={() => changeType("pyramidal")}>Пирамидальное</button><button type="button" className={grilyatoType === "multilevel" ? "active" : ""} onClick={() => changeType("multilevel")}>Разноуровневое</button></div></div>
        <label className="calculatorField"><span>Размер ячейки</span><select className="calculatorSelect" value={cellSize} onChange={(e) => setCellSize(e.target.value)}>{availableCells.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>
        <label className="calculatorField"><span>Запас, %</span><input value={reservePercent} onChange={(e) => setReservePercent(e.target.value)} /></label>
        <p className="calculatorHint">Версия расчёта: КП с ценой за м.п. включено. Формулы перенесены из расчётного файла, финальную комплектацию лучше проверять по проекту.</p>
      </div>
      <div className="calculatorPanel calculatorResultPanel"><h2>Результат</h2>
        <div className="calculatorTableWrap"><table className="calculatorTable"><thead><tr><th>Материал</th><th>Размер</th><th>Длина, м</th><th>Расход</th><th>Количество</th></tr></thead><tbody>{result.map((item) => <tr key={`${item.element}-${item.catalogName}`}><td>{item.element}</td><td>{item.size}</td><td>{item.lengthMeters ?? "-"}</td><td>{item.consumption}</td><td><strong>{formatNumber(item.quantityWithReserve)}</strong> {item.unit}</td></tr>)}</tbody></table></div>
        <div className="calculatorActions"><button type="button" className="btn secondary" onClick={downloadExcelOffer}>Скачать КП</button></div>
        <div className="calculatorSendBox"><h3>Отправить расчёт в Иделеон</h3><p>Мы получим Excel-файл с расчётом и сможем подготовить предложение.</p><div className="calculatorSendGrid"><input placeholder="Ваше имя" value={clientName} onChange={(e) => setClientName(e.target.value)} /><input placeholder="Телефон" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /><input placeholder="E-mail" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div><label className="calculatorConsent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Согласен на обработку персональных данных</span></label><button type="button" className="btn primary calculatorSendButton" onClick={sendExcelOffer} disabled={sendStatus === "sending"}>{sendStatus === "sending" ? "Отправляем..." : "Отправить в Иделеон"}</button>{sendMessage ? <p className={`calculatorStatus ${sendStatus}`}>{sendMessage}</p> : null}</div>
        <p className="calculatorDisclaimer">В Excel-файле будут формулы для пересчёта суммы по цене за метр погонный. Строка «Решётка» в КП не выводится, но участвует в расчёте.</p>
      </div>
    </div></section><SiteFooter /></main>;
}
