"use client";

import { useMemo, useState } from "react";

type SystemType = "wedge" | "clamp";

type CalculationRow = {
  name: string;
  specification: string;
  formula: string;
  quantity: number;
  unit: string;
};

function positive(value: string, fallback: number) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegative(value: string, fallback: number) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.ceil(value * factor) / factor;
}

function format(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
}

function downloadText(text: string, fileName: string, type: string) {
  const blob = new Blob(["\ufeff", text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ScaffoldProtectionCalculator() {
  const [length, setLength] = useState("30");
  const [width, setWidth] = useState("20");
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

  const result = useMemo(() => {
    const buildingL = positive(length, 30);
    const buildingW = positive(width, 20);
    const frameH = positive(height, 15);
    const gap = positive(facadeGap, 0.5);
    const frameWidth = positive(corridor, 2);
    const bayLength = positive(bay, 2);
    const tierHeight = positive(tier, 2);
    const reserveValue = Math.min(30, nonNegative(reserve, 5));
    const reserveFactor = 1 + reserveValue / 100;

    const innerL = buildingL + gap * 2;
    const innerW = buildingW + gap * 2;
    const outerL = innerL + frameWidth * 2;
    const outerW = innerW + frameWidth * 2;

    const innerLongBays = Math.ceil(innerL / bayLength);
    const innerShortBays = Math.ceil(innerW / bayLength);
    const outerLongBays = Math.ceil(outerL / bayLength);
    const outerShortBays = Math.ceil(outerW / bayLength);
    const innerBays = 2 * (innerLongBays + innerShortBays);
    const outerBays = 2 * (outerLongBays + outerShortBays);
    const innerNodes = innerBays;
    const outerNodes = outerBays;
    const allNodes = innerNodes + outerNodes;
    const tiers = Math.ceil(frameH / tierHeight);
    const horizontalLevels = tiers + 1;
    const standards = allNodes * tiers;
    const longitudinal = (innerBays + outerBays) * horizontalLevels;
    const transverse = outerNodes * horizontalLevels;
    const diagonalPanels =
      (Math.ceil(innerBays / 4) + Math.ceil(outerBays / 4)) *
      Math.ceil(tiers / 2);
    const topCoverageArea = outerL * outerW - innerL * innerW;
    const topPanels = Math.ceil(topCoverageArea / (bayLength * frameWidth));

    const q = (value: number, digits = 0) => round(value * reserveFactor, digits);
    const rows: CalculationRow[] = [
      {
        name: "Вертикальные стойки",
        specification: `L=${format(tierHeight)} м`,
        formula: `${allNodes} узлов × ${tiers} ярусов`,
        quantity: q(standards),
        unit: "шт.",
      },
      {
        name: "Опорные домкраты / башмаки",
        specification: "по числу нижних узлов",
        formula: `${innerNodes} внутренних + ${outerNodes} наружных`,
        quantity: q(allNodes),
        unit: "шт.",
      },
      {
        name: "Продольные ригели двух контуров",
        specification: `номинал L=${format(bayLength)} м`,
        formula: `${innerBays + outerBays} пролётов × ${horizontalLevels} уровней`,
        quantity: q(longitudinal),
        unit: "шт.",
      },
      {
        name: "Поперечные ригели между контурами",
        specification: `номинал L=${format(frameWidth)} м`,
        formula: `${outerNodes} позиций × ${horizontalLevels} уровней`,
        quantity: q(transverse),
        unit: "шт.",
      },
      {
        name: "Диагональные связи",
        specification: "ориентировочно: каждые 4 пролёта / 2 яруса",
        formula: "по внутреннему и наружному контурам",
        quantity: q(diagonalPanels),
        unit: "шт.",
      },
      {
        name: "Панели / настил верхнего уровня",
        specification: `модуль около ${format(bayLength)} × ${format(frameWidth)} м`,
        formula: `${format(topCoverageArea)} м² кольцевой зоны`,
        quantity: q(topPanels),
        unit: "шт.",
      },
    ];

    if (system === "clamp") {
      rows.push(
        {
          name: "Хомуты неповоротные",
          specification: "для горизонталей и перемычек",
          formula: "2 хомута на каждый ригель",
          quantity: q((longitudinal + transverse) * 2),
          unit: "шт.",
        },
        {
          name: "Хомуты поворотные",
          specification: "для диагональных связей",
          formula: "2 хомута на диагональ",
          quantity: q(diagonalPanels * 2),
          unit: "шт.",
        },
        {
          name: "Стыковые соединители труб",
          specification: "для наращивания стоек",
          formula: `${allNodes} линий × ${Math.max(0, tiers - 1)} стыков`,
          quantity: q(allNodes * Math.max(0, tiers - 1)),
          unit: "шт.",
        },
      );
    }

    return {
      buildingL,
      buildingW,
      frameH,
      gap,
      frameWidth,
      bayLength,
      tierHeight,
      reservePercent: reserveValue,
      innerL,
      innerW,
      outerL,
      outerW,
      innerBays,
      outerBays,
      allNodes,
      tiers,
      topCoverageArea,
      rows,
    };
  }, [length, width, height, corridor, facadeGap, bay, tier, reserve, system]);

  function downloadCalculation() {
    const params = [
      ["Параметр", "Значение"],
      ["Тип системы", system === "wedge" ? "Клиновая" : "Хомутовая"],
      ["Здание", `${result.buildingL} × ${result.buildingW} × ${result.frameH} м`],
      ["Отступ от фасада", `${result.gap} м`],
      ["Расстояние между контурами", `${result.frameWidth} м`],
      ["Шаг пролёта", `${result.bayLength} м`],
      ["Высота яруса", `${result.tierHeight} м`],
      ["Запас", `${result.reservePercent}%`],
      [],
      ["Элемент", "Спецификация", "Основание расчёта", "Количество", "Ед. изм."],
      ...result.rows.map((row) => [
        row.name,
        row.specification,
        row.formula,
        String(row.quantity).replace(".", ","),
        row.unit,
      ]),
    ];
    const csv = params
      .map((row) => row.map((cell = "") => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    downloadText(csv, "IDELEON_predvaritelnyy_raschet_zashchitnogo_karkasa.csv", "text/csv;charset=utf-8");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !consent) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const message = [
        "Предварительный расчёт защиты здания от БПЛА",
        `Система: ${system === "wedge" ? "клиновая" : "хомутовая"}`,
        `Здание: ${result.buildingL} × ${result.buildingW} × ${result.frameH} м`,
        `Отступ: ${result.gap} м; между контурами: ${result.frameWidth} м`,
        `Пролёт: ${result.bayLength} м; ярус: ${result.tierHeight} м; запас: ${result.reservePercent}%`,
        ...result.rows.map((row) => `${row.name}: ${row.quantity} ${row.unit}`),
        "Требуется инженерная проверка схемы и несущей способности.",
      ].join("\n");
      const formData = new FormData();
      formData.append("requestType", "calculation");
      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      formData.append("email", email.trim());
      formData.append("sourcePage", "/calculators/stroitelnye-lesa-zashchitnyy-karkas");
      formData.append("message", message);
      formData.append("consent", "on");
      const response = await fetch("/api/request", { method: "POST", body: formData });
      if (!response.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const viewWidth = 720;
  const viewHeight = 480;
  const scale = Math.min(560 / result.outerL, 340 / result.outerW);
  const outerSvgW = result.outerL * scale;
  const outerSvgH = result.outerW * scale;
  const innerSvgW = result.innerL * scale;
  const innerSvgH = result.innerW * scale;
  const buildingSvgW = result.buildingL * scale;
  const buildingSvgH = result.buildingW * scale;
  const ox = (viewWidth - outerSvgW) / 2;
  const oy = (viewHeight - outerSvgH) / 2;

  return (
    <>
      <section className="scaffoldCalculatorGrid">
        <div className="calculatorPanel">
          <p className="label">Быстрый режим</p>
          <h2>Размеры здания и каркаса</h2>
          <div className="scaffoldMainFields">
            <label>Длина здания, м<input type="number" min="1" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} /></label>
            <label>Ширина здания, м<input type="number" min="1" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} /></label>
            <label>Высота каркаса, м<input type="number" min="1" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
            <label>Между контурами, м<input type="number" min="0.5" step="0.1" value={corridor} onChange={(e) => setCorridor(e.target.value)} /></label>
          </div>

          <details className="scaffoldAdvanced">
            <summary>Дополнительные настройки</summary>
            <div className="scaffoldMainFields">
              <label>Тип системы
                <select value={system} onChange={(e) => setSystem(e.target.value as SystemType)}>
                  <option value="wedge">Клиновая</option>
                  <option value="clamp">Хомутовая</option>
                </select>
              </label>
              <label>Отступ от фасада, м<input type="number" min="0.1" step="0.1" value={facadeGap} onChange={(e) => setFacadeGap(e.target.value)} /></label>
              <label>Шаг пролёта, м<input type="number" min="0.5" step="0.1" value={bay} onChange={(e) => setBay(e.target.value)} /></label>
              <label>Высота яруса, м<input type="number" min="0.5" step="0.1" value={tier} onChange={(e) => setTier(e.target.value)} /></label>
              <label>Запас, %<input type="number" min="0" max="30" step="1" value={reserve} onChange={(e) => setReserve(e.target.value)} /></label>
            </div>
          </details>

          <div className="scaffoldAssumption">
            <strong>Модель V1:</strong> замкнутый прямоугольный двухконтурный каркас. Ригели ставятся на каждом горизонтальном уровне, поперечные перемычки — по узлам наружного контура, диагонали — ориентировочно через 4 пролёта и 2 яруса.
          </div>
        </div>

        <div className="calculatorPanel scaffoldDrawingPanel">
          <div className="scaffoldDrawingHeader">
            <div><p className="label">Схема сверху</p><h2>Два расчётных контура</h2></div>
            <span>Масштаб автоматически</span>
          </div>
          <svg className="scaffoldPlan" viewBox={`0 0 ${viewWidth} ${viewHeight}`} role="img" aria-label="Схема здания, внутреннего и наружного контуров каркаса">
            <rect x={ox} y={oy} width={outerSvgW} height={outerSvgH} rx="4" className="scaffoldOuter" />
            <rect x={ox + result.frameWidth * scale} y={oy + result.frameWidth * scale} width={innerSvgW} height={innerSvgH} rx="3" className="scaffoldInner" />
            <rect x={ox + (result.frameWidth + result.gap) * scale} y={oy + (result.frameWidth + result.gap) * scale} width={buildingSvgW} height={buildingSvgH} rx="2" className="scaffoldBuilding" />
            <text x={viewWidth / 2} y={viewHeight / 2 - 8} textAnchor="middle">ЗДАНИЕ</text>
            <text x={viewWidth / 2} y={viewHeight / 2 + 20} textAnchor="middle" className="scaffoldSizeText">{format(result.buildingL)} × {format(result.buildingW)} м</text>
          </svg>
          <div className="scaffoldLegend">
            <span><i className="outer" /> Наружный контур</span>
            <span><i className="inner" /> Внутренний контур</span>
            <span><i className="building" /> Здание</span>
          </div>
          <div className="scaffoldMetrics">
            <div><span>Габарит каркаса</span><strong>{format(result.outerL)} × {format(result.outerW)} м</strong></div>
            <div><span>Ярусов</span><strong>{result.tiers}</strong></div>
            <div><span>Узлов стоек</span><strong>{result.allNodes}</strong></div>
            <div><span>Верхняя зона</span><strong>{format(round(result.topCoverageArea, 1))} м²</strong></div>
          </div>
        </div>
      </section>

      <section className="calculatorPanel scaffoldResults">
        <div className="scaffoldResultHeader">
          <div><p className="label">Предварительная комплектация</p><h2>Ведомость элементов</h2></div>
          <button type="button" className="secondaryButton" onClick={downloadCalculation}>Скачать расчёт CSV</button>
        </div>
        <div className="calculatorTableWrap">
          <table className="calculatorResultTable">
            <thead><tr><th>Элемент</th><th>Спецификация</th><th>Основание расчёта</th><th>Количество с запасом</th></tr></thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.name}>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.specification}</td>
                  <td>{row.formula}</td>
                  <td><strong>{format(row.quantity)} {row.unit}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="scaffoldEngineeringWarning">
          <strong>Это не расчёт несущей способности и не проект производства работ.</strong>
          <p>Инженер должен проверить ветровые и снеговые нагрузки, основания, устойчивость, раскрепление, диагонали, узлы углов, верхнее покрытие и допустимость выбранной системы.</p>
        </div>
      </section>

      <section className="scaffoldBottomGrid">
        <article className="calculatorPanel">
          <p className="label">Для эксперта</p>
          <h2>Что нужно подтвердить</h2>
          <ol className="scaffoldCheckList">
            <li>Допустим ли принятый шаг стоек и ярусов для конкретной системы.</li>
            <li>Нужны ли горизонтали на каждом уровне и в каком количестве.</li>
            <li>Правильна ли частота диагоналей и поперечных перемычек.</li>
            <li>Как считать углы, доборные пролёты и несовпадающие узлы контуров.</li>
            <li>Какие артикулы, длины и массы использовать из паспорта производителя.</li>
          </ol>
        </article>

        <form className="calculatorSendForm" onSubmit={submit}>
          <h3>Отправить расчёт в Иделеон</h3>
          <p>Получим параметры и ведомость, запросим план здания и передадим инженеру.</p>
          <input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="calculatorConsent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Согласен на обработку персональных данных</span></label>
          <button className="primaryButton" type="submit" disabled={status === "sending"}>{status === "sending" ? "Отправляем..." : "Отправить расчёт"}</button>
          {status === "success" ? <p className="formSuccess">Расчёт отправлен. Мы свяжемся с вами.</p> : null}
          {status === "error" ? <p className="formError">Заполните все поля или попробуйте ещё раз.</p> : null}
        </form>
      </section>
    </>
  );
}
