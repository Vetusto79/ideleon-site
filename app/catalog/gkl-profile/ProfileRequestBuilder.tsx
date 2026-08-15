"use client";

import { useEffect, useRef, useState } from "react";
import { reachGoal } from "../../components/metrika";
import styles from "./gklProfile.module.css";

type FormStatus = "idle" | "sending" | "success" | "error";

type ProfileRow = {
  id: number;
  type: string;
  size: string;
  customSize: string;
  thickness: string;
  length: string;
  quantity: string;
  unit: string;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".dwg", ".dxf",
  ".jpg", ".jpeg", ".png", ".zip", ".rar",
];

const profileTypes = [
  "ПП — потолочный",
  "ППН — направляющий потолочный",
  "ПС — стоечный",
  "ПН — направляющий",
  "ПУ — угловой",
  "Маячковый",
  "Другой профиль",
];

const CUSTOM_SIZE = "Другой размер";

const profileSizes: Record<string, string[]> = {
  "ПП — потолочный": ["60×27", CUSTOM_SIZE],
  "ППН — направляющий потолочный": ["28×27", CUSTOM_SIZE],
  "ПС — стоечный": ["50×50", "75×50", "100×50", CUSTOM_SIZE],
  "ПН — направляющий": ["50×40", "75×40", "100×40", CUSTOM_SIZE],
  "ПУ — угловой": ["20×20", "25×25", "31×31", CUSTOM_SIZE],
  "Маячковый": ["6", "10", CUSTOM_SIZE],
  "Другой профиль": [CUSTOM_SIZE],
};

function createRow(id: number): ProfileRow {
  return {
    id,
    type: "ПП — потолочный",
    size: "60×27",
    customSize: "",
    thickness: "0,6",
    length: "3000",
    quantity: "",
    unit: "шт.",
  };
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".0", "")} МБ`;
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export default function ProfileRequestBuilder() {
  const [rows, setRows] = useState<ProfileRow[]>([createRow(1)]);
  const [nextId, setNextId] = useState(2);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [sourcePage, setSourcePage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSourcePage(window.location.href);
  }, []);

  function updateRow(id: number, field: keyof Omit<ProfileRow, "id">, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function updateProfileType(id: number, type: string) {
    const firstSize = profileSizes[type]?.[0] || CUSTOM_SIZE;
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, type, size: firstSize, customSize: "" }
          : row
      )
    );
  }

  function addRow() {
    setRows((current) => [...current, createRow(nextId)]);
    setNextId((current) => current + 1);
    reachGoal("gkl_profile_add_position", { positions: rows.length + 1 });
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
      return "Можно приложить PDF, DWG, DXF, DOC, XLS, JPG, PNG, ZIP или RAR.";
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

    const filledRows = rows.filter((row) => row.quantity.trim());

    if (!file && filledRows.every((row) => !row.quantity.trim())) {
      setStatus("error");
      setMessage("Укажите количество хотя бы в одной строке или приложите спецификацию.");
      return;
    }

    const formData = new FormData(form);
    const positionLines = filledRows.map((row, index) => {
      const selectedSize =
        row.size === CUSTOM_SIZE ? row.customSize.trim() : row.size;

      return (
        `${index + 1}. ${row.type}; размер ${selectedSize || "не указан"}; ` +
        `толщина ${row.thickness || "не указана"} мм; длина ${row.length || "не указана"} мм; ` +
        `количество ${row.quantity || "не указано"} ${row.unit}`
      );
    });
    const city = String(formData.get("city") || "").trim();
    const comment = String(formData.get("comment") || "").trim();

    formData.set("requestType", "calculation");
    formData.set(
      "task",
      [
        "Заявка со страницы «Профиль для ГКЛ»",
        "",
        "Позиции:",
        ...(positionLines.length ? positionLines : ["Позиции находятся в приложенном файле."]),
        "",
        `Город / объект: ${city || "не указан"}`,
        `Комментарий: ${comment || "не указан"}`,
      ].join("\n")
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
        form: "gkl_profile_positions",
        positions: filledRows.length,
        attachment: Boolean(file),
      });

      form.reset();
      setRows([createRow(1)]);
      setNextId(2);
      setFileName("");
      setStatus("success");
      setMessage("Заявка отправлена. Проверим позиции и свяжемся с вами.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам."
      );
    }
  }

  return (
    <section className={styles.builderSection} id="quick-request" aria-labelledby="builder-title">
      <div className={styles.builderIntro}>
        <p className="label">Быстрая заявка</p>
        <h2 id="builder-title">Соберите список без корзины и карточек товара</h2>
        <p>
          Одна строка — одна позиция. Нужен только добор ПП 60×27? Оставьте одну.
          Нужна смешанная поставка? Добавляйте строки, пока список не закончится.
        </p>
        <div className={styles.builderTip}>
          <strong>Не знаете часть параметров?</strong>
          <span>Оставьте поле как есть и поясните задачу в комментарии.</span>
        </div>
      </div>

      <form className={styles.builderForm} onSubmit={handleSubmit}>
        <div className={styles.positionsHeader}>
          <div><span>Позиции</span><strong>{rows.length}</strong></div>
          <button className={styles.addButton} type="button" onClick={addRow}>
            + Добавить ещё позицию
          </button>
        </div>

        <div className={styles.positionList}>
          {rows.map((row, index) => (
            <fieldset className={styles.positionRow} key={row.id}>
              <legend>Позиция {index + 1}</legend>
              <label className={styles.typeField}>
                <span>Тип профиля</span>
                <select value={row.type} onChange={(event) => updateProfileType(row.id, event.target.value)}>
                  {profileTypes.map((type) => <option value={type} key={type}>{type}</option>)}
                </select>
              </label>
              <label>
                <span>Размер, мм</span>
                <select
                  value={row.size}
                  onChange={(event) => updateRow(row.id, "size", event.target.value)}
                >
                  {(profileSizes[row.type] || [CUSTOM_SIZE]).map((size) => (
                    <option value={size} key={size}>{size}</option>
                  ))}
                </select>
                {row.size === CUSTOM_SIZE ? (
                  <input
                    value={row.customSize}
                    onChange={(event) => updateRow(row.id, "customSize", event.target.value)}
                    placeholder="Укажите размер"
                    aria-label="Другой размер профиля"
                  />
                ) : null}
              </label>
              <label>
                <span>Толщина, мм</span>
                <input
                  inputMode="decimal"
                  value={row.thickness}
                  onChange={(event) => updateRow(row.id, "thickness", event.target.value)}
                  placeholder="0,6"
                />
              </label>
              <label>
                <span>Длина, мм</span>
                <input
                  inputMode="numeric"
                  value={row.length}
                  onChange={(event) => updateRow(row.id, "length", event.target.value)}
                  placeholder="3000"
                />
              </label>
              <label>
                <span>Количество</span>
                <input
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(event) => updateRow(row.id, "quantity", event.target.value)}
                  placeholder="0"
                />
              </label>
              <label>
                <span>Единица</span>
                <select value={row.unit} onChange={(event) => updateRow(row.id, "unit", event.target.value)}>
                  <option value="шт.">шт.</option>
                  <option value="пог. м">пог. м</option>
                  <option value="упак.">упак.</option>
                </select>
              </label>
              {rows.length > 1 ? (
                <button
                  className={styles.removeButton}
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Удалить позицию ${index + 1}`}
                >
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
          <label>
            <span>Город / объект</span>
            <input name="city" autoComplete="address-level2" placeholder="Куда считать доставку" />
          </label>
          <label className={styles.fullField}>
            <span>Комментарий</span>
            <textarea name="comment" placeholder="Производитель, срок, особенности объекта — всё, что важно учесть" />
          </label>
        </div>

        <label className={styles.fileField} id="specification">
          <strong>Есть спецификация? Прикрепите её</strong>
          <span>PDF, DWG, DXF, Word, Excel, JPG, PNG, ZIP или RAR до 25 МБ.</span>
          <input
            ref={fileInputRef}
            name="attachment"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.jpg,.jpeg,.png,.zip,.rar"
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
        <input
          className={styles.hiddenField}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <button className={styles.submitButton} type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Отправляем..." : "Отправить список на расчёт"}
        </button>
        <p className={styles.submitNote}>Без регистрации, корзины и торжественного занесения профиля в личный кабинет.</p>

        {message ? (
          <p
            className={`${styles.formMessage} ${status === "success" ? styles.formSuccess : styles.formError}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
