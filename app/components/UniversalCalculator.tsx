"use client";

import { useEffect, useMemo, useState } from "react";
import { getCalculator } from "../data/calculators";
import type {
  CalculatorConfig,
  CalculatorResultRow,
  CalculatorVisual,
  CalculatorVisualGroup,
} from "../data/calculators";
import {
  buildCalculatorOfferExcel,
  buildCalculatorProjectOfferExcel,
  type CalculatorProjectItem,
} from "./CalculatorOfferExcel";

const GKL_PROJECT_STORAGE_KEY = "ideleon:gkl-project:v1";

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

function positiveNumber(value: string | undefined) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function gklArea(values: Record<string, string>) {
  if ((values.constructionType || "ceiling") === "ceiling") {
    return positiveNumber(values.ceilingArea);
  }
  if ((values.wallInputMode || "area") === "area") {
    return positiveNumber(values.wallArea);
  }
  return positiveNumber(values.wallHeight) * positiveNumber(values.wallLength);
}

function gklProjectTitle(values: Record<string, string>) {
  const type = values.constructionType || "ceiling";
  const area = formatNumber(gklArea(values), 2);
  if (type === "ceiling") return `Потолок из ГКЛ — ${area} м²`;

  const height = formatNumber(positiveNumber(values.wallHeight), 2);
  if (type === "cladding") return `Обшивка / выравнивание стены — ${area} м², H=${height} м`;

  const width = values.partitionWidth || "50";
  return `Перегородка ПС/ПН ${width} — ${area} м², H=${height} м`;
}

function makeProjectItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneRows(rows: CalculatorResultRow[]) {
  return rows.map((row) => ({ ...row }));
}

export default function UniversalCalculator({ calculatorSlug }: { calculatorSlug: string }) {
  const calculator = getCalculator(calculatorSlug)!;
  const projectEnabled = calculator.slug === "profil-gkl";

  const [values, setValues] = useState<Record<string, string>>(() => initialValues(calculator));
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendMessage, setSendMessage] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectItems, setProjectItems] = useState<CalculatorProjectItem[]>([]);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [editingProjectItemId, setEditingProjectItemId] = useState<string | null>(null);
  const [projectMessage, setProjectMessage] = useState("");

  const rows = useMemo(() => calculator.calculate(values), [calculator, values]);
  const calculationWarning = calculator.getWarning?.(values) ?? null;

  useEffect(() => {
    if (!projectEnabled || typeof window === "undefined") {
      setProjectLoaded(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(GKL_PROJECT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { projectName?: string; items?: CalculatorProjectItem[] };
        const defaults = initialValues(calculator);
        const recalculatedItems = Array.isArray(saved.items)
          ? saved.items.map((item) => {
              const restoredValues = { ...defaults, ...(item.values || {}) };
              const normalizedValues = calculator.normalizeValues
                ? calculator.normalizeValues(restoredValues, "__restore__")
                : restoredValues;

              return {
                ...item,
                title: gklProjectTitle(normalizedValues),
                paramsText: calculator.getParamsText(normalizedValues),
                values: normalizedValues,
                rows: cloneRows(calculator.calculate(normalizedValues)),
              };
            })
          : [];

        setProjectName(saved.projectName || "");
        setProjectItems(recalculatedItems);
      }
    } catch {
      setProjectItems([]);
    } finally {
      setProjectLoaded(true);
    }
  }, [projectEnabled, calculator]);

  useEffect(() => {
    if (!projectEnabled || !projectLoaded || typeof window === "undefined") return;
    window.localStorage.setItem(
      GKL_PROJECT_STORAGE_KEY,
      JSON.stringify({ projectName, items: projectItems }),
    );
  }, [projectEnabled, projectLoaded, projectName, projectItems]);

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

  function createCurrentProjectItem(id = makeProjectItemId()): CalculatorProjectItem {
    return {
      id,
      title: gklProjectTitle(values),
      paramsText: calculator.getParamsText(values),
      values: { ...values },
      rows: cloneRows(rows),
      createdAt: new Date().toISOString(),
    };
  }

  function addOrUpdateProjectItem() {
    setProjectMessage("");
    if (calculationWarning) {
      setProjectMessage("Сначала исправьте параметры текущего расчёта.");
      return;
    }

    if (editingProjectItemId) {
      const updated = createCurrentProjectItem(editingProjectItemId);
      setProjectItems((items) => items.map((item) => (item.id === editingProjectItemId ? updated : item)));
      setEditingProjectItemId(null);
      setProjectMessage("Расчёт в проекте обновлён.");
      return;
    }

    setProjectItems((items) => [...items, createCurrentProjectItem()]);
    setValues(initialValues(calculator));
    setProjectMessage("Расчёт добавлен. Можно вводить следующую конструкцию.");
  }

  function editProjectItem(item: CalculatorProjectItem) {
    setValues({ ...item.values });
    setEditingProjectItemId(item.id);
    setProjectMessage("Редактируется сохранённый расчёт. После изменений нажмите «Сохранить изменения». ");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelProjectEdit() {
    setEditingProjectItemId(null);
    setValues(initialValues(calculator));
    setProjectMessage("Редактирование отменено.");
  }

  function duplicateProjectItem(item: CalculatorProjectItem) {
    const copy: CalculatorProjectItem = {
      ...item,
      id: makeProjectItemId(),
      title: `${item.title} — копия`,
      values: { ...item.values },
      rows: cloneRows(item.rows),
      createdAt: new Date().toISOString(),
    };
    setProjectItems((items) => [...items, copy]);
    setProjectMessage("Расчёт продублирован.");
  }

  function removeProjectItem(id: string) {
    setProjectItems((items) => items.filter((item) => item.id !== id));
    if (editingProjectItemId === id) {
      setEditingProjectItemId(null);
      setValues(initialValues(calculator));
    }
    setProjectMessage("Расчёт удалён из проекта.");
  }

  function clearProject() {
    if (typeof window !== "undefined" && !window.confirm("Удалить все сохранённые расчёты проекта?")) return;
    setProjectItems([]);
    setProjectName("");
    setEditingProjectItemId(null);
    setValues(initialValues(calculator));
    setProjectMessage("Проект очищен.");
  }

  async function makeExcelBlob(useProject: boolean) {
    if (useProject && projectEnabled && projectItems.length > 0) {
      return await buildCalculatorProjectOfferExcel({
        calculator,
        projectName: projectName.trim() || "Проект ГКЛ",
        items: projectItems,
      });
    }
    return await buildCalculatorOfferExcel({ calculator, values, rows });
  }

  async function downloadCurrentExcelOffer() {
    const blob = await makeExcelBlob(false);
    downloadBlob(blob, calculator.fileName);
  }

  async function downloadProjectExcelOffer() {
    if (projectItems.length === 0) {
      setProjectMessage("Сначала добавьте хотя бы один расчёт в проект.");
      return;
    }
    const blob = await makeExcelBlob(true);
    downloadBlob(blob, "KP_profil_GKL_proekt_ideleon.xlsx");
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
      const useProject = projectEnabled && projectItems.length > 0;
      const blob = await makeExcelBlob(useProject);
      const fileName = useProject ? "KP_profil_GKL_proekt_ideleon.xlsx" : calculator.fileName;
      const file = new File([blob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const formData = new FormData();
      formData.append("requestType", "calculation");
      formData.append("name", clientName.trim());
      formData.append("phone", clientPhone.trim());
      formData.append("email", clientEmail.trim());
      formData.append("sourcePage", `/calculators/${calculator.slug}`);
      formData.append(
        "message",
        useProject
          ? `${calculator.offerTitle}\nПроект: ${projectName.trim() || "Проект ГКЛ"}\nРасчётов: ${projectItems.length}\nЕдиное КП приложено.`
          : `${calculator.offerTitle}\n${calculator.getParamsText(values)}\nФайл КП приложен.`,
      );
      formData.append("file", file);
      formData.append("consent", "on");

      const response = await fetch("/api/request", { method: "POST", body: formData });
      if (!response.ok) throw new Error("request failed");

      setSendStatus("success");
      setSendMessage(
        useProject
          ? `Проект из ${projectItems.length} расчётов отправлен. Мы подготовим единое предложение.`
          : "Расчёт отправлен. Мы свяжемся с вами и подготовим предложение.",
      );
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
            {projectEnabled ? (
              <>
                <button
                  className="primaryButton"
                  type="button"
                  onClick={addOrUpdateProjectItem}
                  disabled={Boolean(calculationWarning)}
                >
                  {editingProjectItemId ? "Сохранить изменения" : "Добавить в проект и начать следующий"}
                </button>
                {editingProjectItemId ? (
                  <button className="secondaryButton" type="button" onClick={cancelProjectEdit}>
                    Отменить редактирование
                  </button>
                ) : null}
              </>
            ) : null}
            <button
              className="secondaryButton"
              type="button"
              onClick={downloadCurrentExcelOffer}
              disabled={Boolean(calculationWarning)}
            >
              {projectEnabled ? "Скачать текущее КП" : "Скачать КП"}
            </button>
          </div>

          {projectEnabled ? (
            <section className="gklProjectPanel" aria-label="Проект расчётов ГКЛ">
              <div className="gklProjectHeader">
                <div>
                  <p className="label">Единое коммерческое предложение</p>
                  <h3>Проект расчётов ГКЛ</h3>
                  <p>Добавляйте перегородки, обшивку и потолки по очереди. Все расчёты сохраняются в браузере и попадают в один Excel-лист отдельными блоками.</p>
                </div>
                <span className="gklProjectCount">{projectItems.length}</span>
              </div>

              <label className="gklProjectNameField">
                <span>Название объекта / проекта</span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setProjectName(event.target.value)}
                  placeholder="Например: БЦ Северный, перегородки 2-го этажа"
                />
              </label>

              {projectItems.length > 0 ? (
                <div className="gklProjectList">
                  {projectItems.map((item, index) => (
                    <article className={editingProjectItemId === item.id ? "gklProjectItem editing" : "gklProjectItem"} key={item.id}>
                      <div className="gklProjectItemNumber">{index + 1}</div>
                      <div className="gklProjectItemContent">
                        <strong>{item.title}</strong>
                        <span>{item.paramsText}</span>
                      </div>
                      <div className="gklProjectItemActions">
                        <button type="button" onClick={() => editProjectItem(item)}>Редактировать</button>
                        <button type="button" onClick={() => duplicateProjectItem(item)}>Дублировать</button>
                        <button type="button" className="danger" onClick={() => removeProjectItem(item.id)}>Удалить</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="gklProjectEmpty">Пока нет сохранённых расчётов. Рассчитайте первую конструкцию и нажмите «Добавить в проект и начать следующий».</div>
              )}

              {projectMessage ? <p className="gklProjectMessage">{projectMessage}</p> : null}

              <div className="gklProjectFooter">
                <button
                  type="button"
                  className="primaryButton"
                  onClick={downloadProjectExcelOffer}
                  disabled={projectItems.length === 0}
                >
                  Скачать единое КП ({projectItems.length})
                </button>
                <button type="button" className="secondaryButton" onClick={clearProject} disabled={projectItems.length === 0}>
                  Очистить проект
                </button>
              </div>
            </section>
          ) : null}

          <form className="calculatorSendForm" onSubmit={sendExcelOffer}>
            <h3>Отправить расчёт в Иделеон</h3>
            <p>
              {projectEnabled && projectItems.length > 0
                ? `Мы получим единое Excel-КП из ${projectItems.length} расчётов.`
                : "Мы получим Excel-файл с расчётом и сможем подготовить предложение."}
            </p>

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

      <style jsx>{`
        .gklProjectPanel {
          margin-top: 28px;
          padding: 26px;
          border: 1px solid #d9e1eb;
          border-radius: 24px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 16px 40px rgba(15, 27, 51, 0.07);
        }
        .gklProjectHeader {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
        }
        .gklProjectHeader h3 {
          margin: 4px 0 8px;
          font-size: 28px;
          color: #0f1b33;
        }
        .gklProjectHeader p:last-child {
          margin: 0;
          color: #59708e;
          line-height: 1.55;
        }
        .gklProjectCount {
          display: inline-flex;
          min-width: 52px;
          height: 52px;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: #ff6a00;
          color: #ffffff;
          font-size: 22px;
          font-weight: 900;
        }
        .gklProjectNameField {
          display: grid;
          gap: 8px;
          margin-top: 22px;
          font-weight: 800;
          color: #0f1b33;
        }
        .gklProjectNameField input {
          width: 100%;
          min-height: 48px;
          padding: 12px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          background: #ffffff;
          font: inherit;
        }
        .gklProjectList {
          display: grid;
          gap: 12px;
          margin-top: 20px;
        }
        .gklProjectItem {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: 15px;
          border: 1px solid #dbe3ec;
          border-radius: 18px;
          background: #ffffff;
        }
        .gklProjectItem.editing {
          border-color: #ff6a00;
          box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.12);
        }
        .gklProjectItemNumber {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #0f1b33;
          color: #ffffff;
          font-weight: 900;
        }
        .gklProjectItemContent {
          display: grid;
          gap: 5px;
          min-width: 0;
        }
        .gklProjectItemContent strong {
          color: #0f1b33;
          font-size: 17px;
        }
        .gklProjectItemContent span {
          color: #60748f;
          font-size: 13px;
          line-height: 1.45;
        }
        .gklProjectItemActions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }
        .gklProjectItemActions button {
          min-height: 36px;
          padding: 7px 10px;
          border: 1px solid #d6dee8;
          border-radius: 10px;
          background: #f8fafc;
          color: #233754;
          font-weight: 800;
          cursor: pointer;
        }
        .gklProjectItemActions button:hover {
          border-color: #ff6a00;
          color: #e85f00;
        }
        .gklProjectItemActions button.danger:hover {
          border-color: #dc2626;
          color: #dc2626;
        }
        .gklProjectEmpty {
          margin-top: 20px;
          padding: 20px;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          background: #ffffff;
          color: #64748b;
        }
        .gklProjectMessage {
          margin: 16px 0 0;
          color: #47617f;
          font-weight: 800;
        }
        .gklProjectFooter {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }
        @media (max-width: 860px) {
          .gklProjectItem {
            grid-template-columns: 42px minmax(0, 1fr);
          }
          .gklProjectItemActions {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }
        }
        @media (max-width: 560px) {
          .gklProjectPanel {
            padding: 20px;
          }
          .gklProjectHeader h3 {
            font-size: 23px;
          }
          .gklProjectItem {
            grid-template-columns: 1fr;
          }
          .gklProjectItemNumber {
            width: 34px;
            height: 34px;
          }
          .gklProjectItemActions button {
            flex: 1 1 auto;
          }
        }
      `}</style>
    </>
  );
}
