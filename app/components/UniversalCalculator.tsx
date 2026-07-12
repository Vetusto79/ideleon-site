"use client";

import { useMemo, useState } from "react";
import { getCalculator } from "../data/calculators";
import type { CalculatorConfig, CalculatorVisual, CalculatorVisualGroup } from "../data/calculators";
import { buildCalculatorOfferExcel } from "./CalculatorOfferExcel";

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits }).format(value);
}

function initialValues(calculator: CalculatorConfig) {
  const defaults = Object.fromEntries(calculator.fields.map((field) => [field.id, field.defaultValue]));
  return calculator.normalizeValues ? calculator.normalizeValues(defaults, "__init__") : defaults;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function conditionMatches(values: Record<string, string>, condition?: { fieldId: string; values: string[] }) {
  if (!condition) return true;
  return condition.values.includes(values[condition.fieldId]);
}

function visualIsActive(values: Record<string, string>, visual: CalculatorVisual) {
  if (visual.activeWhen) {
    return Object.entries(visual.activeWhen).every(([fieldId, value]) => values[fieldId] === value);
  }
  return Boolean(visual.fieldId && visual.value && values[visual.fieldId] === visual.value);
}

function visualIsClickable(visual: CalculatorVisual) {
  return Boolean((visual.fieldId && visual.value) || visual.setValues);
}

export default function UniversalCalculator({ calculatorSlug }: { calculatorSlug: string }) {
  const calculator = getCalculator(calculatorSlug)!;

  const [values, setValues] = useState<Record<string, string>>(() => initialValues(calculator));
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendMessage, setSendMessage] = useState("");

  const rows = useMemo(() => calculator.calculate(values), [calculator, values]);
  const calculationWarning = calculator.getWarning?.(values) ?? null;

  function updateValues(nextValues: Record<string, string>, changedFieldId: string) {
    const normalized = calculator.normalizeValues
      ? calculator.normalizeValues(nextValues, changedFieldId)
      : nextValues;
    setValues(normalized);
  }

  function setValue(id: string, value: string) {
    updateValues({ ...values, [id]: value }, id);
  }

  function applyVisual(visual: CalculatorVisual) {
    const changes = visual.setValues
      ? visual.setValues
      : visual.fieldId && visual.value
        ? { [visual.fieldId]: visual.value }
        : null;

    if (!changes) return;
    const changedFieldId = visual.fieldId || Object.keys(changes)[0] || "visual";
    updateValues({ ...values, ...changes }, changedFieldId);
  }

  async function makeExcelBlob() {
    return await buildCalculatorOfferExcel({ calculator, values, rows });
  }

  async function downloadExcelOffer() {
    const blob = await makeExcelBlob();
    downloadBlob(blob, calculator.fileName);
  }

  async function sendExcelOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendMessage("");

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      setSendStatus("error");
      setSendMessage("Заполните имя, телефон и e-mail.");
      return;
    }

    if (!consent) {
      setSendStatus("error");
      setSendMessage("Нужно согласие на обработку персональных данных.");
      return;
    }

    setSendStatus("sending");

    try {
      const blob = await makeExcelBlob();
      const file = new File([blob], calculator.fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const formData = new FormData();
      formData.append("requestType", "calculation");
      formData.append("name", clientName.trim());
      formData.append("phone", clientPhone.trim());
      formData.append("email", clientEmail.trim());
      formData.append("sourcePage", `/calculators/${calculator.slug}`);
      formData.append("message", `${calculator.offerTitle}\n${calculator.getParamsText(values)}\nФайл КП приложен.`);
      formData.append("file", file);
      formData.append("consent", "on");

      const response = await fetch("/api/request", { method: "POST", body: formData });
      if (!response.ok) throw new Error("request failed");

      setSendStatus("success");
      setSendMessage("Расчёт отправлен. Мы свяжемся с вами и подготовим предложение.");
    } catch {
      setSendStatus("error");
      setSendMessage("Не удалось отправить заявку. Попробуйте позвонить нам или написать на почту.");
    }
  }

  const visibleFields = calculator.fields.filter((field) => {
    if (field.hideInput) return false;
    return conditionMatches(values, field.showWhen);
  });

  const baseVisualGroup: CalculatorVisualGroup | null = calculator.visuals.length > 0
    ? {
        title: calculator.visualTitle || "Выберите вариант по изображению",
        description:
          calculator.visualDescription ||
          "Нажмите на карточку, чтобы переключить соответствующий параметр калькулятора.",
        visuals: calculator.visuals,
      }
    : null;

  const visibleVisualGroups = [
    ...(baseVisualGroup ? [baseVisualGroup] : []),
    ...(calculator.visualGroups || []),
  ].filter((group) => conditionMatches(values, group.showWhen));

  function renderVisualCard(visual: CalculatorVisual) {
    if (!conditionMatches(values, visual.showWhen)) return null;

    const active = visualIsActive(values, visual);
    const clickable = visualIsClickable(visual);
    const className = active ? "calculatorVisualCard active" : "calculatorVisualCard";
    const content = (
      <>
        <div
          className={
            visual.diagram
              ? "calculatorVisualImageWrap calculatorVisualImageWrapWithDiagram"
              : "calculatorVisualImageWrap"
          }
        >
          <div className="calculatorVisualPhotoWrap">
            <img className="calculatorVisualPhoto" src={visual.image} alt={visual.alt} loading="lazy" />
            {active ? <span className="calculatorVisualSelected">Выбрано</span> : null}
          </div>
          {visual.diagram ? (
            <div className="calculatorVisualDiagramWrap">
              <img
                className="calculatorVisualDiagram"
                src={visual.diagram}
                alt={visual.diagramAlt || `Техническая схема: ${visual.title}`}
                loading="lazy"
              />
            </div>
          ) : null}
        </div>
        <div className="calculatorVisualText">
          <h3>{visual.title}</h3>
          <p>{visual.description}</p>
        </div>
      </>
    );

    if (clickable) {
      return (
        <button
          key={`${visual.title}-${visual.value || "multi"}`}
          type="button"
          className={className}
          onClick={() => applyVisual(visual)}
          aria-pressed={active}
        >
          {content}
        </button>
      );
    }

    return (
      <article key={visual.title} className={className}>
        {content}
      </article>
    );
  }

  function renderVisualGroup(group: CalculatorVisualGroup) {
    const visuals = group.visuals.filter((visual) => conditionMatches(values, visual.showWhen));
    if (visuals.length === 0) return null;

    const gridClass =
      visuals.length === 1
        ? "calculatorVisualGrid calculatorVisualGridSingle"
        : visuals.length === 2
          ? "calculatorVisualGrid calculatorVisualGridTwo"
          : visuals.length === 3
            ? "calculatorVisualGrid calculatorVisualGridThree"
            : "calculatorVisualGrid";

    return (
      <section className="calculatorVisualGroup" key={group.title}>
        <div className="calculatorVisualHeader">
          <p className="label">Визуальный выбор</p>
          <h2>{group.title}</h2>
          <p>{group.description}</p>
        </div>
        <div className={gridClass}>{visuals.map(renderVisualCard)}</div>
      </section>
    );
  }

  return (
    <>
      <section className={visibleVisualGroups.length > 0 ? "calculatorSection calculatorSectionStacked" : "calculatorSection"}>
        {visibleVisualGroups.length > 0 ? (
          <div className="calculatorVisualGroupsInline">
            {visibleVisualGroups.map(renderVisualGroup)}
          </div>
        ) : null}

        <div className="calculatorPanel">
          <h2>Параметры расчёта</h2>

          <div className="calculatorFields">
            {visibleFields.map((field) => (
              <div key={field.id} className="calculatorField">
                <label>{field.label}</label>

                {field.type === "number" || field.type === "text" ? (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    min={field.type === "number" ? "0" : undefined}
                    step={field.type === "number" ? field.step || "any" : undefined}
                    value={values[field.id] ?? ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(field.id, event.target.value)}
                  />
                ) : null}

                {field.type === "select" ? (
                  <select
                    value={values[field.id] ?? field.defaultValue}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setValue(field.id, event.target.value)}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : null}

                {field.type === "buttons" ? (
                  <div className="calculatorToggleGroup">
                    {field.options?.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={values[field.id] === option.value ? "active" : ""}
                        onClick={() => setValue(field.id, option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <p className="calculatorNote">
            {calculator.calculatorNote || "Расчёт предварительный. На расход могут влиять раскладка, проёмы, светильники, подрезка, высота и требования проекта."}
          </p>
        </div>

        <div className="calculatorPanel calculatorResultPanel">
          <h2>{calculator.resultTitle || "Результат"}</h2>

          {calculationWarning ? (
            <div className="calculatorCompatibilityWarning" role="alert">
              <strong>Нужно изменить параметры</strong>
              <p>{calculationWarning}</p>
            </div>
          ) : (
            <div className="calculatorTableWrap">
              <table className="calculatorResultTable">
                <thead>
                  <tr>
                    <th>{calculator.resultMaterialTitle || "Материал"}</th>
                    <th>{calculator.resultCoefficientTitle || "Коэффициент"}</th>
                    <th>{calculator.resultQuantityTitle || "Количество с запасом"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.name}-${row.size ?? ""}`}>
                      <td>
                        <strong>{row.name}</strong>
                        {row.size ? <span>{row.size}</span> : null}
                        {row.catalogName ? <span className="calculatorCatalogName">По каталогу: {row.catalogName}</span> : null}
                      </td>
                      <td>{row.coefficient}</td>
                      <td>{formatNumber(row.quantity, calculator.resultMaxFractionDigits ?? 2)} {row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="calculatorActions">
            <button
              className="secondaryButton"
              type="button"
              onClick={downloadExcelOffer}
              disabled={Boolean(calculationWarning)}
            >
              Скачать КП
            </button>
          </div>

          <form className="calculatorSendForm" onSubmit={sendExcelOffer}>
            <h3>Отправить расчёт в Иделеон</h3>
            <p>Мы получим Excel-файл с расчётом и сможем подготовить предложение.</p>

            <input placeholder="Ваше имя" value={clientName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setClientName(event.target.value)} />
            <input placeholder="Телефон" value={clientPhone} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setClientPhone(event.target.value)} />
            <input placeholder="E-mail" value={clientEmail} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setClientEmail(event.target.value)} />

            <label className="calculatorConsent">
              <input type="checkbox" checked={consent} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConsent(event.target.checked)} />
              <span>Согласен на обработку персональных данных</span>
            </label>

            <button className="primaryButton" type="submit" disabled={sendStatus === "sending" || Boolean(calculationWarning)}>
              {sendStatus === "sending" ? "Отправляем..." : "Отправить в Иделеон"}
            </button>

            {sendMessage ? <p className={sendStatus === "success" ? "formSuccess" : "formError"}>{sendMessage}</p> : null}
          </form>
        </div>
      </section>

      <section className="calculatorSeoSection">
        {calculator.seoSections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </section>

      {calculator.relatedLinks && calculator.relatedLinks.length > 0 ? (
        <nav className="calculatorRelatedLinks" aria-label="Связанные страницы">
          <h2>Связанные страницы</h2>
          <div>
            {calculator.relatedLinks.map((link) => (
              <a href={link.href} key={link.href}>{link.label}</a>
            ))}
          </div>
        </nav>
      ) : null}

      {calculator.faq.length > 0 && (
        <section className="calculatorFaqSection">
          <h2>Вопросы по расчёту</h2>
          <div className="faqGrid">
            {calculator.faq.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
