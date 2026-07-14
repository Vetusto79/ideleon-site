import type { CalculatorConfig, CalculatorResultRow, OfferColumn } from "../data/calculators";

export type CalculatorProjectItem = {
  id: string;
  title: string;
  paramsText: string;
  values: Record<string, string>;
  rows: CalculatorResultRow[];
  createdAt: string;
};

const LOGO_URL = "/images/logo/ideleon-logo-horizontal.png";

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

function cellForColumn(
  columns: OfferColumn[],
  column: OfferColumn,
  row: CalculatorResultRow,
  rowIndex: number,
  colIndex: number,
  displayIndex?: number,
) {
  const ref = `${letters(colIndex)}${rowIndex}`;
  if (column.key === "index") return numberCell(ref, displayIndex ?? rowIndex - 9, "6");
  if (column.key === "quantity") return numberCell(ref, row.quantity, "6");
  if (column.key === "lengthM") {
    return row.lengthM ? numberCell(ref, row.lengthM, "6") : cell(ref, "-", "8");
  }
  if (column.key === "price") return cell(ref, "", "9");
  if (column.key === "sum") {
    const priceColumnIndex = columnSearchIndex(columns, "price");
    const quantityColumnIndex = columnSearchIndex(columns, "quantity");
    const lengthColumnIndex = columnSearchIndex(columns, "lengthM");
    const priceRef = `${letters(priceColumnIndex)}${rowIndex}`;
    const quantityRef = `${letters(quantityColumnIndex)}${rowIndex}`;
    const formula =
      row.priceMode === "meter" && row.lengthM
        ? `IF(${priceRef}="","",${quantityRef}*${letters(lengthColumnIndex)}${rowIndex}*${priceRef})`
        : `IF(${priceRef}="","",${quantityRef}*${priceRef})`;
    return formulaCell(ref, formula, "7");
  }
  return cell(ref, String(getValue(row, column.key, rowIndex)), (column.key === "name" || column.key === "catalogName") ? "8" : "0");
}

async function loadLogoBytes() {
  const response = await fetch(LOGO_URL, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Не удалось загрузить логотип: ${LOGO_URL}`);
  }
  return new Uint8Array(await response.arrayBuffer());
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
  const logoBytes = await loadLogoBytes();
  const date = new Date().toLocaleDateString("ru-RU");
  const offerRows = rows.filter((row) => row.includeInOffer !== false);
  const maxColumn = calculator.offerColumns.length;
  const maxLetter = letters(maxColumn);
  const sheetRows: string[] = [];

  sheetRows.push(rowXml(1, [], 38));
  sheetRows.push(rowXml(2, [], 38));
  sheetRows.push(rowXml(3, [], 38));
  sheetRows.push(rowXml(4, [cell("A4", calculator.offerTitle, "1")], 34));
  sheetRows.push(rowXml(5, [cell("A5", "ООО «ИДЕЛЕОН»", "3")], 22));
  sheetRows.push(rowXml(6, [cell("A6", `Дата: ${date}`, "11")], 22));
  sheetRows.push(rowXml(7, [cell("A7", calculator.getParamsText(values), "11")], 28));
  sheetRows.push(rowXml(8, [], 10));

  const headerCells = calculator.offerColumns.map((column, index) => cell(`${letters(index + 1)}9`, column.title, "2"));
  sheetRows.push(rowXml(9, headerCells, 30));

  offerRows.forEach((row, index) => {
    const rowNumber = 10 + index;
    const cells = calculator.offerColumns.map((column, colIndex) =>
      cellForColumn(calculator.offerColumns, column, row, rowNumber, colIndex + 1),
    );
    sheetRows.push(rowXml(rowNumber, cells, 26));
  });

  const footerStart = 11 + offerRows.length;
  sheetRows.push(rowXml(footerStart, [], 8));
  sheetRows.push(rowXml(footerStart + 1, [cell(`A${footerStart + 1}`, "Заполняйте только столбец «Цена». Столбец «Цена за» подсказывает, в каких единицах вводить стоимость.", "3")], 22));
  sheetRows.push(rowXml(footerStart + 2, [cell(`A${footerStart + 2}`, "Для профильных элементов цена может вводиться за м.п. — Excel сам рассчитает сумму по длине и количеству.", "3")], 22));
  sheetRows.push(rowXml(footerStart + 3, [cell(`A${footerStart + 3}`, "Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "3")], 22));
  sheetRows.push(rowXml(footerStart + 4, [cell(`A${footerStart + 4}`, "ООО «ИДЕЛЕОН» · ideleon.com · zakaz@ideleon.com · +7-926-696-13-86 · +7-915-038-40-30", "3")], 22));

  const cols = calculator.offerColumns
    .map((column, index) => `<col min="${index + 1}" max="${index + 1}" width="${columnWidth(column)}" customWidth="1"/>`)
    .join("");

  const merges = [
    `<mergeCell ref="A1:${maxLetter}3"/>`,
    `<mergeCell ref="A4:${maxLetter}4"/>`,
    `<mergeCell ref="A5:${maxLetter}5"/>`,
    `<mergeCell ref="A6:${maxLetter}6"/>`,
    `<mergeCell ref="A7:${maxLetter}7"/>`,
    `<mergeCell ref="A${footerStart + 1}:${maxLetter}${footerStart + 1}"/>`,
    `<mergeCell ref="A${footerStart + 2}:${maxLetter}${footerStart + 2}"/>`,
    `<mergeCell ref="A${footerStart + 3}:${maxLetter}${footerStart + 3}"/>`,
    `<mergeCell ref="A${footerStart + 4}:${maxLetter}${footerStart + 4}"/>`,
  ];

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>
  <cols>${cols}</cols>
  <sheetData>${sheetRows.join("")}</sheetData>
  <mergeCells count="${merges.length}">${merges.join("")}</mergeCells>
  <pageMargins left="0.35" right="0.35" top="0.45" bottom="0.45" header="0.2" footer="0.2"/>
  <pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0" paperSize="9"/>
  <drawing r:id="rId1"/>
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

  const sheetRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;

  const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:oneCellAnchor>
    <xdr:from><xdr:col>0</xdr:col><xdr:colOff>80000</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>80000</xdr:rowOff></xdr:from>
    <xdr:ext cx="4700000" cy="1565000"/>
    <xdr:pic>
      <xdr:nvPicPr><xdr:cNvPr id="2" name="IDELEON logo"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>
      <xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
      <xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="4700000" cy="1565000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:oneCellAnchor>
</xdr:wsDr>`;

  const drawingRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>
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
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
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
    { name: "xl/worksheets/_rels/sheet1.xml.rels", data: stringToBytes(sheetRels) },
    { name: "xl/drawings/drawing1.xml", data: stringToBytes(drawingXml) },
    { name: "xl/drawings/_rels/drawing1.xml.rels", data: stringToBytes(drawingRels) },
    { name: "xl/media/image1.png", data: logoBytes },
    { name: "xl/styles.xml", data: stringToBytes(styles) },
  ]);

  return new Blob([zip], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}


function aggregateProjectRows(items: CalculatorProjectItem[]) {
  const map = new Map<string, CalculatorResultRow & { sourceCount: number }>();

  items.forEach((item) => {
    item.rows
      .filter((row) => row.includeInOffer !== false)
      .forEach((row) => {
        const key = [
          row.name,
          row.size ?? "",
          row.catalogName ?? "",
          row.lengthM ?? "",
          row.unit,
          row.priceUnit ?? row.unit,
          row.priceMode ?? "quantity",
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
  const logoBytes = await loadLogoBytes();
  const date = new Date().toLocaleDateString("ru-RU");
  const maxColumn = calculator.offerColumns.length;
  const maxLetter = letters(maxColumn);
  const sheetRows: string[] = [];
  const merges: string[] = [];
  let currentRow = 1;

  function pushBlank(height = 10) {
    sheetRows.push(rowXml(currentRow, [], height));
    currentRow += 1;
  }

  function pushMerged(value: string, style: string, height: number) {
    sheetRows.push(rowXml(currentRow, [cell(`A${currentRow}`, value, style)], height));
    merges.push(`<mergeCell ref="A${currentRow}:${maxLetter}${currentRow}"/>`);
    currentRow += 1;
  }

  function pushTableHeader() {
    const cells = calculator.offerColumns.map((column, index) =>
      cell(`${letters(index + 1)}${currentRow}`, column.title, "2"),
    );
    sheetRows.push(rowXml(currentRow, cells, 30));
    currentRow += 1;
  }

  function pushOfferRows(rows: CalculatorResultRow[]) {
    rows.forEach((row, index) => {
      const cells = calculator.offerColumns.map((column, colIndex) =>
        cellForColumn(calculator.offerColumns, column, row, currentRow, colIndex + 1, index + 1),
      );
      sheetRows.push(rowXml(currentRow, cells, 26));
      currentRow += 1;
    });
  }

  sheetRows.push(rowXml(currentRow, [], 38)); currentRow += 1;
  sheetRows.push(rowXml(currentRow, [], 38)); currentRow += 1;
  sheetRows.push(rowXml(currentRow, [], 38)); currentRow += 1;
  pushMerged("Единое коммерческое предложение / профиль для ГКЛ", "1", 34);
  pushMerged("ООО «ИДЕЛЕОН»", "3", 22);
  pushMerged(`Дата: ${date}`, "11", 22);
  pushMerged(`Объект / проект: ${projectName || "Проект ГКЛ"}`, "11", 24);
  pushMerged(`Количество сохранённых расчётов: ${items.length}`, "11", 22);
  pushBlank(10);

  pushMerged("СОСТАВ ПРОЕКТА", "10", 28);
  const projectSummaryHeader = [
    cell(`A${currentRow}`, "№", "2"),
    cell(`B${currentRow}`, "Конструкция", "2"),
    cell(`C${currentRow}`, "Параметры расчёта", "2"),
  ];
  sheetRows.push(rowXml(currentRow, projectSummaryHeader, 28));
  currentRow += 1;

  items.forEach((item, index) => {
    sheetRows.push(rowXml(currentRow, [
      numberCell(`A${currentRow}`, index + 1, "6"),
      cell(`B${currentRow}`, item.title, "8"),
      cell(`C${currentRow}`, item.paramsText, "8"),
    ], 30));
    merges.push(`<mergeCell ref="C${currentRow}:${maxLetter}${currentRow}"/>`);
    currentRow += 1;
  });

  items.forEach((item, index) => {
    pushBlank(10);
    pushMerged(`РАСЧЁТ №${index + 1} — ${item.title}`, "1", 32);
    pushMerged(item.paramsText, "11", 30);
    pushTableHeader();
    pushOfferRows(item.rows.filter((row) => row.includeInOffer !== false));
  });

  const summaryRows = aggregateProjectRows(items);
  pushBlank(12);
  pushMerged("ИТОГО К ЗАКАЗУ — СВОДНАЯ СПЕЦИФИКАЦИЯ", "1", 34);
  pushMerged("Одинаковые материалы суммированы только при полном совпадении наименования, размера, длины и единицы измерения.", "11", 28);
  pushTableHeader();
  const summaryDataStart = currentRow;
  pushOfferRows(summaryRows);
  const summaryDataEnd = currentRow - 1;

  const sumColumnIndex = columnSearchIndex(calculator.offerColumns, "sum");
  const totalRow = currentRow;
  if (summaryRows.length > 0) {
    const totalCells: string[] = [];
    totalCells.push(cell(`A${totalRow}`, "ОБЩАЯ СУММА", "10"));
    totalCells.push(formulaCell(
      `${letters(sumColumnIndex)}${totalRow}`,
      `SUM(${letters(sumColumnIndex)}${summaryDataStart}:${letters(sumColumnIndex)}${summaryDataEnd})`,
      "7",
    ));
    sheetRows.push(rowXml(totalRow, totalCells, 30));
    merges.push(`<mergeCell ref="A${totalRow}:${letters(sumColumnIndex - 1)}${totalRow}"/>`);
    currentRow += 1;
  }

  pushBlank(10);
  pushMerged("Заполняйте столбец «Цена» в нужных блоках или только в сводной спецификации. Столбец «Сумма» рассчитывается автоматически.", "3", 24);
  pushMerged("Все расчёты размещены на одном листе отдельными блоками. В конце листа находится суммарная спецификация для закупки.", "3", 24);
  pushMerged("Расчёт ориентировочный. Точную комплектацию рекомендуется проверить по проекту.", "3", 22);
  pushMerged("ООО «ИДЕЛЕОН» · ideleon.com · zakaz@ideleon.com · +7-926-696-13-86 · +7-915-038-40-30", "3", 22);

  const cols = calculator.offerColumns
    .map((column, index) => `<col min="${index + 1}" max="${index + 1}" width="${columnWidth(column)}" customWidth="1"/>`)
    .join("");

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>
  <cols>${cols}</cols>
  <sheetData>${sheetRows.join("")}</sheetData>
  <mergeCells count="${merges.length}">${merges.join("")}</mergeCells>
  <pageMargins left="0.35" right="0.35" top="0.45" bottom="0.45" header="0.2" footer="0.2"/>
  <pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0" paperSize="9"/>
  <drawing r:id="rId1"/>
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

  const sheetRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;

  const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:oneCellAnchor>
    <xdr:from><xdr:col>0</xdr:col><xdr:colOff>80000</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>80000</xdr:rowOff></xdr:from>
    <xdr:ext cx="4700000" cy="1565000"/>
    <xdr:pic>
      <xdr:nvPicPr><xdr:cNvPr id="2" name="IDELEON logo"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>
      <xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
      <xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="4700000" cy="1565000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:oneCellAnchor>
</xdr:wsDr>`;

  const drawingRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>
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
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
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
    { name: "xl/worksheets/_rels/sheet1.xml.rels", data: stringToBytes(sheetRels) },
    { name: "xl/drawings/drawing1.xml", data: stringToBytes(drawingXml) },
    { name: "xl/drawings/_rels/drawing1.xml.rels", data: stringToBytes(drawingRels) },
    { name: "xl/media/image1.png", data: logoBytes },
    { name: "xl/styles.xml", data: stringToBytes(styles) },
  ]);

  return new Blob([zip], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
