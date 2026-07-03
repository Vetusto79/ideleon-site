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

const IDELEON_LOGO_BASE64 = "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";

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

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
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

  rows.push(rowXml(1, [], 22));
  rows.push(rowXml(2, [], 22));
  rows.push(rowXml(3, [], 22));
  rows.push(rowXml(4, [cell("A4", "Коммерческое предложение / расчёт потолка Грильято", "1")], 34));
  rows.push(rowXml(5, [cell("A5", "ООО «ИДЕЛЕОН»", "4")], 20));
  rows.push(rowXml(6, [cell("A6", `Дата: ${date}`, "0")], 20));
  rows.push(rowXml(7, [cell("A7", `Площадь: ${area} м² · периметр: ${perimeter} м · тип: ${typeLabels[grilyatoType]} · ячейка: ${cellSize} · запас: ${reserve}%`, "0")], 24));
  rows.push(rowXml(8, [], 8));

  rows.push(
    rowXml(
      9,
      [
        cell("A9", "№", "3"),
        cell("B9", "Наименование элемента", "3"),
        cell("C9", "Размер", "3"),
        cell("D9", "Длина, м", "3"),
        cell("E9", "Ед. изм.", "3"),
        cell("F9", "Количество", "3"),
        cell("G9", "Цена за", "3"),
        cell("H9", "Цена", "3"),
        cell("I9", "Сумма", "3"),
      ],
      28,
    ),
  );

  offerRows.forEach((item, index) => {
    const rowNumber = 10 + index;
    const hasLength = Boolean(item.lengthMeters && item.lengthMeters > 0);
    const priceBasis = hasLength || item.unit === "м.п." ? "м.п." : item.unit;
    const sumFormula = hasLength
      ? `IF(H${rowNumber}="","",F${rowNumber}*D${rowNumber}*H${rowNumber})`
      : `IF(H${rowNumber}="","",F${rowNumber}*H${rowNumber})`;

    rows.push(
      rowXml(
        rowNumber,
        [
          numberCell(`A${rowNumber}`, index + 1, "7"),
          cell(`B${rowNumber}`, item.element, "9"),
          cell(`C${rowNumber}`, item.size, "0"),
          item.lengthMeters === null ? emptyCell(`D${rowNumber}`, "5") : numberCell(`D${rowNumber}`, item.lengthMeters, "5"),
          cell(`E${rowNumber}`, item.unit, "7"),
          numberCell(`F${rowNumber}`, Number(item.quantityWithReserve ?? 0), "5"),
          cell(`G${rowNumber}`, priceBasis, "7"),
          emptyCell(`H${rowNumber}`, "8"),
          formulaCell(`I${rowNumber}`, sumFormula, "6"),
        ],
        24,
      ),
    );
  });

  const noteRow = 11 + offerRows.length;
  rows.push(rowXml(noteRow, [], 8));
  rows.push(rowXml(noteRow + 1, [cell(`A${noteRow + 1}`, "Заполняйте только столбец «Цена». Столбец «Цена за» подсказывает, в каких единицах вводить стоимость.", "4")], 18));
  rows.push(rowXml(noteRow + 2, [cell(`A${noteRow + 2}`, "Для профилей цена вводится за м.п. — Excel сам посчитает сумму по длине элемента и количеству.", "4")], 18));
  rows.push(rowXml(noteRow + 3, [cell(`A${noteRow + 3}`, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "4")], 18));

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>
  <printOptions gridLines="0" headings="0"/>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="5" customWidth="1"/>
    <col min="2" max="2" width="42" customWidth="1"/>
    <col min="3" max="3" width="18" customWidth="1"/>
    <col min="4" max="4" width="12" customWidth="1"/>
    <col min="5" max="5" width="12" customWidth="1"/>
    <col min="6" max="6" width="14" customWidth="1"/>
    <col min="7" max="7" width="12" customWidth="1"/>
    <col min="8" max="8" width="14" customWidth="1"/>
    <col min="9" max="9" width="18" customWidth="1"/>
  </cols>
  <sheetData>${rows.join("")}</sheetData>
  <mergeCells count="8">
    <mergeCell ref="A4:I4"/>
    <mergeCell ref="A5:I5"/>
    <mergeCell ref="A6:I6"/>
    <mergeCell ref="A7:I7"/>
    <mergeCell ref="A${noteRow + 1}:I${noteRow + 1}"/>
    <mergeCell ref="A${noteRow + 2}:I${noteRow + 2}"/>
    <mergeCell ref="A${noteRow + 3}:I${noteRow + 3}"/>
    <mergeCell ref="A1:I1"/>
  </mergeCells>
  <drawing r:id="rId1"/>
</worksheet>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font><sz val="11"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="20"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><sz val="11"/><color rgb="FF64748B"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Arial"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F1B33"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF3E6"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FF94A3B8"/></left>
      <right style="thin"><color rgb="FF94A3B8"/></right>
      <top style="thin"><color rgb="FF94A3B8"/></top>
      <bottom style="thin"><color rgb="FF94A3B8"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="medium"><color rgb="FF0F1B33"/></left>
      <right style="medium"><color rgb="FF0F1B33"/></right>
      <top style="medium"><color rgb="FF0F1B33"/></top>
      <bottom style="medium"><color rgb="FF0F1B33"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="10">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="2" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="2" fontId="4" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="2" fontId="4" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const logoBytes = base64ToBytes(IDELEON_LOGO_BASE64);

  const drawing = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:oneCellAnchor>
    <xdr:from>
      <xdr:col>0</xdr:col>
      <xdr:colOff>0</xdr:colOff>
      <xdr:row>0</xdr:row>
      <xdr:rowOff>0</xdr:rowOff>
    </xdr:from>
    <xdr:ext cx="3048000" cy="1016000"/>
    <xdr:pic>
      <xdr:nvPicPr>
        <xdr:cNvPr id="2" name="IDELEON Logo"/>
        <xdr:cNvPicPr/>
      </xdr:nvPicPr>
      <xdr:blipFill>
        <a:blip r:embed="rId1"/>
        <a:stretch><a:fillRect/></a:stretch>
      </xdr:blipFill>
      <xdr:spPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="3048000" cy="1016000"/>
        </a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      </xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:oneCellAnchor>
</xdr:wsDr>`;

  const files = [
    {
      name: "[Content_Types].xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>
</Types>`),
    },
    {
      name: "_rels/.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`),
    },
    {
      name: "docProps/core.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>OpenAI</dc:creator>
  <cp:lastModifiedBy>OpenAI</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`),
    },
    {
      name: "docProps/app.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
</Properties>`),
    },
    {
      name: "xl/workbook.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="КП Грильято" sheetId="1" r:id="rId1"/></sheets>
</workbook>`),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),
    },
    {
      name: "xl/worksheets/sheet1.xml",
      data: stringToBytes(sheet),
    },
    {
      name: "xl/styles.xml",
      data: stringToBytes(styles),
    },
    {
      name: "xl/worksheets/_rels/sheet1.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`),
    },
    {
      name: "xl/drawings/drawing1.xml",
      data: stringToBytes(drawing),
    },
    {
      name: "xl/drawings/_rels/drawing1.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
</Relationships>`),
    },
    {
      name: "xl/media/image1.png",
      data: logoBytes,
    },
  ];

  const zip = makeZip(files);
  return new Blob([zip], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
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
        <p className="calculatorHint">Версия расчёта: КП с единым столбцом «Цена». Для профилей цена вводится за м.п., для штучных элементов — за штуку. Финальную комплектацию лучше проверять по проекту.</p>
      </div>
      <div className="calculatorPanel calculatorResultPanel"><h2>Результат</h2>
        <div className="calculatorTableWrap"><table className="calculatorTable"><thead><tr><th>Материал</th><th>Размер</th><th>Длина, м</th><th>Расход</th><th>Количество</th></tr></thead><tbody>{result.map((item) => <tr key={`${item.element}-${item.catalogName}`}><td>{item.element}</td><td>{item.size}</td><td>{item.lengthMeters ?? "-"}</td><td>{item.consumption}</td><td><strong>{formatNumber(item.quantityWithReserve)}</strong> {item.unit}</td></tr>)}</tbody></table></div>
        <div className="calculatorActions"><button type="button" className="btn secondary" onClick={downloadExcelOffer}>Скачать КП</button></div>
        <div className="calculatorSendBox"><h3>Отправить расчёт в Иделеон</h3><p>Мы получим Excel-файл с расчётом и сможем подготовить предложение.</p><div className="calculatorSendGrid"><input placeholder="Ваше имя" value={clientName} onChange={(e) => setClientName(e.target.value)} /><input placeholder="Телефон" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /><input placeholder="E-mail" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div><label className="calculatorConsent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Согласен на обработку персональных данных</span></label><button type="button" className="btn primary calculatorSendButton" onClick={sendExcelOffer} disabled={sendStatus === "sending"}>{sendStatus === "sending" ? "Отправляем..." : "Отправить в Иделеон"}</button>{sendMessage ? <p className={`calculatorStatus ${sendStatus}`}>{sendMessage}</p> : null}</div>
        <p className="calculatorDisclaimer">В Excel-файле используется один столбец «Цена». Границы оставлены только в таблице с данными. Строка «Решётка» в КП не выводится, но участвует в расчёте.</p>
      </div>
    </div></section><SiteFooter /></main>;
}
