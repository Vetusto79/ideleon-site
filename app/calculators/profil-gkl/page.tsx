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
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(time), u16(date),
      u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes,
    ]);
    localParts.push(localHeader, data);

    const centralHeader = concatBytes([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(time), u16(date),
      u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), nameBytes,
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const localData = concatBytes(localParts);
  const end = concatBytes([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(centralDirectory.length), u32(localData.length), u16(0),
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

function numberCell(ref: string, value: number, style = "4") {
  return `<c r="${ref}" s="${style}"><v>${String(value).replace(",", ".")}</v></c>`;
}

function emptyCell(ref: string, style = "0") {
  return `<c r="${ref}" s="${style}"/>`;
}

function formulaCell(ref: string, formula: string, style = "5") {
  return `<c r="${ref}" s="${style}"><f>${xml(formula)}</f></c>`;
}

function rowXml(rowNumber: number, cells: string[], height?: number) {
  return `<row r="${rowNumber}"${height ? ` ht="${height}" customHeight="1"` : ""}>${cells.join("")}</row>`;
}

function xlsxStyles() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1">
    <numFmt numFmtId="164" formatCode="# ##0.00"/>
  </numFmts>
  <fonts count="6">
    <font><sz val="11"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="20"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><sz val="11"/><color rgb="FF64748B"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FFFF6A00"/><name val="Arial"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F1B33"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF3E6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="4">
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
    <border>
      <bottom style="medium"><color rgb="FFFF6A00"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="12">
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="2" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="164" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="164" fontId="4" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="164" fontId="4" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="3" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function createWorkbookBlob(sheet: string) {
  const logoBytes = base64ToBytes(IDELEON_LOGO_BASE64);
  const now = new Date().toISOString();

  const drawing = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:oneCellAnchor>
    <xdr:from>
      <xdr:col>0</xdr:col><xdr:colOff>120000</xdr:colOff>
      <xdr:row>0</xdr:row><xdr:rowOff>80000</xdr:rowOff>
    </xdr:from>
    <xdr:ext cx="3048000" cy="1016000"/>
    <xdr:pic>
      <xdr:nvPicPr><xdr:cNvPr id="2" name="IDELEON Logo"/><xdr:cNvPicPr/></xdr:nvPicPr>
      <xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
      <xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="3048000" cy="1016000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>
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
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>КП IDELEON</dc:title>
  <dc:creator>IDELEON</dc:creator>
  <cp:lastModifiedBy>IDELEON</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`),
    },
    {
      name: "docProps/app.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>IDELEON calculator</Application></Properties>`),
    },
    {
      name: "xl/workbook.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="КП IDELEON" sheetId="1" r:id="rId1"/></sheets>
  <calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>
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
    { name: "xl/worksheets/sheet1.xml", data: stringToBytes(sheet) },
    {
      name: "xl/worksheets/_rels/sheet1.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`),
    },
    { name: "xl/styles.xml", data: stringToBytes(xlsxStyles()) },
    { name: "xl/drawings/drawing1.xml", data: stringToBytes(drawing) },
    {
      name: "xl/drawings/_rels/drawing1.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo.png"/>
</Relationships>`),
    },
    { name: "xl/media/logo.png", data: logoBytes },
  ];

  const zip = makeZip(files);
  return new Blob([zip], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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
  const excelRows: string[] = [];

  excelRows.push(rowXml(1, [], 26));
  excelRows.push(rowXml(2, [], 26));
  excelRows.push(rowXml(3, [], 26));
  excelRows.push(rowXml(4, [cell("A4", title, "1")], 34));
  excelRows.push(rowXml(5, [cell("A5", subtitle, "3")], 20));
  excelRows.push(rowXml(6, [cell("A6", `Дата: ${date}`, "11")], 20));
  excelRows.push(rowXml(7, [cell("A7", params, "11")], 24));
  excelRows.push(rowXml(8, [], 8));

  excelRows.push(rowXml(9, [
    cell("A9", "№", "2"),
    cell("B9", "Наименование", "2"),
    cell("C9", "Длина профиля", "2"),
    cell("D9", "Ед. изм.", "2"),
    cell("E9", "Коэффициент", "2"),
    cell("F9", "Количество", "2"),
    cell("G9", "Цена за", "2"),
    cell("H9", "Цена", "2"),
    cell("I9", "Сумма", "2"),
  ], 30));

  rows.forEach((row, index) => {
    const rowNumber = 10 + index;
    const unit = row.unit === "пог. м" ? "м.п." : row.unit;
    const sumFormula = `IF(H${rowNumber}="","",F${rowNumber}*H${rowNumber})`;

    excelRows.push(rowXml(rowNumber, [
      numberCell(`A${rowNumber}`, index + 1, "6"),
      cell(`B${rowNumber}`, row.name, "8"),
      cell(`C${rowNumber}`, profileLengthLabel(row.profileLengthMm) || "-", "0"),
      cell(`D${rowNumber}`, row.unit, "6"),
      cell(`E${rowNumber}`, row.coefficient, "0"),
      numberCell(`F${rowNumber}`, row.rounded, "4"),
      cell(`G${rowNumber}`, unit, "6"),
      emptyCell(`H${rowNumber}`, "7"),
      formulaCell(`I${rowNumber}`, sumFormula, "5"),
    ], 24));
  });

  const noteRow = 11 + rows.length;
  excelRows.push(rowXml(noteRow, [], 8));
  excelRows.push(rowXml(noteRow + 1, [cell(`A${noteRow + 1}`, "Заполняйте только столбец «Цена». Столбец «Цена за» подсказывает, в каких единицах вводить стоимость.", "3")], 18));
  excelRows.push(rowXml(noteRow + 2, [cell(`A${noteRow + 2}`, "Для профилей количество уже указано в погонных метрах — сумма считается как «Количество × Цена».", "3")], 18));
  excelRows.push(rowXml(noteRow + 3, [cell(`A${noteRow + 3}`, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "3")], 18));

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="5" customWidth="1"/>
    <col min="2" max="2" width="40" customWidth="1"/>
    <col min="3" max="3" width="16" customWidth="1"/>
    <col min="4" max="4" width="12" customWidth="1"/>
    <col min="5" max="5" width="28" customWidth="1"/>
    <col min="6" max="6" width="14" customWidth="1"/>
    <col min="7" max="7" width="12" customWidth="1"/>
    <col min="8" max="8" width="14" customWidth="1"/>
    <col min="9" max="9" width="18" customWidth="1"/>
  </cols>
  <sheetData>${excelRows.join("")}</sheetData>
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

  return createWorkbookBlob(sheet);
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

  function downloadExcelOffer() { downloadBlob(makeExcelBlob(), "KP_profil_GKL_ideleon.xlsx"); }

  async function sendExcelOffer() {
    setSendStatus("idle"); setSendMessage("");
    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) { setSendStatus("error"); setSendMessage("Заполните имя, телефон и e-mail."); return; }
    if (!consent) { setSendStatus("error"); setSendMessage("Нужно согласие на обработку персональных данных."); return; }
    const file = new File([makeExcelBlob()], "KP_profil_GKL_ideleon.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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
            <p className="calculatorHint">Версия расчёта: КП оформлено в едином стиле с Грильято. Цена вводится в одном столбце, сумма считается автоматически.</p>
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
