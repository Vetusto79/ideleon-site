export type CalculatorFieldOption = {
  label: string;
  value: string;
};

export type CalculatorField = {
  id: string;
  label: string;
  type: "number" | "text" | "buttons" | "select";
  defaultValue: string;
  unit?: string;
  options?: CalculatorFieldOption[];
  showWhen?: {
    fieldId: string;
    values: string[];
  };
};

export type CalculatorVisual = {
  title: string;
  description: string;
  image: string;
  alt: string;
  fieldId?: string;
  value?: string;
};

export type OfferColumnKey =
  | "index"
  | "name"
  | "size"
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
  group: "gkl" | "grilyato";
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
  offerColumns: OfferColumn[];
  calculate: (values: Record<string, string>) => CalculatorResultRow[];
  getParamsText: (values: Record<string, string>) => string;
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
];

export function getCalculator(slug: string) {
  return calculators.find((calculator) => calculator.slug === slug);
}

export function getCalculatorSlugs() {
  return calculators.map((calculator) => calculator.slug);
}
