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
    cell("C9", "Длина", "2"),
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
    const sumFormula = `F${rowNumber}*H${rowNumber}`;

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
  excelRows.push(rowXml(noteRow + 2, [cell(`A${noteRow + 2}`, "Для профиля количество уже указано в погонных метрах — сумма считается как «Количество × Цена».", "3")], 18));
  excelRows.push(rowXml(noteRow + 3, [cell(`A${noteRow + 3}`, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "3")], 18));

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="5" customWidth="1"/>
    <col min="2" max="2" width="42" customWidth="1"/>
    <col min="3" max="3" width="14" customWidth="1"/>
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

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1"><numFmt numFmtId="164" formatCode="# ##0.00"/></numFmts>
  <fonts count="5">
    <font><sz val="11"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="20"/><color rgb="FF0F172A"/><name val="Arial"/></font>
    <font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><sz val="11"/><color rgb="FF64748B"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Arial"/></font>
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
    <border><bottom style="medium"><color rgb="FFFF6A00"/></bottom></border>
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
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="3" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const drawing = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:oneCellAnchor>
    <xdr:from><xdr:col>0</xdr:col><xdr:colOff>120000</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>80000</xdr:rowOff></xdr:from>
    <xdr:ext cx="3048000" cy="1016000"/>
    <xdr:pic>
      <xdr:nvPicPr><xdr:cNvPr id="2" name="IDELEON Logo"/><xdr:cNvPicPr/></xdr:nvPicPr>
      <xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
      <xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="3048000" cy="1016000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:oneCellAnchor>
</xdr:wsDr>`;

  const logoBytes = base64ToBytes(IDELEON_LOGO_BASE64);

  const files = [
    {
      name: "[Content_Types].xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`),
    },
    {
      name: "_rels/.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`),
    },
    {
      name: "docProps/core.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>КП профиль ГКЛ IDELEON</dc:title><dc:creator>IDELEON</dc:creator></cp:coreProperties>`),
    },
    {
      name: "docProps/app.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>IDELEON calculator</Application></Properties>`),
    },
    {
      name: "xl/workbook.xml",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="КП профиль ГКЛ" sheetId="1" r:id="rId1"/></sheets><calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>`),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
    },
    {
      name: "xl/worksheets/sheet1.xml",
      data: stringToBytes(sheet),
    },
    {
      name: "xl/worksheets/_rels/sheet1.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`),
    },
    {
      name: "xl/styles.xml",
      data: stringToBytes(styles),
    },
    {
      name: "xl/drawings/drawing1.xml",
      data: stringToBytes(drawing),
    },
    {
      name: "xl/drawings/_rels/drawing1.xml.rels",
      data: stringToBytes(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo.png"/></Relationships>`),
    },
    {
      name: "xl/media/logo.png",
      data: logoBytes,
    },
  ];

  const zip = makeZip(files);

  return new Blob([zip], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
            <p className="calculatorHint">Версия расчёта: КП ГКЛ пересобрано как корректный XLSX. Цена вводится в одном столбце, сумма считается автоматически.</p>
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
