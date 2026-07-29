"use client";

import { useMemo, useState } from "react";

type SystemType = "wedge" | "clamp";
type GeometryMode = "rectangle" | "l-shape" | "u-shape" | "custom";
type Point = { x: number; y: number };
type CalculationRow = { name: string; specification: string; formula: string; quantity: number; unit: string };

const PRESETS: Record<Exclude<GeometryMode, "rectangle">, Point[]> = {
  "l-shape": [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }, { x: 18, y: 10 }, { x: 18, y: 22 }, { x: 0, y: 22 }],
  "u-shape": [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 22 }, { x: 21, y: 22 }, { x: 21, y: 10 }, { x: 9, y: 10 }, { x: 9, y: 22 }, { x: 0, y: 22 }],
  custom: [{ x: 0, y: 0 }, { x: 26, y: 0 }, { x: 26, y: 12 }, { x: 18, y: 12 }, { x: 18, y: 20 }, { x: 7, y: 20 }, { x: 7, y: 15 }, { x: 0, y: 15 }],
};

function positive(value: string, fallback: number) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function nonNegative(value: string, fallback: number) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
function ceilReserve(value: number, factor: number) { return Math.ceil(value * factor); }
function format(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
}
function distance(a: Point, b: Point) { return Math.hypot(b.x - a.x, b.y - a.y); }
function segments(points: Point[]) {
  return points.map((point, index) => ({ a: point, b: points[(index + 1) % points.length], length: distance(point, points[(index + 1) % points.length]) }));
}
function signedArea(points: Point[]) {
  return points.reduce((sum, p, i) => {
    const n = points[(i + 1) % points.length];
    return sum + p.x * n.y - n.x * p.y;
  }, 0) / 2;
}
function polygonArea(points: Point[]) { return Math.abs(signedArea(points)); }
function lineIntersection(a: Point, av: Point, b: Point, bv: Point): Point | null {
  const cross = av.x * bv.y - av.y * bv.x;
  if (Math.abs(cross) < 1e-8) return null;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = (dx * bv.y - dy * bv.x) / cross;
  return { x: a.x + av.x * t, y: a.y + av.y * t };
}
function offsetPolygon(points: Point[], offset: number) {
  if (points.length < 3) return points;
  const orientation = signedArea(points) >= 0 ? 1 : -1;
  return points.map((point, i) => {
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];
    const v1 = { x: point.x - prev.x, y: point.y - prev.y };
    const v2 = { x: next.x - point.x, y: next.y - point.y };
    const l1 = Math.hypot(v1.x, v1.y) || 1;
    const l2 = Math.hypot(v2.x, v2.y) || 1;
    const n1 = orientation > 0 ? { x: v1.y / l1, y: -v1.x / l1 } : { x: -v1.y / l1, y: v1.x / l1 };
    const n2 = orientation > 0 ? { x: v2.y / l2, y: -v2.x / l2 } : { x: -v2.y / l2, y: v2.x / l2 };
    const p1 = { x: point.x + n1.x * offset, y: point.y + n1.y * offset };
    const p2 = { x: point.x + n2.x * offset, y: point.y + n2.y * offset };
    return lineIntersection(p1, v1, p2, v2) || { x: point.x + (n1.x + n2.x) * offset / 2, y: point.y + (n1.y + n2.y) * offset / 2 };
  });
}
function downloadText(text: string, fileName: string) {
  const blob = new Blob(["\ufeff", text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export default function ScaffoldProtectionCalculator() {
  const [mode, setMode] = useState<GeometryMode>("rectangle");
  const [length, setLength] = useState("30");
  const [width, setWidth] = useState("20");
  const [height, setHeight] = useState("15");
  const [corridor, setCorridor] = useState("2");
  const [facadeGap, setFacadeGap] = useState("0.5");
  const [bay, setBay] = useState("2");
  const [tier, setTier] = useState("2");
  const [reserve, setReserve] = useState("5");
  const [system, setSystem] = useState<SystemType>("wedge");
  const [points, setPoints] = useState<Point[]>(PRESETS.custom);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const buildingPoints = useMemo<Point[]>(() => mode === "rectangle"
    ? [{ x: 0, y: 0 }, { x: positive(length, 30), y: 0 }, { x: positive(length, 30), y: positive(width, 20) }, { x: 0, y: positive(width, 20) }]
    : points, [mode, length, width, points]);

  function selectMode(next: GeometryMode) {
    setMode(next);
    if (next !== "rectangle") setPoints(PRESETS[next].map((p) => ({ ...p })));
  }
  function updatePoint(index: number, axis: "x" | "y", value: string) {
    const parsed = Number(value.replace(",", "."));
    setPoints((current) => current.map((point, i) => i === index ? { ...point, [axis]: Number.isFinite(parsed) ? parsed : 0 } : point));
  }

  const result = useMemo(() => {
    const frameH = positive(height, 15);
    const gap = positive(facadeGap, 0.5);
    const frameWidth = positive(corridor, 2);
    const bayLength = positive(bay, 2);
    const tierHeight = positive(tier, 2);
    const reserveValue = Math.min(30, nonNegative(reserve, 5));
    const factor = 1 + reserveValue / 100;
    const inner = offsetPolygon(buildingPoints, gap);
    const outer = offsetPolygon(buildingPoints, gap + frameWidth);
    const innerSegments = segments(inner);
    const outerSegments = segments(outer);
    const innerBaysBySegment = innerSegments.map((s) => Math.max(1, Math.ceil(s.length / bayLength)));
    const outerBaysBySegment = outerSegments.map((s) => Math.max(1, Math.ceil(s.length / bayLength)));
    const innerBays = innerBaysBySegment.reduce((a, b) => a + b, 0);
    const outerBays = outerBaysBySegment.reduce((a, b) => a + b, 0);
    const innerNodes = innerBays;
    const outerNodes = outerBays;
    const allNodes = innerNodes + outerNodes;
    const tiers = Math.ceil(frameH / tierHeight);
    const levels = tiers + 1;
    const standards = allNodes * tiers;
    const longitudinal = (innerBays + outerBays) * levels;
    const transversePositions = Math.max(innerNodes, outerNodes);
    const transverse = transversePositions * levels;
    const diagonalPanels = (Math.ceil(innerBays / 4) + Math.ceil(outerBays / 4)) * Math.ceil(tiers / 2);
    const topCoverageArea = Math.max(0, polygonArea(outer) - polygonArea(inner));
    const topPanels = Math.ceil(topCoverageArea / (bayLength * frameWidth));
    const q = (value: number) => ceilReserve(value, factor);
    const rows: CalculationRow[] = [
      { name: "Вертикальные стойки", specification: `L=${format(tierHeight)} м`, formula: `${allNodes} линий стоек × ${tiers} ярусов`, quantity: q(standards), unit: "шт." },
      { name: "Опорные домкраты / башмаки", specification: "по нижним узлам", formula: `${innerNodes} внутренних + ${outerNodes} наружных`, quantity: q(allNodes), unit: "шт." },
      { name: "Продольные ригели двух контуров", specification: `номинал до ${format(bayLength)} м`, formula: `${innerBays + outerBays} пролётов × ${levels} уровней`, quantity: q(longitudinal), unit: "шт." },
      { name: "Поперечные ригели между контурами", specification: `номинал около ${format(frameWidth)} м`, formula: `${transversePositions} позиций × ${levels} уровней`, quantity: q(transverse), unit: "шт." },
      { name: "Диагональные связи", specification: "каждые 4 пролёта / 2 яруса", formula: "внутренний и наружный контуры", quantity: q(diagonalPanels), unit: "шт." },
      { name: "Панели / настил верхнего уровня", specification: `модуль около ${format(bayLength)} × ${format(frameWidth)} м`, formula: `${format(topCoverageArea)} м² кольцевой зоны`, quantity: q(topPanels), unit: "шт." },
    ];
    if (system === "clamp") rows.push(
      { name: "Хомуты неповоротные", specification: "горизонтали и перемычки", formula: "2 хомута на ригель", quantity: q((longitudinal + transverse) * 2), unit: "шт." },
      { name: "Хомуты поворотные", specification: "диагональные связи", formula: "2 хомута на диагональ", quantity: q(diagonalPanels * 2), unit: "шт." },
      { name: "Стыковые соединители труб", specification: "наращивание стоек", formula: `${allNodes} линий × ${Math.max(0, tiers - 1)} стыков`, quantity: q(allNodes * Math.max(0, tiers - 1)), unit: "шт." },
    );
    return {
      frameH, gap, frameWidth, bayLength, tierHeight, reserveValue, inner, outer,
      innerBaysBySegment, outerBaysBySegment, innerBays, outerBays, allNodes, tiers,
      topCoverageArea, buildingArea: polygonArea(buildingPoints), rows,
      perimeter: segments(buildingPoints).reduce((sum, s) => sum + s.length, 0),
    };
  }, [buildingPoints, height, facadeGap, corridor, bay, tier, reserve, system]);

  const drawing = useMemo(() => {
    const all = [...result.outer, ...result.inner, ...buildingPoints];
    const minX = Math.min(...all.map((p) => p.x)), maxX = Math.max(...all.map((p) => p.x));
    const minY = Math.min(...all.map((p) => p.y)), maxY = Math.max(...all.map((p) => p.y));
    const scale = Math.min(620 / Math.max(1, maxX - minX), 360 / Math.max(1, maxY - minY));
    const map = (p: Point) => `${50 + (p.x - minX) * scale},${50 + (p.y - minY) * scale}`;
    return { outer: result.outer.map(map).join(" "), inner: result.inner.map(map).join(" "), building: buildingPoints.map(map).join(" ") };
  }, [buildingPoints, result.inner, result.outer]);

  function calculationLines() {
    return [
      `Геометрия: ${mode === "rectangle" ? "прямоугольник" : mode === "l-shape" ? "Г-образная" : mode === "u-shape" ? "П-образная" : "произвольный контур"}`,
      `Точки контура: ${buildingPoints.map((p, i) => `${i + 1}(${p.x};${p.y})`).join(", ")}`,
      `Высота: ${result.frameH} м; отступ: ${result.gap} м; между контурами: ${result.frameWidth} м`,
      `Пролёт: ${result.bayLength} м; ярус: ${result.tierHeight} м; запас: ${result.reserveValue}%`,
      ...result.rows.map((row) => `${row.name}: ${row.quantity} ${row.unit}`),
    ];
  }
  function downloadCalculation() {
    const table = [
      ["Параметр", "Значение"],
      ["Тип системы", system === "wedge" ? "Клиновая" : "Хомутовая"],
      ["Режим геометрии", mode],
      ["Координаты контура, м", buildingPoints.map((p, i) => `${i + 1}: ${p.x};${p.y}`).join(" | ")],
      ["Периметр здания", `${format(result.perimeter)} м`], ["Площадь здания", `${format(result.buildingArea)} м²`],
      ["Высота каркаса", `${result.frameH} м`], ["Отступ от фасада", `${result.gap} м`],
      ["Между контурами", `${result.frameWidth} м`], ["Шаг пролёта", `${result.bayLength} м`],
      ["Высота яруса", `${result.tierHeight} м`], ["Запас", `${result.reserveValue}%`], [],
      ["Элемент", "Спецификация", "Основание", "Количество", "Ед."],
      ...result.rows.map((row) => [row.name, row.specification, row.formula, row.quantity, row.unit]),
      [], ["Разбивка участков"], ["Участок", "Длина здания, м", "Пролётов внутреннего контура", "Пролётов наружного контура"],
      ...segments(buildingPoints).map((s, i) => [`${i + 1}: точка ${i + 1} → ${i + 2 > buildingPoints.length ? 1 : i + 2}`, format(s.length), result.innerBaysBySegment[i], result.outerBaysBySegment[i]]),
    ];
    const csv = table.map((row) => row.map((cell = "") => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    downloadText(csv, "IDELEON_zashchita_ot_BPLA_slozhnaya_geometriya.csv");
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !consent) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const formData = new FormData();
      formData.append("requestType", "calculation"); formData.append("name", name.trim()); formData.append("phone", phone.trim());
      formData.append("email", email.trim()); formData.append("sourcePage", "/calculators/stroitelnye-lesa-zashchitnyy-karkas");
      formData.append("message", ["Предварительный расчёт защиты здания от БПЛА", `Система: ${system === "wedge" ? "клиновая" : "хомутовая"}`, ...calculationLines(), "Требуется инженерная проверка."].join("\n"));
      formData.append("consent", "on");
      const response = await fetch("/api/request", { method: "POST", body: formData });
      if (!response.ok) throw new Error("request failed");
      setStatus("success");
    } catch { setStatus("error"); }
  }

  return (
    <>
      <section className="calculatorPanel" style={{ marginBottom: 24 }}>
        <p className="label">Геометрия объекта</p>
        <h2>Выберите форму здания</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          {([
            ["rectangle", "Прямоугольник"], ["l-shape", "Г-образное"], ["u-shape", "П-образное"], ["custom", "Произвольный контур"],
          ] as [GeometryMode, string][]).map(([value, label]) => (
            <button key={value} type="button" className={mode === value ? "primaryButton" : "secondaryButton"} onClick={() => selectMode(value)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="scaffoldCalculatorGrid">
        <div className="calculatorPanel">
          <p className="label">{mode === "rectangle" ? "Быстрый режим" : "Сложная конфигурация"}</p>
          <h2>Размеры здания и каркаса</h2>
          {mode === "rectangle" ? (
            <div className="scaffoldMainFields">
              <label>Длина здания, м<input type="number" min="1" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} /></label>
              <label>Ширина здания, м<input type="number" min="1" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} /></label>
              <label>Высота каркаса, м<input type="number" min="1" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
              <label>Между контурами, м<input type="number" min="0.5" step="0.1" value={corridor} onChange={(e) => setCorridor(e.target.value)} /></label>
            </div>
          ) : (
            <>
              <p>Координаты углов задаются в метрах. Обходи здание по порядку, не пересекая линии. Последняя точка замыкается с первой автоматически.</p>
              <div style={{ overflowX: "auto" }}>
                <table className="calculatorResultTable">
                  <thead><tr><th>Точка</th><th>X, м</th><th>Y, м</th><th /></tr></thead>
                  <tbody>{points.map((point, index) => (
                    <tr key={index}><td><strong>{index + 1}</strong></td>
                      <td><input aria-label={`X точки ${index + 1}`} type="number" step="0.1" value={point.x} onChange={(e) => updatePoint(index, "x", e.target.value)} /></td>
                      <td><input aria-label={`Y точки ${index + 1}`} type="number" step="0.1" value={point.y} onChange={(e) => updatePoint(index, "y", e.target.value)} /></td>
                      <td><button type="button" className="secondaryButton" disabled={points.length <= 3} onClick={() => setPoints((p) => p.filter((_, i) => i !== index))}>Удалить</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <button type="button" className="secondaryButton" style={{ marginTop: 12 }} onClick={() => {
                const last = points[points.length - 1] || { x: 0, y: 0 };
                setPoints((p) => [...p, { x: last.x + 5, y: last.y }]);
              }}>+ Добавить точку</button>
              <div className="scaffoldMainFields" style={{ marginTop: 18 }}>
                <label>Высота каркаса, м<input type="number" min="1" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
                <label>Между контурами, м<input type="number" min="0.5" step="0.1" value={corridor} onChange={(e) => setCorridor(e.target.value)} /></label>
              </div>
            </>
          )}
          <details className="scaffoldAdvanced">
            <summary>Дополнительные настройки</summary>
            <div className="scaffoldMainFields">
              <label>Тип системы<select value={system} onChange={(e) => setSystem(e.target.value as SystemType)}><option value="wedge">Клиновая</option><option value="clamp">Хомутовая</option></select></label>
              <label>Отступ от фасада, м<input type="number" min="0.1" step="0.1" value={facadeGap} onChange={(e) => setFacadeGap(e.target.value)} /></label>
              <label>Шаг пролёта, м<input type="number" min="0.5" step="0.1" value={bay} onChange={(e) => setBay(e.target.value)} /></label>
              <label>Высота яруса, м<input type="number" min="0.5" step="0.1" value={tier} onChange={(e) => setTier(e.target.value)} /></label>
              <label>Запас, %<input type="number" min="0" max="30" step="1" value={reserve} onChange={(e) => setReserve(e.target.value)} /></label>
            </div>
          </details>
          <div className="scaffoldAssumption"><strong>Модель V2:</strong> каждый участок замкнутого контура рассчитывается отдельно. На поворотах ставятся узлы стоек; внутренний и наружный контуры строятся смещением от фасада.</div>
        </div>

        <div className="calculatorPanel scaffoldDrawingPanel">
          <div className="scaffoldDrawingHeader"><div><p className="label">Схема сверху</p><h2>Контуры по форме здания</h2></div><span>Масштаб автоматически</span></div>
          <svg className="scaffoldPlan" viewBox="0 0 720 460" role="img" aria-label="Схема здания и двух контуров защитного каркаса">
            <polygon points={drawing.outer} className="scaffoldOuter" />
            <polygon points={drawing.inner} className="scaffoldInner" />
            <polygon points={drawing.building} className="scaffoldBuilding" />
          </svg>
          <div className="scaffoldLegend"><span><i className="outer" /> Наружный контур</span><span><i className="inner" /> Внутренний контур</span><span><i className="building" /> Здание</span></div>
          <div className="scaffoldMetrics">
            <div><span>Периметр здания</span><strong>{format(result.perimeter)} м</strong></div>
            <div><span>Ярусов</span><strong>{result.tiers}</strong></div>
            <div><span>Узлов стоек</span><strong>{result.allNodes}</strong></div>
            <div><span>Верхняя зона</span><strong>{format(result.topCoverageArea)} м²</strong></div>
          </div>
        </div>
      </section>

      {mode !== "rectangle" && <section className="calculatorPanel" style={{ marginTop: 24 }}>
        <p className="label">Контроль геометрии</p><h2>Разбивка по участкам</h2>
        <div className="calculatorTableWrap"><table className="calculatorResultTable">
          <thead><tr><th>Участок</th><th>Длина фасада</th><th>Внутренний контур</th><th>Наружный контур</th></tr></thead>
          <tbody>{segments(buildingPoints).map((s, i) => <tr key={i}><td><strong>{i + 1} → {i + 2 > buildingPoints.length ? 1 : i + 2}</strong></td><td>{format(s.length)} м</td><td>{result.innerBaysBySegment[i]} прол.</td><td>{result.outerBaysBySegment[i]} прол.</td></tr>)}</tbody>
        </table></div>
      </section>}

      <section className="calculatorPanel scaffoldResults">
        <div className="scaffoldResultHeader"><div><p className="label">Предварительная комплектация</p><h2>Ведомость элементов</h2></div><button type="button" className="secondaryButton" onClick={downloadCalculation}>Скачать расчёт CSV</button></div>
        <div className="calculatorTableWrap"><table className="calculatorResultTable">
          <thead><tr><th>Элемент</th><th>Спецификация</th><th>Основание расчёта</th><th>Количество с запасом</th></tr></thead>
          <tbody>{result.rows.map((row) => <tr key={row.name}><td><strong>{row.name}</strong></td><td>{row.specification}</td><td>{row.formula}</td><td><strong>{format(row.quantity)} {row.unit}</strong></td></tr>)}</tbody>
        </table></div>
        <div className="scaffoldEngineeringWarning"><strong>Это предварительный подбор комплектации, не расчёт несущей способности и не ППР.</strong><p>Для вогнутых углов, узких ниш и диагональных фасадов смещённые контуры требуют обязательной проверки инженером. Также проверяются нагрузки, основания, раскрепление, верхнее покрытие и узлы.</p></div>
      </section>

      <section className="scaffoldBottomGrid">
        <article className="calculatorPanel"><p className="label">Для эксперта</p><h2>Что нужно подтвердить в V2</h2><ol className="scaffoldCheckList">
          <li>Метод построения смещённых контуров во внешних и внутренних углах.</li><li>Разбивку каждого участка на стандартные длины производителя.</li>
          <li>Сопряжение несовпадающих узлов внутреннего и наружного рядов.</li><li>Частоту поперечных перемычек и диагоналей на сложном контуре.</li><li>Артикулы, массы и ограничения конкретной системы лесов.</li>
        </ol></article>
        <form className="calculatorSendForm" onSubmit={submit}><h3>Отправить расчёт в Иделеон</h3><p>Получим геометрию и ведомость, запросим план и передадим инженеру.</p>
          <input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} /><input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} /><input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="calculatorConsent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Согласен на обработку персональных данных</span></label>
          <button className="primaryButton" type="submit" disabled={status === "sending"}>{status === "sending" ? "Отправляем..." : "Отправить расчёт"}</button>
          {status === "success" && <p className="formSuccess">Расчёт отправлен. Мы свяжемся с вами.</p>}{status === "error" && <p className="formError">Заполните все поля или попробуйте ещё раз.</p>}
        </form>
      </section>
    </>
  );
}
