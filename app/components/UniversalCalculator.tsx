"use client";

import { useMemo, useState } from "react";
import { getCalculator } from "../data/calculators";
import type { CalculatorConfig } from "../data/calculators";
import { buildCalculatorOfferExcel } from "./CalculatorOfferExcel";

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
}

function initialValues(calculator: CalculatorConfig) {
  return Object.fromEntries(calculator.fields.map((field) => [field.id, field.defaultValue]));
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
  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  function isFieldVisible(fieldId: string, allowed: string[]) {
    return allowed.includes(values[fieldId]);
  }

  function makeExcelBlob() {
    return buildCalculatorOfferExcel({ calculator, values, rows });
  }

  function downloadExcelOffer() {
    downloadBlob(makeExcelBlob(), calculator.fileName);
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
      const file = new File([makeExcelBlob()], calculator.fileName, {
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
    } catch (error) {
      setSendStatus("error");
      setSendMessage("Не удалось отправить заявку. Попробуйте позвонить нам или написать на почту.");
    }
  }

  const visibleFields = calculator.fields.filter((field) => {
    if (!field.showWhen) return true;
    return isFieldVisible(field.showWhen.fieldId, field.showWhen.values);
  });

  return (
    <>
      {calculator.visuals.length > 0 && (
        <section className="calculatorVisualSection">
          <div className="calculatorVisualHeader">
            <p className="label">Наглядная схема</p>
            <h2>Что именно считает калькулятор</h2>
            <p>Выберите вариант расчёта по кнопке или нажмите на схему — калькулятор переключится автоматически.</p>
          </div>

          <div className={calculator.visuals.length === 3 ? "calculatorVisualGrid calculatorVisualGridThree" : "calculatorVisualGrid"}>
            {calculator.visuals.map((visual) => {
              const active = Boolean(visual.fieldId && visual.value && values[visual.fieldId] === visual.value);
              const clickable = Boolean(visual.fieldId && visual.value);

              if (clickable && visual.fieldId && visual.value) {
                return (
                  <button
                    key={`${visual.title}-${visual.value}`}
                    type="button"
                    className={active ? "calculatorVisualCard active" : "calculatorVisualCard"}
                    onClick={() => setValue(visual.fieldId!, visual.value!)}
                    aria-pressed={active}
                  >
                    <img src={visual.image} alt={visual.alt} />
                    <div>
                      <h3>{visual.title}</h3>
                      <p>{visual.description}</p>
                    </div>
                  </button>
                );
              }

              return (
                <article key={visual.title} className="calculatorVisualCard">
                  <img src={visual.image} alt={visual.alt} />
                  <div>
                    <h3>{visual.title}</h3>
                    <p>{visual.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="calculatorSection">
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
                    value={values[field.id] ?? ""}
                    onChange={(event) => setValue(field.id, event.target.value)}
                  />
                ) : null}

                {field.type === "select" ? (
                  <select value={values[field.id] ?? field.defaultValue} onChange={(event) => setValue(field.id, event.target.value)}>
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
            Расчёт предварительный. На расход могут влиять раскладка, проёмы, светильники, подрезка, высота и требования проекта.
          </p>
        </div>

        <div className="calculatorPanel calculatorResultPanel">
          <h2>Результат</h2>

          <div className="calculatorTableWrap">
            <table className="calculatorResultTable">
              <thead>
                <tr>
                  <th>Материал</th>
                  <th>Коэффициент</th>
                  <th>Количество с запасом</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.name}-${row.size ?? ""}`}>
                    <td>
                      <strong>{row.name}</strong>
                      {row.size ? <span>{row.size}</span> : null}
                    </td>
                    <td>{row.coefficient}</td>
                    <td>{formatNumber(row.quantity)} {row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="calculatorActions">
            <button className="secondaryButton" type="button" onClick={downloadExcelOffer}>
              Скачать КП
            </button>
          </div>

          <form className="calculatorSendForm" onSubmit={sendExcelOffer}>
            <h3>Отправить расчёт в Иделеон</h3>
            <p>Мы получим Excel-файл с расчётом и сможем подготовить предложение.</p>

            <input placeholder="Ваше имя" value={clientName} onChange={(event) => setClientName(event.target.value)} />
            <input placeholder="Телефон" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} />
            <input placeholder="E-mail" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} />

            <label className="calculatorConsent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Согласен на обработку персональных данных</span>
            </label>

            <button className="primaryButton" type="submit" disabled={sendStatus === "sending"}>
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
