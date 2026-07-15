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
  group: "gkl" | "grilyato" | "cassette" | "metal" | "sandwich" | "blocks" | "rack" | "facade";
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

function gklProfileQuantityWithReserve(quantityMeters: number, values: Record<string, string>, profileLengthMm?: string | null) {
  const quantityWithReserve = addReserve(quantityMeters, reserve(values));
  const profileLengthM = profileLengthMm ? toNumber(profileLengthMm) / 1000 : 0;

  if (profileLengthM > 0) {
    return roundUp(quantityWithReserve, profileLengthM);
  }

  return roundUp(quantityWithReserve, 0.01);
}

function gklProfileCoefficient(baseCoefficient: string, profileLengthMm?: string | null) {
  const profileLengthM = profileLengthMm ? toNumber(profileLengthMm) / 1000 : 0;
  return profileLengthM > 0
    ? `${baseCoefficient}; округление до целых профилей по ${fmt(profileLengthM)} м`
    : baseCoefficient;
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
    const isProfileInMeters = unit === "пог. м" && Boolean(profileLengthMm);
    const finalQuantity = isProfileInMeters
      ? gklProfileQuantityWithReserve(quantity, values, profileLengthMm)
      : roundUp(addReserve(quantity, reserveValue), unit === "шт." ? 1 : 0.01);

    rows.push(resultRow({
      name,
      unit,
      coefficient: isProfileInMeters ? gklProfileCoefficient(coefficient, profileLengthMm) : coefficient,
      quantity: finalQuantity,
      lengthM: profileLengthMm ? toNumber(profileLengthMm) / 1000 : null,
      priceUnit: unit === "пог. м" ? "м.п." : unit,
      priceMode: "quantity",
    }));
  }

  if (type === "ceiling") {
    const area = toNumber(values.ceilingArea);
    const perimeter = toNumber(values.ceilingPerimeter);
    const length = values.ceilingProfileLengthMm || "3000";
    const guideLength = values.ceilingGuideProfileLengthMm || "3000";
    push("Лист ГКЛ", "м²", "Площадь потолка × 1", area);
    push(`Профиль ПП 60×27, ${profileLengthLabel(length)}`, "пог. м", "Площадь потолка × 2,9", area * 2.9, length);
    push(`Профиль ППН 27×28, ${profileLengthLabel(guideLength)}`, "пог. м", "Периметр потолка × 1", perimeter, guideLength);
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
    const guideLength = values.ceilingGuideProfileLengthMm || "3000";
    push("Лист ГКЛ", "м²", "Площадь стены × 1", area);
    push(`Профиль ПП 60×27, ${profileLengthLabel(length)}`, "пог. м", "Площадь стены × 2", area * 2, length);
    push(`Профиль ППН 27×28, ${profileLengthLabel(guideLength)}`, "пог. м", "Площадь стены × 0,7", area * 0.7, guideLength);
    push("Прямой подвес", "шт.", "Площадь стены × 0,7", area * 0.7);
  }

  if (type === "partition") {
    const area = gklWallArea(values);
    const width = values.partitionWidth || "50";
    const length = values.studProfileLengthMm || "3000";
    const guideLength = values.partitionGuideProfileLengthMm || "3000";
    const guideName = width === "50" ? "Профиль ПН 50×40" : width === "75" ? "Профиль ПН 75×40" : "Профиль ПН 100×40";
    const studName = width === "50" ? "Профиль ПС 50×50" : width === "75" ? "Профиль ПС 75×50" : "Профиль ПС 100×50";
    push("Лист ГКЛ", "м²", "Площадь перегородки × 2,1", area * 2.1);
    push(`${guideName}, ${profileLengthLabel(guideLength)}`, "пог. м", "Площадь перегородки × 0,7", area * 0.7, guideLength);
    push(`${studName}, ${profileLengthLabel(length)}`, "пог. м", "Площадь перегородки × 2", area * 2, length);
  }

  return rows;
}

function gklParams(values: Record<string, string>) {
  const type = values.constructionType || "ceiling";
  if (type === "ceiling") {
    return `Потолок из ГКЛ; площадь потолка: ${values.ceilingArea} м²; периметр: ${values.ceilingPerimeter} м; подвес: ${(values.suspensionType || "direct") === "direct" ? "прямой" : "анкерный с тягой"}; длина ПП 60×27: ${values.ceilingProfileLengthMm || "3000"} мм; длина ППН 27×28: ${values.ceilingGuideProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
  }

  const area = gklWallArea(values);
  const length = gklWallLength(values);
  const inputMode = (values.wallInputMode || "area") === "area" ? "по площади и высоте" : "по длине и высоте";

  if (type === "cladding") {
    return `Выравнивание стены ГКЛ; исходные данные: ${inputMode}; высота: ${values.wallHeight} м; расчётная длина: ${fmt(length)} м; площадь: ${fmt(area)} м²; длина ПП 60×27: ${values.ceilingProfileLengthMm || "3000"} мм; длина ППН 27×28: ${values.ceilingGuideProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
  }

  return `Перегородка из ГКЛ; исходные данные: ${inputMode}; высота: ${values.wallHeight} м; расчётная длина: ${fmt(length)} м; площадь перегородки по одной стороне: ${fmt(area)} м²; профиль: ${values.partitionWidth} мм; длина стоечного профиля: ${values.studProfileLengthMm || "3000"} мм; длина направляющего профиля: ${values.partitionGuideProfileLengthMm || "3000"} мм; запас: ${values.reserve}%`;
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


const rackColumns: OfferColumn[] = [
  { key: "index", title: "№", width: 6 },
  { key: "name", title: "Наименование элемента", width: 28 },
  { key: "size", title: "Размер", width: 18 },
  { key: "catalogName", title: "Каталожное название", width: 24 },
  { key: "unit", title: "Ед. изм.", width: 12 },
  { key: "coefficient", title: "Расход / примечание", width: 24 },
  { key: "quantity", title: "Количество", width: 16 },
  { key: "priceUnit", title: "Цена за", width: 12 },
  { key: "price", title: "Цена", width: 14 },
  { key: "sum", title: "Сумма", width: 16 },
];

function ceilWithReserve(value: number, reservePercent: number, step = 1) {
  return roundUp(addReserve(value, reservePercent), step);
}

function rackArea(values: Record<string, string>) {
  return toNumber(values.area);
}

function rackPerimeter(values: Record<string, string>) {
  return toNumber(values.perimeter);
}

function rackReserve(values: Record<string, string>) {
  return Math.min(Math.max(toNumber(values.reserve), 0), 30);
}

function rackLengthM(values: Record<string, string>, fieldId = "length") {
  return toNumber(values[fieldId]) / 1000;
}

function rackMetersResult(name: string, size: string, catalogName: string, coefficient: number | string, quantity: number, lengthStepM = 0, quantityStep = 1) {
  const step = lengthStepM > 0 ? lengthStepM : quantityStep;
  return resultRow({
    name,
    size,
    catalogName,
    unit: "м.п.",
    coefficient: typeof coefficient === "number" ? fmt(coefficient) : coefficient,
    quantity,
    quantityStep,
    priceUnit: "м.п.",
    priceMode: "quantity",
  });
}

function rackPieceResult(name: string, size: string, catalogName: string, coefficient: number | string, quantity: number, priceUnit = "шт.") {
  return resultRow({
    name,
    size,
    catalogName,
    unit: priceUnit,
    coefficient: typeof coefficient === "number" ? fmt(coefficient) : coefficient,
    quantity,
    quantityStep: 1,
    priceUnit,
    priceMode: "quantity",
  });
}

type CubeVariant = {
  id: string;
  label: string;
  code: string;
  width: number;
  height: number;
  system: "A50S" | "A60S" | "A70S" | "A95S" | "A100S";
  groupTitle: string;
};

const cubeVariants: CubeVariant[] = [
  { id: "_25х35", label: "25×35 мм", code: "A25/35/S", width: 25, height: 35, system: "A60S", groupTitle: "Ширина рейки 25 мм" },

  { id: "_30х38", label: "30×38 мм", code: "A38/S", width: 30, height: 38, system: "A50S", groupTitle: "Ширина рейки 30 мм" },
  { id: "_30х50", label: "30×50 мм", code: "A50/S", width: 30, height: 50, system: "A50S", groupTitle: "Ширина рейки 30 мм" },
  { id: "_30х85", label: "30×85 мм", code: "A85/S", width: 30, height: 85, system: "A50S", groupTitle: "Ширина рейки 30 мм" },
  { id: "_30х110", label: "30×110 мм", code: "A110/S", width: 30, height: 110, system: "A50S", groupTitle: "Ширина рейки 30 мм" },
  { id: "_30х160", label: "30×160 мм", code: "A160/S", width: 30, height: 160, system: "A50S", groupTitle: "Ширина рейки 30 мм" },
  { id: "_30х200", label: "30×200 мм", code: "A200/S", width: 30, height: 200, system: "A50S", groupTitle: "Ширина рейки 30 мм" },
  { id: "_30х250", label: "30×250 мм", code: "A250/S", width: 30, height: 250, system: "A50S", groupTitle: "Ширина рейки 30 мм" },
  { id: "_30х300", label: "30×300 мм", code: "A300/S", width: 30, height: 300, system: "A50S", groupTitle: "Ширина рейки 30 мм" },

  { id: "_37.5х25", label: "37,5×25 мм", code: "A25/S", width: 37.5, height: 25, system: "A70S", groupTitle: "Ширина рейки 37,5 мм" },

  { id: "_40х50", label: "40×50 мм", code: "A50/40/S", width: 40, height: 50, system: "A70S", groupTitle: "Ширина рейки 40 мм" },
  { id: "_40х70", label: "40×70 мм", code: "A70/40/S", width: 40, height: 70, system: "A70S", groupTitle: "Ширина рейки 40 мм" },
  { id: "_40х100", label: "40×100 мм", code: "A100/40/S", width: 40, height: 100, system: "A70S", groupTitle: "Ширина рейки 40 мм" },

  { id: "_48.8х50", label: "48,8×50 мм", code: "A50/50/S", width: 48.8, height: 50, system: "A95S", groupTitle: "Ширина рейки 50 мм" },

  { id: "_73.8х50", label: "73,8×50 мм", code: "A75/50/S", width: 73.8, height: 50, system: "A95S", groupTitle: "Ширина рейки 75 мм" },

  { id: "_80х35", label: "80×35 мм", code: "A80/35/S", width: 80, height: 35, system: "A100S", groupTitle: "Ширина рейки 80 мм" },
  { id: "_80х80", label: "80×80 мм", code: "A80/80/S", width: 80, height: 80, system: "A100S", groupTitle: "Ширина рейки 80 мм" },
  { id: "_80х100", label: "80×100 мм", code: "A80/100/S", width: 80, height: 100, system: "A100S", groupTitle: "Ширина рейки 80 мм" },
];

const cubeVisualGroupOrder = [
  "Ширина рейки 25 мм",
  "Ширина рейки 30 мм",
  "Ширина рейки 37,5 мм",
  "Ширина рейки 40 мм",
  "Ширина рейки 50 мм",
  "Ширина рейки 75 мм",
  "Ширина рейки 80 мм",
] as const;

const cubeVisualGroups: CalculatorVisualGroup[] = cubeVisualGroupOrder.map((groupTitle) => ({
  title: groupTitle,
  description: "Выберите стандартный типоразмер рейки из каталожной линейки Албес.",
  showWhen: { fieldId: "cubeMode", values: ["standard"] },
  visuals: cubeVariants
    .filter((item) => item.groupTitle === groupTitle)
    .map((item) => ({
      title: `Рейка ${item.code}`,
      description: `${item.label} • система ${item.system}`,
      image: "/images/calculators/rack/cube.webp",
      alt: `Кубообразная рейка ${item.code} ${item.label}`,
      fieldId: "cubeVariant",
      value: item.id,
      setValues: { cubeMode: "standard", cubeVariant: item.id },
      activeWhen: { cubeVariant: item.id, cubeMode: "standard" },
    })),
}));

const cubeRailCoeffByModule: Record<string, number> = {
  "50": 20,
  "60": 16.67,
  "70.2": 14.25,
  "95": 10.53,
  "100": 10,
  "145.4": 7.13,
  "150": 6.67,
  "200": 5,
};

function approxEqual(a: number, b: number, tolerance = 0.3) {
  return Math.abs(a - b) <= tolerance;
}

function cubeMode(values: Record<string, string>) {
  return values.cubeMode || "standard";
}

function cubeGapMm(values: Record<string, string>) {
  return Math.max(20, toNumber(values.cubeGap) || 20);
}

function getCubeStandardVariant(values: Record<string, string>) {
  return cubeVariants.find((item) => item.id === values.cubeVariant) || null;
}

function getCubeWidth(values: Record<string, string>) {
  if (cubeMode(values) === "custom") {
    return Math.min(300, Math.max(20, toNumber(values.cubeCustomWidth)));
  }
  return getCubeStandardVariant(values)?.width || 0;
}

function getCubeHeight(values: Record<string, string>) {
  if (cubeMode(values) === "custom") {
    return Math.min(300, Math.max(20, toNumber(values.cubeCustomHeight)));
  }
  return getCubeStandardVariant(values)?.height || 0;
}

function getCubeModuleMm(values: Record<string, string>) {
  return getCubeWidth(values) + cubeGapMm(values);
}

function getCubeSystem(values: Record<string, string>) {
  if (cubeMode(values) === "custom") return "CUSTOM";
  return getCubeStandardVariant(values)?.system || "A50S";
}

function cubeSystemLabel(value: string) {
  return ({ A50S: "A50S", A60S: "A60S", A70S: "A70S", A95S: "A95S", A100S: "A100S", CUSTOM: "Изменяемый шаг" } as Record<string, string>)[value] || value;
}

function getCubeCatalogCode(values: Record<string, string>) {
  if (cubeMode(values) === "custom") {
    return `Индивидуальная рейка ${fmt(getCubeWidth(values))}×${fmt(getCubeHeight(values))}`;
  }
  return getCubeStandardVariant(values)?.code || "-";
}

function getCubeRailCoeff(moduleMm: number) {
  const exact = Object.entries(cubeRailCoeffByModule).find(([key]) => approxEqual(Number(key), moduleMm, 0.35));
  if (exact) return exact[1];
  if (moduleMm <= 0) return 0;
  return Number((1000 / moduleMm).toFixed(2));
}

function cubeParams(values: Record<string, string>) {
  const width = getCubeWidth(values);
  const height = getCubeHeight(values);
  const gap = cubeGapMm(values);
  const moduleMm = getCubeModuleMm(values);
  const modeLabel = cubeMode(values) === "custom" ? "свой размер" : "стандартный типоразмер";
  return `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; режим: ${modeLabel}; рейка: ${fmt(width)}×${fmt(height)} мм; длина рейки: ${values.length || "3000"} мм; зазор между рейками: ${fmt(gap)} мм; модуль: ${fmt(moduleMm)} мм; система: ${cubeSystemLabel(getCubeSystem(values))}; примыкание: ${values.wallSupport || "Опирание на уголок"}; запас: ${fmt(rackReserve(values))}%.`;
}

function cubeWarning(values: Record<string, string>) {
  if (rackArea(values) <= 0 || rackPerimeter(values) <= 0) return null;

  if (cubeMode(values) === "custom") {
    const width = toNumber(values.cubeCustomWidth);
    const height = toNumber(values.cubeCustomHeight);
    const gap = toNumber(values.cubeGap);
    if (width < 20 || width > 300) return "Для индивидуальной рейки укажите ширину от 20 до 300 мм.";
    if (height < 20 || height > 300) return "Для индивидуальной рейки укажите высоту от 20 до 300 мм.";
    if (gap < 20) return "Зазор между рейками должен быть не меньше 20 мм.";
    if (gap % 5 !== 0) return "Для удобства закупки и монтажа рекомендуем задавать зазор кратно 5 мм.";
    return null;
  }

  const variant = getCubeStandardVariant(values);
  if (!variant) return "Выберите стандартный типоразмер кубообразной рейки.";
  if (cubeGapMm(values) < 20) return "Для стандартной рейки задайте зазор не меньше 20 мм.";
  return null;
}

function cubeCalculate(values: Record<string, string>) {
  const area = rackArea(values);
  const perimeter = rackPerimeter(values);
  const reservePercent = rackReserve(values);
  const lengthM = rackLengthM(values);
  const width = getCubeWidth(values);
  const height = getCubeHeight(values);
  const gap = cubeGapMm(values);
  const moduleMm = getCubeModuleMm(values);
  const system = getCubeSystem(values);
  const standardVariant = getCubeStandardVariant(values);
  const catalogCode = getCubeCatalogCode(values);

  if (!area || !perimeter || !lengthM || !width || !height || !moduleMm) return [];

  const railCoeff = getCubeRailCoeff(moduleMm);
  const isSpecialA38 = cubeMode(values) === "standard" && standardVariant?.code === "A38/S" && approxEqual(moduleMm, 50);
  const grebenkaCoeff = isSpecialA38 ? 0.89 : 1.12;
  const hangerCoeff = isSpecialA38 ? 0.83 : 1.23;
  const railQty = ceilWithReserve(area * railCoeff, reservePercent, lengthM);
  const grebenkaQty = ceilWithReserve(area * grebenkaCoeff, reservePercent, 4);
  const hangerQty = ceilWithReserve(area * hangerCoeff, reservePercent, 10);

  const grebenkaCatalog = ({ A50S: "ВТ-4-50/ВТ-12-50/ВТ-19", A60S: "ВТ-4-60", A70S: "ВТ-4-70", A95S: "ВТ-17", A100S: "ВТ-4-50/ВТ-12-50", CUSTOM: "Система с изменяемым шагом / по проекту" } as Record<string, string>)[system] || "ВТ";

  const rows: CalculatorResultRow[] = [
    resultRow({
      name: "Рейка",
      size: `${fmt(width)}×${fmt(height)}×${values.length} мм`,
      catalogName: catalogCode,
      unit: "м.п.",
      coefficient: `${fmt(railCoeff)} (модуль ${fmt(moduleMm)} мм, зазор ${fmt(gap)} мм)`,
      quantity: railQty,
      quantityStep: lengthM,
      priceUnit: "м.п.",
    }),
    resultRow({
      name: "Гребёнка",
      size: "4000 мм",
      catalogName: grebenkaCatalog,
      unit: "м.п.",
      coefficient: fmt(grebenkaCoeff),
      quantity: grebenkaQty,
      quantityStep: 4,
      priceUnit: "м.п.",
    }),
    resultRow({
      name: "Уголок",
      size: "3000 мм",
      catalogName: values.wallSupport === "Опирание на уголок" ? "PL" : "-",
      unit: "м.п.",
      coefficient: "периметр",
      quantity: ceilWithReserve(perimeter, reservePercent, 1),
      quantityStep: 1,
      priceUnit: "м.п.",
    }),
    resultRow({
      name: "Подвес",
      size: "по проекту",
      catalogName: "АП / ЕВРО / Нониус",
      unit: "шт.",
      coefficient: fmt(hangerCoeff),
      quantity: hangerQty,
      quantityStep: 10,
      priceUnit: "шт.",
    }),
  ];

  if (catalogCode !== "A38/S" && cubeMode(values) === "standard") {
    rows.push(resultRow({
      name: "Соединительный элемент для рейки",
      size: "-",
      catalogName: catalogCode,
      unit: "шт.",
      coefficient: "по количеству реек",
      quantity: ceilWithReserve(railQty / lengthM, reservePercent, 1),
      quantityStep: 1,
      priceUnit: "шт.",
    }));
  }

  if (approxEqual(moduleMm, 50, 0.35)) {
    rows.push(resultRow({
      name: "Раскладка",
      size: values.length === "4000" ? "4000 мм" : "3000 мм",
      catalogName: "ASB 50 / ASM 50",
      unit: "м.п.",
      coefficient: fmt(20),
      quantity: railQty,
      quantityStep: lengthM,
      priceUnit: "м.п.",
    }));
  }

  if (system === "A50S" && !isSpecialA38 && (approxEqual(moduleMm, 100, 0.35) || approxEqual(moduleMm, 150, 0.35) || approxEqual(moduleMm, 200, 0.35))) {
    const decoCoeff = approxEqual(moduleMm, 100, 0.35) ? 11.2 : approxEqual(moduleMm, 150, 0.35) ? 7.4 : 5.6;
    const decoCode = approxEqual(moduleMm, 100, 0.35) ? "ДВ-70" : approxEqual(moduleMm, 150, 0.35) ? "ДВ-120" : "ДВ-170";
    rows.push(resultRow({
      name: "Декоративная вставка",
      size: "-",
      catalogName: decoCode,
      unit: "шт.",
      coefficient: fmt(decoCoeff),
      quantity: ceilWithReserve(area * decoCoeff, reservePercent, 1),
      quantityStep: 1,
      priceUnit: "шт.",
    }));
  }

  if (cubeMode(values) === "standard" && catalogCode !== "A38/S") {
    const fixCoeff = approxEqual(moduleMm, 50, 0.35)
      ? 22.4
      : approxEqual(moduleMm, 100, 0.35)
        ? 11.2
        : approxEqual(moduleMm, 150, 0.35)
          ? 7.5
          : approxEqual(moduleMm, 200, 0.35)
            ? 5.6
            : 0;
    if (fixCoeff > 0) {
      rows.push(resultRow({
        name: "Фиксатор рейки",
        size: "-",
        catalogName: ({ "A50/S": "A50S 30", "A85/S": "A85S 30", "A110/S": "A110S 30", "A160/S": "A160S 30", "A200/S": "A200S 30", "A250/S": "A250S 30", "A300/S": "A300S 30" } as Record<string, string>)[catalogCode] || catalogCode,
        unit: "шт.",
        coefficient: fmt(fixCoeff),
        quantity: ceilWithReserve(area * fixCoeff, reservePercent, 1),
        quantityStep: 1,
        priceUnit: "шт.",
      }));
    }
  }

  return rows;
}


{
  slug: "reechnyy-potolok-kuboobraznyy-dizayn",
  group: "rack",
  title: "Реечный потолок кубообразного дизайна",
  shortTitle: "Кубообразный дизайн",
  description: "Расчёт кубообразной рейки по стандартным типоразмерам Албес или по индивидуальным ширине, высоте и зазору.",
  seoTitle: "Калькулятор кубообразного реечного потолка",
  seoDescription: "Онлайн-калькулятор кубообразной рейки: стандартные типоразмеры Албес, свой размер, зазор между рейками, расход комплектующих и Excel-КП.",
  h1: "Калькулятор кубообразной рейки",
  intro: "Калькулятор адаптирован под кубообразный потолок: можно выбрать стандартный типоразмер из линейки Албес или задать свою ширину, высоту и зазор между рейками. Итогом будет готовая комплектация и Excel-КП.",
  offerTitle: "КП — кубообразный реечный потолок",
  fileName: "IDELEON-cube-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "cubeMode", label: "Режим подбора", type: "buttons", defaultValue: "standard", options: [
      { label: "Стандартные типоразмеры", value: "standard" },
      { label: "Свой размер", value: "custom" },
    ] },
    { id: "cubeVariant", label: "Стандартный типоразмер", type: "select", defaultValue: "_30х38", options: cubeVariants.map((item) => ({ label: `${item.code} — ${item.label}`, value: item.id })), showWhen: { fieldId: "cubeMode", values: ["standard"] } },
    { id: "cubeCustomWidth", label: "Ширина рейки", type: "number", defaultValue: "30", unit: "мм", step: "1", showWhen: { fieldId: "cubeMode", values: ["custom"] } },
    { id: "cubeCustomHeight", label: "Высота рейки", type: "number", defaultValue: "50", unit: "мм", step: "1", showWhen: { fieldId: "cubeMode", values: ["custom"] } },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [
      { label: "3000", value: "3000" },
      { label: "4000", value: "4000" },
    ] },
    { id: "cubeGap", label: "Зазор между рейками", type: "number", defaultValue: "20", unit: "мм", step: "5" },
    { id: "wallSupport", label: "Примыкание к стене", type: "buttons", defaultValue: "Опирание на уголок", options: [
      { label: "Опирание на уголок", value: "Опирание на уголок" },
      { label: "С отступом от стены", value: "С отступом от стены" },
    ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visualTitle: "Выберите типоразмер кубообразной рейки",
  visualDescription: "В стандартном режиме выберите типоразмер из линейки Албес. Если нужна нестандартная геометрия, переключитесь в режим «Свой размер» и задайте ширину, высоту и зазор между рейками.",
  visuals: [],
  visualGroups: cubeVisualGroups,
  calculatorNote: "Для индивидуальных размеров калькулятор даёт предварительную комплектацию. По нестандартным системам с изменяемым шагом, торцевым заглушкам и сложным примыканиям итоговую раскладку лучше проверить по проекту.",
  resultTitle: "Состав комплекта",
  resultMaterialTitle: "Элемент",
  resultCoefficientTitle: "Расход / комментарий",
  resultQuantityTitle: "Количество",
  offerColumns: rackColumns,
  calculate: cubeCalculate,
  getParamsText: cubeParams,
  getWarning: cubeWarning,
  relatedLinks: [
    { label: "Все калькуляторы", href: "/calculators" },
    { label: "Каталог реечных потолков", href: "/catalog/rack-ceilings" },
  ],
  seoSections: [
    { title: "Что учитывает калькулятор кубообразной рейки", text: "Калькулятор считает основную рейку, гребёнку, уголок и подвес. Для типовых модулей используются коэффициенты из исходного Excel-калькулятора, а для нестандартного зазора расход рейки определяется по фактическому модулю — ширина рейки плюс зазор." },
    { title: "Стандартные и индивидуальные размеры", text: "Стандартные типоразмеры основаны на линейке Албес. Дополнительно можно задать свою ширину и высоту рейки в диапазоне от 20 до 300 мм и использовать зазор от 20 мм с шагом 5 мм." },
    { title: "Какой зазор задавать", text: "Зазор между рейками влияет на модуль системы и общий расход. Для большинства решений используют значения от 20 мм и далее кратно 5 мм. При нестандартных системах желательно дополнительно сверить шаг гребёнки и схему подвеса." },
  ],
  faq: [
    { question: "Можно ли выбрать свой размер рейки?", answer: "Да. В калькуляторе есть режим «Свой размер», где можно указать ширину и высоту рейки от 20 до 300 мм, а также задать зазор между рейками." },
    { question: "Почему меняется расход при другом зазоре?", answer: "Потому что меняется модуль системы: чем больше суммарный модуль, тем меньше реек требуется на 1 м²." },
    { question: "Нужен ли зазор кратно 5 мм?", answer: "Для практического применения и закупки это удобно и рекомендуется. Если указать некратное значение, калькулятор предупредит об этом." },
    { question: "Это точный проектный расчёт?", answer: "Это предварительный расчёт для подготовки КП. Для сложных узлов, индивидуального шага и нестандартной раскладки итоговую спецификацию лучше проверить по проекту." },
  ],
},

{
  slug: "reechnyy-potolok-pryamougolnogo-dizayna",
  group: "rack",
  title: "Реечный потолок прямоугольного дизайна",
  shortTitle: "Прямоугольный дизайн",
  description: "Расчёт прямоугольной рейки, гребёнки, уголка, подвеса, соединителей и раскладки.",
  seoTitle: "Калькулятор прямоугольной реечной системы",
  seoDescription: "Онлайн-расчёт прямоугольной рейки A50SV / A100SV / A150SV / A200SV.",
  h1: "Калькулятор реечного потолка прямоугольного дизайна",
  intro: "Расчёт основных элементов для прямоугольной рейки с автоматическим округлением до длины 3 или 4 метра.",
  offerTitle: "КП — прямоугольная рейка",
  fileName: "IDELEON-rectangular-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "system", label: "Марка системы", type: "buttons", defaultValue: "A50SV", options: [
      { label: "A50SV", value: "A50SV" },
      { label: "A100SV", value: "A100SV" },
      { label: "A150SV", value: "A150SV" },
      { label: "A200SV", value: "A200SV" },
    ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [
      { label: "3000", value: "3000" },
      { label: "4000", value: "4000" },
    ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visualTitle: "Выберите прямоугольную систему",
  visualDescription: "Карточки задают марку системы. Остальные параметры — длина рейки и запас.",
  visuals: [
    { title: "A50SV", description: "Рейка 30×14 мм, модуль 50 мм.", image: "/images/calculators/rack/rectangular.webp", alt: "Прямоугольная рейка A50SV", fieldId: "system", value: "A50SV" },
    { title: "A100SV", description: "Рейка 80×14 мм, модуль 100 мм.", image: "/images/calculators/rack/rectangular.webp", alt: "Прямоугольная рейка A100SV", fieldId: "system", value: "A100SV" },
    { title: "A150SV", description: "Рейка 130×14 мм, модуль 150 мм.", image: "/images/calculators/rack/rectangular.webp", alt: "Прямоугольная рейка A150SV", fieldId: "system", value: "A150SV" },
    { title: "A200SV", description: "Рейка 180×14 мм, модуль 200 мм.", image: "/images/calculators/rack/rectangular.webp", alt: "Прямоугольная рейка A200SV", fieldId: "system", value: "A200SV" },
  ],
  calculatorNote: "Расход соединителей для рейки считается по количеству целых реек. Раскладка выводится отдельной строкой.",
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values);
    const perimeter = rackPerimeter(values);
    const reservePercent = rackReserve(values);
    const lengthM = rackLengthM(values);
    if (!area || !perimeter || !lengthM) return [];
    const map = {
      A50SV: { size: "30×14", catalog: "A30/SV", coeff: 20 },
      A100SV: { size: "80×14", catalog: "A80/SV", coeff: 10 },
      A150SV: { size: "130×14", catalog: "A130/SV", coeff: 6.67 },
      A200SV: { size: "180×14", catalog: "A180/SV", coeff: 5 },
    } as Record<string, { size: string; catalog: string; coeff: number }>;
    const item = map[values.system] || map.A50SV;
    const railQty = ceilWithReserve(area * item.coeff, reservePercent, lengthM);
    const grebQty = ceilWithReserve(area * 0.89, reservePercent, 4);
    const cornerQty = ceilWithReserve(perimeter, reservePercent, 1);
    const hangerQty = ceilWithReserve(area * 0.83, reservePercent, 10);
    const connectorQty = ceilWithReserve(railQty / lengthM, reservePercent, 1);
    return [
      resultRow({ name: "Рейка", size: `${item.size}×${values.length} мм`, catalogName: item.catalog, unit: "м.п.", coefficient: fmt(item.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: "ВТ-4-50/ВТ-12-50", unit: "м.п.", coefficient: fmt(0.89), quantity: grebQty, quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "3000 мм", catalogName: "PL / PLL", unit: "м.п.", coefficient: "периметр", quantity: cornerQty, quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Подвес", size: "по проекту", catalogName: "АП / ЕВРО / Нониус", unit: "комп.", coefficient: fmt(0.83), quantity: hangerQty, quantityStep: 10, priceUnit: "комп." }),
      resultRow({ name: "Соединительный элемент для рейки", size: "-", catalogName: item.catalog, unit: "шт.", coefficient: "по количеству реек", quantity: connectorQty, quantityStep: 1, priceUnit: "шт." }),
      resultRow({ name: "Раскладка", size: `${values.length} мм`, catalogName: "ASB 50 / ASM 50", unit: "м.п.", coefficient: fmt(20), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
    ];
  },
  getParamsText: rectangularParams,
  getWarning: simpleRackWarning,
  relatedLinks: [
    { label: "Все калькуляторы", href: "/calculators" },
    { label: "Каталог реечных потолков", href: "/catalog/rack-ceilings" },
  ],
  seoSections: [
    { title: "Логика расчёта", text: "Рейка и раскладка округляются до длины 3 или 4 метра. Гребёнка округляется до 4 метров, уголок — по периметру, подвес — шагом по 10 комплектов." },
  ],
  faq: [
    { question: "Можно ли выбрать длину 4 м?", answer: "Да, калькулятор поддерживает 3000 и 4000 мм и автоматически округляет основную рейку под выбранную длину." },
  ],
},
{
  slug: "reechnyy-potolok-italyanskogo-dizayna",
  group: "rack",
  title: "Реечный потолок итальянского дизайна",
  shortTitle: "Итальянский дизайн",
  description: "Расчёт открытых и закрытых стыков для итальянской рейки.",
  seoTitle: "Калькулятор итальянской рейки",
  seoDescription: "Онлайн-расчёт реечного потолка итальянского дизайна: открытые и закрытые стыки.",
  h1: "Калькулятор реечного потолка итальянского дизайна",
  intro: "Выберите тип стыка, марку системы и длину рейки — калькулятор посчитает основные элементы и раскладку.",
  offerTitle: "КП — итальянская рейка",
  fileName: "IDELEON-italian-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "jointType", label: "Тип стыков", type: "buttons", defaultValue: "открытые", options: [
      { label: "Открытые", value: "открытые" },
      { label: "Закрытые", value: "закрытые" },
    ] },
    { id: "system", label: "Марка системы", type: "buttons", defaultValue: "A90A", options: [
      { label: "A90A", value: "A90A" },
      { label: "A100A", value: "A100A" },
      { label: "A100AC", value: "A100AC" },
    ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [
      { label: "3000", value: "3000" },
      { label: "4000", value: "4000" },
    ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visualTitle: "Выберите тип стыка",
  visualDescription: "Для открытых стыков доступны системы A90A и A100A. Для закрытого стыка — A100AC.",
  visuals: [
    { title: "Открытые стыки", description: "Итальянская рейка с открытым стыком.", image: "/images/calculators/rack/italian.webp", alt: "Итальянская рейка с открытыми стыками", fieldId: "jointType", value: "открытые" },
    { title: "Закрытые стыки", description: "Итальянская рейка с закрытым стыком.", image: "/images/calculators/rack/italian.webp", alt: "Итальянская рейка с закрытыми стыками", fieldId: "jointType", value: "закрытые" },
  ],
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values);
    const perimeter = rackPerimeter(values);
    const reservePercent = rackReserve(values);
    const lengthM = rackLengthM(values);
    if (!area || !perimeter || !lengthM) return [];
    const system = values.system;
    const railCatalog = system === "A100AC" ? "A84/AC" : "A84/A";
    const railSize = system === "A100AC" ? "(84+20,3)×16" : "84×16";
    const railCoeff = system === "A90A" ? 11.11 : 10;
    const railQty = ceilWithReserve(area * railCoeff, reservePercent, lengthM);
    const rows = [
      resultRow({ name: "Рейка", size: `${railSize}×${values.length} мм`, catalogName: railCatalog, unit: "м.п.", coefficient: fmt(railCoeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: system === "A90A" ? "ВТ-3-90" : "ВТ-3-100", unit: "м.п.", coefficient: fmt(0.89), quantity: ceilWithReserve(area * 0.89, reservePercent, 4), quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "3000 мм", catalogName: "PL / PLL / RPP-21", unit: "м.п.", coefficient: "периметр", quantity: ceilWithReserve(perimeter, reservePercent, 1), quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Подвес", size: "по проекту", catalogName: "АП", unit: "комп.", coefficient: fmt(0.83), quantity: ceilWithReserve(area * 0.83, reservePercent, 10), quantityStep: 10, priceUnit: "комп." }),
      resultRow({ name: "Соединительный элемент для рейки", size: "-", catalogName: railCatalog, unit: "шт.", coefficient: "по количеству реек", quantity: ceilWithReserve(railQty / lengthM, reservePercent, 1), quantityStep: 1, priceUnit: "шт." }),
    ];
    if (system === "A100A") {
      rows.push(resultRow({ name: "Раскладка", size: `${values.length} мм`, catalogName: "AS", unit: "м.п.", coefficient: fmt(10), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }));
    }
    return rows;
  },
  getParamsText: (values) => `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; стык: ${values.jointType}; система: ${values.system}; длина: ${values.length} мм; запас: ${fmt(rackReserve(values))}%.`,
  getWarning: (values) => {
    if (rackArea(values) <= 0 || rackPerimeter(values) <= 0) return null;
    if (values.jointType === "закрытые" && values.system !== "A100AC") return "Для закрытого стыка выберите систему A100AC.";
    if (values.jointType === "открытые" && values.system === "A100AC") return "Система A100AC предназначена для закрытого стыка.";
    return null;
  },
  relatedLinks: [
    { label: "Все калькуляторы", href: "/calculators" },
    { label: "Каталог реечных потолков", href: "/catalog/rack-ceilings" },
  ],
  seoSections: [{ title: "Особенности системы", text: "Итальянский дизайн поддерживает два сценария: открытый стык и закрытый стык. При открытом стыке дополнительная раскладка нужна только для A100A." }],
  faq: [{ question: "Какая система подходит для закрытого стыка?", answer: "По исходному Excel для закрытого стыка используется A100AC." }],
},
{
  slug: "reechnyy-potolok-nemeckogo-dizayna",
  group: "rack",
  title: "Реечный потолок немецкого дизайна",
  shortTitle: "Немецкий дизайн",
  description: "Расчёт немецкой рейки, гребёнки, уголка, подвеса, соединителя и раскладки ASN.",
  seoTitle: "Калькулятор немецкой рейки",
  seoDescription: "Онлайн-расчёт реечного потолка немецкого дизайна AN100A / AN150A / AN200A.",
  h1: "Калькулятор реечного потолка немецкого дизайна",
  intro: "Немецкая рейка с раскладкой ASN и универсальной гребёнкой ВТN.",
  offerTitle: "КП — немецкая рейка",
  fileName: "IDELEON-german-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "system", label: "Марка системы", type: "buttons", defaultValue: "AN100A", options: [
      { label: "AN100A", value: "AN100A" },
      { label: "AN150A", value: "AN150A" },
      { label: "AN200A", value: "AN200A" },
    ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [
      { label: "3000", value: "3000" },
      { label: "4000", value: "4000" },
    ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visuals: [
    { title: "AN100A", description: "Рейка AN85/A.", image: "/images/calculators/rack/german.webp", alt: "Немецкая рейка AN100A", fieldId: "system", value: "AN100A" },
    { title: "AN150A", description: "Рейка AN135/A.", image: "/images/calculators/rack/german.webp", alt: "Немецкая рейка AN150A", fieldId: "system", value: "AN150A" },
    { title: "AN200A", description: "Рейка AN185/A.", image: "/images/calculators/rack/german.webp", alt: "Немецкая рейка AN200A", fieldId: "system", value: "AN200A" },
  ],
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values); const perimeter = rackPerimeter(values); const reservePercent = rackReserve(values); const lengthM = rackLengthM(values); if (!area || !perimeter || !lengthM) return [];
    const map = { AN100A: { size: "85×12,5", catalog: "AN85/A", coeff: 10 }, AN150A: { size: "135×12,5", catalog: "AN135/A", coeff: 6.67 }, AN200A: { size: "185×12,5", catalog: "AN185/A", coeff: 5 } } as Record<string, { size: string; catalog: string; coeff: number }>;
    const item = map[values.system] || map.AN100A; const railQty = ceilWithReserve(area * item.coeff, reservePercent, lengthM);
    return [
      resultRow({ name: "Рейка", size: `${item.size}×${values.length} мм`, catalogName: item.catalog, unit: "м.п.", coefficient: fmt(item.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: "ВТN", unit: "м.п.", coefficient: fmt(0.89), quantity: ceilWithReserve(area * 0.89, reservePercent, 4), quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "3000 мм", catalogName: "PL / PLL / RPP-18", unit: "м.п.", coefficient: "периметр", quantity: ceilWithReserve(perimeter, reservePercent, 1), quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Подвес", size: "по проекту", catalogName: "АП", unit: "комп.", coefficient: fmt(0.83), quantity: ceilWithReserve(area * 0.83, reservePercent, 10), quantityStep: 10, priceUnit: "комп." }),
      resultRow({ name: "Соединительный элемент для рейки", size: "-", catalogName: item.catalog, unit: "шт.", coefficient: "по количеству реек", quantity: ceilWithReserve(railQty / lengthM, reservePercent, 1), quantityStep: 1, priceUnit: "шт." }),
      resultRow({ name: "Раскладка", size: `${values.length} мм`, catalogName: "ASN", unit: "м.п.", coefficient: fmt(item.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
    ];
  },
  getParamsText: (values) => `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; система: ${values.system}; длина: ${values.length} мм; запас: ${fmt(rackReserve(values))}%.`,
  getWarning: simpleRackWarning,
  relatedLinks: [{ label: "Все калькуляторы", href: "/calculators" }],
  seoSections: [{ title: "Что входит в расчёт", text: "Немецкая рейка, гребёнка ВТN, уголок, подвес, соединитель и раскладка ASN." }],
  faq: [{ question: "Как округляется раскладка?", answer: "Так же, как основная рейка: до длины 3 или 4 метра." }],
},
{
  slug: "reechnyy-potolok-omega",
  group: "rack",
  title: "Реечный потолок OMEGA",
  shortTitle: "OMEGA",
  description: "Расчёт рейки OMEGA, гребёнки ВТ-8, уголка и подвеса.",
  seoTitle: "Калькулятор OMEGA рейки",
  seoDescription: "Онлайн-расчёт реечного потолка OMEGA: A50AT / A100AT / A150AT.",
  h1: "Калькулятор реечного потолка OMEGA",
  intro: "Калькулятор OMEGA рассчитывает основные элементы и соединители по исходной Excel-логике.",
  offerTitle: "КП — рейка OMEGA",
  fileName: "IDELEON-omega-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "system", label: "Марка системы", type: "buttons", defaultValue: "A50AT", options: [
      { label: "A50AT", value: "A50AT" },
      { label: "A100AT", value: "A100AT" },
      { label: "A150AT", value: "A150AT" },
    ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [ { label: "3000", value: "3000" }, { label: "4000", value: "4000" } ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visuals: [
    { title: "A50AT", description: "Рейка OMEGA с модулем 50 мм.", image: "/images/calculators/rack/omega.webp", alt: "Рейка OMEGA A50AT", fieldId: "system", value: "A50AT" },
    { title: "A100AT", description: "Рейка OMEGA с модулем 100 мм.", image: "/images/calculators/rack/omega.webp", alt: "Рейка OMEGA A100AT", fieldId: "system", value: "A100AT" },
    { title: "A150AT", description: "Рейка OMEGA с модулем 150 мм.", image: "/images/calculators/rack/omega.webp", alt: "Рейка OMEGA A150AT", fieldId: "system", value: "A150AT" },
  ],
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values); const perimeter = rackPerimeter(values); const reservePercent = rackReserve(values); const lengthM = rackLengthM(values); if (!area || !perimeter || !lengthM) return [];
    const map = { A50AT: { catalog: "A50/AT", coeff: 20 }, A100AT: { catalog: "A100/AT", coeff: 10 }, A150AT: { catalog: "A150/AT", coeff: 6.67 } } as Record<string, { catalog: string; coeff: number }>;
    const item = map[values.system] || map.A50AT; const railQty = ceilWithReserve(area * item.coeff, reservePercent, lengthM);
    return [
      resultRow({ name: "Рейка", size: `${values.system.replace("A", "").replace("AT", "")}×${values.length} мм`, catalogName: item.catalog, unit: "м.п.", coefficient: fmt(item.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: "ВТ-8", unit: "м.п.", coefficient: fmt(0.89), quantity: ceilWithReserve(area * 0.89, reservePercent, 4), quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "3000 мм", catalogName: "PL / PLL / RPP-25", unit: "м.п.", coefficient: "периметр", quantity: ceilWithReserve(perimeter, reservePercent, 1), quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Подвес", size: "по проекту", catalogName: "АП", unit: "комп.", coefficient: fmt(0.83), quantity: ceilWithReserve(area * 0.83, reservePercent, 10), quantityStep: 10, priceUnit: "комп." }),
      resultRow({ name: "Соединительный элемент для рейки", size: "-", catalogName: item.catalog, unit: "шт.", coefficient: "по количеству реек", quantity: ceilWithReserve(railQty / lengthM, reservePercent, 1), quantityStep: 1, priceUnit: "шт." }),
    ];
  },
  getParamsText: (values) => `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; система: ${values.system}; длина: ${values.length} мм; запас: ${fmt(rackReserve(values))}%.`,
  getWarning: simpleRackWarning,
  relatedLinks: [{ label: "Все калькуляторы", href: "/calculators" }],
  seoSections: [{ title: "Для чего подходит OMEGA", text: "OMEGA-профиль используется для линейных декоративных потолков, где важен строгий ритм и аккуратная геометрия." }],
  faq: [{ question: "Есть ли раскладка в OMEGA?", answer: "В исходном Excel отдельная строка раскладки не предусмотрена, поэтому калькулятор считает только основные элементы." }],
},
{
  slug: "reechnyy-potolok-s-dizayn",
  group: "rack",
  title: "Реечный потолок S-дизайн",
  shortTitle: "S-дизайн",
  description: "Расчёт S-образной рейки, гребёнки ВТS, уголка и подвеса.",
  seoTitle: "Калькулятор рейки S-дизайн",
  seoDescription: "Онлайн-расчёт реечного потолка S-дизайн: A25AS / A100AS / A150AS.",
  h1: "Калькулятор реечного потолка S-дизайн",
  intro: "S-образная рейка для декоративных линейных потолков. Калькулятор считает основные элементы и соединители.",
  offerTitle: "КП — S-дизайн",
  fileName: "IDELEON-s-design-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "system", label: "Марка системы", type: "buttons", defaultValue: "A25AS", options: [
      { label: "A25AS", value: "A25AS" },
      { label: "A100AS", value: "A100AS" },
      { label: "A150AS", value: "A150AS" },
    ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [ { label: "3000", value: "3000" }, { label: "4000", value: "4000" } ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visuals: [
    { title: "A25AS", description: "Узкая S-образная рейка.", image: "/images/calculators/rack/s-design.webp", alt: "S-дизайн A25AS", fieldId: "system", value: "A25AS" },
    { title: "A100AS", description: "Средняя ширина S-дизайна.", image: "/images/calculators/rack/s-design.webp", alt: "S-дизайн A100AS", fieldId: "system", value: "A100AS" },
    { title: "A150AS", description: "Широкая рейка S-дизайна.", image: "/images/calculators/rack/s-design.webp", alt: "S-дизайн A150AS", fieldId: "system", value: "A150AS" },
  ],
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values); const perimeter = rackPerimeter(values); const reservePercent = rackReserve(values); const lengthM = rackLengthM(values); if (!area || !perimeter || !lengthM) return [];
    const map = { A25AS: { size: "25×13,2", catalog: "A25/AS", coeff: 40 }, A100AS: { size: "100×13,2", catalog: "A100/AS", coeff: 10 }, A150AS: { size: "150×13,2", catalog: "A150/AS", coeff: 6.67 } } as Record<string, { size: string; catalog: string; coeff: number }>;
    const item = map[values.system] || map.A25AS; const railQty = ceilWithReserve(area * item.coeff, reservePercent, lengthM);
    return [
      resultRow({ name: "Рейка", size: `${item.size}×${values.length} мм`, catalogName: item.catalog, unit: "м.п.", coefficient: fmt(item.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: "ВТS", unit: "м.п.", coefficient: fmt(0.89), quantity: ceilWithReserve(area * 0.89, reservePercent, 4), quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "3000 мм", catalogName: "PL / PLL / RPP-18", unit: "м.п.", coefficient: "периметр", quantity: ceilWithReserve(perimeter, reservePercent, 1), quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Подвес", size: "по проекту", catalogName: "АП", unit: "комп.", coefficient: fmt(0.83), quantity: ceilWithReserve(area * 0.83, reservePercent, 10), quantityStep: 10, priceUnit: "комп." }),
      resultRow({ name: "Соединительный элемент для рейки", size: "-", catalogName: item.catalog, unit: "шт.", coefficient: "по количеству реек", quantity: ceilWithReserve(railQty / lengthM, reservePercent, 1), quantityStep: 1, priceUnit: "шт." }),
    ];
  },
  getParamsText: (values) => `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; система: ${values.system}; длина: ${values.length} мм; запас: ${fmt(rackReserve(values))}%.`,
  getWarning: simpleRackWarning,
  relatedLinks: [{ label: "Все калькуляторы", href: "/calculators" }],
  seoSections: [{ title: "Особенность S-дизайна", text: "S-образная рейка создаёт более мягкий ритм линии и хорошо работает в декоративных потолках общественных пространств." }],
  faq: [{ question: "Почему для A25AS расход выше?", answer: "Потому что это узкая рейка, и на квадратный метр требуется больше погонных метров материала." }],
},
{
  slug: "reechnyy-potolok-v-obraznogo-dizayna",
  group: "rack",
  title: "Реечный потолок V-образного дизайна",
  shortTitle: "V-образный дизайн",
  description: "Расчёт V-образной рейки с выбором высоты, длины, раскладки и гребёнки.",
  seoTitle: "Калькулятор V-образной рейки",
  seoDescription: "Онлайн-расчёт V-образного реечного потолка: A50V и A70V.",
  h1: "Калькулятор реечного потолка V-образного дизайна",
  intro: "Выберите систему, высоту рейки и длину. Калькулятор автоматически определит каталожную позицию и комплектующие.",
  offerTitle: "КП — V-образная рейка",
  fileName: "IDELEON-v-design-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "system", label: "Марка системы", type: "buttons", defaultValue: "A50V", options: [ { label: "A50V", value: "A50V" }, { label: "A70V", value: "A70V" } ] },
    { id: "height", label: "Высота рейки", type: "select", defaultValue: "39.5", options: [ { label: "39,5 мм", value: "39.5" }, { label: "39 мм", value: "39" }, { label: "90 мм", value: "90" } ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [ { label: "3000", value: "3000" }, { label: "4000", value: "4000" } ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visuals: [
    { title: "A50V", description: "V-образная рейка для системы 50 мм.", image: "/images/calculators/rack/v-design.webp", alt: "V-образная рейка A50V", fieldId: "system", value: "A50V" },
    { title: "A70V", description: "V-образная рейка для системы 70 мм.", image: "/images/calculators/rack/v-design.webp", alt: "V-образная рейка A70V", fieldId: "system", value: "A70V" },
  ],
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values); const perimeter = rackPerimeter(values); const reservePercent = rackReserve(values); const lengthM = rackLengthM(values); if (!area || !perimeter || !lengthM) return [];
    const system = values.system; const h = values.height;
    const variant = system === "A50V" && h === "39.5" ? { size: "45×39,5", catalog: "A40/V", coeff: 20, greb: "ВТ-4-50" }
      : system === "A50V" && h === "90" ? { size: "30×90", catalog: "A90/V", coeff: 20, greb: "ВТ-4-50/ВТ-12-50" }
      : system === "A70V" && h === "39" ? { size: "52×39", catalog: "A40/V", coeff: 14.25, greb: "ВТ-4-70" }
      : null;
    if (!variant) return [];
    const railQty = ceilWithReserve(area * variant.coeff, reservePercent, lengthM);
    const rows = [
      resultRow({ name: "Рейка", size: `${variant.size}×${values.length} мм`, catalogName: variant.catalog, unit: "м.п.", coefficient: fmt(variant.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: variant.greb, unit: "м.п.", coefficient: fmt(0.89), quantity: ceilWithReserve(area * 0.89, reservePercent, 4), quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "3000 мм", catalogName: "PL / PLL", unit: "м.п.", coefficient: "периметр", quantity: ceilWithReserve(perimeter, reservePercent, 1), quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Подвес", size: "по проекту", catalogName: "АП / ЕВРО / Нониусный подвес", unit: "комп.", coefficient: fmt(0.83), quantity: ceilWithReserve(area * 0.83, reservePercent, 10), quantityStep: 10, priceUnit: "комп." }),
      resultRow({ name: "Соединительный элемент для рейки", size: "-", catalogName: variant.catalog, unit: "шт.", coefficient: "по количеству реек", quantity: ceilWithReserve(railQty / lengthM, reservePercent, 1), quantityStep: 1, priceUnit: "шт." }),
    ];
    if (variant.catalog !== "A90/V") {
      rows.push(resultRow({ name: "Раскладка", size: `${values.length} мм`, catalogName: system === "A50V" ? "ASB-50" : "ASB-70", unit: "шт.", coefficient: "по количеству гребёнок", quantity: ceilWithReserve((ceilWithReserve(area * 0.89, reservePercent, 4)) / 4, reservePercent, 1), quantityStep: 1, priceUnit: "шт." }));
    }
    return rows;
  },
  getParamsText: (values) => `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; система: ${values.system}; высота: ${values.height} мм; длина: ${values.length} мм; запас: ${fmt(rackReserve(values))}%.`,
  getWarning: (values) => {
    if (rackArea(values) <= 0 || rackPerimeter(values) <= 0) return null;
    if (values.system === "A50V" && !["39.5", "90"].includes(values.height)) return "Для системы A50V доступны высоты 39,5 мм и 90 мм.";
    if (values.system === "A70V" && values.height !== "39") return "Для системы A70V доступна только высота 39 мм.";
    return null;
  },
  relatedLinks: [{ label: "Все калькуляторы", href: "/calculators" }],
  seoSections: [{ title: "Особенности V-дизайна", text: "V-образная рейка выпускается в двух системах. Для A90/V отдельная раскладка не нужна, для остальных конфигураций она выводится отдельной строкой." }],
  faq: [{ question: "Можно ли выбрать любую высоту?", answer: "Нет. Допустимые высоты зависят от выбранной системы, и калькулятор это проверяет." }],
},
{
  slug: "reechnyy-potolok-plastinoobraznogo-dizayna",
  group: "rack",
  title: "Реечный потолок пластинообразного дизайна",
  shortTitle: "Пластинообразный дизайн",
  description: "Расчёт пластинообразной рейки A50SP / A70SP.",
  seoTitle: "Калькулятор пластинообразной рейки",
  seoDescription: "Онлайн-расчёт реечного потолка пластинообразного дизайна.",
  h1: "Калькулятор реечного потолка пластинообразного дизайна",
  intro: "Калькулятор рассчитывает пластинообразную рейку, гребёнку, уголок и подвес.",
  offerTitle: "КП — пластинообразная рейка",
  fileName: "IDELEON-plate-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь помещения", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр помещения", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "system", label: "Марка системы", type: "buttons", defaultValue: "A50SP", options: [ { label: "A50SP", value: "A50SP" }, { label: "A70SP", value: "A70SP" } ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [ { label: "3000", value: "3000" }, { label: "4000", value: "4000" } ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visuals: [
    { title: "A50SP", description: "Система для модуля 50 мм.", image: "/images/calculators/rack/plate.webp", alt: "Пластинообразная рейка A50SP", fieldId: "system", value: "A50SP" },
    { title: "A70SP", description: "Система для модуля 70 мм.", image: "/images/calculators/rack/plate.webp", alt: "Пластинообразная рейка A70SP", fieldId: "system", value: "A70SP" },
  ],
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values); const perimeter = rackPerimeter(values); const reservePercent = rackReserve(values); const lengthM = rackLengthM(values); if (!area || !perimeter || !lengthM) return [];
    const item = values.system === "A70SP" ? { coeff: 14.25, greb: "ВТ-4-70" } : { coeff: 20, greb: "ВТ-4-50" };
    const railQty = ceilWithReserve(area * item.coeff, reservePercent, lengthM);
    return [
      resultRow({ name: "Рейка", size: `7×91×${values.length} мм`, catalogName: "A91/SP", unit: "м.п.", coefficient: fmt(item.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: item.greb, unit: "м.п.", coefficient: fmt(0.89), quantity: ceilWithReserve(area * 0.89, reservePercent, 4), quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "3000 мм", catalogName: "PL / PLL", unit: "м.п.", coefficient: "периметр", quantity: ceilWithReserve(perimeter, reservePercent, 1), quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Подвес", size: "по проекту", catalogName: "АП / ЕВРО", unit: "комп.", coefficient: fmt(0.83), quantity: ceilWithReserve(area * 0.83, reservePercent, 10), quantityStep: 10, priceUnit: "комп." }),
    ];
  },
  getParamsText: (values) => `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; система: ${values.system}; длина: ${values.length} мм; запас: ${fmt(rackReserve(values))}%.`,
  getWarning: simpleRackWarning,
  relatedLinks: [{ label: "Все калькуляторы", href: "/calculators" }],
  seoSections: [{ title: "Что считает калькулятор", text: "Для пластинообразного дизайна считаются четыре основные позиции: рейка, гребёнка, уголок и подвес." }],
  faq: [{ question: "Почему нет соединителей для рейки?", answer: "В исходной Excel-таблице для этого калькулятора отдельная строка соединителей не предусмотрена." }],
},
{
  slug: "fasadnaya-reyka",
  group: "facade",
  title: "Фасадная рейка",
  shortTitle: "Фасадная рейка",
  description: "Расчёт фасадной рейки для горизонтальной и вертикальной облицовки.",
  seoTitle: "Калькулятор фасадной рейки",
  seoDescription: "Онлайн-расчёт фасадной рейки: закрытый стык, декоративный паз, опирающийся тип и увеличенная жёсткость.",
  h1: "Калькулятор фасадной рейки",
  intro: "Калькулятор рассчитывает фасадную рейку, гребёнку, уголок и кронштейн на основе площади, периметра, типа поверхности и системы.",
  offerTitle: "КП — фасадная рейка",
  fileName: "IDELEON-facade-rack-calculator.xlsx",
  fields: [
    { id: "area", label: "Площадь обшивки", type: "number", defaultValue: "100", unit: "м²", step: "0.01" },
    { id: "perimeter", label: "Периметр обшивки", type: "number", defaultValue: "40", unit: "м", step: "0.01" },
    { id: "surfaceType", label: "Тип поверхности", type: "buttons", defaultValue: "горизонтальная", options: [ { label: "Горизонтальная", value: "горизонтальная" }, { label: "Вертикальная", value: "вертикальная" } ] },
    { id: "facadeSystem", label: "Система", type: "select", defaultValue: "с_закрытым_стыком", options: [
      { label: "С закрытым стыком", value: "с_закрытым_стыком" },
      { label: "С декоративным пазом", value: "с_декоративным_пазом" },
      { label: "Опирающегося типа с декоративным пазом", value: "опирающегося_типа_с_декоративным_пазом" },
      { label: "Опирающегося типа с закрытыми стыками", value: "опирающегося_типа_с_закрытыми_стыками" },
      { label: "С увеличенной жёсткостью", value: "с_увеличенной_жёсткостью" },
    ] },
    { id: "module", label: "Модуль", type: "select", defaultValue: "90", options: [
      { label: "90", value: "90" }, { label: "100", value: "100" }, { label: "140", value: "140" }, { label: "150", value: "150" }, { label: "160", value: "160" }, { label: "190", value: "190" }, { label: "200", value: "200" }, { label: "240", value: "240" }, { label: "250", value: "250" }, { label: "300", value: "300" }, { label: "320", value: "320" }
    ] },
    { id: "length", label: "Длина рейки", type: "buttons", defaultValue: "3000", unit: "мм", options: [ { label: "3000", value: "3000" }, { label: "4000", value: "4000" } ] },
    { id: "reserve", label: "Запас", type: "number", defaultValue: "5", unit: "%", step: "1" },
  ],
  visuals: [
    { title: "Горизонтальная облицовка", description: "Основной фасадный сценарий — система с закрытым стыком.", image: "/images/calculators/facade/facade.webp", alt: "Фасадная рейка для горизонтальной облицовки", fieldId: "surfaceType", value: "горизонтальная" },
    { title: "Вертикальная облицовка", description: "Вертикальные системы с декоративным пазом, опиранием или увеличенной жёсткостью.", image: "/images/calculators/facade/facade.webp", alt: "Фасадная рейка для вертикальной облицовки", fieldId: "surfaceType", value: "вертикальная" },
  ],
  offerColumns: rackColumns,
  calculate: (values) => {
    const area = rackArea(values); const perimeter = rackPerimeter(values); const reservePercent = rackReserve(values); const lengthM = rackLengthM(values); if (!area || !perimeter || !lengthM) return [];
    const key = `${values.facadeSystem}|${values.module}`;
    const map = {
      "с_закрытым_стыком|90": { size: "90", catalog: "A90/C", coeff: 11.12, greb: "ВТ-2-90" },
      "с_закрытым_стыком|140": { size: "140", catalog: "A140/C", coeff: 7.14, greb: "ВТ-2-140" },
      "с_закрытым_стыком|190": { size: "190", catalog: "A190/C", coeff: 5.26, greb: "ВТ-2-190" },
      "с_декоративным_пазом|100": { size: "100", catalog: "A100/C", coeff: 10, greb: "ВТ-2-100" },
      "с_декоративным_пазом|150": { size: "150", catalog: "A150/C", coeff: 6.67, greb: "ВТ-2-150" },
      "с_декоративным_пазом|200": { size: "200", catalog: "A200/C", coeff: 5, greb: "ВТ-2-100" },
      "опирающегося_типа_с_декоративным_пазом|160": { size: "160", catalog: "A150/CP", coeff: 6.25, greb: "ВТ-5" },
      "опирающегося_типа_с_декоративным_пазом|240": { size: "250", catalog: "A230/CP", coeff: 4.17, greb: "ВТ-5" },
      "опирающегося_типа_с_декоративным_пазом|320": { size: "320", catalog: "A310/CP", coeff: 3.125, greb: "ВТ-5" },
      "опирающегося_типа_с_закрытыми_стыками|160": { size: "160", catalog: "A160/CT", coeff: 6.25, greb: "ВТ-5" },
      "опирающегося_типа_с_закрытыми_стыками|240": { size: "250", catalog: "A240/CT", coeff: 4.17, greb: "ВТ-5" },
      "опирающегося_типа_с_закрытыми_стыками|320": { size: "320", catalog: "A320/CT", coeff: 3.125, greb: "ВТ-5" },
      "с_увеличенной_жёсткостью|150": { size: "150", catalog: "AF150/C", coeff: 6.67, greb: "ВТ-9-150" },
      "с_увеличенной_жёсткостью|200": { size: "200", catalog: "AF200/C", coeff: 5, greb: "ВТ-9-100" },
      "с_увеличенной_жёсткостью|250": { size: "250", catalog: "AF250/C", coeff: 4, greb: "ВТ-9-125" },
      "с_увеличенной_жёсткостью|300": { size: "300", catalog: "AF300/C", coeff: 3.34, greb: "ВТ-9-100/ВТ-9-150" },
    } as Record<string, { size: string; catalog: string; coeff: number; greb: string }>;
    const item = map[key];
    if (!item) return [];
    const railQty = ceilWithReserve(area * item.coeff, reservePercent, lengthM);
    return [
      resultRow({ name: "Рейка", size: `${item.size}×${values.length} мм`, catalogName: item.catalog, unit: "м.п.", coefficient: fmt(item.coeff), quantity: railQty, quantityStep: lengthM, priceUnit: "м.п." }),
      resultRow({ name: "Гребёнка", size: "4000 мм", catalogName: item.greb, unit: "м.п.", coefficient: fmt(1.12), quantity: ceilWithReserve(area * 1.12, reservePercent, 4), quantityStep: 4, priceUnit: "м.п." }),
      resultRow({ name: "Уголок", size: "40×40×3000 мм", catalogName: "PL", unit: "м.п.", coefficient: "периметр", quantity: ceilWithReserve(perimeter, reservePercent, 1), quantityStep: 1, priceUnit: "м.п." }),
      resultRow({ name: "Кронштейн", size: "по проекту", catalogName: "АК", unit: "шт.", coefficient: fmt(1.24), quantity: ceilWithReserve(area * 1.24, reservePercent, 10), quantityStep: 10, priceUnit: "шт." }),
    ];
  },
  getParamsText: (values) => `Площадь: ${fmt(rackArea(values))} м²; периметр: ${fmt(rackPerimeter(values))} м; поверхность: ${values.surfaceType}; система: ${values.facadeSystem}; модуль: ${values.module} мм; длина: ${values.length} мм; запас: ${fmt(rackReserve(values))}%.`,
  getWarning: facadeWarning,
  relatedLinks: [{ label: "Все калькуляторы", href: "/calculators" }, { label: "Каталог фасадных систем", href: "/catalog" }],
  seoSections: [{ title: "Как выбрать фасадную рейку", text: "Сначала выберите направление облицовки. Для горизонтального сценария оставляйте систему с закрытым стыком. Для вертикального монтажа доступны системы с декоративным пазом, опиранием и увеличенной жёсткостью." }],
  faq: [{ question: "Почему для некоторых модулей калькулятор ничего не считает?", answer: "Потому что исходный Excel допускает только определённые сочетания системы и модуля." }],
}

];

export function getCalculator(slug: string) {
  return calculators.find((calculator) => calculator.slug === slug);
}

export function getCalculatorSlugs() {
  return calculators.map((calculator) => calculator.slug);
}
