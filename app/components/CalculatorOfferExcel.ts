import type { CalculatorConfig, CalculatorResultRow, OfferColumn } from "../data/calculators";

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

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime() {
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  return { time, date };
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

function letters(index: number) {
  let result = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function cell(ref: string, value: string | number, style = "0") {
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
}

function numberCell(ref: string, value: number, style = "4") {
  return `<c r="${ref}" s="${style}"><v>${String(value).replace(",", ".")}</v></c>`;
}

function formulaCell(ref: string, formula: string, style = "5") {
  return `<c r="${ref}" s="${style}"><f>${xml(formula)}</f></c>`;
}

function rowXml(index: number, cells: string[], height?: number) {
  return `<row r="${index}"${height ? ` ht="${height}" customHeight="1"` : ""}>${cells.join("")}</row>`;
}

function columnWidth(column: OfferColumn) {
  return column.width ?? 16;
}

function getValue(row: CalculatorResultRow, key: string, rowNumber: number) {
  if (key === "name") return row.name;
  if (key === "size") return row.size ?? "";
  if (key === "lengthM") return row.lengthM ?? "";
  if (key === "unit") return row.unit;
  if (key === "coefficient") return row.coefficient;
  if (key === "quantity") return row.quantity;
  if (key === "priceUnit") return row.priceUnit ?? row.unit;
  if (key === "index") return rowNumber;
  return "";
}

function cellForColumn(column: OfferColumn, row: CalculatorResultRow, rowIndex: number, colIndex: number) {
  const ref = `${letters(colIndex)}${rowIndex}`;
  if (column.key === "index") return numberCell(ref, rowIndex - 9, "6");
  if (column.key === "quantity") return numberCell(ref, row.quantity, "6");
  if (column.key === "lengthM") {
    return row.lengthM ? numberCell(ref, row.lengthM, "6") : cell(ref, "-", "8");
  }
  if (column.key === "price") return cell(ref, "", "9");
  if (column.key === "sum") {
    const priceColumnIndex = colIndex - 1;
    const quantityColumnIndex = Math.max(1, columnSearchIndex("quantity"));
    const lengthColumnIndex = columnSearchIndex("lengthM");
    const priceRef = `${letters(priceColumnIndex)}${rowIndex}`;
    const quantityRef = `${letters(quantityColumnIndex)}${rowIndex}`;
    const formula =
      row.priceMode === "meter" && row.lengthM
        ? `IF(${priceRef}="","",${quantityRef}*${letters(lengthColumnIndex)}${rowIndex}*${priceRef})`
        : `IF(${priceRef}="","",${quantityRef}*${priceRef})`;
    return formulaCell(ref, formula, "7");
  }
  return cell(ref, String(getValue(row, column.key, rowIndex)), column.key === "name" ? "8" : "0");
}

let activeColumns: OfferColumn[] = [];
function columnSearchIndex(key: string) {
  const index = activeColumns.findIndex((column) => column.key === key);
  return index >= 0 ? index + 1 : 1;
}

export function buildCalculatorOfferExcel({
  calculator,
  values,
  rows,
}: {
  calculator: CalculatorConfig;
  values: Record<string, string>;
  rows: CalculatorResultRow[];
}) {
  activeColumns = calculator.offerColumns;
  const date = new Date().toLocaleDateString("ru-RU");
  const offerRows = rows.filter((row) => row.includeInOffer !== false);
  const maxColumn = calculator.offerColumns.length;
  const maxLetter = letters(maxColumn);
  const sheetRows: string[] = [];

  sheetRows.push(rowXml(1, [cell("A1", "IDELEON — строительные материалы", "10")], 36));
  sheetRows.push(rowXml(2, [], 22));
  sheetRows.push(rowXml(3, [], 16));
  sheetRows.push(rowXml(4, [cell("A4", calculator.offerTitle, "1")], 34));
  sheetRows.push(rowXml(5, [cell("A5", "ООО «ИДЕЛЕОН»", "3")], 22));
  sheetRows.push(rowXml(6, [cell("A6", `Дата: ${date}`, "11")], 22));
  sheetRows.push(rowXml(7, [cell("A7", calculator.getParamsText(values), "11")], 28));
  sheetRows.push(rowXml(8, [], 10));

  const headerCells = calculator.offerColumns.map((column, index) => cell(`${letters(index + 1)}9`, column.title, "2"));
  sheetRows.push(rowXml(9, headerCells, 30));

  offerRows.forEach((row, index) => {
    const rowNumber = 10 + index;
    const cells = calculator.offerColumns.map((column, colIndex) => cellForColumn(column, row, rowNumber, colIndex + 1));
    sheetRows.push(rowXml(rowNumber, cells, 26));
  });

  const footerStart = 11 + offerRows.length;
  sheetRows.push(rowXml(footerStart, [], 8));
  sheetRows.push(rowXml(footerStart + 1, [cell(`A${footerStart + 1}`, "Заполняйте только столбец «Цена». Столбец «Цена за» подсказывает, в каких единицах вводить стоимость.", "3")], 22));
  sheetRows.push(rowXml(footerStart + 2, [cell(`A${footerStart + 2}`, "Для профильных элементов цена может вводиться за м.п. — Excel сам рассчитает сумму по длине и количеству.", "3")], 22));
  sheetRows.push(rowXml(footerStart + 3, [cell(`A${footerStart + 3}`, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "3")], 22));

  const cols = calculator.offerColumns
    .map((column, index) => `<col min="${index + 1}" max="${index + 1}" width="${columnWidth(column)}" customWidth="1"/>`)
    .join("");

  const merges = [
    `<mergeCell ref="A1:${maxLetter}1"/>`,
    `<mergeCell ref="A4:${maxLetter}4"/>`,
    `<mergeCell ref="A5:${maxLetter}5"/>`,
    `<mergeCell ref="A6:${maxLetter}6"/>`,
    `<mergeCell ref="A7:${maxLetter}7"/>`,
    `<mergeCell ref="A${footerStart + 1}:${maxLetter}${footerStart + 1}"/>`,
    `<mergeCell ref="A${footerStart + 2}:${maxLetter}${footerStart + 2}"/>`,
    `<mergeCell ref="A${footerStart + 3}:${maxLetter}${footerStart + 3}"/>`,
  ];

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${cols}</cols>
  <sheetData>${sheetRows.join("")}</sheetData>
  <mergeCells count="${merges.length}">${merges.join("")}</mergeCells>
</worksheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="КП" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Arial"/></font>
    <font><b/><sz val="20"/><name val="Arial"/><color rgb="FF0F1B33"/></font>
    <font><b/><sz val="11"/><name val="Arial"/><color rgb="FFFFFFFF"/></font>
    <font><sz val="11"/><name val="Arial"/><color rgb="FF49627F"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F1B33"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF1E6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>
    <border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="12">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
    <xf numFmtId="4" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf>
    <xf numFmtId="4" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const zip = makeZip([
    { name: "[Content_Types].xml", data: stringToBytes(contentTypes) },
    { name: "_rels/.rels", data: stringToBytes(rels) },
    { name: "xl/workbook.xml", data: stringToBytes(workbookXml) },
    { name: "xl/_rels/workbook.xml.rels", data: stringToBytes(workbookRels) },
    { name: "xl/worksheets/sheet1.xml", data: stringToBytes(sheetXml) },
    { name: "xl/styles.xml", data: stringToBytes(styles) },
  ]);

  activeColumns = [];
  return new Blob([zip], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
