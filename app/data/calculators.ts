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
  group: "gkl" | "grilyato" | "cassette";
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
    const area = toNumber(values.wallHeight) * toNumber(values.wallLength);
    const length = values.ceilingProfileLengthMm || "3000";
    push("Лист ГКЛ", "м²", "Площадь стены × 1", area);
    push(`Профиль ПП 60×27, ${profileLengthLabel(length)}`, "пог. м", "Площадь стены × 2", area * 2, length);
    push("Профиль ППН 27×28", "пог. м", "Площадь стены × 0,7", area * 0.7);
    push("Прямой подвес", "шт.", "Площадь стены × 0,7", area * 0.7);
  }

  if (type === "partition") {
    const area = toNumber(values.wallHeight) * toNumber(values.wallLength);
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
  if (type === "cladding") {
    const area = toNumber(values.wallHeight) * toNumber(values.wallLength);
    return `Выравнивание стены ГКЛ; высота: ${values.wallHeight} м; длина: ${values.wallLength} м; площадь: ${fmt(area)} м²; длина ПП 60×27: ${values.ceilingProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
  }
  const area = toNumber(values.wallHeight) * toNumber(values.wallLength);
  return `Перегородка из ГКЛ; высота: ${values.wallHeight} м; длина: ${values.wallLength} м; площадь: ${fmt(area)} м²; профиль: ${values.partitionWidth} мм; длина стоечного профиля: ${values.studProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
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
    slug: "profil-gkl",
    group: "gkl",
    title: "Калькулятор профиля для ГКЛ",
    shortTitle: "Профиль для ГКЛ",
    description: "Расчёт расхода профиля для потолка, выравнивания стены и перегородки из ГКЛ.",
    seoTitle: "Калькулятор профиля для ГКЛ — расчёт расхода онлайн",
    seoDescription: "Онлайн-калькулятор профиля для гипсокартона: потолок, выравнивание стены и перегородка. Расчёт ПП, ППН, ПН, ПС, подвесов и соединителей.",
    h1: "Калькулятор профиля для ГКЛ",
    intro: "Введите параметры конструкции, чтобы получить предварительный расход профилей и комплектующих. Расчёт можно скачать в Excel и отправить в Иделеон.",
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
      { id: "wallHeight", label: "Высота, м", type: "number", defaultValue: "3", showWhen: { fieldId: "constructionType", values: ["cladding", "partition"] } },
      { id: "wallLength", label: "Длина, м", type: "number", defaultValue: "10", showWhen: { fieldId: "constructionType", values: ["cladding", "partition"] } },
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
    seoSections: [
      { title: "Что считает калькулятор профиля для ГКЛ", text: "Калькулятор помогает предварительно оценить расход листов, профилей, подвесов и соединителей для типовых конструкций из гипсокартона. Итоговый расчёт лучше проверять по проекту, потому что на расход влияют высота, шаг профилей, количество слоёв, проёмы и требования к конструкции." },
      { title: "Когда стоит отправить расчёт в Иделеон", text: "Если у вас есть ведомость, проект или список материалов, отправьте расчёт нам. Мы проверим комплектность, подберём позиции под объект и подготовим коммерческое предложение." },
    ],
    faq: [
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
            diagram: "/images/calculators/cassette/cassette-hidden-simple-diagram.svg",
            diagramAlt: "Техническая схема простого монтажа закрытой системы на стрингере ВТ-600",
            fieldId: "hiddenMountScheme",
            value: "simple",
          },
          {
            title: "Усиленный монтаж",
            description: "Дополнительный каркас ПП-1-2 и ППН-2, двухуровневые соединители, анкерные подвесы и тяги.",
            image: "/images/calculators/cassette/cassette-hidden-reinforced.webp",
            alt: "Интерьер закрытого кассетного потолка с усиленной системой",
            diagram: "/images/calculators/cassette/cassette-hidden-reinforced-diagram.svg",
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
            diagram: "/images/calculators/cassette/cassette-hidden-edge45-diagram.svg",
            diagramAlt: "Техническая схема закрытой кассеты с кромкой AC 45 градусов",
            fieldId: "hiddenEdge",
            value: "45",
          },
          {
            title: "Кромка 90°",
            description: "Прямоугольная грань и чёткий стык. Доступна для всех размеров кассет, предусмотренных калькулятором.",
            image: "/images/calculators/cassette/cassette-hidden-edge90.webp",
            alt: "Интерьер закрытого кассетного потолка с кромкой 90 градусов",
            diagram: "/images/calculators/cassette/cassette-hidden-edge90-diagram.svg",
            diagramAlt: "Техническая схема закрытой кассеты с кромкой AC 90 градусов",
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
