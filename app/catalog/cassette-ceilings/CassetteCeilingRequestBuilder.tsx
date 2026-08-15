"use client";

import { useEffect, useRef, useState } from "react";
import { reachGoal } from "../../components/metrika";
import styles from "../gkl-profile/gklProfile.module.css";

type FormStatus = "idle" | "sending" | "success" | "error";

type CeilingRow = {
  id: number;
  systemType: string;
  systemClass: string;
  material: string;
  module: string;
  customModule: string;
  color: string;
  customColor: string;
  area: string;
  perimeter: string;
  drop: string;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".dwg", ".dxf",
  ".jpg", ".jpeg", ".png", ".zip", ".rar",
];

const CUSTOM_MODULE = "Другой размер";
const CUSTOM_COLOR = "Другой RAL / декор";

const modules = [
  "300×300",
  "300×600",
  "300×1200",
  "600×600",
  "600×1200",
  CUSTOM_MODULE,
];

const colors = [
  "Белый RAL 9003",
  "Металлик RAL 9007",
  "Металлик матовый RAL 9006",
  CUSTOM_COLOR,
];

function createRow(id: number): CeilingRow {
  return {
    id,
    systemType: "Открытая система",
    systemClass: "Стандарт",
    material: "Оцинкованная сталь",
    module: "600×600",
    customModule: "",
    color: "Белый RAL 9003",
    customColor: "",
    area: "",
    perimeter: "",
    drop: "300",
  };
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".0", "")} МБ`;
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export default function CassetteCeilingRequestBuilder() {
  const [rows, setRows] = useState<CeilingRow[]>([createRow(1)]);
  const [nextId, setNextId] = useState(2);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [sourcePage, setSourcePage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSourcePage(window.location.href);
  }, []);

  function updateRow(id: number, field: keyof Omit<CeilingRow, "id">, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setRows((current) => [...current, createRow(nextId)]);
    setNextId((current) => current + 1);
    reachGoal("cassette_ceiling_add_zone", { zones: rows.length + 1 });
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

    const filledRows = rows.filter((row) => row.area.trim());
    if (!file && filledRows.length === 0) {
      setStatus("error");
      setMessage("Укажите площадь хотя бы одной системы или приложите спецификацию.");
      return;
    }

    const formData = new FormData(form);
    const systemLines = filledRows.map((row, index) => {
      const selectedModule = row.module === CUSTOM_MODULE
        ? row.customModule.trim() || "не указан"
        : row.module;
      const selectedColor = row.color === CUSTOM_COLOR
        ? row.customColor.trim() || "не указан"
        : row.color;
      const perimeter = row.perimeter.trim()
        ? `${row.perimeter.trim()} м`
        : `${row.area.trim()} м (предварительно принят численно равным площади)`;

      return (
        `${index + 1}. ${row.systemType}; класс ${row.systemClass}; ` +
        `кассета ${selectedModule}; материал: ${row.material}; цвет: ${selectedColor}; ` +
        `площадь ${row.area.trim()} м²; периметр ${perimeter}; ` +
        `опускание ${row.drop.trim() || "не указано"} мм`
      );
    });
    const city = String(formData.get("city") || "").trim();
    const comment = String(formData.get("comment") || "").trim();

    formData.set("requestType", "calculation");
    formData.set(
      "task",
      [
        "Заявка со страницы «Кассетные потолочные системы»",
        "",
        "Системы / зоны:",
        ...(systemLines.length ? systemLines : ["Параметры находятся в приложенном файле."]),
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
        form: "cassette_ceiling_systems",
        zones: filledRows.length,
        attachment: Boolean(file),
      });

      form.reset();
      setRows([createRow(1)]);
      setNextId(2);
      setFileName("");
      setStatus("success");
      setMessage("Заявка отправлена. Проверим систему и подготовим предложение.");
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
    <section className={styles.builderSection} id="quick-request" aria-labelledby="ceiling-builder-title">
      <div className={styles.builderIntro}>
        <p className="label">Заявка по параметрам</p>
        <h2 id="ceiling-builder-title">Опишите потолок, а не каждую железку</h2>
        <p>
          Одна строка — одна система или зона объекта. Комплект кассет, профилей,
          уголков и подвесов разложим сами.
        </p>
        <div className={styles.builderTip}>
          <strong>Периметр неизвестен?</strong>
          <span>Оставьте поле пустым — предварительно примем его численно равным площади.</span>
        </div>
      </div>

      <form className={styles.builderForm} onSubmit={handleSubmit}>
        <div className={styles.positionsHeader}>
          <div><span>Системы / зоны</span><strong>{rows.length}</strong></div>
          <button className={styles.addButton} type="button" onClick={addRow}>
            + Добавить ещё систему
          </button>
        </div>

        <div className={styles.positionList}>
          {rows.map((row, index) => (
            <fieldset className={`${styles.positionRow} ${styles.ceilingPositionRow}`} key={row.id}>
              <legend>Система {index + 1}</legend>

              <label>
                <span>Тип потолка</span>
                <select value={row.systemType} onChange={(event) => updateRow(row.id, "systemType", event.target.value)}>
                  <option>Открытая система</option>
                  <option>Закрытая система</option>
                </select>
              </label>

              <label>
                <span>Класс</span>
                <select value={row.systemClass} onChange={(event) => updateRow(row.id, "systemClass", event.target.value)}>
                  <option>Эконом</option>
                  <option>Стандарт</option>
                  <option>Премиум</option>
                </select>
              </label>

              <label>
                <span>Материал кассеты</span>
                <select value={row.material} onChange={(event) => updateRow(row.id, "material", event.target.value)}>
                  <option>Оцинкованная сталь</option>
                  <option>Алюминий</option>
                </select>
              </label>

              <label>
                <span>Размер кассеты, мм</span>
                <select value={row.module} onChange={(event) => updateRow(row.id, "module", event.target.value)}>
                  {modules.map((module) => <option value={module} key={module}>{module}</option>)}
                </select>
                {row.module === CUSTOM_MODULE ? (
                  <input
                    value={row.customModule}
                    onChange={(event) => updateRow(row.id, "customModule", event.target.value)}
                    placeholder="Укажите размер"
                    aria-label="Другой размер кассеты"
                  />
                ) : null}
              </label>

              <label>
                <span>Цвет</span>
                <select value={row.color} onChange={(event) => updateRow(row.id, "color", event.target.value)}>
                  {colors.map((color) => <option value={color} key={color}>{color}</option>)}
                </select>
                {row.color === CUSTOM_COLOR ? (
                  <input
                    value={row.customColor}
                    onChange={(event) => updateRow(row.id, "customColor", event.target.value)}
                    placeholder="RAL, декор или образец"
                    aria-label="Другой цвет кассетного потолка"
                  />
                ) : null}
              </label>

              <label>
                <span>Площадь, м²</span>
                <input
                  inputMode="decimal"
                  value={row.area}
                  onChange={(event) => updateRow(row.id, "area", event.target.value)}
                  placeholder="100"
                />
              </label>

              <label>
                <span>Периметр, м — необязательно</span>
                <input
                  inputMode="decimal"
                  value={row.perimeter}
                  onChange={(event) => updateRow(row.id, "perimeter", event.target.value)}
                  placeholder="Если известен"
                />
              </label>

              <label>
                <span>Опускание потолка, мм</span>
                <input
                  inputMode="numeric"
                  value={row.drop}
                  onChange={(event) => updateRow(row.id, "drop", event.target.value)}
                  placeholder="300"
                />
              </label>

              {rows.length > 1 ? (
                <button
                  className={styles.removeButton}
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Удалить систему ${index + 1}`}
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
            <textarea name="comment" placeholder="Перфорация, акустическая подложка, производитель, срок и другие требования" />
          </label>
        </div>

        <label className={styles.fileField} id="specification">
          <strong>Есть план, проект или спецификация? Прикрепите</strong>
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
          {status === "sending" ? "Отправляем..." : "Отправить системы на расчёт"}
        </button>
        <p className={styles.submitNote}>Комплектующие и совместимость проверит менеджер — клиенту страдать необязательно.</p>

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
