export type CalculatorFieldOption = {
  label: string;
  value: string;
};

export type CalculatorCondition = {
  fieldId: string;
  values: string[];
};

export type CalculatorField = {
  id: string;
  label: string;
  type: "number" | "text" | "buttons" | "select";
  defaultValue: string;
  unit?: string;
  options?: CalculatorFieldOption[];
  showWhen?: CalculatorCondition;
  hideInput?: boolean;
  step?: string;
};

export type CalculatorVisual = {
  title: string;
  description: string;
  image: string;
  alt: string;
  diagram?: string;
  diagramAlt?: string;
  fieldId?: string;
  value?: string;
  setValues?: Record<string, string>;
  activeWhen?: Record<string, string>;
  showWhen?: CalculatorCondition;
};

export type CalculatorVisualGroup = {
  title: string;
  description: string;
  visuals: CalculatorVisual[];
  showWhen?: CalculatorCondition;
};

export type OfferColumnKey =
  | "index"
  | "name"
  | "size"
  | "catalogName"
  | "lengthM"
  | "unit"
  | "coefficient"
  | "quantity"
  | "priceUnit"
  | "price"
  | "sum";

export type OfferColumn = {
  key: OfferColumnKey;
  title: string;
  width?: number;
};

export type CalculatorResultRow = {
  name: string;
  size?: string;
  catalogName?: string;
  lengthM?: number | null;
  unit: string;
  coefficient: string;
  quantity: number;
  quantityStep?: number;
  includeInOffer?: boolean;
  priceUnit?: string;
  priceMode?: "quantity" | "meter";
};

export type CalculatorConfig = {
  slug: string;
  group: "gkl" | "grilyato" | "cassette" | "metal" | "sandwich" | "blocks";
  title: string;
  shortTitle: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;
  offerTitle: string;
  fileName: string;
  fields: CalculatorField[];
  visuals: CalculatorVisual[];
  visualTitle?: string;
  visualDescription?: string;
  visualGroups?: CalculatorVisualGroup[];
  calculatorNote?: string;
  resultTitle?: string;
  resultMaterialTitle?: string;
  resultCoefficientTitle?: string;
  resultQuantityTitle?: string;
  resultMaxFractionDigits?: number;
  offerColumns: OfferColumn[];
  calculate: (values: Record<string, string>) => CalculatorResultRow[];
  getParamsText: (values: Record<string, string>) => string;
  getWarning?: (values: Record<string, string>) => string | null;
  normalizeValues?: (values: Record<string, string>, changedFieldId: string) => Record<string, string>;
  relatedLinks?: { label: string; href: string }[];
  seoSections: {
    title: string;
    text: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
};

function toNumber(value: string) {
  const normalized = String(value ?? "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function roundUp(value: number, step = 1) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value / step) * step;
}

function addReserve(value: number, reservePercent: number) {
  return value * (1 + reservePercent / 100);
}

function fmt(value: number) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
}

function reserve(values: Record<string, string>) {
  return Math.min(Math.max(toNumber(values.reserve), 0), 30);
}

function resultRow(row: Omit<CalculatorResultRow, "includeInOffer" | "quantityStep"> & { includeInOffer?: boolean; quantityStep?: number }) {
  return {
    includeInOffer: true,
    quantityStep: 1,
    priceUnit: row.unit,
    priceMode: "quantity" as const,
    ...row,
  };
}

function withReserveQuantity(quantity: number, values: Record<string, string>, step = 1) {
  return roundUp(addReserve(quantity, reserve(values)), step);
}

function profileLengthLabel(mm: string) {
  return `L=${mm} мм`;
}

const gklColumns: OfferColumn[] = [
  { key: "index", title: "№", width: 6 },
  { key: "name", title: "Наименование", width: 38 },
  { key: "lengthM", title: "Длина профиля", width: 16 },
  { key: "unit", title: "Ед. изм.", width: 12 },
  { key: "coefficient", title: "Коэффициент", width: 34 },
  { key: "quantity", title: "Количество", width: 15 },
  { key: "priceUnit", title: "Цена за", width: 12 },
  { key: "price", title: "Цена", width: 14 },
  { key: "sum", title: "Сумма", width: 16 },
];

const grilyatoColumns: OfferColumn[] = [
  { key: "index", title: "№", width: 6 },
  { key: "name", title: "Наименование элемента", width: 42 },
  { key: "size", title: "Размер", width: 18 },
  { key: "lengthM", title: "Длина, м", width: 13 },
  { key: "unit", title: "Ед. изм.", width: 12 },
  { key: "quantity", title: "Количество", width: 16 },
  { key: "priceUnit", title: "Цена за", width: 12 },
  { key: "price", title: "Цена", width: 14 },
  { key: "sum", title: "Сумма", width: 16 },
];

function gklWallArea(values: Record<string, string>) {
  if ((values.wallInputMode || "area") === "area") {
    return toNumber(values.wallArea);
  }
  return toNumber(values.wallHeight) * toNumber(values.wallLength);
}

function gklWallLength(values: Record<string, string>) {
  const height = toNumber(values.wallHeight);
  if ((values.wallInputMode || "area") === "area") {
    return height > 0 ? gklWallArea(values) / height : 0;
  }
  return toNumber(values.wallLength);
}

function normalizeGklValues(values: Record<string, string>, changedFieldId: string) {
  const next = { ...values };
  const type = next.constructionType || "ceiling";

  if (type === "ceiling") {
    next.wallInputMode = "none";
  } else if (changedFieldId === "constructionType" || next.wallInputMode === "none" || !next.wallInputMode) {
    next.wallInputMode = "area";
  }

  return next;
}

function gklCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const type = values.constructionType || "ceiling";
  const rows: CalculatorResultRow[] = [];
  const reserveValue = reserve(values);

  function push(name: string, unit: string, coefficient: string, quantity: number, profileLengthMm?: string | null) {
    rows.push(resultRow({
      name,
      unit,
      coefficient,
      quantity: roundUp(addReserve(quantity, reserveValue), unit === "шт." ? 1 : 0.01),
      lengthM: profileLengthMm ? Number(profileLengthMm) / 1000 : null,
      priceUnit: unit === "пог. м" ? "м.п." : unit,
      priceMode: "quantity",
    }));
  }

  if (type === "ceiling") {
    const area = toNumber(values.ceilingArea);
    const perimeter = toNumber(values.ceilingPerimeter);
    const length = values.ceilingProfileLengthMm || "3000";
    push("Лист ГКЛ", "м²", "Площадь потолка × 1", area);
    push(`Профиль ПП 60×27, ${profileLengthLabel(length)}`, "пог. м", "Площадь потолка × 2,9", area * 2.9, length);
    push("Профиль ППН 27×28", "пог. м", "Периметр потолка × 1", perimeter);
    push("Удлинитель ПП", "шт.", "Площадь потолка × 0,2", area * 0.2);
    push("Соединитель одноуровневый / краб", "шт.", "Площадь потолка × 1,7", area * 1.7);
    if ((values.suspensionType || "direct") === "direct") {
      push("Прямой подвес", "шт.", "Площадь потолка × 0,7", area * 0.7);
    } else {
      push("Анкерный подвес", "шт.", "Площадь потолка × 0,7", area * 0.7);
      push("Тяга подвеса", "шт.", "Площадь потолка × 0,7", area * 0.7);
    }
  }

  if (type === "cladding") {
    const area = gklWallArea(values);
    const length = values.ceilingProfileLengthMm || "3000";
    push("Лист ГКЛ", "м²", "Площадь стены × 1", area);
    push(`Профиль ПП 60×27, ${profileLengthLabel(length)}`, "пог. м", "Площадь стены × 2", area * 2, length);
    push("Профиль ППН 27×28", "пог. м", "Площадь стены × 0,7", area * 0.7);
    push("Прямой подвес", "шт.", "Площадь стены × 0,7", area * 0.7);
  }

  if (type === "partition") {
    const area = gklWallArea(values);
    const width = values.partitionWidth || "50";
    const length = values.studProfileLengthMm || "3000";
    const guideName = width === "50" ? "Профиль ПН 50×40" : width === "75" ? "Профиль ПН 75×40" : "Профиль ПН 100×40";
    const studName = width === "50" ? "Профиль ПС 50×50" : width === "75" ? "Профиль ПС 75×50" : "Профиль ПС 100×50";
    push("Лист ГКЛ", "м²", "Площадь перегородки × 2,1", area * 2.1);
    push(guideName, "пог. м", "Площадь перегородки × 0,7", area * 0.7);
    push(`${studName}, ${profileLengthLabel(length)}`, "пог. м", "Площадь перегородки × 2", area * 2, length);
  }

  return rows;
}

function gklParams(values: Record<string, string>) {
  const type = values.constructionType || "ceiling";
  if (type === "ceiling") {
    return `Потолок из ГКЛ; площадь потолка: ${values.ceilingArea} м²; периметр: ${values.ceilingPerimeter} м; подвес: ${(values.suspensionType || "direct") === "direct" ? "прямой" : "анкерный с тягой"}; длина ПП 60×27: ${values.ceilingProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
  }

  const area = gklWallArea(values);
  const length = gklWallLength(values);
  const inputMode = (values.wallInputMode || "area") === "area" ? "по площади и высоте" : "по длине и высоте";

  if (type === "cladding") {
    return `Выравнивание стены ГКЛ; исходные данные: ${inputMode}; высота: ${values.wallHeight} м; расчётная длина: ${fmt(length)} м; площадь: ${fmt(area)} м²; длина ПП 60×27: ${values.ceilingProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
  }

  return `Перегородка из ГКЛ; исходные данные: ${inputMode}; высота: ${values.wallHeight} м; расчётная длина: ${fmt(length)} м; площадь перегородки по одной стороне: ${fmt(area)} м²; профиль: ${values.partitionWidth} мм; длина стоечного профиля: ${values.studProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
}

const standardCellOptions = [
  "50×50", "60×60", "75×75", "86×86", "100×100", "120×120", "150×150", "200×200",
  "100×50", "150×50", "150×75", "180×60", "200×100", "50×200", "30×200", "50×50×100", "30-35-40-90", "1200 модель 10-1", "1200 модель 10-2",
];

function isModel10(cellSize: string) {
  return cellSize.includes("1200");
}

function isSmallCell(cellSize: string) {
  return cellSize === "50×50" || cellSize === "60×60" || cellSize === "75×75" || cellSize === "86×86";
}

function mamaCoeff(cellSize: string) {
  if (cellSize === "100×50") return 7;
  if (cellSize === "150×50") return 5;
  if (cellSize === "150×75") return 5;
  if (cellSize === "180×60") return 5;
  if (cellSize === "200×100") return 3;
  if (cellSize === "50×200") return 12;
  if (cellSize === "30×200") return 20;
  if (cellSize === "50×50×100") return 8;
  if (cellSize === "30-35-40-90") return 14;
  if (cellSize.includes("1200")) return 20;
  return 5;
}

function papaCoeff(cellSize: string) {
  if (cellSize === "100×50") return 7;
  if (cellSize === "150×50") return 5;
  if (cellSize === "150×75") return 5;
  if (cellSize === "180×60") return 5;
  if (cellSize === "200×100") return 3;
  if (cellSize === "50×200") return 3;
  if (cellSize === "30×200") return 3;
  if (cellSize === "50×50×100") return 8;
  if (cellSize === "30-35-40-90") return 14;
  if (cellSize.includes("1200")) return 20;
  return 5;
}

function grilyatoCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const area = toNumber(values.area);
  const perimeter = toNumber(values.perimeter);
  const cellSize = values.cellSize || "100×100";
  const type = values.grilyatoType || "standard";
  const reserveValue = reserve(values);
  const rows: CalculatorResultRow[] = [];

  function row(name: string, size: string, lengthM: number | null, unit: string, coefficient: string, qty: number, include = true, priceMode: "quantity" | "meter" = "quantity", priceUnit?: string) {
    rows.push(resultRow({
      name,
      size,
      lengthM,
      unit,
      coefficient,
      quantity: roundUp(addReserve(qty, reserveValue), unit === "м.п." ? 3 : 1),
      includeInOffer: include,
      priceMode,
      priceUnit: priceUnit || (priceMode === "meter" ? "м.п." : unit),
    }));
  }

  const latticeCoeff = isModel10(cellSize) ? 0.7 : 2.78;
  const latticeQty = roundUp(area * latticeCoeff, 1);
  row("Решётка", isModel10(cellSize) ? "1200×1200 мм" : "600×600 мм", null, "шт.", String(latticeCoeff), latticeQty, false);

  row("Профиль «мама»", "600 мм", 0.6, "шт.", `решётка × ${mamaCoeff(cellSize)}`, latticeQty * mamaCoeff(cellSize), true, "meter");
  row("Профиль «папа»", "600 мм", 0.6, "шт.", `решётка × ${papaCoeff(cellSize)}`, latticeQty * papaCoeff(cellSize), true, "meter");

  const n1Coeff = isSmallCell(cellSize) ? 0.7 : 0.35;
  row("Несущая направляющая L=2400 мм", "2400 мм", 2.4, "шт.", `площадь × ${n1Coeff}`, roundUp(area * n1Coeff, 1), true, "meter");
  if (!isSmallCell(cellSize)) {
    const n2Coeff = isModel10(cellSize) ? 0.7 : 1.39;
    row("Несущая направляющая L=1200 мм", "1200 мм", 1.2, "шт.", `площадь × ${n2Coeff}`, roundUp(area * n2Coeff, 1), true, "meter");
  }
  if (!isModel10(cellSize)) {
    const n3Coeff = isSmallCell(cellSize) ? 2.78 : 1.39;
    row("Несущая направляющая L=600 мм", "600 мм", 0.6, "шт.", `площадь × ${n3Coeff}`, roundUp(area * n3Coeff, 1), true, "meter");
  }
  const pgCoeff = isSmallCell(cellSize) ? 0.7 : 0.35;
  row("Соединительный элемент", "-", null, "шт.", `площадь × ${pgCoeff}`, roundUp(area * pgCoeff, 1), true, "quantity", "шт.");
  const hangerCoeff = isSmallCell(cellSize) ? 1.85 : 0.93;
  row("Подвес", "по проекту", null, "комп.", `площадь × ${hangerCoeff}`, roundUp(area * hangerCoeff, 10), true, "quantity", "комп.");
  row("Уголок", "3000 мм", null, "м.п.", "периметр", roundUp(perimeter, 3), true, "quantity", "м.п.");

  return rows;
}


function grilyatoParams(values: Record<string, string>) {
  return `Площадь: ${values.area} м²; периметр: ${values.perimeter} м; тип: ${values.grilyatoType}; ячейка: ${values.cellSize}; запас: ${values.reserve}%`;
}

function profileCoeff(cellSize: string) {
  if (cellSize === "50×50") return 20;
  if (cellSize === "60×60") return 16.67;
  if (cellSize === "75×75") return 13.33;
  if (cellSize === "86×86") return 11.63;
  if (cellSize === "100×100") return 10;
  if (cellSize === "120×120") return 8.33;
  if (cellSize === "150×150") return 6.67;
  return 5;
}

function glCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const area = toNumber(values.area);
  const perimeter = toNumber(values.perimeter);
  const cellSize = values.cellSize || "100×100";
  const schemeCoeff = values.mountScheme === "reinforced" ? 1.67 : 0.83;
  const reserveValue = reserve(values);
  const gridQty = roundUp(area * 2.78, 1);
  const coeff = profileCoeff(cellSize);
  const catalogName = values.glType === "GL24" ? "Т-24 GL24" : "Т-15 GL15";
  const rows: CalculatorResultRow[] = [];

  function row(name: string, size: string, lengthM: number | null, unit: string, coefficient: string, qty: number, priceMode: "quantity" | "meter" = "quantity", priceUnit?: string) {
    rows.push(resultRow({
      name, size, lengthM, unit, coefficient,
      quantity: roundUp(addReserve(qty, reserveValue), unit === "м.п." ? 3 : 1),
      priceMode,
      priceUnit: priceUnit || (priceMode === "meter" ? "м.п." : unit),
    }));
  }

  row("Решётка", "600×600 мм", null, "шт.", "площадь × 2,78", gridQty, "quantity", "шт.");
  row("Профиль «мама»", "600 мм", 0.6, "шт.", `решётка × ${coeff}`, gridQty * coeff, "meter");
  row("Профиль «папа»", "600 мм", 0.6, "шт.", `решётка × ${coeff}`, gridQty * coeff, "meter");
  row("Обрамляющий профиль", "600 мм", 0.6, "шт.", "решётка × 4", gridQty * 4, "meter");
  row("Несущая направляющая L=3700 мм", "3700 мм", 3.7, "м.п.", `${catalogName}; площадь × ${schemeCoeff}`, roundUp(area * schemeCoeff, 3.7), "quantity", "м.п.");
  if (values.mountScheme !== "reinforced") row("Поперечная направляющая L=1200 мм", "1200 мм", 1.2, "м.п.", "площадь × 1,67", roundUp(area * 1.67, 1.2), "quantity", "м.п.");
  row("Поперечная направляющая L=600 мм", "600 мм", 0.6, "м.п.", `площадь × ${schemeCoeff}`, roundUp(area * schemeCoeff, 0.6), "quantity", "м.п.");
  row("Подвес", "по проекту", null, "шт.", `площадь × ${schemeCoeff}`, roundUp(area * schemeCoeff, 10), "quantity", "шт.");
  row("Уголок", "3000 мм", null, "м.п.", "периметр", roundUp(perimeter, 3), "quantity", "м.п.");
  return rows;
}

function glParams(values: Record<string, string>) {
  return `Площадь: ${values.area} м²; периметр: ${values.perimeter} м; тип: ${values.glType}; ячейка: ${values.cellSize}; схема: ${values.mountScheme}; запас: ${values.reserve}%`;
}

function diagonalCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const area = toNumber(values.area);
  const perimeter = toNumber(values.perimeter);
  const schemeCoeff = values.mountScheme === "reinforced" ? 1.67 : 0.83;
  const reserveValue = reserve(values);
  const latticeQty = roundUp(area * 2.78, 1);
  const rows: CalculatorResultRow[] = [];

  function row(name: string, size: string, lengthM: number | null, unit: string, coefficient: string, qty: number, priceMode: "quantity" | "meter" = "quantity", priceUnit?: string) {
    rows.push(resultRow({
      name, size, lengthM, unit, coefficient,
      quantity: roundUp(addReserve(qty, reserveValue), unit === "м.п." ? 3 : 1),
      priceMode,
      priceUnit: priceUnit || (priceMode === "meter" ? "м.п." : unit),
    }));
  }

  row("Профиль «мама №1»", "600 мм", 0.6, "шт.", "решётка × 2", latticeQty * 2, "meter");
  row("Профиль «мама №2»", "600 мм", 0.6, "шт.", "решётка × 1", latticeQty, "meter");
  row("Профиль «папа №1»", "600 мм", 0.6, "шт.", "решётка × 2", latticeQty * 2, "meter");
  row("Профиль «папа №2»", "600 мм", 0.6, "шт.", "решётка × 1", latticeQty, "meter");
  row("Диагональный элемент D37×15", "403 мм", 0.403, "шт.", "решётка × 4", latticeQty * 4, "meter");
  row("Обрамляющий профиль", "600 мм", 0.6, "шт.", "решётка × 4", latticeQty * 4, "meter");
  row("Несущая направляющая L=3700 мм", "3700 мм", 3.7, "м.п.", `площадь × ${schemeCoeff}`, roundUp(area * schemeCoeff, 3.7), "quantity", "м.п.");
  if (values.mountScheme !== "reinforced") row("Поперечная направляющая L=1200 мм", "1200 мм", 1.2, "м.п.", "площадь × 1,67", roundUp(area * 1.67, 1.2), "quantity", "м.п.");
  row("Поперечная направляющая L=600 мм", "600 мм", 0.6, "м.п.", `площадь × ${schemeCoeff}`, roundUp(area * schemeCoeff, 0.6), "quantity", "м.п.");
  row("Подвес", "по проекту", null, "шт.", `площадь × ${schemeCoeff}`, roundUp(area * schemeCoeff, 10), "quantity", "шт.");
  row("Уголок", "3000 мм", null, "м.п.", "периметр", roundUp(perimeter, 3), "quantity", "м.п.");
  return rows;
}

function simpleAreaPerimeterParams(title: string) {
  return (values: Record<string, string>) => `${title}; площадь: ${values.area} м²; периметр: ${values.perimeter} м; запас: ${values.reserve}%`;
}

function triangleCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const area = toNumber(values.area);
  const perimeter = toNumber(values.perimeter);
  const reserveValue = reserve(values);
  const latticeQty = roundUp(area * 2.57, 1);
  const rows: CalculatorResultRow[] = [];

  function row(name: string, size: string, lengthM: number | null, unit: string, coefficient: string, qty: number, priceMode: "quantity" | "meter" = "quantity", priceUnit?: string) {
    rows.push(resultRow({
      name, size, lengthM, unit, coefficient,
      quantity: roundUp(addReserve(qty, reserveValue), unit === "м.п." ? 3 : 1),
      priceMode,
      priceUnit: priceUnit || (priceMode === "meter" ? "м.п." : unit),
    }));
  }

  row("Профиль «мама»", "750 мм", 0.75, "шт.", "решётка × 3", latticeQty * 3, "meter");
  row("Профиль «папа»", "600 мм", 0.6, "шт.", "решётка × 4", latticeQty * 4, "meter");
  row("Диагональный элемент D1", "600 мм", 0.6, "шт.", "решётка × 2", latticeQty * 2, "meter");
  row("Диагональный элемент D2", "450 мм", 0.45, "шт.", "решётка × 2", latticeQty * 2, "meter");
  row("Диагональный элемент D3", "300 мм", 0.3, "шт.", "решётка × 2", latticeQty * 2, "meter");
  row("Диагональный элемент D4", "150 мм", 0.15, "шт.", "решётка × 2", latticeQty * 2, "meter");
  row("Несущая направляющая №1 L=2400 мм", "2400 мм", 2.4, "шт.", "площадь × 0,65", roundUp(area * 0.65, 1), "meter");
  row("Несущая направляющая №2 L=750 мм", "750 мм", 0.75, "шт.", "площадь × 2,57", roundUp(area * 2.57, 1), "meter");
  row("Соединительный элемент", "-", null, "шт.", "площадь × 0,65", roundUp(area * 0.65, 1), "quantity", "шт.");
  row("Подвес", "по проекту", null, "комп.", "площадь × 1,54", roundUp(area * 1.54, 10), "quantity", "комп.");
  row("Обрамляющий профиль", "3000 мм", null, "м.п.", "периметр", roundUp(perimeter, 3), "quantity", "м.п.");
  return rows;
}



const cassetteColumns: OfferColumn[] = [
  { key: "index", title: "№", width: 6 },
  { key: "name", title: "Наименование элемента", width: 34 },
  { key: "size", title: "Размер", width: 17 },
  { key: "catalogName", title: "Название по каталогу", width: 38 },
  { key: "unit", title: "Ед. изм.", width: 12 },
  { key: "coefficient", title: "Расход", width: 22 },
  { key: "quantity", title: "Количество", width: 16 },
  { key: "priceUnit", title: "Цена за", width: 12 },
  { key: "price", title: "Цена", width: 14 },
  { key: "sum", title: "Сумма", width: 16 },
];

const cassetteModules = ["300×300", "300×600", "300×1200", "600×600", "600×1200"];
const microlookModules = ["300×600", "300×1200", "600×600", "600×1200"];

const systemClassLabels: Record<string, string> = {
  economy: "Эконом",
  standard: "Стандарт",
  premium: "Премиум",
  designer: "Дизайнерский",
};

function cassetteAreaCoefficient(module: string) {
  if (module === "300×300") return 11.11;
  if (module === "300×600") return 5.56;
  if (module === "300×1200") return 2.78;
  if (module === "600×600") return 2.78;
  return 1.39;
}

function cassetteStringerCoefficient(module: string) {
  return module.startsWith("300×") ? 3.33 : 1.67;
}

function orderQuantity(raw: number, reservePercent: number, step = 1) {
  const withoutReserve = roundUp(raw, step);
  return roundUp(withoutReserve * (1 + reservePercent / 100), step);
}

function cassetteBaseName(module: string) {
  if (module === "300×300") return "АР 300";
  if (module === "300×600") return "АР 300×600";
  if (module === "300×1200") return "АР 300×1200";
  if (module === "600×600") return "АР 600";
  return "АР 600×1200";
}

function microlookCatalogSize(module: string) {
  if (module === "600×600") return "600";
  return module.replace("×", "x");
}

function normalizeOpenCassetteValues(values: Record<string, string>, changedFieldId: string) {
  const next = { ...values };
  const designer = next.systemClass === "designer";

  if (designer) {
    next.edge = "microlook";
    if (!microlookModules.includes(next.module)) next.module = "600×600";
    if (next.edgeDrop !== "A6" && next.edgeDrop !== "A8") next.edgeDrop = "A6";
  } else if (next.edge === "microlook") {
    next.edge = "board";
  }

  if (changedFieldId === "edge" && next.edge === "microlook") {
    next.systemClass = "designer";
    if (!microlookModules.includes(next.module)) next.module = "600×600";
  }

  return next;
}

function isOpenCassetteCombinationValid(values: Record<string, string>) {
  const module = values.module || "600×600";
  const edge = values.edge || "board";
  const systemClass = values.systemClass || "standard";

  if (systemClass === "designer") {
    return edge === "microlook" && microlookModules.includes(module);
  }

  if (edge === "line" || edge === "tegular45") return module === "600×600";
  return edge === "board" || edge === "tegular90";
}

function openCassetteWarning(values: Record<string, string>) {
  if (isOpenCassetteCombinationValid(values)) return null;

  if ((values.systemClass || "standard") === "designer") {
    return "Для дизайнерской системы STRUNA применяются только специальные кассеты MICROLOOK 15 размеров 300×600, 300×1200, 600×600 и 600×1200 мм с опусканием A6 или A8.";
  }

  if (values.edge === "line") {
    return "Кромка LINE в исходном Excel-калькуляторе предусмотрена для кассеты 600×600 мм.";
  }

  if (values.edge === "tegular45") {
    return "Кромка TEGULAR 45° в исходном Excel-калькуляторе предусмотрена для кассеты 600×600 мм.";
  }

  return "Выбранное сочетание размера кассеты и кромки не предусмотрено исходным Excel-калькулятором.";
}

function openCassetteCatalogName(values: Record<string, string>) {
  if (!isOpenCassetteCombinationValid(values)) return "";
  const module = values.module || "600×600";
  const edge = values.edge || "board";
  const drop = values.edgeDrop || "A6";
  const base = cassetteBaseName(module);

  if ((values.systemClass || "standard") === "designer") {
    return `Панель STRONG MICROLOOK 15 ${microlookCatalogSize(module)}${drop}`;
  }

  if (edge === "board") return `${base} "BOARD"`;
  if (edge === "line") return `${base} "LINE"`;
  if (edge === "tegular45") return `${base}${drop}/45`;
  return `${base}${drop}/90`;
}

function openSystemCatalogName(systemClass: string, element: string) {
  const classLabel = systemClassLabels[systemClass] || systemClassLabels.standard;
  if (systemClass === "designer") {
    return element === "main"
      ? "Дизайнерская Т-система 15 мм ALBES STRUNA"
      : "Поперечный профиль ALBES STRUNA";
  }
  return `Т-система класса «${classLabel}»`;
}

function openCassetteCalculate(values: Record<string, string>): CalculatorResultRow[] {
  if (!isOpenCassetteCombinationValid(values)) return [];

  const area = toNumber(values.area);
  const perimeter = toNumber(values.perimeter);
  const module = values.module || "600×600";
  const edge = values.edge || "board";
  const scheme = values.mountScheme || "standard";
  const systemClass = values.systemClass || "standard";
  const reserveValue = reserve(values);
  const rows: CalculatorResultRow[] = [];

  function push(row: CalculatorResultRow) {
    rows.push(resultRow(row));
  }

  const cassetteCoeff = cassetteAreaCoefficient(module);
  push({
    name: "Кассета",
    size: module,
    catalogName: openCassetteCatalogName(values),
    unit: "шт.",
    coefficient: `площадь × ${String(cassetteCoeff).replace(".", ",")}`,
    quantity: orderQuantity(area * cassetteCoeff, reserveValue, 1),
    priceUnit: "шт.",
    priceMode: "quantity",
  });

  let mainCoeff = scheme === "reinforced" ? 1.67 : 0.83;
  if (module === "300×1200" && scheme === "reinforced") mainCoeff = 3.33;
  const mainLength = systemClass === "designer" ? 3.6 : 3.7;

  push({
    name: "Несущая направляющая",
    size: `${mainLength.toFixed(1).replace(".", ",")} м`,
    catalogName: openSystemCatalogName(systemClass, "main"),
    lengthM: mainLength,
    unit: "м.п.",
    coefficient: `площадь × ${String(mainCoeff).replace(".", ",")}`,
    quantity: orderQuantity(area * mainCoeff, reserveValue, mainLength),
    priceUnit: "м.п.",
    priceMode: "quantity",
  });

  let cross1200: number | null = null;
  if (scheme === "standard") {
    if (module === "300×300" || module === "300×600" || module === "600×600" || module === "600×1200") cross1200 = 1.67;
    if (module === "300×1200") cross1200 = 2.78;
  }
  if (cross1200) {
    push({
      name: "Поперечная направляющая",
      size: "1,2 м",
      catalogName: openSystemCatalogName(systemClass, "cross"),
      lengthM: 1.2,
      unit: "м.п.",
      coefficient: `площадь × ${String(cross1200).replace(".", ",")}`,
      quantity: orderQuantity(area * cross1200, reserveValue, 1.2),
      priceUnit: "м.п.",
      priceMode: "quantity",
    });
  }

  let cross600: number | null = null;
  if (module === "300×300" || module === "300×600") cross600 = scheme === "reinforced" ? 3.33 : 2.55;
  if (module === "600×600") cross600 = scheme === "reinforced" ? 1.67 : 0.83;
  if (module === "600×1200" && scheme === "reinforced") cross600 = 0.83;
  if (cross600) {
    push({
      name: "Поперечная направляющая",
      size: "0,6 м",
      catalogName: openSystemCatalogName(systemClass, "cross"),
      lengthM: 0.6,
      unit: "м.п.",
      coefficient: `площадь × ${String(cross600).replace(".", ",")}`,
      quantity: orderQuantity(area * cross600, reserveValue, 0.6),
      priceUnit: "м.п.",
      priceMode: "quantity",
    });
  }

  let cross300: number | null = null;
  if (module === "300×300") cross300 = 1.67;
  if (module === "300×1200" && scheme === "reinforced") cross300 = 0.83;
  if (cross300) {
    push({
      name: "Поперечная направляющая",
      size: "0,3 м",
      catalogName: openSystemCatalogName(systemClass, "cross"),
      lengthM: 0.3,
      unit: "м.п.",
      coefficient: `площадь × ${String(cross300).replace(".", ",")}`,
      quantity: orderQuantity(area * cross300, reserveValue, 0.3),
      priceUnit: "м.п.",
      priceMode: "quantity",
    });
  }

  const angleCatalog = systemClass === "designer" || edge === "board" || edge === "line" ? "PL" : "PLL";
  push({
    name: "Уголок",
    size: "3 м",
    catalogName: angleCatalog,
    lengthM: 3,
    unit: "м.п.",
    coefficient: "периметр",
    quantity: orderQuantity(perimeter, reserveValue, 3),
    priceUnit: "м.п.",
    priceMode: "quantity",
  });

  const hangerCoeff = module === "300×300" ? 1.39 : 0.83;
  push({
    name: "Подвес",
    size: "по проекту",
    catalogName: "АП",
    unit: "комп.",
    coefficient: `площадь × ${String(hangerCoeff).replace(".", ",")}`,
    quantity: orderQuantity(area * hangerCoeff, reserveValue, 10),
    priceUnit: "комп.",
    priceMode: "quantity",
  });

  return rows;
}

function openCassetteParams(values: Record<string, string>) {
  const edgeLabels: Record<string, string> = {
    board: "BOARD — прямоугольная приподнятая",
    line: "LINE — прямоугольная одноуровневая",
    tegular45: `TEGULAR 45° — с опусканием ${values.edgeDrop || "A6"}`,
    tegular90: `TEGULAR 90° — с опусканием ${values.edgeDrop || "A6"}`,
    microlook: `MICROLOOK 15 — с опусканием ${values.edgeDrop || "A6"}`,
  };
  const scheme = values.mountScheme === "reinforced" ? "усиленная" : "стандартная";
  const classLabel = systemClassLabels[values.systemClass || "standard"];

  return `Открытая подвесная система; площадь: ${values.area} м²; периметр: ${values.perimeter} м; класс системы: ${classLabel}; кассета: ${values.module}; кромка: ${edgeLabels[values.edge]}; схема: ${scheme}; запас: ${values.reserve}%`;
}

function hiddenCassetteCombinationValid(values: Record<string, string>) {
  const module = values.module || "600×600";
  const edge = values.hiddenEdge || "90";
  return edge === "90" || (edge === "45" && module === "600×600");
}

function hiddenCassetteWarning(values: Record<string, string>) {
  return hiddenCassetteCombinationValid(values)
    ? null
    : "Кромка 45° предусмотрена исходными Excel-калькуляторами только для кассеты 600×600 мм. Выберите кромку 90° или измените размер кассеты.";
}

function hiddenCassetteCatalogName(values: Record<string, string>) {
  if (!hiddenCassetteCombinationValid(values)) return "";
  const module = values.module || "600×600";
  const edge = values.hiddenEdge || "90";
  return `${cassetteBaseName(module)} АС/${edge}`;
}

function hiddenCassetteCalculate(values: Record<string, string>): CalculatorResultRow[] {
  if (!hiddenCassetteCombinationValid(values)) return [];

  const area = toNumber(values.area);
  const perimeter = toNumber(values.perimeter);
  const module = values.module || "600×600";
  const scheme = values.hiddenMountScheme || "simple";
  const reserveValue = reserve(values);
  const coeff = cassetteStringerCoefficient(module);
  const rows: CalculatorResultRow[] = [];

  function push(row: CalculatorResultRow) {
    rows.push(resultRow(row));
  }

  const cassetteCoeff = cassetteAreaCoefficient(module);
  push({
    name: "Кассета",
    size: module,
    catalogName: hiddenCassetteCatalogName(values),
    unit: "шт.",
    coefficient: `площадь × ${String(cassetteCoeff).replace(".", ",")}`,
    quantity: orderQuantity(area * cassetteCoeff, reserveValue, 1),
    priceUnit: "шт.",
    priceMode: "quantity",
  });

  push({
    name: "Стрингер",
    size: "4 м",
    catalogName: "ВТ-600",
    lengthM: 4,
    unit: "м.п.",
    coefficient: `площадь × ${String(coeff).replace(".", ",")}`,
    quantity: orderQuantity(area * coeff, reserveValue, 4),
    priceUnit: "м.п.",
    priceMode: "quantity",
  });

  if (scheme === "reinforced") {
    push({ name: "Потолочный профиль", size: "3 м", catalogName: "ПП-1-2 (47×26)", lengthM: 3, unit: "м.п.", coefficient: "площадь × 1", quantity: orderQuantity(area, reserveValue, 3), priceUnit: "м.п.", priceMode: "quantity" });
    push({ name: "Потолочный профиль направляющий", size: "3 м", catalogName: "ППН-2 (30×20)", lengthM: 3, unit: "м.п.", coefficient: "периметр", quantity: orderQuantity(perimeter, reserveValue, 3), priceUnit: "м.п.", priceMode: "quantity" });
    push({ name: "Соединитель двухуровневый", size: "—", catalogName: "Соединитель двухуровневый для ПП-1-2", unit: "шт.", coefficient: `площадь × ${String(coeff).replace(".", ",")}`, quantity: orderQuantity(area * coeff, reserveValue, 1), priceUnit: "шт.", priceMode: "quantity" });
    push({ name: "Уголок", size: "3 м", catalogName: "PL", lengthM: 3, unit: "м.п.", coefficient: "периметр", quantity: orderQuantity(perimeter, reserveValue, 3), priceUnit: "м.п.", priceMode: "quantity" });
    push({ name: "Подвес анкерный", size: "по проекту", catalogName: "Подвес с зажимом для ПП-1-2", unit: "шт.", coefficient: "площадь × 1,67", quantity: orderQuantity(area * 1.67, reserveValue, 10), priceUnit: "шт.", priceMode: "quantity" });
    push({ name: "Тяга подвеса", size: "по проекту", catalogName: "Ø4", unit: "шт.", coefficient: "площадь × 1,67", quantity: orderQuantity(area * 1.67, reserveValue, 10), priceUnit: "шт.", priceMode: "quantity" });
  } else {
    push({ name: "Уголок", size: "3 м", catalogName: "PL", lengthM: 3, unit: "м.п.", coefficient: "периметр", quantity: orderQuantity(perimeter, reserveValue, 3), priceUnit: "м.п.", priceMode: "quantity" });
    push({ name: "Верхняя часть нониусного подвеса", size: "по проекту", catalogName: "Верхняя часть нониусного подвеса", unit: "шт.", coefficient: `площадь × ${String(coeff).replace(".", ",")}`, quantity: orderQuantity(area * coeff, reserveValue, 10), priceUnit: "шт.", priceMode: "quantity" });
    push({ name: "Нижняя часть нониусного подвеса", size: "по проекту", catalogName: "Нижняя часть нониусного подвеса для ВТ-600", unit: "шт.", coefficient: `площадь × ${String(coeff).replace(".", ",")}`, quantity: orderQuantity(area * coeff, reserveValue, 10), priceUnit: "шт.", priceMode: "quantity" });
    push({ name: "Шплинт нониусный", size: "по проекту", catalogName: "Шплинт нониусный", unit: "шт.", coefficient: `площадь × ${String(coeff).replace(".", ",")}`, quantity: orderQuantity(area * coeff, reserveValue, 10), priceUnit: "шт.", priceMode: "quantity" });
  }

  return rows;
}

function hiddenCassetteParams(values: Record<string, string>) {
  const scheme = values.hiddenMountScheme === "reinforced" ? "усиленный монтаж" : "простой монтаж";
  return `Закрытая подвесная система; ${scheme}; площадь: ${values.area} м²; периметр: ${values.perimeter} м; кассета: ${values.module}; кромка: ${values.hiddenEdge}°; стрингер ВТ-600 длиной 4 м; запас: ${values.reserve}%`;
}



const metalLongProductTypes = [
  "rebar", "round", "square", "hexagon", "strip", "roundPipe",
  "squareTube", "rectTube", "angle", "channel", "beam",
];

const rebarMassKgM: Record<string, number> = {
  "6": 0.222, "8": 0.395, "10": 0.617, "12": 0.888, "14": 1.208,
  "16": 1.578, "18": 1.998, "20": 2.466, "22": 2.984, "25": 3.853,
  "28": 4.834, "32": 6.313, "36": 7.99, "40": 9.865,
};

const equalAngleMassKgM: Record<string, number> = {
  "20×20×3": 0.89, "20×20×4": 1.15, "25×25×3": 1.12, "25×25×4": 1.46,
  "32×32×3": 1.46, "32×32×4": 1.91, "35×35×4": 2.10,
  "40×40×3": 1.85, "40×40×4": 2.42, "40×40×5": 2.98,
  "45×45×4": 2.73, "45×45×5": 3.37,
  "50×50×4": 3.05, "50×50×5": 3.77, "50×50×6": 4.47,
  "63×63×5": 4.81, "63×63×6": 5.72, "63×63×8": 7.46,
  "70×70×5": 5.38, "70×70×6": 6.39, "70×70×7": 7.39, "70×70×8": 8.37,
  "75×75×5": 5.80, "75×75×6": 6.89, "75×75×8": 9.02,
  "80×80×6": 7.36, "80×80×8": 9.65,
  "90×90×6": 8.33, "90×90×7": 9.64, "90×90×8": 10.93,
  "100×100×7": 10.79, "100×100×8": 12.25, "100×100×10": 15.10,
};

const channelPMassKgM: Record<string, number> = {
  "5П": 4.84, "6,5П": 5.90, "8П": 7.05, "10П": 8.59,
  "12П": 10.40, "14П": 12.30, "16П": 14.20, "18П": 16.30,
  "20П": 18.40, "22П": 21.00, "24П": 24.00, "27П": 27.70,
  "30П": 31.80, "33П": 36.50, "36П": 41.90, "40П": 48.30,
};

const iBeamMassKgM: Record<string, number> = {
  "10": 9.46, "12": 11.50, "14": 13.70, "16": 15.90,
  "18": 18.40, "20": 21.00, "22": 24.00, "24": 27.30,
  "27": 31.50, "30": 36.50, "33": 42.20, "36": 48.60,
  "40": 57.00, "45": 66.50, "50": 78.50, "55": 92.60, "60": 108.00,
};

const metalProductLabels: Record<string, string> = {
  rebar: "Арматура А500С",
  round: "Круг стальной",
  square: "Квадрат стальной",
  hexagon: "Шестигранник стальной",
  strip: "Полоса стальная",
  sheet: "Лист стальной горячекатаный",
  roundPipe: "Труба стальная круглая",
  squareTube: "Труба профильная квадратная",
  rectTube: "Труба профильная прямоугольная",
  angle: "Уголок равнополочный",
  channel: "Швеллер серии П",
  beam: "Двутавр горячекатаный",
};

function metalProductName(values: Record<string, string>) {
  const product = values.productType || "rebar";
  if (product === "rebar") return `Арматура ${values.rebarClass || "А500С"}`;
  return metalProductLabels[product] || "Металлопрокат";
}

function metalStandardLabel(values: Record<string, string>) {
  const product = values.productType || "rebar";
  const standard = metalProductStandards[product] || "теоретический расчёт";
  if (product === "rebar") return standard;
  return `${standard}; сталь: ${values.steelGrade || "Ст3сп/пс5"}`;
}

const metalProductStandards: Record<string, string> = {
  rebar: "ГОСТ 34028-2016",
  round: "геометрический расчёт, ρ=7850 кг/м³",
  square: "геометрический расчёт, ρ=7850 кг/м³",
  hexagon: "геометрический расчёт, ρ=7850 кг/м³",
  strip: "геометрический расчёт, ρ=7850 кг/м³",
  sheet: "геометрический расчёт, ρ=7850 кг/м³",
  roundPipe: "формула теоретической массы круглой трубы",
  squareTube: "формула теоретической массы профильной трубы",
  rectTube: "формула теоретической массы профильной трубы",
  angle: "ГОСТ 8509-93",
  channel: "ГОСТ 8240-97, серия П",
  beam: "ГОСТ 8239-89",
};

function metalNumber(value: string | undefined) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function metalRound(value: number, digits = 3) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function metalSizeLabel(values: Record<string, string>) {
  const product = values.productType || "rebar";
  if (product === "rebar") return `Ø${values.rebarDiameter || "12"} мм`;
  if (product === "round") return `Ø${values.roundDiameter || "20"} мм`;
  if (product === "square") return `${values.squareSide || "20"}×${values.squareSide || "20"} мм`;
  if (product === "hexagon") return `S=${values.hexAcrossFlats || "20"} мм`;
  if (product === "strip") return `${values.stripWidth || "40"}×${values.stripThickness || "4"} мм`;
  if (product === "sheet") return `${values.sheetThickness || "4"}×${values.sheetWidth || "1500"}×${values.sheetLength || "6000"} мм`;
  if (product === "roundPipe") return `Ø${values.roundPipeDiameter || "57"}×${values.roundPipeWall || "3,5"} мм`;
  if (product === "squareTube") return `${values.squareTubeSide || "40"}×${values.squareTubeSide || "40"}×${values.squareTubeWall || "2"} мм`;
  if (product === "rectTube") return `${values.rectTubeWidth || "60"}×${values.rectTubeHeight || "40"}×${values.rectTubeWall || "2"} мм`;
  if (product === "angle") return values.angleSize || "50×50×5";
  if (product === "channel") return values.channelSize || "12П";
  return `№${values.beamSize || "20"}`;
}

function metalKgPerMeter(values: Record<string, string>) {
  const product = values.productType || "rebar";
  if (product === "rebar") return rebarMassKgM[values.rebarDiameter || "12"] || 0;
  if (product === "round") {
    const d = metalNumber(values.roundDiameter);
    return 0.006165 * d * d;
  }
  if (product === "square") {
    const a = metalNumber(values.squareSide);
    return 0.00785 * a * a;
  }
  if (product === "hexagon") {
    const s = metalNumber(values.hexAcrossFlats);
    return 0.006798 * s * s;
  }
  if (product === "strip") {
    return 0.00785 * metalNumber(values.stripWidth) * metalNumber(values.stripThickness);
  }
  if (product === "roundPipe") {
    const d = metalNumber(values.roundPipeDiameter);
    const t = metalNumber(values.roundPipeWall);
    return 0.02466 * t * (d - t);
  }
  if (product === "squareTube") {
    const a = metalNumber(values.squareTubeSide);
    const t = metalNumber(values.squareTubeWall);
    return 0.0157 * t * (2 * a - 2.86 * t);
  }
  if (product === "rectTube") {
    const a = metalNumber(values.rectTubeWidth);
    const b = metalNumber(values.rectTubeHeight);
    const t = metalNumber(values.rectTubeWall);
    return 0.0157 * t * (a + b - 2.86 * t);
  }
  if (product === "angle") return equalAngleMassKgM[values.angleSize || "50×50×5"] || 0;
  if (product === "channel") return channelPMassKgM[values.channelSize || "12П"] || 0;
  if (product === "beam") return iBeamMassKgM[values.beamSize || "20"] || 0;
  return 0;
}

function metalLongTotals(values: Record<string, string>) {
  const kgPerM = metalKgPerMeter(values);
  const pieceLength = metalNumber(values.pieceLength) || 12;
  const mode = values.longInputMode || "length";
  let exactLengthM = 0;
  let exactWeightT = 0;
  let exactPieces = 0;

  if (mode === "weight") {
    exactWeightT = metalNumber(values.inputWeightT);
    exactLengthM = kgPerM > 0 ? exactWeightT * 1000 / kgPerM : 0;
    exactPieces = pieceLength > 0 ? exactLengthM / pieceLength : 0;
  } else if (mode === "pieces") {
    exactPieces = metalNumber(values.inputPieces);
    exactLengthM = exactPieces * pieceLength;
    exactWeightT = exactLengthM * kgPerM / 1000;
  } else {
    exactLengthM = metalNumber(values.inputLengthM);
    exactWeightT = exactLengthM * kgPerM / 1000;
    exactPieces = pieceLength > 0 ? exactLengthM / pieceLength : 0;
  }

  const orderPieces = Math.ceil(exactPieces - 1e-9);
  const orderLengthM = orderPieces * pieceLength;
  const orderWeightT = orderLengthM * kgPerM / 1000;
  return { kgPerM, pieceLength, exactLengthM, exactWeightT, exactPieces, orderPieces, orderLengthM, orderWeightT };
}

function metalSheetTotals(values: Record<string, string>) {
  const thickness = metalNumber(values.sheetThickness);
  const widthM = metalNumber(values.sheetWidth) / 1000;
  const lengthM = metalNumber(values.sheetLength) / 1000;
  const areaPerSheet = widthM * lengthM;
  const kgPerSheet = thickness * areaPerSheet * 7.85;
  const mode = values.sheetInputMode || "sheets";
  let exactSheets = 0;
  let exactAreaM2 = 0;
  let exactWeightT = 0;

  if (mode === "area") {
    exactAreaM2 = metalNumber(values.inputAreaM2);
    exactSheets = areaPerSheet > 0 ? exactAreaM2 / areaPerSheet : 0;
    exactWeightT = exactAreaM2 * thickness * 7.85 / 1000;
  } else if (mode === "weight") {
    exactWeightT = metalNumber(values.inputSheetWeightT);
    exactSheets = kgPerSheet > 0 ? exactWeightT * 1000 / kgPerSheet : 0;
    exactAreaM2 = exactSheets * areaPerSheet;
  } else {
    exactSheets = metalNumber(values.inputSheetCount);
    exactAreaM2 = exactSheets * areaPerSheet;
    exactWeightT = exactSheets * kgPerSheet / 1000;
  }

  const orderSheets = Math.ceil(exactSheets - 1e-9);
  const orderAreaM2 = orderSheets * areaPerSheet;
  const orderWeightT = orderSheets * kgPerSheet / 1000;
  return { thickness, areaPerSheet, kgPerSheet, exactSheets, exactAreaM2, exactWeightT, orderSheets, orderAreaM2, orderWeightT };
}

const metalColumns: OfferColumn[] = [
  { key: "index", title: "№", width: 6 },
  { key: "name", title: "Наименование", width: 38 },
  { key: "size", title: "Размер", width: 24 },
  { key: "catalogName", title: "Норматив / метод", width: 30 },
  { key: "coefficient", title: "Расчётные параметры", width: 42 },
  { key: "unit", title: "Ед. изм.", width: 12 },
  { key: "quantity", title: "Количество", width: 16 },
  { key: "priceUnit", title: "Цена за", width: 12 },
  { key: "price", title: "Цена", width: 14 },
  { key: "sum", title: "Сумма", width: 16 },
];

function metalCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const product = values.productType || "rebar";
  const productName = metalProductName(values);
  const size = metalSizeLabel(values);
  const standard = metalStandardLabel(values);

  if (product === "sheet") {
    const totals = metalSheetTotals(values);
    const rows: CalculatorResultRow[] = [
      resultRow({
        name: productName,
        size,
        catalogName: standard,
        unit: "т",
        coefficient: `1 лист = ${fmt(totals.kgPerSheet)} кг; к заказу ${totals.orderSheets} шт.`,
        quantity: metalRound(totals.orderWeightT, 4),
        priceUnit: "т",
        priceMode: "quantity",
      }),
      resultRow({ name: "Масса одного листа", size, unit: "кг", coefficient: "толщина × площадь × 7,85", quantity: metalRound(totals.kgPerSheet, 3), includeInOffer: false }),
      resultRow({ name: "Площадь одного листа", size, unit: "м²", coefficient: "ширина × длина", quantity: metalRound(totals.areaPerSheet, 3), includeInOffer: false }),
      resultRow({ name: "Расчётное количество листов", size, unit: "шт.", coefficient: "без округления", quantity: metalRound(totals.exactSheets, 3), includeInOffer: false }),
      resultRow({ name: "Количество целых листов к заказу", size, unit: "шт.", coefficient: "округление вверх", quantity: totals.orderSheets, includeInOffer: false }),
      resultRow({ name: "Расчётная площадь", size, unit: "м²", coefficient: "без округления", quantity: metalRound(totals.exactAreaM2, 3), includeInOffer: false }),
      resultRow({ name: "Расчётная масса", size, unit: "т", coefficient: "без округления до целых листов", quantity: metalRound(totals.exactWeightT, 4), includeInOffer: false }),
    ];
    return rows;
  }

  const totals = metalLongTotals(values);
  return [
    resultRow({
      name: productName,
      size,
      catalogName: standard,
      unit: "т",
      coefficient: `1 м = ${fmt(totals.kgPerM)} кг; ${totals.orderPieces} шт. × ${fmt(totals.pieceLength)} м`,
      quantity: metalRound(totals.orderWeightT, 4),
      priceUnit: "т",
      priceMode: "quantity",
    }),
    resultRow({ name: "Теоретическая масса одного метра", size, unit: "кг/м", coefficient: standard, quantity: metalRound(totals.kgPerM, 3), includeInOffer: false }),
    resultRow({ name: "Расчётная общая длина", size, unit: "м", coefficient: "без округления до целых штук", quantity: metalRound(totals.exactLengthM, 3), includeInOffer: false }),
    resultRow({ name: "Расчётная масса", size, unit: "т", coefficient: "без округления до целых штук", quantity: metalRound(totals.exactWeightT, 4), includeInOffer: false }),
    resultRow({ name: "Расчётное количество штук", size, unit: "шт.", coefficient: `длина одной штуки ${fmt(totals.pieceLength)} м`, quantity: metalRound(totals.exactPieces, 3), includeInOffer: false }),
    resultRow({ name: "Количество целых штук к заказу", size, unit: "шт.", coefficient: "округление вверх", quantity: totals.orderPieces, includeInOffer: false }),
    resultRow({ name: "Длина целых штук к заказу", size, unit: "м", coefficient: `${totals.orderPieces} шт. × ${fmt(totals.pieceLength)} м`, quantity: metalRound(totals.orderLengthM, 3), includeInOffer: false }),
  ];
}

function metalParams(values: Record<string, string>) {
  const product = values.productType || "rebar";
  const productName = metalProductName(values);
  const size = metalSizeLabel(values);
  if (product === "sheet") {
    const totals = metalSheetTotals(values);
    return `${productName}; марка стали: ${values.steelGrade || "Ст3сп/пс5"}; размер: ${size}; расчётно ${fmt(totals.exactSheets)} лист.; к заказу ${totals.orderSheets} лист.; площадь ${fmt(totals.exactAreaM2)} м²; масса к заказу ${fmt(totals.orderWeightT)} т.`;
  }
  const totals = metalLongTotals(values);
  const gradeText = product === "rebar" ? `класс ${values.rebarClass || "А500С"}` : `марка стали ${values.steelGrade || "Ст3сп/пс5"}`;
  return `${productName}; ${gradeText}; размер: ${size}; теоретическая масса ${fmt(totals.kgPerM)} кг/м; длина одной штуки ${fmt(totals.pieceLength)} м; расчётная длина ${fmt(totals.exactLengthM)} м; к заказу ${totals.orderPieces} шт.; масса к заказу ${fmt(totals.orderWeightT)} т.`;
}

function metalWarning(values: Record<string, string>) {
  const product = values.productType || "rebar";
  if (product === "sheet") {
    if (!metalNumber(values.sheetThickness) || !metalNumber(values.sheetWidth) || !metalNumber(values.sheetLength)) {
      return "Укажите положительные значения толщины, ширины и длины листа.";
    }
    return null;
  }
  if (!metalNumber(values.pieceLength)) return "Укажите длину одной штуки больше нуля.";
  if (product === "roundPipe") {
    const d = metalNumber(values.roundPipeDiameter);
    const t = metalNumber(values.roundPipeWall);
    if (!d || !t || t * 2 >= d) return "Толщина стенки круглой трубы должна быть меньше половины наружного диаметра.";
  }
  if (product === "squareTube") {
    const a = metalNumber(values.squareTubeSide);
    const t = metalNumber(values.squareTubeWall);
    if (!a || !t || t * 2 >= a) return "Толщина стенки квадратной трубы должна быть меньше половины стороны.";
  }
  if (product === "rectTube") {
    const a = metalNumber(values.rectTubeWidth);
    const b = metalNumber(values.rectTubeHeight);
    const t = metalNumber(values.rectTubeWall);
    if (!a || !b || !t || t * 2 >= Math.min(a, b)) return "Толщина стенки прямоугольной трубы должна быть меньше половины меньшей стороны.";
  }
  if (metalKgPerMeter(values) <= 0) return "Проверьте размеры изделия: теоретическая масса должна быть больше нуля.";
  return null;
}


function normalizeMetalValues(values: Record<string, string>) {
  const next = { ...values };
  const product = next.productType || "rebar";
  if (product === "sheet") {
    next.longInputMode = "none";
    if (!["sheets", "area", "weight"].includes(next.sheetInputMode)) next.sheetInputMode = "sheets";
  } else {
    next.sheetInputMode = "none";
    if (!["length", "weight", "pieces"].includes(next.longInputMode)) next.longInputMode = "length";
  }
  return next;
}

const metalProductValues = ["rebar", "round", "square", "hexagon", "strip", "sheet", "roundPipe", "squareTube", "rectTube", "angle", "channel", "beam"];
const metalNonRebarValues = metalProductValues.filter((value) => value !== "rebar");
const metalLongCondition: CalculatorCondition = { fieldId: "productType", values: metalLongProductTypes };



const sandwichColumns: OfferColumn[] = [
  { key: "index", title: "№", width: 6 },
  { key: "name", title: "Наименование", width: 38 },
  { key: "size", title: "Параметр", width: 22 },
  { key: "unit", title: "Ед. изм.", width: 12 },
  { key: "coefficient", title: "Основание расчёта", width: 30 },
  { key: "quantity", title: "Количество", width: 15 },
  { key: "priceUnit", title: "Цена за", width: 12 },
  { key: "price", title: "Цена", width: 14 },
  { key: "sum", title: "Сумма", width: 16 },
];

function sandwichNumber(value: string | undefined) {
  return toNumber(String(value ?? ""));
}
function sandwichScopeLabel(scope: string) {
  return scope === "wall" ? "Только стены" : scope === "roof" ? "Только кровля" : "Здание целиком";
}
function sandwichRoofTypeLabel(type: string) {
  return type === "single" ? "Односкатная" : "Двускатная";
}
function sandwichRoofSlopeLength(values: Record<string, string>) {
  const width = sandwichNumber(values.buildingWidth);
  const slopeDeg = Math.max(sandwichNumber(values.roofPitchDeg), 1);
  const rad = slopeDeg * Math.PI / 180;
  if ((values.roofType || "gable") === "single") return width / Math.cos(rad);
  return (width / 2) / Math.cos(rad);
}
function sandwichWallAreaNet(values: Record<string, string>) {
  const length = sandwichNumber(values.buildingLength);
  const width = sandwichNumber(values.buildingWidth);
  const height = sandwichNumber(values.wallHeight);
  return Math.max(2 * (length + width) * height - sandwichNumber(values.openingsArea), 0);
}
function sandwichRoofArea(values: Record<string, string>) {
  const length = sandwichNumber(values.buildingLength);
  const slopeLen = sandwichRoofSlopeLength(values);
  return (values.roofType || "gable") === "single" ? length * slopeLen : 2 * length * slopeLen;
}
function sandwichTotals(values: Record<string, string>) {
  const reservePercent = reserve(values);
  const wallArea = sandwichWallAreaNet(values);
  const roofArea = sandwichRoofArea(values);
  const wallWidthM = (sandwichNumber(values.wallUsefulWidth) || 1000) / 1000;
  const roofWidthM = (sandwichNumber(values.roofUsefulWidth) || 1000) / 1000;
  const height = sandwichNumber(values.wallHeight);
  const length = sandwichNumber(values.buildingLength);
  const width = sandwichNumber(values.buildingWidth);
  const slopeLen = sandwichRoofSlopeLength(values);
  const scope = values.scope || "building";
  const wallAreaReserve = addReserve(wallArea, reservePercent);
  const roofAreaReserve = addReserve(roofArea, reservePercent);
  return {
    scope, height, length, width, slopeLen,
    wallAreaReserve, roofAreaReserve,
    wallPanels: Math.ceil(wallAreaReserve / Math.max(height * wallWidthM, 0.0001)),
    roofPanels: Math.ceil(roofAreaReserve / Math.max(slopeLen * roofWidthM, 0.0001)),
    cornerTrim: 4 * height,
    baseTrim: 2 * (length + width),
    ridge: (values.roofType || "gable") === "single" ? 0 : length,
    cornice: (values.roofType || "gable") === "single" ? length : 2 * length,
    gableTrim: (values.roofType || "gable") === "single" ? 2 * (length + slopeLen) : 4 * slopeLen,
    wallScrews: Math.ceil(wallAreaReserve * 6),
    roofScrews: Math.ceil(roofAreaReserve * 8),
  };
}
function sandwichCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const t = sandwichTotals(values);
  const rows: CalculatorResultRow[] = [];
  const wallSize = `${values.wallThickness || "100"} мм, полезная ширина ${values.wallUsefulWidth || "1000"} мм`;
  const roofSize = `${values.roofThickness || "120"} мм, полезная ширина ${values.roofUsefulWidth || "1000"} мм`;
  if (t.scope !== "roof") {
    rows.push(resultRow({ name: "Стеновые сэндвич-панели", size: wallSize, unit: "м²", coefficient: `Площадь стен − проёмы + ${reserve(values)}% запас`, quantity: roundUp(t.wallAreaReserve, 0.01), priceUnit: "м²" }));
    rows.push(resultRow({ name: "Ориентировочное количество стеновых панелей", size: wallSize, unit: "шт.", coefficient: "Оценка по полезной ширине", quantity: t.wallPanels, includeInOffer: false }));
    rows.push(resultRow({ name: "Угловые доборные элементы", size: "наружные углы", unit: "пог. м", coefficient: `4 угла × ${fmt(t.height)} м`, quantity: roundUp(t.cornerTrim, 0.01), priceUnit: "пог. м" }));
    rows.push(resultRow({ name: "Стартовая / цокольная планка", size: "по периметру здания", unit: "пог. м", coefficient: `2 × (L + B)`, quantity: roundUp(t.baseTrim, 0.01), priceUnit: "пог. м" }));
    rows.push(resultRow({ name: "Саморезы для стеновых панелей", size: "ориентировочно", unit: "шт.", coefficient: `6 шт. × площадь стен`, quantity: t.wallScrews, priceUnit: "шт." }));
  }
  if (t.scope !== "wall") {
    rows.push(resultRow({ name: "Кровельные сэндвич-панели", size: roofSize, unit: "м²", coefficient: `Площадь кровли + ${reserve(values)}% запас`, quantity: roundUp(t.roofAreaReserve, 0.01), priceUnit: "м²" }));
    rows.push(resultRow({ name: "Ориентировочное количество кровельных панелей", size: roofSize, unit: "шт.", coefficient: "Оценка по длине ската и полезной ширине", quantity: t.roofPanels, includeInOffer: false }));
    if (t.ridge > 0) rows.push(resultRow({ name: "Коньковый элемент", size: sandwichRoofTypeLabel(values.roofType || "gable"), unit: "пог. м", coefficient: "По длине здания", quantity: roundUp(t.ridge, 0.01), priceUnit: "пог. м" }));
    rows.push(resultRow({ name: "Карнизная планка", size: sandwichRoofTypeLabel(values.roofType || "gable"), unit: "пог. м", coefficient: "По длине здания", quantity: roundUp(t.cornice, 0.01), priceUnit: "пог. м" }));
    rows.push(resultRow({ name: "Торцевые / фронтонные элементы", size: sandwichRoofTypeLabel(values.roofType || "gable"), unit: "пог. м", coefficient: "По торцам и скатам кровли", quantity: roundUp(t.gableTrim, 0.01), priceUnit: "пог. м" }));
    rows.push(resultRow({ name: "Саморезы для кровельных панелей", size: "ориентировочно", unit: "шт.", coefficient: `8 шт. × площадь кровли`, quantity: t.roofScrews, priceUnit: "шт." }));
  }
  return rows;
}
function sandwichParams(values: Record<string, string>) {
  const t = sandwichTotals(values);
  return `Режим: ${sandwichScopeLabel(values.scope || "building")}; габариты: ${fmt(sandwichNumber(values.buildingLength))} × ${fmt(sandwichNumber(values.buildingWidth))} м; высота: ${fmt(sandwichNumber(values.wallHeight))} м; кровля: ${sandwichRoofTypeLabel(values.roofType || "gable")}; стеновые панели: ${fmt(t.wallAreaReserve)} м²; кровельные панели: ${fmt(t.roofAreaReserve)} м²`;
}
function sandwichWarning(values: Record<string, string>) {
  if (!sandwichNumber(values.buildingLength) || !sandwichNumber(values.buildingWidth) || !sandwichNumber(values.wallHeight)) return "Укажите длину, ширину и высоту здания больше нуля.";
  if ((values.scope || "building") !== "roof" && sandwichWallAreaNet(values) <= 0) return "Проверьте площадь проёмов: она не должна полностью превышать площадь стен.";
  if ((values.scope || "building") !== "wall" && sandwichRoofArea(values) <= 0) return "Проверьте параметры кровли: площадь кровли должна быть больше нуля.";
  return null;
}


const blocksColumns: OfferColumn[] = [
  { key: "index", title: "№", width: 6 },
  { key: "name", title: "Наименование", width: 38 },
  { key: "size", title: "Размер / характеристика", width: 26 },
  { key: "unit", title: "Ед. изм.", width: 12 },
  { key: "coefficient", title: "Основание расчёта", width: 32 },
  { key: "quantity", title: "Количество", width: 16 },
  { key: "priceUnit", title: "Цена за", width: 12 },
  { key: "price", title: "Цена", width: 14 },
  { key: "sum", title: "Сумма", width: 16 },
];

function blocksNumber(value: string | undefined) {
  return toNumber(String(value ?? ""));
}

function blocksMaterialLabel(value: string) {
  return value === "polystyrene" ? "Полистиролбетон" : "Газобетон";
}

function blocksWallTypeLabel(value: string) {
  if (value === "bearing") return "Внутренние несущие стены";
  if (value === "partition") return "Перегородки";
  return "Наружные стены";
}

function blocksOpeningsArea(values: Record<string, string>) {
  if ((values.openingsMode || "area") === "count") {
    const windowArea = blocksNumber(values.windowCount) * blocksNumber(values.windowWidth) * blocksNumber(values.windowHeight);
    const doorArea = blocksNumber(values.doorCount) * blocksNumber(values.doorWidth) * blocksNumber(values.doorHeight);
    return windowArea + doorArea;
  }
  return blocksNumber(values.openingsArea);
}

function blocksTotals(values: Record<string, string>) {
  const material = values.blockMaterial || "gas";
  const wallLength = blocksNumber(values.wallLength);
  const wallHeight = blocksNumber(values.wallHeight);
  const floors = Math.max(Math.round(blocksNumber(values.floors) || 1), 1);
  const openingsArea = blocksOpeningsArea(values);
  const grossArea = wallLength * wallHeight * floors;
  const netArea = Math.max(grossArea - openingsArea, 0);
  const thicknessM = blocksNumber(values.blockThickness) / 1000;
  const blockLengthM = blocksNumber(values.blockLength) / 1000;
  const blockHeightM = blocksNumber(values.blockHeight) / 1000;
  const blockVolume = blockLengthM * blockHeightM * thicknessM;
  const volume = netArea * thicknessM;
  const volumeWithReserve = addReserve(volume, reserve(values));
  const blockCountExact = blockVolume > 0 ? volumeWithReserve / blockVolume : 0;
  const blockCount = Math.ceil(blockCountExact);
  const density = blocksNumber(values.blockDensity) || 500;
  const weightT = volumeWithReserve * density / 1000;
  const glueKgM3 = blocksNumber(values.glueConsumption) || 25;
  const bagWeight = blocksNumber(values.glueBagWeight) || 25;
  const glueKg = volumeWithReserve * glueKgM3;
  const glueBags = Math.ceil(glueKg / bagWeight);
  return {
    material,
    wallLength,
    wallHeight,
    floors,
    openingsArea,
    grossArea,
    netArea,
    thicknessM,
    blockLengthM,
    blockHeightM,
    blockVolume,
    volume,
    volumeWithReserve,
    blockCountExact,
    blockCount,
    density,
    weightT,
    glueKgM3,
    bagWeight,
    glueKg,
    glueBags,
  };
}

function blocksCalculate(values: Record<string, string>): CalculatorResultRow[] {
  const t = blocksTotals(values);
  const material = blocksMaterialLabel(t.material);
  const blockSize = `${values.blockLength || "625"}×${values.blockHeight || "250"}×${values.blockThickness || "300"} мм, D${values.blockDensity || "500"}`;
  return [
    resultRow({
      name: `${material}ные блоки`,
      size: blockSize,
      unit: "м³",
      coefficient: `Чистая площадь стен × толщина + ${reserve(values)}% запас`,
      quantity: roundUp(t.volumeWithReserve, 0.01),
      priceUnit: "м³",
    }),
    resultRow({
      name: `Кладочная смесь, мешок ${fmt(t.bagWeight)} кг`,
      size: `${fmt(t.glueKgM3)} кг на 1 м³ кладки`,
      unit: "меш.",
      coefficient: `Объём блоков × ${fmt(t.glueKgM3)} кг/м³`,
      quantity: t.glueBags,
      priceUnit: "меш.",
    }),
    resultRow({
      name: "Расчётное количество блоков",
      size: blockSize,
      unit: "шт.",
      coefficient: "Объём с запасом / объём одного блока",
      quantity: t.blockCount,
      includeInOffer: false,
    }),
    resultRow({
      name: "Чистая площадь кладки",
      size: blocksWallTypeLabel(values.wallType || "exterior"),
      unit: "м²",
      coefficient: "Площадь стен − оконные и дверные проёмы",
      quantity: roundUp(t.netArea, 0.01),
      includeInOffer: false,
    }),
    resultRow({
      name: "Объём кладки без запаса",
      size: `${fmt(t.thicknessM)} м толщина стены`,
      unit: "м³",
      coefficient: "Чистая площадь × толщина",
      quantity: roundUp(t.volume, 0.01),
      includeInOffer: false,
    }),
    resultRow({
      name: "Теоретическая масса блоков",
      size: `Плотность D${fmt(t.density)}`,
      unit: "т",
      coefficient: "Объём с запасом × плотность",
      quantity: roundUp(t.weightT, 0.001),
      includeInOffer: false,
    }),
  ];
}

function blocksParams(values: Record<string, string>) {
  const t = blocksTotals(values);
  return [
    `Материал: ${blocksMaterialLabel(values.blockMaterial || "gas")}`,
    `Тип стен: ${blocksWallTypeLabel(values.wallType || "exterior")}`,
    `Размер блока: ${values.blockLength}×${values.blockHeight}×${values.blockThickness} мм`,
    `Плотность: D${values.blockDensity}`,
    `Длина стен: ${fmt(t.wallLength)} м`,
    `Высота: ${fmt(t.wallHeight)} м`,
    `Этажей: ${t.floors}`,
    `Проёмы: ${fmt(t.openingsArea)} м²`,
    `Объём с запасом: ${fmt(t.volumeWithReserve)} м³`,
  ].join("; ");
}

function blocksWarning(values: Record<string, string>) {
  const t = blocksTotals(values);
  if (!t.wallLength || !t.wallHeight) return "Укажите общую длину и высоту стен больше нуля.";
  if (!t.blockLengthM || !t.blockHeightM || !t.thicknessM) return "Проверьте длину, высоту и толщину блока.";
  if (t.openingsArea >= t.grossArea) return "Площадь проёмов должна быть меньше общей площади стен.";
  if (!t.volumeWithReserve || !t.blockCount) return "Проверьте исходные параметры расчёта.";
  return null;
}

function normalizeBlocksValues(values: Record<string, string>, changedFieldId: string) {
  const next = { ...values };
  if (changedFieldId === "__init__") {
    next.blockMaterial = next.blockMaterial || "gas";
    next.wallType = next.wallType || "exterior";
  }
  if (changedFieldId === "blockMaterial" || changedFieldId === "__init__") {
    if ((next.blockMaterial || "gas") === "polystyrene") {
      next.blockLength = "600";
      next.blockHeight = "300";
      next.blockDensity = "500";
    } else {
      next.blockLength = "625";
      next.blockHeight = "250";
      next.blockDensity = "500";
    }
  }
  if (changedFieldId === "wallType" || changedFieldId === "blockMaterial" || changedFieldId === "__init__") {
    next.blockThickness = next.wallType === "partition" ? "100" : next.wallType === "bearing" ? "200" : "300";
  }
  return next;
}

const commonReserveField: CalculatorField = {
  id: "reserve",
  label: "Запас, %",
  type: "number",
  defaultValue: "5",
};

const areaField: CalculatorField = { id: "area", label: "Площадь потолка, м²", type: "number", defaultValue: "100" };
const perimeterField: CalculatorField = { id: "perimeter", label: "Периметр, м", type: "number", defaultValue: "40" };
const mountSchemeField: CalculatorField = {
  id: "mountScheme",
  label: "Схема монтажа",
  type: "buttons",
  defaultValue: "standard",
  options: [
    { label: "Стандартная", value: "standard" },
    { label: "Усиленная", value: "reinforced" },
  ],
};

export const calculators: CalculatorConfig[] = [

  {
    slug: "stenovye-bloki",
    group: "blocks",
    title: "Калькулятор газобетона и полистиролбетона",
    shortTitle: "Стеновые блоки",
    description: "Расчёт объёма и количества газобетонных или полистиролбетонных блоков, веса и кладочной смеси.",
    seoTitle: "Калькулятор газобетона и полистиролбетона — блоки на дом",
    seoDescription: "Онлайн-калькулятор IDELEON для расчёта газобетонных и полистиролбетонных блоков: площадь стен, проёмы, объём кладки, количество блоков, масса и кладочная смесь.",
    h1: "Калькулятор газобетона и полистиролбетона",
    intro: "Выберите материал и тип стен, задайте размеры блока и геометрию здания. Калькулятор рассчитает чистую площадь кладки, объём материала, ориентировочное количество блоков, теоретический вес и расход кладочной смеси.",
    offerTitle: "Коммерческое предложение / стеновые блоки",
    fileName: "KP_stenovye_bloki_ideleon.xlsx",
    visualTitle: "Выберите материал",
    visualDescription: "Карточка переключает материал и устанавливает типовые размеры блока. Любой размер можно затем скорректировать вручную.",
    calculatorNote: "Расчёт предварительный. Фактическое количество зависит от раскладки, перевязки, фронтонов, армопоясов, подрезки, упаковки производителя и геометрии проекта.",
    resultTitle: "Результат расчёта стеновых блоков",
    resultMaterialTitle: "Показатель",
    resultCoefficientTitle: "Основание расчёта",
    resultQuantityTitle: "Количество",
    resultMaxFractionDigits: 3,
    fields: [
      { id: "blockMaterial", label: "Материал", type: "buttons", defaultValue: "gas", hideInput: true, options: [
        { label: "Газобетон", value: "gas" },
        { label: "Полистиролбетон", value: "polystyrene" },
      ] },
      { id: "wallType", label: "Тип стен", type: "buttons", defaultValue: "exterior", hideInput: true, options: [
        { label: "Наружные стены", value: "exterior" },
        { label: "Внутренние несущие", value: "bearing" },
        { label: "Перегородки", value: "partition" },
      ] },
      { id: "blockLength", label: "Длина блока, мм", type: "number", defaultValue: "625", step: "any" },
      { id: "blockHeight", label: "Высота блока, мм", type: "number", defaultValue: "250", step: "any" },
      { id: "blockThickness", label: "Толщина блока / стены, мм", type: "number", defaultValue: "300", step: "any" },
      { id: "blockDensity", label: "Плотность блока, кг/м³", type: "select", defaultValue: "500", options: ["300","350","400","450","500","600"].map((value) => ({ label: `D${value}`, value })) },
      { id: "wallLength", label: "Общая длина стен, м", type: "number", defaultValue: "40", step: "any" },
      { id: "wallHeight", label: "Средняя высота стен одного этажа, м", type: "number", defaultValue: "3", step: "any" },
      { id: "floors", label: "Количество этажей", type: "number", defaultValue: "1", step: "1" },
      { id: "openingsMode", label: "Как задать проёмы", type: "buttons", defaultValue: "area", options: [
        { label: "Общей площадью", value: "area" },
        { label: "Окна и двери", value: "count" },
      ] },
      { id: "openingsArea", label: "Общая площадь окон и дверей, м²", type: "number", defaultValue: "18", step: "any", showWhen: { fieldId: "openingsMode", values: ["area"] } },
      { id: "windowCount", label: "Количество окон", type: "number", defaultValue: "8", step: "1", showWhen: { fieldId: "openingsMode", values: ["count"] } },
      { id: "windowWidth", label: "Средняя ширина окна, м", type: "number", defaultValue: "1,4", step: "any", showWhen: { fieldId: "openingsMode", values: ["count"] } },
      { id: "windowHeight", label: "Средняя высота окна, м", type: "number", defaultValue: "1,4", step: "any", showWhen: { fieldId: "openingsMode", values: ["count"] } },
      { id: "doorCount", label: "Количество дверей", type: "number", defaultValue: "2", step: "1", showWhen: { fieldId: "openingsMode", values: ["count"] } },
      { id: "doorWidth", label: "Средняя ширина двери, м", type: "number", defaultValue: "0,9", step: "any", showWhen: { fieldId: "openingsMode", values: ["count"] } },
      { id: "doorHeight", label: "Средняя высота двери, м", type: "number", defaultValue: "2,1", step: "any", showWhen: { fieldId: "openingsMode", values: ["count"] } },
      { id: "glueConsumption", label: "Расход кладочной смеси, кг/м³", type: "number", defaultValue: "25", step: "any" },
      { id: "glueBagWeight", label: "Вес мешка кладочной смеси, кг", type: "select", defaultValue: "25", options: ["20","25"].map((value) => ({ label: `${value} кг`, value })) },
      commonReserveField,
    ],
    visuals: [
      { title: "Газобетон", description: "Автоклавные ячеистые блоки. Типовой размер в калькуляторе — 625×250 мм.", image: "/images/calculators/blocks/gas-concrete.png", alt: "Газобетонный стеновой блок", fieldId: "blockMaterial", value: "gas" },
      { title: "Полистиролбетон", description: "Лёгкие блоки с гранулами вспененного полистирола. Типовой размер — 600×300 мм.", image: "/images/calculators/blocks/polystyrene-concrete.png", alt: "Полистиролбетонный стеновой блок", fieldId: "blockMaterial", value: "polystyrene" },
    ],
    visualGroups: [
      {
        title: "Выберите тип стен",
        description: "Тип стены устанавливает стартовую толщину блока. После выбора толщину можно изменить вручную по проекту.",
        visuals: [
          { title: "Наружные стены", description: "Внешний контур здания. Стартовая толщина — 300 мм.", image: "/images/calculators/blocks/exterior-walls.png", alt: "Наружные стены здания", fieldId: "wallType", value: "exterior" },
          { title: "Внутренние несущие", description: "Несущие стены внутри здания. Стартовая толщина — 200 мм.", image: "/images/calculators/blocks/bearing-walls.png", alt: "Внутренняя несущая стена", fieldId: "wallType", value: "bearing" },
          { title: "Перегородки", description: "Ненесущие разделительные стены. Стартовая толщина — 100 мм.", image: "/images/calculators/blocks/partitions.png", alt: "Перегородка из строительных блоков", fieldId: "wallType", value: "partition" },
        ],
      },
    ],
    offerColumns: blocksColumns,
    calculate: blocksCalculate,
    getParamsText: blocksParams,
    getWarning: blocksWarning,
    normalizeValues: normalizeBlocksValues,
    relatedLinks: [
      { label: "Калькулятор сэндвич-панелей", href: "/calculators/sendvich-paneli" },
      { label: "Все калькуляторы", href: "/calculators" },
      { label: "Каталог строительных материалов", href: "/catalog" },
    ],
    seoSections: [
      { title: "Что рассчитывает калькулятор", text: "Калькулятор определяет чистую площадь стен после вычета оконных и дверных проёмов, объём кладки, количество блоков, теоретическую массу и ориентировочное количество мешков кладочной смеси." },
      { title: "Как задать проёмы", text: "Проёмы можно указать одной общей площадью либо через количество и средние размеры окон и дверей. Второй способ удобен на ранней стадии, когда точной ведомости проёмов ещё нет." },
      { title: "Газобетон или полистиролбетон", text: "Выбор материала в калькуляторе меняет типовые размеры блока, но все параметры доступны для ручной корректировки. Для закупки важны фактический формат, плотность, класс прочности и упаковка конкретного производителя." },
      { title: "Как учитывается кладочная смесь", text: "Расход задаётся пользователем в килограммах на кубометр кладки. По умолчанию установлено 25 кг/м³, но фактическое значение нужно сверять с инструкцией производителя смеси, толщиной шва и качеством геометрии блоков." },
      { title: "Когда требуется проектный расчёт", text: "Точный расчёт требуется для фронтонов, эркеров, армопоясов, перемычек, сложной перевязки, нескольких толщин стен и нестандартных блоков. В таких случаях результат калькулятора используется как предварительная основа спецификации." },
    ],
    faq: [
      { question: "Учитывает ли калькулятор запас?", answer: "Да. Запас применяется к объёму блоков и затем влияет на количество блоков, вес и расход кладочной смеси." },
      { question: "Можно ли задать нестандартный размер блока?", answer: "Да. Длина, высота и толщина блока вводятся вручную, поэтому калькулятор подходит для разных производителей." },
      { question: "Почему количество блоков округляется вверх?", answer: "Поставить дробную часть блока нельзя, поэтому ориентировочное количество изделий округляется до целого блока в большую сторону." },
      { question: "Считает ли калькулятор поддоны?", answer: "Нет. Количество блоков или объём на поддоне различаются у производителей, поэтому упаковку нужно уточнять при запросе коммерческого предложения." },
      { question: "Можно ли сразу заказать по этому расчёту?", answer: "Расчёт подходит для предварительной заявки. Перед выставлением счёта менеджер проверит размеры, плотность, упаковку, наличие и условия доставки." },
    ],
  },

  {
    slug: "sendvich-paneli",
    group: "sandwich",
    title: "Калькулятор сэндвич-панелей",
    shortTitle: "Сэндвич-панели",
    description: "Предварительный расчёт стеновых и кровельных сэндвич-панелей, доборных элементов и крепежа для здания.",
    seoTitle: "Калькулятор сэндвич-панелей — стены, кровля, доборы",
    seoDescription: "Онлайн-калькулятор IDELEON для предварительного расчёта стеновых и кровельных сэндвич-панелей: площадь стен и кровли, количество панелей, доборные элементы, крепёж и Excel-КП.",
    h1: "Калькулятор сэндвич-панелей",
    intro: "Калькулятор помогает быстро оценить потребность в стеновых и кровельных сэндвич-панелях по габаритам здания. Расчёт ориентировочный: он подходит для предварительного бюджета и заявки на коммерческое предложение, а окончательная спецификация уточняется по проекту.",
    offerTitle: "Коммерческое предложение / сэндвич-панели",
    fileName: "KP_sendvich_paneli_ideleon.xlsx",
    visualTitle: "Выберите схему расчёта",
    visualDescription: "Сначала выберите, что рассчитывать: здание целиком, только стены или только кровлю. Далее укажите тип кровли и размеры здания.",
    calculatorNote: "Расчёт ориентировочный. Он не заменяет проектную раскладку панелей, расчёт узлов примыканий и подбор крепежа по ветровым и снеговым нагрузкам.",
    resultTitle: "Результат предварительного расчёта",
    resultMaterialTitle: "Позиция",
    resultCoefficientTitle: "Основание",
    resultQuantityTitle: "Количество",
    resultMaxFractionDigits: 2,
    fields: [
      { id: "scope", label: "Что рассчитываем", type: "buttons", defaultValue: "building", hideInput: true, options: [
        { label: "Здание целиком", value: "building" },
        { label: "Только стены", value: "wall" },
        { label: "Только кровля", value: "roof" },
      ] },
      { id: "buildingLength", label: "Длина здания, м", type: "number", defaultValue: "24", step: "any" },
      { id: "buildingWidth", label: "Ширина здания, м", type: "number", defaultValue: "12", step: "any" },
      { id: "wallHeight", label: "Высота стен, м", type: "number", defaultValue: "4", step: "any" },
      { id: "openingsArea", label: "Площадь проёмов, м²", type: "number", defaultValue: "12", step: "any", showWhen: { fieldId: "scope", values: ["building", "wall"] } },
      { id: "roofType", label: "Тип кровли", type: "buttons", defaultValue: "gable", hideInput: true, showWhen: { fieldId: "scope", values: ["building", "roof"] }, options: [
        { label: "Двускатная", value: "gable" },
        { label: "Односкатная", value: "single" },
      ] },
      { id: "roofPitchDeg", label: "Уклон кровли, °", type: "number", defaultValue: "10", step: "any", showWhen: { fieldId: "scope", values: ["building", "roof"] } },
      { id: "wallThickness", label: "Толщина стеновой панели", type: "select", defaultValue: "100", showWhen: { fieldId: "scope", values: ["building", "wall"] }, options: ["50","80","100","120","150","200"].map((value) => ({ label: `${value} мм`, value })) },
      { id: "wallUsefulWidth", label: "Полезная ширина стеновой панели", type: "select", defaultValue: "1000", showWhen: { fieldId: "scope", values: ["building", "wall"] }, options: ["1000","1190"].map((value) => ({ label: `${value} мм`, value })) },
      { id: "roofThickness", label: "Толщина кровельной панели", type: "select", defaultValue: "120", showWhen: { fieldId: "scope", values: ["building", "roof"] }, options: ["50","80","100","120","150","200"].map((value) => ({ label: `${value} мм`, value })) },
      { id: "roofUsefulWidth", label: "Полезная ширина кровельной панели", type: "select", defaultValue: "1000", showWhen: { fieldId: "scope", values: ["building", "roof"] }, options: ["1000"].map((value) => ({ label: `${value} мм`, value })) },
      commonReserveField,
    ],
    visuals: [],
    visualGroups: [
      {
        title: "Что нужно рассчитать",
        description: "Выберите режим расчёта. Для полного здания калькулятор покажет и стеновые, и кровельные панели, а также ориентировочный набор доборов и крепежа.",
        visuals: [
          { title: "Здание целиком", description: "Стены, кровля, доборные элементы и крепёж для предварительного бюджета.", image: "/images/calculators/sandwich/building.png", alt: "Расчёт комплекта сэндвич-панелей на здание", fieldId: "scope", value: "building" },
          { title: "Только стены", description: "Только стеновые панели, проёмы, углы и стартовые элементы.", image: "/images/calculators/sandwich/wall.png", alt: "Расчёт стеновых сэндвич-панелей", fieldId: "scope", value: "wall" },
          { title: "Только кровля", description: "Кровельные панели, конёк, карниз и фронтонные элементы.", image: "/images/calculators/sandwich/roof.png", alt: "Расчёт кровельных сэндвич-панелей", fieldId: "scope", value: "roof" },
        ],
      },
      {
        title: "Тип кровли",
        description: "Выберите конструкцию кровли для расчёта площади кровельных панелей и доборных элементов.",
        showWhen: { fieldId: "scope", values: ["building", "roof"] },
        visuals: [
          { title: "Двускатная кровля", description: "Подходит для складов, ангаров, магазинов и производственных зданий.", image: "/images/calculators/sandwich/gable.png", alt: "Двускатная кровля из сэндвич-панелей", fieldId: "roofType", value: "gable" },
          { title: "Односкатная кровля", description: "Часто используется для навесов, пристроек и компактных зданий.", image: "/images/calculators/sandwich/single-slope.png", alt: "Односкатная кровля из сэндвич-панелей", fieldId: "roofType", value: "single" },
        ],
      },
    ],
    offerColumns: sandwichColumns,
    calculate: sandwichCalculate,
    getParamsText: sandwichParams,
    getWarning: sandwichWarning,
    relatedLinks: [
      { label: "Калькулятор чёрного металлопроката", href: "/calculators/chernyy-metalloprokat" },
      { label: "Каталог сэндвич-панелей", href: "/catalog/sandvich-paneli" },
      { label: "Все калькуляторы", href: "/calculators" },
    ],
    seoSections: [
      { title: "Что считает калькулятор", text: "Калькулятор определяет ориентировочную площадь стеновых и кровельных сэндвич-панелей, число панелей по полезной ширине, длину основных доборных элементов и количество крепежа. Расчёт подходит для предварительной оценки бюджета и подготовки заявки в IDELEON." },
      { title: "Как пользоваться калькулятором", text: "Сначала выберите режим расчёта: всё здание, только стены или только кровлю. Затем задайте габариты здания, высоту стен, площадь проёмов, тип кровли и толщину панелей. При необходимости укажите запас на подрезку и монтаж." },
      { title: "Какие схемы взаимодействия заложены", text: "Для удобства пользователя калькулятор разбит на две последовательные группы карточек: сначала сценарий расчёта, затем тип кровли. После выбора схема взаимодействия становится короче: показываются только релевантные поля, а результат сразу отражает конкретный сценарий — стены, кровлю или полный комплект на здание." },
      { title: "Когда нужен точный проектный расчёт", text: "Если у здания есть фонари, воротные порталы, внутренние углы, перепады высот, сложные узлы примыкания, несколько температурных зон или нестандартные пролёты, нужен детальный проектный расчёт. Специалисты IDELEON подготовят точную раскладку панелей, доборов и крепежа." },
      { title: "Что важно учесть при заказе", text: "Фактическая длина панелей, тип утеплителя, замок панели, цвет, покрытие, ветровой район, снеговая нагрузка и длина доборов уточняются при подготовке коммерческого предложения. Поэтому Excel-КП из калькулятора является предварительным расчётом, а не окончательной спецификацией." },
    ],
    faq: [
      { question: "Считает ли калькулятор панели поштучно?", answer: "Да, калькулятор показывает ориентировочное количество панелей по полезной ширине и расчётной длине. Итоговая раскладка всё равно требует проверки по проекту." },
      { question: "Учитываются ли окна и ворота?", answer: "Да. Для стенового контура можно указать общую площадь проёмов, и калькулятор уменьшит расчётную площадь стеновых панелей." },
      { question: "Можно ли считать только кровлю?", answer: "Да. Для этого выберите сценарий «Только кровля» — тогда будут показаны только кровельные панели и связанные с ними доборные элементы." },
      { question: "Чем отличается двускатная и односкатная кровля в расчёте?", answer: "От типа кровли зависит площадь скатов, длина доборных элементов и, соответственно, ориентировочный расход панелей и крепежа." },
      { question: "Насколько точен расчёт?", answer: "Это предварительный расчёт для бюджета и быстрой заявки. Для закупки и монтажа нужна итоговая спецификация, подготовленная по проекту." },
    ],
  },

  {
    slug: "chernyy-metalloprokat",
    group: "metal",
    title: "Калькулятор чёрного металлопроката",
    shortTitle: "Чёрный металлопрокат",
    description: "Пересчёт массы, длины, количества штук и площади для 12 видов стального проката.",
    seoTitle: "Калькулятор веса металлопроката — масса, метры и количество",
    seoDescription: "Онлайн-калькулятор чёрного металлопроката IDELEON: арматура, круг, квадрат, шестигранник, полоса, лист, трубы, уголок, швеллер и двутавр. Перевод тонн в метры и штуки, Excel-КП.",
    h1: "Калькулятор чёрного металлопроката",
    intro: "Выберите вид проката, укажите размер и исходную величину. Калькулятор пересчитает массу, общую длину и количество целых изделий, а затем сформирует Excel-КП в фирменном формате IDELEON.",
    offerTitle: "Коммерческое предложение / чёрный металлопрокат",
    fileName: "KP_chernyy_metalloprokat_ideleon.xlsx",
    visualTitle: "Выберите вид металлопроката",
    visualDescription: "Двенадцать основных видов чёрного металлопроката. После выбора карточки ниже появятся только относящиеся к изделию размеры и параметры пересчёта.",
    calculatorNote: "Расчёт показывает теоретическую массу. Фактическая масса партии может отличаться в пределах производственных допусков; наличие размеров и длину поставки подтвердит менеджер IDELEON.",
    resultTitle: "Результат пересчёта",
    resultMaterialTitle: "Показатель",
    resultCoefficientTitle: "Основание расчёта",
    resultQuantityTitle: "Значение",
    resultMaxFractionDigits: 4,
    fields: [
      {
        id: "productType", label: "Вид проката", type: "buttons", defaultValue: "rebar", hideInput: true,
        options: metalProductValues.map((value) => ({ label: metalProductLabels[value], value })),
      },
      {
        id: "longInputMode", label: "Что известно", type: "buttons", defaultValue: "length", showWhen: metalLongCondition,
        options: [
          { label: "Общая длина", value: "length" },
          { label: "Масса", value: "weight" },
          { label: "Количество штук", value: "pieces" },
        ],
      },
      {
        id: "sheetInputMode", label: "Что известно", type: "buttons", defaultValue: "sheets", showWhen: { fieldId: "productType", values: ["sheet"] },
        options: [
          { label: "Количество листов", value: "sheets" },
          { label: "Общая площадь", value: "area" },
          { label: "Масса", value: "weight" },
        ],
      },
      {
        id: "rebarClass", label: "Класс арматуры", type: "buttons", defaultValue: "А500С", showWhen: { fieldId: "productType", values: ["rebar"] },
        options: [
          { label: "А500С", value: "А500С" },
          { label: "А400 / А-III", value: "А400 (А-III)" },
          { label: "А240 / А-I", value: "А240 (А-I)" },
        ],
      },
      {
        id: "steelGrade", label: "Марка стали", type: "select", defaultValue: "Ст3сп/пс5", showWhen: { fieldId: "productType", values: metalNonRebarValues },
        options: [
          { label: "Ст3сп/пс5", value: "Ст3сп/пс5" },
          { label: "09Г2С", value: "09Г2С" },
          { label: "Ст20", value: "Ст20" },
          { label: "S235JR", value: "S235JR" },
          { label: "Уточнить по заявке", value: "уточнить" },
        ],
      },
      {
        id: "rebarDiameter", label: "Диаметр арматуры", type: "select", defaultValue: "12", showWhen: { fieldId: "productType", values: ["rebar"] },
        options: Object.keys(rebarMassKgM).map((value) => ({ label: `Ø${value} мм`, value })),
      },
      { id: "roundDiameter", label: "Диаметр круга, мм", type: "number", defaultValue: "20", step: "any", showWhen: { fieldId: "productType", values: ["round"] } },
      { id: "squareSide", label: "Сторона квадрата, мм", type: "number", defaultValue: "20", step: "any", showWhen: { fieldId: "productType", values: ["square"] } },
      { id: "hexAcrossFlats", label: "Размер шестигранника под ключ S, мм", type: "number", defaultValue: "20", step: "any", showWhen: { fieldId: "productType", values: ["hexagon"] } },
      { id: "stripWidth", label: "Ширина полосы, мм", type: "number", defaultValue: "40", step: "any", showWhen: { fieldId: "productType", values: ["strip"] } },
      { id: "stripThickness", label: "Толщина полосы, мм", type: "number", defaultValue: "4", step: "any", showWhen: { fieldId: "productType", values: ["strip"] } },
      { id: "sheetThickness", label: "Толщина листа, мм", type: "number", defaultValue: "4", step: "any", showWhen: { fieldId: "productType", values: ["sheet"] } },
      { id: "sheetWidth", label: "Ширина листа, мм", type: "number", defaultValue: "1500", step: "any", showWhen: { fieldId: "productType", values: ["sheet"] } },
      { id: "sheetLength", label: "Длина листа, мм", type: "number", defaultValue: "6000", step: "any", showWhen: { fieldId: "productType", values: ["sheet"] } },
      { id: "roundPipeDiameter", label: "Наружный диаметр трубы, мм", type: "number", defaultValue: "57", step: "any", showWhen: { fieldId: "productType", values: ["roundPipe"] } },
      { id: "roundPipeWall", label: "Толщина стенки, мм", type: "number", defaultValue: "3,5", step: "any", showWhen: { fieldId: "productType", values: ["roundPipe"] } },
      { id: "squareTubeSide", label: "Наружная сторона трубы, мм", type: "number", defaultValue: "40", step: "any", showWhen: { fieldId: "productType", values: ["squareTube"] } },
      { id: "squareTubeWall", label: "Толщина стенки, мм", type: "number", defaultValue: "2", step: "any", showWhen: { fieldId: "productType", values: ["squareTube"] } },
      { id: "rectTubeWidth", label: "Ширина трубы, мм", type: "number", defaultValue: "60", step: "any", showWhen: { fieldId: "productType", values: ["rectTube"] } },
      { id: "rectTubeHeight", label: "Высота трубы, мм", type: "number", defaultValue: "40", step: "any", showWhen: { fieldId: "productType", values: ["rectTube"] } },
      { id: "rectTubeWall", label: "Толщина стенки, мм", type: "number", defaultValue: "2", step: "any", showWhen: { fieldId: "productType", values: ["rectTube"] } },
      {
        id: "angleSize", label: "Размер равнополочного уголка", type: "select", defaultValue: "50×50×5", showWhen: { fieldId: "productType", values: ["angle"] },
        options: Object.entries(equalAngleMassKgM).map(([value, mass]) => ({ label: `${value} мм — ${String(mass).replace(".", ",")} кг/м`, value })),
      },
      {
        id: "channelSize", label: "Номер швеллера с параллельными полками", type: "select", defaultValue: "12П", showWhen: { fieldId: "productType", values: ["channel"] },
        options: Object.entries(channelPMassKgM).map(([value, mass]) => ({ label: `${value} — ${String(mass).replace(".", ",")} кг/м`, value })),
      },
      {
        id: "beamSize", label: "Номер двутавра", type: "select", defaultValue: "20", showWhen: { fieldId: "productType", values: ["beam"] },
        options: Object.entries(iBeamMassKgM).map(([value, mass]) => ({ label: `№${value} — ${String(mass).replace(".", ",")} кг/м`, value })),
      },
      { id: "pieceLength", label: "Длина одной штуки, м", type: "number", defaultValue: "12", step: "any", showWhen: metalLongCondition },
      { id: "inputLengthM", label: "Общая длина, м", type: "number", defaultValue: "100", step: "any", showWhen: { fieldId: "longInputMode", values: ["length"] } },
      { id: "inputWeightT", label: "Масса, т", type: "number", defaultValue: "1", step: "any", showWhen: { fieldId: "longInputMode", values: ["weight"] } },
      { id: "inputPieces", label: "Количество штук", type: "number", defaultValue: "10", step: "any", showWhen: { fieldId: "longInputMode", values: ["pieces"] } },
      { id: "inputSheetCount", label: "Количество листов", type: "number", defaultValue: "10", step: "any", showWhen: { fieldId: "sheetInputMode", values: ["sheets"] } },
      { id: "inputAreaM2", label: "Общая площадь, м²", type: "number", defaultValue: "100", step: "any", showWhen: { fieldId: "sheetInputMode", values: ["area"] } },
      { id: "inputSheetWeightT", label: "Масса, т", type: "number", defaultValue: "1", step: "any", showWhen: { fieldId: "sheetInputMode", values: ["weight"] } },
    ],
    visuals: [
      { title: "Арматура", description: "Периодический профиль А500С. Масса по ГОСТ 34028-2016.", image: "/images/calculators/metal/rebar.png", alt: "Арматура стальная", fieldId: "productType", value: "rebar" },
      { title: "Круг", description: "Круглый стальной пруток произвольного диаметра.", image: "/images/calculators/metal/round.png", alt: "Круг стальной", fieldId: "productType", value: "round" },
      { title: "Квадрат", description: "Стальной квадрат сплошного сечения.", image: "/images/calculators/metal/square.png", alt: "Квадрат стальной", fieldId: "productType", value: "square" },
      { title: "Шестигранник", description: "Пруток шестигранного сечения, размер под ключ.", image: "/images/calculators/metal/hexagon.png", alt: "Шестигранник стальной", fieldId: "productType", value: "hexagon" },
      { title: "Полоса", description: "Плоский стальной прокат по ширине и толщине.", image: "/images/calculators/metal/strip.png", alt: "Полоса стальная", fieldId: "productType", value: "strip" },
      { title: "Лист", description: "Листовой прокат: масса, площадь и количество листов.", image: "/images/calculators/metal/sheet.png", alt: "Лист стальной", fieldId: "productType", value: "sheet" },
      { title: "Труба круглая", description: "Наружный диаметр и толщина стенки.", image: "/images/calculators/metal/round-pipe.png", alt: "Труба стальная круглая", fieldId: "productType", value: "roundPipe" },
      { title: "Труба квадратная", description: "Квадратная профильная труба.", image: "/images/calculators/metal/square-tube.png", alt: "Труба профильная квадратная", fieldId: "productType", value: "squareTube" },
      { title: "Труба прямоугольная", description: "Прямоугольная профильная труба.", image: "/images/calculators/metal/rect-tube.png", alt: "Труба профильная прямоугольная", fieldId: "productType", value: "rectTube" },
      { title: "Уголок", description: "Горячекатаный равнополочный уголок по ГОСТ 8509-93.", image: "/images/calculators/metal/angle.png", alt: "Уголок стальной", fieldId: "productType", value: "angle" },
      { title: "Швеллер", description: "Горячекатаный швеллер серии П по ГОСТ 8240-97.", image: "/images/calculators/metal/channel.png", alt: "Швеллер стальной", fieldId: "productType", value: "channel" },
      { title: "Двутавр", description: "Горячекатаная двутавровая балка по ГОСТ 8239-89.", image: "/images/calculators/metal/i-beam.png", alt: "Двутавр стальной", fieldId: "productType", value: "beam" },
    ],
    offerColumns: metalColumns,
    calculate: metalCalculate,
    getParamsText: metalParams,
    getWarning: metalWarning,
    normalizeValues: normalizeMetalValues,
    relatedLinks: [
      { label: "Каталог металлопроката", href: "/catalog/metal-roll" },
      { label: "Арматура", href: "/catalog/rebar" },
      { label: "Все калькуляторы", href: "/calculators" },
    ],
    seoSections: [
      { title: "Что считает калькулятор металлопроката", text: "Калькулятор переводит массу в длину и количество штук, длину — в массу и количество, а для листового проката дополнительно считает площадь и число листов. Для сортаментных профилей используются табличные теоретические массы, для простых геометрических сечений — расчёт при плотности стали 7850 кг/м³." },
      { title: "Какие виды проката доступны", text: "В одном калькуляторе собраны арматура, круг, квадрат, шестигранник, полоса, стальной лист, круглая труба, квадратная и прямоугольная профильная труба, равнополочный уголок, швеллер серии П и горячекатаный двутавр." },
      { title: "Как пользоваться пересчётом", text: "Выберите изделие, задайте размеры и длину одной штуки. Затем укажите, что известно: общая длина, масса или количество штук. Для листа можно исходить из количества, площади или массы. Результат показывает как точный пересчёт, так и количество целых изделий к заказу." },
      { title: "Почему фактическая масса может отличаться", text: "Теоретическая масса определяется по номинальным размерам. Реальная партия может отличаться из-за допусков по толщине, диаметру, геометрии профиля и длине. Перед выставлением счёта менеджер IDELEON проверит сортамент, длину поставки и наличие на складе." },
      { title: "Когда нужен расчёт специалиста", text: "Обратитесь в IDELEON, если требуется смешанная спецификация, резка в размер, нестандартная длина, несколько марок стали, подбор аналогов или расчёт доставки. Скачанный Excel можно использовать как основу запроса цены." },
    ],
    faq: [
      { question: "Какую плотность стали использует калькулятор?", answer: "Для геометрических формул используется 7850 кг/м³ — стандартное значение для расчёта теоретической массы углеродистой стали." },
      { question: "Почему калькулятор показывает расчётное и целое количество штук?", answer: "Пересчёт массы или длины может дать дробное число изделий. Для заказа калькулятор отдельно округляет количество полных прутков, труб или балок вверх." },
      { question: "Какие швеллеры включены?", answer: "В первой версии используется наиболее понятный сортамент горячекатаных швеллеров серии П с параллельными гранями полок по ГОСТ 8240-97." },
      { question: "Какие уголки включены?", answer: "Калькулятор содержит распространённые равнополочные горячекатаные уголки по ГОСТ 8509-93." },
      { question: "Можно ли использовать Excel-КП для запроса цены?", answer: "Да. В файле уже будут изделие, размер, норматив, расчётная масса и поле для цены за тонну. Окончательное предложение формируется после проверки наличия и условий поставки." },
    ],
  },
  {
    slug: "profil-gkl",
    group: "gkl",
    title: "Калькулятор профиля для ГКЛ",
    shortTitle: "Профиль для ГКЛ",
    description: "Расчёт расхода профиля для потолка, выравнивания стены и перегородки из ГКЛ.",
    seoTitle: "Калькулятор профиля для ГКЛ — расчёт расхода онлайн",
    seoDescription: "Онлайн-калькулятор профиля для гипсокартона: потолок, выравнивание стены и перегородка. Расчёт ПП, ППН, ПН, ПС, подвесов и соединителей.",
    h1: "Калькулятор профиля для ГКЛ",
    intro: "Введите параметры конструкции, чтобы получить предварительный расход профилей и комплектующих. Для перегородок и выравнивания стен можно считать как по длине и высоте, так и сразу по площади в квадратных метрах. Несколько разных конструкций можно сохранить в один проект и выгрузить единым Excel-КП на одном листе.",
    offerTitle: "Коммерческое предложение / расчёт профиля для ГКЛ",
    fileName: "KP_profil_GKL_ideleon.xlsx",
    visualTitle: "Выберите тип конструкции",
    visualDescription: "Карточка переключает тип конструкции и связанные параметры расчёта.",
    fields: [
      {
        id: "constructionType",
        label: "Тип конструкции",
        type: "buttons",
        defaultValue: "ceiling",
        options: [
          { label: "Потолок", value: "ceiling" },
          { label: "Выравнивание", value: "cladding" },
          { label: "Перегородка", value: "partition" },
        ],
      },
      { id: "ceilingArea", label: "Площадь потолка, м²", type: "number", defaultValue: "200", showWhen: { fieldId: "constructionType", values: ["ceiling"] } },
      { id: "ceilingPerimeter", label: "Периметр потолка, м", type: "number", defaultValue: "40", showWhen: { fieldId: "constructionType", values: ["ceiling"] } },
      {
        id: "suspensionType",
        label: "Тип подвеса",
        type: "buttons",
        defaultValue: "direct",
        showWhen: { fieldId: "constructionType", values: ["ceiling"] },
        options: [
          { label: "Прямой подвес", value: "direct" },
          { label: "Анкерный + тяга", value: "anchor" },
        ],
      },
      {
        id: "wallInputMode",
        label: "Как задать размеры стены",
        type: "buttons",
        defaultValue: "none",
        showWhen: { fieldId: "constructionType", values: ["cladding", "partition"] },
        options: [
          { label: "По площади", value: "area" },
          { label: "По длине", value: "dimensions" },
        ],
      },
      {
        id: "wallArea",
        label: "Площадь стены / перегородки по одной стороне, м²",
        type: "number",
        defaultValue: "100",
        step: "any",
        showWhen: { fieldId: "wallInputMode", values: ["area"] },
      },
      {
        id: "wallHeight",
        label: "Высота стены / перегородки, м",
        type: "number",
        defaultValue: "3",
        step: "any",
        showWhen: { fieldId: "wallInputMode", values: ["area", "dimensions"] },
      },
      {
        id: "wallLength",
        label: "Общая длина стены / перегородки, м",
        type: "number",
        defaultValue: "10",
        step: "any",
        showWhen: { fieldId: "wallInputMode", values: ["dimensions"] },
      },
      {
        id: "partitionWidth",
        label: "Ширина профиля перегородки",
        type: "buttons",
        defaultValue: "50",
        showWhen: { fieldId: "constructionType", values: ["partition"] },
        options: [
          { label: "50", value: "50" },
          { label: "75", value: "75" },
          { label: "100", value: "100" },
        ],
      },
      {
        id: "ceilingProfileLengthMm",
        label: "Длина ПП 60×27, мм",
        type: "select",
        defaultValue: "3000",
        showWhen: { fieldId: "constructionType", values: ["ceiling", "cladding"] },
        options: [
          { label: "3000 мм", value: "3000" },
          { label: "4000 мм", value: "4000" },
        ],
      },
      {
        id: "studProfileLengthMm",
        label: "Длина стоечного профиля, мм",
        type: "select",
        defaultValue: "3000",
        showWhen: { fieldId: "constructionType", values: ["partition"] },
        options: [
          { label: "3000 мм", value: "3000" },
          { label: "4000 мм", value: "4000" },
        ],
      },
      commonReserveField,
    ],
    visuals: [
      { title: "Потолок из ГКЛ", description: "ПП 60×27, ППН 27×28, подвесы и соединители.", image: "/images/calculators/gkl/gkl-ceiling.png", alt: "Схема потолочного каркаса ГКЛ", fieldId: "constructionType", value: "ceiling" },
      { title: "Выравнивание стены", description: "ПП 60×27 на прямых подвесах к основанию стены.", image: "/images/calculators/gkl/gkl-wall-alignment.png", alt: "Схема выравнивания стены ГКЛ", fieldId: "constructionType", value: "cladding" },
      { title: "Перегородка", description: "ПН/ПС 50, 75 или 100 мм и листовая обшивка.", image: "/images/calculators/gkl/gkl-partition.png", alt: "Схема перегородки ГКЛ", fieldId: "constructionType", value: "partition" },
    ],
    offerColumns: gklColumns,
    calculate: gklCalculate,
    getParamsText: gklParams,
    normalizeValues: normalizeGklValues,
    seoSections: [
      { title: "Что считает калькулятор профиля для ГКЛ", text: "Калькулятор помогает предварительно оценить расход листов, профилей, подвесов и соединителей для типовых конструкций из гипсокартона. Для выравнивания стен и перегородок исходные данные можно задать двумя способами: площадью и высотой либо длиной и высотой. Итоговый расчёт лучше проверять по проекту, потому что на расход влияют шаг профилей, количество слоёв, проёмы и требования к конструкции." },
      { title: "Когда стоит отправить расчёт в Иделеон", text: "Если у вас есть ведомость, проект или список материалов, отправьте расчёт нам. Мы проверим комплектность, подберём позиции под объект и подготовим коммерческое предложение." },
      { title: "Как объединить несколько перегородок в одно КП", text: "После каждого расчёта добавьте конструкцию в проект. Сохранённые перегородки, обшивки и потолки останутся в браузере. Единое Excel-КП разместит все расчёты отдельными блоками на одном листе, а внизу сформирует суммарную спецификацию одинаковых материалов." },
    ],
    faq: [
      { question: "Можно ли считать перегородку или обшивку сразу по квадратным метрам?", answer: "Да. Выберите способ «По площади», укажите площадь конструкции по одной стороне и её высоту. Калькулятор самостоятельно определит расчётную длину и выполнит дальнейший расчёт." },
      { question: "Можно ли включить несколько разных перегородок в одно КП?", answer: "Да. Добавляйте каждый выполненный расчёт в проект. Затем скачайте единое КП: на одном листе будут отдельные блоки по каждой конструкции и общая сводная спецификация в конце." },
      { question: "Можно ли использовать расчёт как финальную спецификацию?", answer: "Нет. Это предварительный расчёт для оценки расхода. Финальную комплектацию лучше проверять по проекту." },
      { question: "Почему выравнивание стены считается через ПП 60×27?", answer: "Потому что в этом варианте каркас крепится к стене на прямых подвесах и собирается на потолочной паре ПП 60×27 и ППН 27×28." },
    ],
  },
  {
    slug: "grilyato",
    group: "grilyato",
    title: "Калькулятор потолка Грильято",
    shortTitle: "Грильято",
    description: "Расчёт стандартного, нестандартного, пирамидального и разноуровневого Грильято.",
    seoTitle: "Калькулятор Грильято — расчёт потолка онлайн",
    seoDescription: "Расчёт расхода потолка Грильято по площади, периметру, типу системы и размеру ячейки. Скачать КП Excel и отправить заявку в Иделеон.",
    h1: "Калькулятор потолка Грильято",
    intro: "Выберите тип Грильято, размер ячейки, площадь и периметр помещения. Калькулятор рассчитает предварительную комплектацию и сформирует Excel-файл.",
    offerTitle: "Коммерческое предложение / расчёт потолка Грильято",
    fileName: "KP_grilyato_ideleon.xlsx",
    visualTitle: "Выберите вариант потолка Грильято",
    visualDescription: "Карточка переключает тип системы и сразу обновляет параметры расчёта.",
    fields: [
      areaField, perimeterField,
      {
        id: "grilyatoType",
        label: "Тип Грильято",
        type: "buttons",
        defaultValue: "standard",
        options: [
          { label: "Стандарт", value: "standard" },
          { label: "Нестандарт", value: "nonstandard" },
          { label: "Пирамидальное", value: "pyramidal" },
          { label: "Разноуровневое", value: "multilevel" },
        ],
      },
      { id: "cellSize", label: "Ячейка", type: "select", defaultValue: "100×100", options: standardCellOptions.map((item) => ({ label: item, value: item })) },
      commonReserveField,
    ],
    visuals: [
      { title: "Стандартное", description: "Классическая открытая ячейка.", image: "/images/calculators/grilyato/grilyato-standard.png", alt: "Схема стандартного Грильято", fieldId: "grilyatoType", value: "standard" },
      { title: "Нестандартная ячейка", description: "Модели с отличающимся размером ячейки.", image: "/images/calculators/grilyato/grilyato-nonstandard-model-1.png", alt: "Схема нестандартного Грильято", fieldId: "grilyatoType", value: "nonstandard" },
      { title: "Пирамидальное", description: "Профиль с объёмным визуальным эффектом.", image: "/images/calculators/grilyato/grilyato-pyramidal.png", alt: "Схема пирамидального Грильято", fieldId: "grilyatoType", value: "pyramidal" },
      { title: "Разноуровневое", description: "Система с перепадом высоты элементов.", image: "/images/calculators/grilyato/grilyato-multilevel.png", alt: "Схема разноуровневого Грильято", fieldId: "grilyatoType", value: "multilevel" },
    ],
    offerColumns: grilyatoColumns,
    calculate: grilyatoCalculate,
    getParamsText: grilyatoParams,
    seoSections: [
      { title: "Что входит в расчёт потолка Грильято", text: "В расчёт входят профили решётки, несущие направляющие, соединительные элементы, подвесы и уголок. Состав зависит от типа системы и размера ячейки." },
      { title: "Почему расчёт предварительный", text: "На итоговый расход влияют раскладка потолка, примыкания, подрезка, светильники, инженерные элементы и особенности помещения. Для коммерческого предложения расчёт лучше проверить по проекту." },
    ],
    faq: [
      { question: "Почему решётка не выводится в КП?", answer: "В некоторых вариантах решётка используется как расчётная база, но клиенту удобнее видеть состав элементов: мама, папа, направляющие, подвесы и уголок." },
      { question: "Можно ли заполнить цены за погонный метр?", answer: "Да. Для профильных элементов Excel сам пересчитает цену за штуку и сумму по длине элемента." },
    ],
  },
  {
    slug: "grilyato-gl",
    group: "grilyato",
    title: "Калькулятор Грильято GL",
    shortTitle: "Грильято GL",
    description: "Расчёт потолка Грильято GL15 / GL24 по площади, периметру, ячейке и схеме монтажа.",
    seoTitle: "Калькулятор Грильято GL15 и GL24",
    seoDescription: "Онлайн расчёт потолка Грильято GL15 и GL24. Подбор элементов, Excel КП и отправка расчёта в Иделеон.",
    h1: "Калькулятор Грильято GL",
    intro: "Калькулятор помогает предварительно рассчитать систему Грильято GL15 или GL24 и сформировать Excel-файл для дальнейшей работы.",
    offerTitle: "Коммерческое предложение / расчёт потолка Грильято GL",
    fileName: "KP_grilyato_GL_ideleon.xlsx",
    visualTitle: "Выберите вариант системы Грильято GL",
    visualDescription: "Визуальный выбор работает вместе с полями калькулятора и обновляет результат.",
    fields: [
      areaField, perimeterField,
      { id: "glType", label: "Тип системы", type: "buttons", defaultValue: "GL15", options: [{ label: "GL15", value: "GL15" }, { label: "GL24", value: "GL24" }] },
      { id: "cellSize", label: "Ячейка", type: "select", defaultValue: "100×100", options: ["50×50", "60×60", "75×75", "86×86", "100×100", "120×120", "150×150", "200×200"].map((item) => ({ label: item, value: item })) },
      mountSchemeField,
      commonReserveField,
    ],
    visuals: [
      { title: "GL15", description: "Тонкий визуальный профиль.", image: "/images/calculators/grilyato-gl/grilyato-gl15.png", alt: "Схема Грильято GL15", fieldId: "glType", value: "GL15" },
      { title: "GL24", description: "Более выраженная подвесная система.", image: "/images/calculators/grilyato-gl/grilyato-gl24.png", alt: "Схема Грильято GL24", fieldId: "glType", value: "GL24" },
      { title: "Размеры ячеек", description: "Чем меньше ячейка, тем выше расход профилей.", image: "/images/calculators/grilyato-gl/grilyato-cell-sizes.png", alt: "Размеры ячеек Грильято" },
    ],
    offerColumns: grilyatoColumns,
    calculate: glCalculate,
    getParamsText: glParams,
    seoSections: [
      { title: "Чем отличается Грильято GL", text: "Системы GL15 и GL24 отличаются визуальной шириной профиля и применяются там, где важны внешний вид потолка, шаг ячейки и совместимость с подвесной системой." },
      { title: "Как использовать расчёт", text: "Введите площадь, периметр, тип системы и размер ячейки. После расчёта можно скачать КП Excel или отправить файл в Иделеон для проверки." },
    ],
    faq: [
      { question: "GL15 и GL24 считаются одинаково?", answer: "Базовая логика похожа, но отличаются профиль и номенклатура. В расчёте это отражено через выбранный тип системы." },
    ],
  },
  {
    slug: "diagonalnoe-grilyato",
    group: "grilyato",
    title: "Калькулятор диагонального Грильято",
    shortTitle: "Диагональное Грильято",
    description: "Расчёт диагонального Грильято D-15 по площади, периметру и схеме монтажа.",
    seoTitle: "Калькулятор диагонального Грильято D-15",
    seoDescription: "Онлайн расчёт диагонального Грильято D-15: элементы, направляющие, диагональные профили, Excel КП.",
    h1: "Калькулятор диагонального Грильято",
    intro: "Диагональное Грильято имеет отдельный состав элементов, поэтому вынесено в отдельный расчёт.",
    offerTitle: "Коммерческое предложение / расчёт диагонального Грильято",
    fileName: "KP_diagonalnoe_grilyato_ideleon.xlsx",
    visualTitle: "Выберите вариант диагонального Грильято",
    visualDescription: "Карточка помогает выбрать исполнение перед вводом параметров объекта.",
    fields: [areaField, perimeterField, mountSchemeField, commonReserveField],
    visuals: [
      { title: "Диагональное D-15", description: "Система с диагональными элементами в ячейке.", image: "/images/calculators/grilyato/grilyato-dl15.png", alt: "Схема диагонального Грильято D-15" },
    ],
    offerColumns: grilyatoColumns,
    calculate: diagonalCalculate,
    getParamsText: simpleAreaPerimeterParams("Диагональное Грильято"),
    seoSections: [
      { title: "Особенность диагонального Грильято", text: "В отличие от стандартного Грильято, диагональная система включает дополнительные диагональные элементы. Из-за этого состав КП отличается от стандартной решётки." },
    ],
    faq: [
      { question: "Почему диагональное Грильято вынесено отдельно?", answer: "Потому что у него другой состав элементов и другие коэффициенты расхода." },
    ],
  },
  {
    slug: "treugolnoe-grilyato",
    group: "grilyato",
    title: "Калькулятор треугольного Грильято",
    shortTitle: "Треугольное Грильято",
    description: "Расчёт треугольного Грильято STA-150.",
    seoTitle: "Калькулятор треугольного Грильято STA-150",
    seoDescription: "Расчёт треугольного Грильято STA-150: профили мама/папа, диагональные элементы, направляющие, подвесы и обрамление.",
    h1: "Калькулятор треугольного Грильято",
    intro: "Треугольное Грильято имеет собственную геометрию ячейки и отдельный состав элементов. Калькулятор формирует предварительный расчёт и Excel-КП.",
    offerTitle: "Коммерческое предложение / расчёт треугольного Грильято",
    fileName: "KP_treugolnoe_grilyato_ideleon.xlsx",
    visualTitle: "Выберите вариант треугольного Грильято",
    visualDescription: "Карточка переключает вариант системы и сохраняет единый порядок работы калькулятора.",
    fields: [areaField, perimeterField, commonReserveField],
    visuals: [
      { title: "Треугольное STA-150", description: "Система с треугольной геометрией ячейки.", image: "/images/calculators/grilyato/grilyato-triangle.png", alt: "Схема треугольного Грильято STA-150" },
    ],
    offerColumns: grilyatoColumns,
    calculate: triangleCalculate,
    getParamsText: simpleAreaPerimeterParams("Треугольное Грильято"),
    seoSections: [
      { title: "Что считает калькулятор треугольного Грильято", text: "Расчёт включает профили мама/папа, диагональные элементы, несущие направляющие, подвесы, соединительные элементы и обрамляющий профиль." },
    ],
    faq: [
      { question: "Можно ли считать треугольное Грильято как стандартное?", answer: "Нет. У него другая геометрия и другой состав элементов, поэтому нужен отдельный расчёт." },
    ],
  },

  {
    slug: "kassetnyy-potolok-otkrytaya-sistema",
    group: "cassette",
    title: "Калькулятор кассетного потолка на открытой системе",
    shortTitle: "Открытая подвесная система",
    description: "Расчёт кассет, Т-профилей, уголка и подвесов с выбором класса системы и типа кромки.",
    seoTitle: "Калькулятор открытого кассетного потолка — BOARD, LINE, TEGULAR и MICROLOOK",
    seoDescription: "Расчёт открытого кассетного потолка по площади, размеру кассет, классу Т-системы, кромке BOARD, LINE, TEGULAR или MICROLOOK 15 и схеме монтажа.",
    h1: "Калькулятор кассетного потолка на открытой системе",
    intro: "Рассчитайте кассеты и комплектующие для открытой подвесной системы. Класс Эконом, Стандарт, Премиум или Дизайнерский помогает выбрать уровень решения, но не меняет коэффициенты расхода. Для STRUNA калькулятор автоматически использует специальные кассеты MICROLOOK 15.",
    offerTitle: "Коммерческое предложение / открытый кассетный потолок",
    fileName: "KP_kassetnyy_potolok_otkrytaya_sistema_ideleon.xlsx",
    fields: [
      areaField,
      perimeterField,
      {
        id: "systemClass",
        label: "Класс подвесной системы",
        type: "buttons",
        defaultValue: "standard",
        options: [
          { label: "Эконом", value: "economy" },
          { label: "Стандарт", value: "standard" },
          { label: "Премиум", value: "premium" },
          { label: "Дизайнерский", value: "designer" },
        ],
      },
      { id: "module", label: "Размер кассеты", type: "buttons", defaultValue: "600×600", options: cassetteModules.map((item) => ({ label: item, value: item })) },
      {
        id: "edge",
        label: "Тип кромки",
        type: "buttons",
        defaultValue: "board",
        hideInput: true,
        options: [
          { label: "BOARD", value: "board" },
          { label: "LINE", value: "line" },
          { label: "TEGULAR 45°", value: "tegular45" },
          { label: "TEGULAR 90°", value: "tegular90" },
          { label: "MICROLOOK 15", value: "microlook" },
        ],
      },
      {
        id: "edgeDrop",
        label: "Опускание панели",
        type: "buttons",
        defaultValue: "A6",
        showWhen: { fieldId: "edge", values: ["tegular45", "tegular90", "microlook"] },
        options: [
          { label: "A6 — 6,5 мм", value: "A6" },
          { label: "A8 — 8,9 мм", value: "A8" },
        ],
      },
      mountSchemeField,
      commonReserveField,
    ],
    visuals: [],
    visualGroups: [
      {
        title: "Выберите тип кромки кассеты",
        description: "Карточка меняет параметр калькулятора. Класс системы влияет на ассортимент и внешний вид, но не на коэффициенты расхода.",
        showWhen: { fieldId: "systemClass", values: ["economy", "standard", "premium"] },
        visuals: [
          {
            title: "BOARD",
            description: "Прямоугольная приподнятая кромка: кассета визуально находится немного выше видимой Т-системы.",
            image: "/images/calculators/cassette/cassette-edge-board.webp",
            alt: "Интерьер открытого кассетного потолка с кромкой BOARD",
            diagram: "/images/calculators/cassette/cassette-edge-board-diagram.svg",
            diagramAlt: "Техническая схема прямоугольной приподнятой кромки BOARD",
            fieldId: "edge",
            value: "board",
          },
          {
            title: "LINE",
            description: "Прямоугольная одноуровневая кромка: плоскость кассеты и видимая Т-система воспринимаются в одном уровне.",
            image: "/images/calculators/cassette/cassette-edge-line.webp",
            alt: "Интерьер открытого кассетного потолка с кромкой LINE",
            diagram: "/images/calculators/cassette/cassette-edge-line-diagram.svg",
            diagramAlt: "Техническая схема прямоугольной одноуровневой кромки LINE",
            fieldId: "edge",
            value: "line",
          },
          {
            title: "TEGULAR 45°",
            description: "Кассета опущена ниже Т-профиля, скошенная грань формирует мягкую теневую линию.",
            image: "/images/calculators/cassette/cassette-edge-tegular45.webp",
            alt: "Интерьер открытого кассетного потолка с кромкой TEGULAR 45 градусов",
            diagram: "/images/calculators/cassette/cassette-edge-tegular45-diagram.svg",
            diagramAlt: "Техническая схема кромки TEGULAR 45 градусов с опусканием",
            fieldId: "edge",
            value: "tegular45",
          },
          {
            title: "TEGULAR 90°",
            description: "Кассета опущена ниже Т-профиля, прямая вертикальная грань создаёт чёткую геометрию.",
            image: "/images/calculators/cassette/cassette-edge-tegular90.webp",
            alt: "Интерьер открытого кассетного потолка с кромкой TEGULAR 90 градусов",
            diagram: "/images/calculators/cassette/cassette-edge-tegular90-diagram.svg",
            diagramAlt: "Техническая схема кромки TEGULAR 90 градусов с опусканием",
            fieldId: "edge",
            value: "tegular90",
          },
        ],
      },
      {
        title: "Дизайнерская система STRUNA",
        description: "Для профиля шириной 15 мм применяются специальные кассеты MICROLOOK 15. Доступны опускания A6 и A8.",
        showWhen: { fieldId: "systemClass", values: ["designer"] },
        visuals: [
          {
            title: "MICROLOOK 15",
            description: "Специальная кромка для дизайнерской системы STRUNA. Размеры: 300×600, 300×1200, 600×600 и 600×1200 мм.",
            image: "/images/calculators/cassette/cassette-edge-microlook15.webp",
            alt: "Интерьер кассетного потолка STRUNA с кромкой MICROLOOK 15",
            diagram: "/images/calculators/cassette/cassette-edge-microlook15-diagram.svg",
            diagramAlt: "Техническая схема кромки MICROLOOK 15 для профиля STRUNA",
            fieldId: "edge",
            value: "microlook",
          },
        ],
      },
    ],
    offerColumns: cassetteColumns,
    calculate: openCassetteCalculate,
    getParamsText: openCassetteParams,
    getWarning: openCassetteWarning,
    normalizeValues: normalizeOpenCassetteValues,
    relatedLinks: [
      { label: "Калькулятор закрытой кассетной системы", href: "/calculators/kassetnyy-potolok-skrytaya-sistema" },
      { label: "Все калькуляторы", href: "/calculators" },
      { label: "Каталог кассетных потолков", href: "/catalog" },
    ],
    seoSections: [
      { title: "Что считает калькулятор открытой системы", text: "Калькулятор определяет количество кассет, несущих и поперечных направляющих, пристенного уголка и подвесов. Формулы и коэффициенты перенесены из Excel-калькулятора IDELEON. Количество кассет зависит от площади и размера панели; тип кромки сам по себе количество кассет не меняет." },
      { title: "Как выбрать класс подвесной системы", text: "Эконом и Стандарт подходят для объектов с жёстким бюджетом. Премиум выбирают при повышенных требованиях к качеству исполнения и внешнему виду. Дизайнерский класс — система STRUNA с видимым профилем 15 мм и специальными кассетами MICROLOOK 15. Коэффициенты расхода для классов одинаковы." },
      { title: "Как выбрать кромку кассеты", text: "BOARD немного приподнимает кассету над Т-системой, LINE создаёт одноуровневую плоскость, TEGULAR 45° формирует мягкий скошенный край, TEGULAR 90° — строгий прямоугольный край. Для TEGULAR и MICROLOOK выбирается опускание A6 — 6,5 мм или A8 — 8,9 мм." },
      { title: "Когда нужен точный проектный расчёт", text: "Предварительный результат нужно проверить по раскладке, если помещение имеет сложную геометрию, много подрезки, светильников, вентиляционных решёток, люков или перепадов высоты. Специалисты IDELEON уточнят совместимость и подготовят спецификацию по проекту." },
    ],
    faq: [
      { question: "Меняет ли класс Эконом, Стандарт или Премиум расход материалов?", answer: "Нет. Класс нужен для понятного выбора уровня цены и внешнего вида. Коэффициенты расхода одинаковы." },
      { question: "Какие кассеты подходят к STRUNA?", answer: "Только специальные кассеты с кромкой MICROLOOK 15. Калькулятор учитывает размеры 300×600, 300×1200, 600×600 и 600×1200 мм, а также опускания A6 и A8." },
      { question: "Почему LINE и TEGULAR 45° ограничены размером 600×600?", answer: "Такое ограничение заложено в исходном Excel-калькуляторе и ассортиментной совместимости." },
      { question: "Можно ли сразу использовать расчёт для заказа?", answer: "Расчёт предварительный. Перед заказом лучше проверить раскладку и инженерные элементы по проекту." },
    ],
  },
  {
    slug: "kassetnyy-potolok-skrytaya-sistema",
    group: "cassette",
    title: "Калькулятор кассетного потолка на закрытой системе",
    shortTitle: "Закрытая подвесная система",
    description: "Расчёт закрытой системы без видимой Т-сетки: простой или усиленный монтаж.",
    seoTitle: "Калькулятор закрытого кассетного потолка — простой и усиленный монтаж",
    seoDescription: "Расчёт закрытого кассетного потолка: кассеты АС, стрингер ВТ-600 длиной 4 м, простой или усиленный монтаж, подвесы, профили и Excel-КП.",
    h1: "Калькулятор кассетного потолка на закрытой системе",
    intro: "В закрытой системе несущая конструкция не образует видимую Т-образную сетку между кассетами. Выберите простой или усиленный монтаж, размер панели и кромку 45° или 90° — состав Excel-КП изменится автоматически.",
    offerTitle: "Коммерческое предложение / закрытый кассетный потолок",
    fileName: "KP_kassetnyy_potolok_skrytaya_sistema_ideleon.xlsx",
    fields: [
      areaField,
      perimeterField,
      {
        id: "hiddenMountScheme",
        label: "Схема монтажа",
        type: "buttons",
        defaultValue: "simple",
        hideInput: true,
        options: [
          { label: "Простой монтаж", value: "simple" },
          { label: "Усиленный монтаж", value: "reinforced" },
        ],
      },
      { id: "module", label: "Размер кассеты", type: "buttons", defaultValue: "600×600", options: cassetteModules.map((item) => ({ label: item, value: item })) },
      {
        id: "hiddenEdge",
        label: "Тип кромки",
        type: "buttons",
        defaultValue: "90",
        hideInput: true,
        options: [
          { label: "45°", value: "45" },
          { label: "90°", value: "90" },
        ],
      },
      commonReserveField,
    ],
    visuals: [],
    visualGroups: [
      {
        title: "Выберите схему монтажа",
        description: "Простой монтаж использует стрингер ВТ-600 и нониусные подвесы. В усиленной схеме добавляется отдельный каркас из профилей.",
        visuals: [
          {
            title: "Простой монтаж",
            description: "Стрингер ВТ-600 длиной 4 м, уголок PL и комплект нониусного подвеса. Подходит для большинства типовых помещений.",
            image: "/images/calculators/cassette/cassette-hidden-simple.webp",
            alt: "Монтаж кассеты закрытого потолка на простой системе",
            diagram: "/images/calculators/cassette/cassette-hidden-simple-diagram.png",
            diagramAlt: "Техническая схема простого монтажа закрытой системы на стрингере ВТ-600",
            fieldId: "hiddenMountScheme",
            value: "simple",
          },
          {
            title: "Усиленный монтаж",
            description: "Дополнительный каркас ПП-1-2 и ППН-2, двухуровневые соединители, анкерные подвесы и тяги.",
            image: "/images/calculators/cassette/cassette-hidden-reinforced.webp",
            alt: "Интерьер закрытого кассетного потолка с усиленной системой",
            diagram: "/images/calculators/cassette/cassette-hidden-reinforced-diagram.png",
            diagramAlt: "Техническая схема усиленного монтажа закрытой системы с профилем ПП-1-2",
            fieldId: "hiddenMountScheme",
            value: "reinforced",
          },
        ],
      },
      {
        title: "Выберите кромку кассеты",
        description: "Кромка влияет на внешний вид и совместимость, но не меняет количество кассет при одинаковом размере панели.",
        visuals: [
          {
            title: "Кромка 45°",
            description: "Скошенная грань создаёт более мягкий стык. По исходному Excel доступна для кассеты 600×600 мм.",
            image: "/images/calculators/cassette/cassette-hidden-edge45.webp",
            alt: "Интерьер закрытого кассетного потолка с кромкой 45 градусов",
            fieldId: "hiddenEdge",
            value: "45",
          },
          {
            title: "Кромка 90°",
            description: "Прямоугольная грань и чёткий стык. Доступна для всех размеров кассет, предусмотренных калькулятором.",
            image: "/images/calculators/cassette/cassette-hidden-edge90.webp",
            alt: "Интерьер закрытого кассетного потолка с кромкой 90 градусов",
            fieldId: "hiddenEdge",
            value: "90",
          },
        ],
      },
    ],
    offerColumns: cassetteColumns,
    calculate: hiddenCassetteCalculate,
    getParamsText: hiddenCassetteParams,
    getWarning: hiddenCassetteWarning,
    relatedLinks: [
      { label: "Калькулятор открытой кассетной системы", href: "/calculators/kassetnyy-potolok-otkrytaya-sistema" },
      { label: "Все калькуляторы", href: "/calculators" },
      { label: "Каталог кассетных потолков", href: "/catalog" },
    ],
    seoSections: [
      { title: "Что считает калькулятор закрытой системы", text: "Для обеих схем рассчитываются кассеты, стрингеры ВТ-600 длиной 4 м и пристенный уголок. В простом монтаже дополнительно считаются верхняя и нижняя части нониусного подвеса и шплинт. В усиленном монтаже добавляются профили ПП-1-2 и ППН-2, двухуровневые соединители, анкерные подвесы и тяги." },
      { title: "Как выбрать простой или усиленный монтаж", text: "Простой монтаж подходит для большинства типовых помещений и использует меньше элементов. Усиленный выбирают при повышенной нагрузке, сложной геометрии, больших пролётах или требованиях проекта к дополнительному каркасу." },
      { title: "Как выбрать кромку закрытой кассеты", text: "Кромка 90° подходит для всех размеров, заложенных в исходных таблицах. Кромка 45° предусмотрена для панели 600×600 мм. В обоих случаях Т-образная сетка между кассетами не видна." },
      { title: "Когда нужен точный проектный расчёт", text: "Раскладку необходимо проверить по проекту при большом количестве светильников, вентиляции, люков, нестандартных примыканий и подрезки. Для усиленной схемы особенно важно подтвердить шаг дополнительного каркаса и точки подвеса." },
    ],
    faq: [
      { question: "Какой длины стрингер ВТ-600 используется в расчёте?", answer: "Четыре метра. Количество округляется до целых четырёхметровых элементов с последующим учётом запаса." },
      { question: "Чем усиленная схема отличается по составу?", answer: "В ней появляются ПП-1-2, ППН-2, двухуровневые соединители, анкерные подвесы и тяги. Простая схема использует нониусный подвес." },
      { question: "Видна ли Т-система у закрытого потолка?", answer: "Нет. Между кассетами остаются аккуратные стыки, а несущая конструкция скрыта." },
      { question: "Можно ли выбрать кромку 45° для панели 300×600?", answer: "Нет. Исходные Excel-калькуляторы разрешают кромку 45° только для панели 600×600 мм." },
    ],
  }
];

export function getCalculator(slug: string) {
  return calculators.find((calculator) => calculator.slug === slug);
}

export function getCalculatorSlugs() {
  return calculators.map((calculator) => calculator.slug);
}
