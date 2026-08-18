"use client";

import { useMemo, useState } from "react";

type Point = { x: number; y: number };
type ShapeKey = "square" | "rectangle" | "trapezoid" | "l" | "p" | "t" | "z" | "s" | "cross";
type SystemType = "wedge" | "clamp";
type Row = { name: string; specification: string; formula: string; quantity: number; unit: string };

const CALCULATION_FILE_NAME = "IDELEON_zashchita_ot_BPLA.csv";

const SHAPES: Record<ShapeKey, { label: string; points: Point[] }> = {
  square: { label: "Квадрат", points: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 }] },
  rectangle: { label: "Прямоугольник", points: [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 20 }, { x: 0, y: 20 }] },
  trapezoid: { label: "Трапеция", points: [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 24, y: 18 }, { x: 6, y: 18 }] },
  l: { label: "Г-образный", points: [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }, { x: 18, y: 10 }, { x: 18, y: 22 }, { x: 0, y: 22 }] },
  p: { label: "П-образный", points: [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 22 }, { x: 21, y: 22 }, { x: 21, y: 10 }, { x: 9, y: 10 }, { x: 9, y: 22 }, { x: 0, y: 22 }] },
  t: { label: "Т-образный", points: [{ x: 0, y: 0 }, { x: 14, y: 0 }, { x: 28, y: 0 }, { x: 28, y: 8 }, { x: 18, y: 8 }, { x: 18, y: 24 }, { x: 10, y: 24 }, { x: 10, y: 8 }, { x: 0, y: 8 }] },
  z: { label: "Z-образный", points: [{ x: 0, y: 0 }, { x: 28, y: 0 }, { x: 28, y: 9 }, { x: 17, y: 9 }, { x: 17, y: 20 }, { x: 0, y: 20 }, { x: 0, y: 11 }, { x: 11, y: 11 }] },
  s: { label: "S-образный", points: [{ x: 0, y: 0 }, { x: 17, y: 0 }, { x: 17, y: 9 }, { x: 28, y: 9 }, { x: 28, y: 20 }, { x: 0, y: 20 }, { x: 0, y: 11 }, { x: 11, y: 11 }, { x: 11, y: 9 }, { x: 0, y: 9 }] },
  cross: { label: "Крестообразный", points: [{ x: 10, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 9 }, { x: 30, y: 9 }, { x: 30, y: 19 }, { x: 20, y: 19 }, { x: 20, y: 28 }, { x: 10, y: 28 }, { x: 10, y: 19 }, { x: 0, y: 19 }, { x: 0, y: 9 }, { x: 10, y: 9 }] },
};

const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const segments = (points: Point[]) => points.map((a, i) => ({ a, b: points[(i + 1) % points.length], length: distance(a, points[(i + 1) % points.length]) }));
const format = (value: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
const positive = (value: string, fallback: number) => {
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) && number > 0 ? number : fallback;
};
const polygonArea = (points: Point[]) => Math.abs(points.reduce((sum, p, i) => {
  const n = points[(i + 1) % points.length];
  return sum + p.x * n.y - n.x * p.y;
}, 0) / 2);
const directions = (points: Point[]) => points.map((p, i) => {
  const n = points[(i + 1) % points.length];
  const length = distance(p, n) || 1;
  return { x: (n.x - p.x) / length, y: (n.y - p.y) / length };
});
const defaultLengths = (key: ShapeKey) => segments(SHAPES[key].points).map((segment) => Number(segment.length.toFixed(2)));
function buildPoints(key: ShapeKey, lengths: number[]) {
  const dirs = directions(SHAPES[key].points);
  const result: Point[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < dirs.length - 1; i += 1) {
    const last = result[result.length - 1];
    result.push({ x: last.x + dirs[i].x * lengths[i], y: last.y + dirs[i].y * lengths[i] });
  }
  return result;
}
function offsetPolygon(points: Point[], offset: number) {
  const area = points.reduce((sum, p, i) => {
    const n = points[(i + 1) % points.length];
    return sum + p.x * n.y - n.x * p.y;
  }, 0) / 2;
  const orientation = area >= 0 ? 1 : -1;
  const intersection = (a: Point, av: Point, b: Point, bv: Point): Point | null => {
    const cross = av.x * bv.y - av.y * bv.x;
    if (Math.abs(cross) < 1e-8) return null;
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = (dx * bv.y - dy * bv.x) / cross;
    return { x: a.x + av.x * t, y: a.y + av.y * t };
  };
  return points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const first = { x: point.x - previous.x, y: point.y - previous.y };
    const second = { x: next.x - point.x, y: next.y - point.y };
    const firstLength = Math.hypot(first.x, first.y) || 1;
    const secondLength = Math.hypot(second.x, second.y) || 1;
    const firstNormal = orientation > 0 ? { x: first.y / firstLength, y: -first.x / firstLength } : { x: -first.y / firstLength, y: first.x / firstLength };
    const secondNormal = orientation > 0 ? { x: second.y / secondLength, y: -second.x / secondLength } : { x: -second.y / secondLength, y: second.x / secondLength };
    const firstPoint = { x: point.x + firstNormal.x * offset, y: point.y + firstNormal.y * offset };
    const secondPoint = { x: point.x + secondNormal.x * offset, y: point.y + secondNormal.y * offset };
    return intersection(firstPoint, first, secondPoint, second) || {
      x: point.x + (firstNormal.x + secondNormal.x) * offset / 2,
      y: point.y + (firstNormal.y + secondNormal.y) * offset / 2,
    };
  });
}
function downloadText(text: string, fileName: string) {
  const blob = new Blob(["\ufeff", text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
}

export default function ScaffoldProtectionCalculator() {
  const [shape, setShape] = useState<ShapeKey>("rectangle");
  const [lengthsByShape, setLengthsByShape] = useState<Record<ShapeKey, number[]>>(() =>
    Object.fromEntries((Object.keys(SHAPES) as ShapeKey[]).map((key) => [key, defaultLengths(key)])) as Record<ShapeKey, number[]>
  );
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [height, setHeight] = useState("15");
  const [corridor, setCorridor] = useState("2");
  const [facadeGap, setFacadeGap] = useState("0.5");
  const [bay, setBay] = useState("2");
  const [tier, setTier] = useState("2");
  const [reserve, setReserve] = useState("5");
  const [system, setSystem] = useState<SystemType>("wedge");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const enteredLengths = lengthsByShape[shape];
  const buildingPoints = useMemo(() => buildPoints(shape, enteredLengths), [shape, enteredLengths]);
  const actualSegments = useMemo(() => segments(buildingPoints), [buildingPoints]);

  function changeShape(next: ShapeKey) { setShape(next); setActiveSegment(null); }
  function setSegmentLength(index: number, raw: string) {
    if (index === enteredLengths.length - 1) return;
    const next = Number(raw.replace(",", "."));
    if (!Number.isFinite(next) || next <= 0) return;
    setLengthsByShape((all) => ({ ...all, [shape]: all[shape].map((value, i) => i === index ? next : value) }));
  }
  function nudge(index: number, delta: number) {
    setSegmentLength(index, String(Math.max(0.1, enteredLengths[index] + delta)));
    setActiveSegment(index);
  }

  const result = useMemo(() => {
    const frameH = positive(height, 15), frameWidth = positive(corridor, 2), gap = positive(facadeGap, 0.5);
    const bayLength = positive(bay, 2), tierHeight = positive(tier, 2);
    const reserveValue = Math.min(30, Math.max(0, Number(reserve) || 0)), factor = 1 + reserveValue / 100;
    const inner = offsetPolygon(buildingPoints, gap);
    const outer = offsetPolygon(buildingPoints, gap + frameWidth);
    const innerBaysBySegment = segments(inner).map((s) => Math.max(1, Math.ceil(s.length / bayLength)));
    const outerBaysBySegment = segments(outer).map((s) => Math.max(1, Math.ceil(s.length / bayLength)));
    const innerBays = innerBaysBySegment.reduce((a, b) => a + b, 0);
    const outerBays = outerBaysBySegment.reduce((a, b) => a + b, 0);
    const allNodes = innerBays + outerBays, tiers = Math.ceil(frameH / tierHeight), levels = tiers + 1;
    const standards = allNodes * tiers, longitudinal = allNodes * levels;
    const transverse = Math.max(innerBays, outerBays) * levels;
    const diagonals = (Math.ceil(innerBays / 4) + Math.ceil(outerBays / 4)) * Math.ceil(tiers / 2);
    const topArea = Math.max(0, polygonArea(outer) - polygonArea(inner));
    const q = (value: number) => Math.ceil(value * factor);
    const rows: Row[] = [
      { name: "Вертикальные стойки", specification: `L=${format(tierHeight)} м`, formula: `${allNodes} линий × ${tiers} ярусов`, quantity: q(standards), unit: "шт." },
      { name: "Опорные домкраты / башмаки", specification: "по нижним узлам", formula: `${allNodes} узлов`, quantity: q(allNodes), unit: "шт." },
      { name: "Продольные ригели", specification: `до ${format(bayLength)} м`, formula: `${allNodes} пролётов × ${levels} уровней`, quantity: q(longitudinal), unit: "шт." },
      { name: "Поперечные ригели", specification: `около ${format(frameWidth)} м`, formula: `${Math.max(innerBays, outerBays)} позиций × ${levels} уровней`, quantity: q(transverse), unit: "шт." },
      { name: "Диагональные связи", specification: "каждые 4 пролёта / 2 яруса", formula: "два контура", quantity: q(diagonals), unit: "шт." },
      { name: "Панели верхнего уровня", specification: `около ${format(bayLength)} × ${format(frameWidth)} м`, formula: `${format(topArea)} м²`, quantity: q(Math.ceil(topArea / (bayLength * frameWidth))), unit: "шт." },
    ];
    if (system === "clamp") rows.push(
      { name: "Хомуты неповоротные", specification: "горизонтали и перемычки", formula: "2 на ригель", quantity: q((longitudinal + transverse) * 2), unit: "шт." },
      { name: "Хомуты поворотные", specification: "диагонали", formula: "2 на диагональ", quantity: q(diagonals * 2), unit: "шт." },
    );
    return { frameH, frameWidth, gap, bayLength, tierHeight, reserveValue, inner, outer, innerBaysBySegment, outerBaysBySegment, allNodes, tiers, topArea, rows, perimeter: actualSegments.reduce((s, v) => s + v.length, 0), area: polygonArea(buildingPoints) };
  }, [buildingPoints, actualSegments, height, corridor, facadeGap, bay, tier, reserve, system]);

  const drawing = useMemo(() => {
    const all = [...result.outer, ...result.inner, ...buildingPoints];
    const minX = Math.min(...all.map((p) => p.x)), maxX = Math.max(...all.map((p) => p.x));
    const minY = Math.min(...all.map((p) => p.y)), maxY = Math.max(...all.map((p) => p.y));
    const scale = Math.min(620 / Math.max(1, maxX - minX), 350 / Math.max(1, maxY - minY));
    const point = (p: Point) => ({ x: 50 + (p.x - minX) * scale, y: 50 + (p.y - minY) * scale });
    const text = (points: Point[]) => points.map((p) => { const m = point(p); return `${m.x},${m.y}`; }).join(" ");
    return {
      outer: text(result.outer), inner: text(result.inner), building: text(buildingPoints),
      labels: actualSegments.map((segment, index) => {
        const a = point(segment.a), b = point(segment.b);
        return { index, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, length: segment.length };
      }),
    };
  }, [buildingPoints, actualSegments, result.inner, result.outer]);

  function calculationCsv() {
    const table = [
      ["Форма", SHAPES[shape].label], ["Периметр", `${format(result.perimeter)} м`], ["Площадь", `${format(result.area)} м²`],
      ...actualSegments.map((segment, i) => [`Отрезок ${i + 1}`, `${format(segment.length)} м`]), [],
      ["Элемент", "Спецификация", "Основание", "Количество", "Ед."],
      ...result.rows.map((row) => [row.name, row.specification, row.formula, row.quantity, row.unit]),
    ];
    return table.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  }
  function downloadCalculation() {
    downloadText(calculationCsv(), CALCULATION_FILE_NAME);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !consent) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const formData = new FormData();
      const calculationFile = new File(["\ufeff", calculationCsv()], CALCULATION_FILE_NAME, { type: "text/csv;charset=utf-8" });
      formData.append("requestType", "calculation"); formData.append("name", name.trim()); formData.append("phone", phone.trim()); formData.append("email", email.trim());
      formData.append("sourcePage", "/calculators/stroitelnye-lesa-zashchitnyy-karkas");
      formData.append("task", [`Защита здания от БПЛА`, `Форма: ${SHAPES[shape].label}`, ...actualSegments.map((s, i) => `Отрезок ${i + 1}: ${format(s.length)} м`), ...result.rows.map((r) => `${r.name}: ${r.quantity} ${r.unit}`), "Файл расчёта приложен."].join("\n"));
      formData.append("attachment", calculationFile);
      formData.append("consent", "yes");
      const response = await fetch("/api/request", { method: "POST", body: formData });
      if (!response.ok) throw new Error();
      setStatus("success");
    } catch { setStatus("error"); }
  }

  return <>
    <section className="calculatorPanel" style={{ marginBottom: 24 }}>
      <p className="label">Геометрия объекта</p><h2>Выберите форму здания</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10 }}>
        {(Object.keys(SHAPES) as ShapeKey[]).map((key) => <button key={key} type="button" className={shape === key ? "primaryButton" : "secondaryButton"} onClick={() => changeShape(key)}>{SHAPES[key].label}</button>)}
      </div>
    </section>

    <section className="scaffoldCalculatorGrid">
      <div className="calculatorPanel">
        <p className="label">Только длины</p><h2>Размеры отрезков</h2>
        <p>Выбери отрезок по номеру и укажи его длину. Углы и координаты вводить не нужно.</p>
        <div style={{ display: "grid", gap: 9 }}>
          {actualSegments.map((segment, index) => {
            const closing = index === actualSegments.length - 1;
            const active = activeSegment === index;
            return <label key={index} onClick={() => setActiveSegment(index)} style={{ display: "grid", gridTemplateColumns: "minmax(110px,1fr) 40px minmax(76px,100px) 40px", gap: 6, alignItems: "center", padding: 8, borderRadius: 10, background: active ? "#fff1e8" : "#f6f8fb", boxShadow: active ? "inset 4px 0 #ff6500" : undefined }}>
              <strong>Отрезок {index + 1}{closing ? " (замыкающий)" : ""}</strong>
              <button type="button" className="secondaryButton" disabled={closing} style={{ minWidth: 40, padding: 0, fontSize: 22 }} onClick={(e) => { e.preventDefault(); nudge(index, -0.1); }}>−</button>
              <input type="number" min="0.1" step="0.1" disabled={closing} value={Number(segment.length.toFixed(2))} aria-label={`Длина отрезка ${index + 1}`} style={{ width: "100%", textAlign: "center" }} onFocus={() => setActiveSegment(index)} onChange={(e) => setSegmentLength(index, e.target.value)} />
              <button type="button" className="secondaryButton" disabled={closing} style={{ minWidth: 40, padding: 0, fontSize: 22 }} onClick={(e) => { e.preventDefault(); nudge(index, 0.1); }}>+</button>
            </label>;
          })}
        </div>
        <p style={{ color: "#5f6d83", fontSize: 13, marginTop: 10 }}>Замыкающий отрезок считается автоматически, чтобы контур здания не разрывался.</p>
        <div className="scaffoldMainFields" style={{ marginTop: 18 }}>
          <label>Высота каркаса, м<input type="number" min="1" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
          <label>Между контурами, м<input type="number" min="0.5" step="0.1" value={corridor} onChange={(e) => setCorridor(e.target.value)} /></label>
        </div>
        <details className="scaffoldAdvanced"><summary>Дополнительные настройки</summary><div className="scaffoldMainFields">
          <label>Тип системы<select value={system} onChange={(e) => setSystem(e.target.value as SystemType)}><option value="wedge">Клиновая</option><option value="clamp">Хомутовая</option></select></label>
          <label>Отступ от фасада, м<input type="number" min="0.1" step="0.1" value={facadeGap} onChange={(e) => setFacadeGap(e.target.value)} /></label>
          <label>Шаг пролёта, м<input type="number" min="0.5" step="0.1" value={bay} onChange={(e) => setBay(e.target.value)} /></label>
          <label>Высота яруса, м<input type="number" min="0.5" step="0.1" value={tier} onChange={(e) => setTier(e.target.value)} /></label>
          <label>Запас, %<input type="number" min="0" max="30" step="1" value={reserve} onChange={(e) => setReserve(e.target.value)} /></label>
        </div></details>
        <div className="scaffoldAssumption"><strong>Принцип простой:</strong> форма задаёт повороты контура, пользователь меняет только длины его сторон.</div>
      </div>

      <div className="calculatorPanel scaffoldDrawingPanel">
        <div className="scaffoldDrawingHeader"><div><p className="label">Схема сверху</p><h2>{SHAPES[shape].label}</h2></div><span>Масштаб автоматически</span></div>
        <svg className="scaffoldPlan" viewBox="0 0 720 450" role="img" aria-label={`Контур: ${SHAPES[shape].label}`}>
          <polygon points={drawing.outer} className="scaffoldOuter" /><polygon points={drawing.inner} className="scaffoldInner" /><polygon points={drawing.building} className="scaffoldBuilding" />
          {drawing.labels.map((label) => {
            const active = activeSegment === label.index;
            return <g key={label.index} onClick={() => setActiveSegment(label.index)} style={{ cursor: "pointer" }}>
              <rect x={label.x - 40} y={label.y - 15} width="80" height="30" rx="15" fill={active ? "#ff6500" : "white"} stroke={active ? "#ff6500" : "#cbd3df"} />
              <text x={label.x} y={label.y - 1} textAnchor="middle" fontSize="11" fontWeight="800" fill={active ? "white" : "#101b32"}>№ {label.index + 1}</text>
              <text x={label.x} y={label.y + 11} textAnchor="middle" fontSize="10" fontWeight="700" fill={active ? "white" : "#41506a"}>{format(label.length)} м</text>
            </g>;
          })}
        </svg>
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: activeSegment === null ? "#f3f6fa" : "#fff1e8" }}>
          {activeSegment === null ? "Нажми на номер отрезка на схеме — нужное поле подсветится слева." : <><strong>Отрезок {activeSegment + 1}</strong>: {format(actualSegments[activeSegment].length)} м.</>}
        </div>
        <div className="scaffoldLegend"><span><i className="outer" /> Наружный контур</span><span><i className="inner" /> Внутренний контур</span><span><i className="building" /> Здание</span></div>
        <div className="scaffoldMetrics"><div><span>Периметр</span><strong>{format(result.perimeter)} м</strong></div><div><span>Площадь</span><strong>{format(result.area)} м²</strong></div><div><span>Ярусов</span><strong>{result.tiers}</strong></div><div><span>Узлов стоек</span><strong>{result.allNodes}</strong></div></div>
      </div>
    </section>

    <section className="calculatorPanel" style={{ marginTop: 24 }}><p className="label">Контроль геометрии</p><h2>Все отрезки контура</h2><div className="calculatorTableWrap"><table className="calculatorResultTable">
      <thead><tr><th>Отрезок</th><th>Длина</th><th>Внутренний контур</th><th>Наружный контур</th></tr></thead>
      <tbody>{actualSegments.map((s, i) => <tr key={i}><td><strong>№ {i + 1}</strong></td><td>{format(s.length)} м</td><td>{result.innerBaysBySegment[i]} прол.</td><td>{result.outerBaysBySegment[i]} прол.</td></tr>)}</tbody>
    </table></div></section>

    <section className="calculatorPanel scaffoldResults"><div className="scaffoldResultHeader"><div><p className="label">Предварительная комплектация</p><h2>Ведомость элементов</h2></div><button type="button" className="secondaryButton" onClick={downloadCalculation}>Скачать расчёт CSV</button></div>
      <div className="calculatorTableWrap"><table className="calculatorResultTable"><thead><tr><th>Элемент</th><th>Спецификация</th><th>Основание</th><th>Количество</th></tr></thead><tbody>
        {result.rows.map((row) => <tr key={row.name}><td><strong>{row.name}</strong></td><td>{row.specification}</td><td>{row.formula}</td><td><strong>{row.quantity} {row.unit}</strong></td></tr>)}
      </tbody></table></div>
      <div className="scaffoldEngineeringWarning"><strong>Это предварительная комплектация, не расчёт несущей способности и не ППР.</strong><p>Нагрузки, основания, узлы и верхнее покрытие подтверждает инженер.</p></div>
    </section>

    <section className="scaffoldBottomGrid">
      <article className="calculatorPanel"><p className="label">Инженерная проверка</p><h2>Перед заказом</h2><ol className="scaffoldCheckList"><li>Проверить выбранную форму и длины всех отрезков.</li><li>Подтвердить разбивку на стандартные элементы.</li><li>Проверить сопряжения внутреннего и наружного контуров.</li><li>Подтвердить перемычки, диагонали и узлы.</li><li>Выполнить расчёт нагрузок.</li></ol></article>
      <form className="calculatorSendForm" onSubmit={submit}><h3>Отправить расчёт в Иделеон</h3><p>Получим выбранную форму, длины всех отрезков и ведомость.</p>
        <input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} /><input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} /><input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="calculatorConsent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Согласен на обработку персональных данных</span></label>
        <button className="primaryButton" type="submit" disabled={status === "sending"}>{status === "sending" ? "Отправляем..." : "Отправить расчёт"}</button>
        {status === "success" && <p className="formSuccess">Расчёт отправлен.</p>}{status === "error" && <p className="formError">Заполни все поля или попробуй ещё раз.</p>}
      </form>
    </section>
  </>;
}
