"use client";

import { useEffect, useRef, useState } from "react";
import { reachGoal } from "../../components/metrika";
import type { CatalogProductConfig, CatalogRequestField } from "../../data/catalogProducts";
import styles from "../gkl-profile/gklProfile.module.css";

type FormStatus = "idle" | "sending" | "success" | "error";
type RequestRow = { id: number; values: Record<string, string> };

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".dwg", ".dxf",
  ".jpg", ".jpeg", ".png", ".zip", ".rar",
];

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".0", "")} МБ`;
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function initialValues(fields: CatalogRequestField[]) {
  return Object.fromEntries(fields.map((field) => [field.id, field.defaultValue || ""]));
}

function fieldIsVisible(field: CatalogRequestField, values: Record<string, string>) {
  return !field.condition || values[field.condition.fieldId] === field.condition.equals;
}

export default function CatalogRequestBuilder({ config }: { config: CatalogProductConfig }) {
  const makeRow = (id: number): RequestRow => ({ id, values: initialValues(config.fields) });
  const [rows, setRows] = useState<RequestRow[]>([makeRow(1)]);
  const [nextId, setNextId] = useState(2);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [sourcePage, setSourcePage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSourcePage(window.location.href);
  }, []);

  function updateRow(id: number, fieldId: string, value: string) {
    setRows((current) => current.map((row) => (
      row.id === id ? { ...row, values: { ...row.values, [fieldId]: value } } : row
    )));
  }

  function addRow() {
    setRows((current) => [...current, makeRow(nextId)]);
    setNextId((current) => current + 1);
    reachGoal("catalog_add_position", { product: config.slug, positions: rows.length + 1 });
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function validateFile(file: File | null) {
    if (!file || file.size === 0) return "";
    if (file.size > MAX_FILE_SIZE) {
      return `Файл слишком большой. Максимальный размер — ${formatFileSize(MAX_FILE_SIZE)}.`;
    }
    if (!ALLOWED_FILE_EXTENSIONS.includes(getFileExtension(file.name))) {
      return "Можно приложить PDF, DWG, DXF, DOC, XLS, XLSX, CSV, JPG, PNG, ZIP или RAR.";
    }
    return "";
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    const validationMessage = validateFile(file);
    if (validationMessage) {
      event.target.value = "";
      setFileName("");
      setStatus("error");
      setMessage(validationMessage);
      return;
    }
    setFileName(file ? `${file.name} · ${formatFileSize(file.size)}` : "");
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = fileInputRef.current?.files?.[0] || null;
    const validationMessage = validateFile(file);
    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    const filledRows = rows.filter((row) => row.values[config.anchorField]?.trim());
    if (!file && filledRows.length === 0) {
      const anchorLabel = config.fields.find((field) => field.id === config.anchorField)?.label || "количество";
      setStatus("error");
      setMessage(`Укажите поле «${anchorLabel}» хотя бы в одной строке или приложите файл.`);
      return;
    }

    const positionLines = filledRows.map((row, index) => {
      const parameters = config.fields
        .filter((field) => fieldIsVisible(field, row.values))
        .map((field) => {
          const value = row.values[field.id]?.trim();
          return value ? `${field.label}: ${value}${field.unit ? ` ${field.unit}` : ""}` : "";
        })
        .filter(Boolean);
      return `${index + 1}. ${parameters.join("; ")}`;
    });

    const formData = new FormData(form);
    const city = String(formData.get("city") || "").trim();
    const comment = String(formData.get("comment") || "").trim();
    formData.set("requestType", "calculation");
    formData.set(
      "task",
      [
        `Заявка со страницы «${config.title}»`,
        "",
        `${config.itemNamePlural}:`,
        ...(positionLines.length ? positionLines : ["Параметры находятся в приложенном файле."]),
        "",
        `Город / объект: ${city || "не указан"}`,
        `Комментарий: ${comment || "не указан"}`,
      ].join("\n"),
    );
    formData.set("sourcePage", sourcePage || window.location.href);

    setStatus("sending");
    setMessage("Отправляем заявку...");

    try {
      const response = await fetch("/api/request", { method: "POST", body: formData });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Не удалось отправить заявку.");
      }

      reachGoal("lead_form_submit", {
        source: sourcePage || window.location.href,
        form: `catalog_${config.slug}`,
        positions: filledRows.length,
        attachment: Boolean(file),
      });

      form.reset();
      setRows([makeRow(1)]);
      setNextId(2);
      setFileName("");
      setStatus("success");
      setMessage("Заявка отправлена. Проверим параметры и подготовим предложение.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  return (
    <section className={styles.builderSection} id="quick-request" aria-labelledby={`${config.slug}-builder-title`}>
      <div className={styles.builderIntro}>
        <p className="label">Заявка по параметрам</p>
        <h2 id={`${config.slug}-builder-title`}>{config.formTitle}</h2>
        <p>{config.formText}</p>
        <div className={styles.builderTip}>
          <strong>{config.formTipTitle}</strong>
          <span>{config.formTipText}</span>
        </div>
      </div>

      <form className={styles.builderForm} onSubmit={handleSubmit}>
        <div className={styles.positionsHeader}>
          <div><span>{config.itemNamePlural}</span><strong>{rows.length}</strong></div>
          <button className={styles.addButton} type="button" onClick={addRow}>{config.addLabel}</button>
        </div>

        <div className={styles.positionList}>
          {rows.map((row, index) => (
            <fieldset className={`${styles.positionRow} ${styles.ceilingPositionRow}`} key={row.id}>
              <legend>{config.itemName} {index + 1}</legend>
              {config.fields.filter((field) => fieldIsVisible(field, row.values)).map((field) => (
                <label key={field.id}>
                  <span>{field.label}{field.unit ? `, ${field.unit}` : ""}</span>
                  {field.type === "select" ? (
                    <select value={row.values[field.id]} onChange={(event) => updateRow(row.id, field.id, event.target.value)}>
                      {field.options?.map((option) => (
                        <option value={option.value || option.label} key={option.value || option.label}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      inputMode={field.inputMode || "text"}
                      value={row.values[field.id]}
                      onChange={(event) => updateRow(row.id, field.id, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </label>
              ))}
              {rows.length > 1 ? (
                <button className={styles.removeButton} type="button" onClick={() => removeRow(row.id)}>
                  Удалить
                </button>
              ) : null}
            </fieldset>
          ))}
        </div>

        <div className={styles.contactGrid}>
          <label><span>Ваше имя</span><input name="name" autoComplete="name" required /></label>
          <label><span>Телефон</span><input name="phone" autoComplete="tel" required /></label>
          <label><span>E-mail</span><input name="email" type="email" autoComplete="email" required /></label>
          <label><span>Город / объект</span><input name="city" autoComplete="address-level2" placeholder="Куда считать доставку" /></label>
          <label className={styles.fullField}>
            <span>Комментарий</span>
            <textarea name="comment" placeholder={config.commentPlaceholder} />
          </label>
        </div>

        <label className={styles.fileField} id="specification">
          <strong>Есть проект, ведомость или спецификация? Прикрепите</strong>
          <span>PDF, DWG, DXF, Word, Excel, CSV, JPG, PNG, ZIP или RAR до 25 МБ.</span>
          <input
            ref={fileInputRef}
            name="attachment"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.dwg,.dxf,.jpg,.jpeg,.png,.zip,.rar"
            onChange={handleFileChange}
          />
          {fileName ? <em>{fileName}</em> : null}
        </label>

        <label className={styles.consentField}>
          <input name="consent" type="checkbox" value="yes" required />
          <span>
            Я согласен на обработку персональных данных и ознакомлен с{" "}
            <a href="/privacy" target="_blank" rel="noreferrer">Политикой обработки персональных данных</a>
          </span>
        </label>

        <input type="hidden" name="sourcePage" value={sourcePage} />
        <input className={styles.hiddenField} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <button className={styles.submitButton} type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Отправляем..." : config.submitLabel}
        </button>
        <p className={styles.submitNote}>{config.submitNote}</p>
        {message ? (
          <p className={`${styles.formMessage} ${status === "success" ? styles.formSuccess : styles.formError}`} role="status">
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
