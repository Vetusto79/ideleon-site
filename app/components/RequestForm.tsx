"use client";

import { useEffect, useRef, useState } from "react";
import { reachGoal } from "./metrika";

type FormStatus = "idle" | "sending" | "success" | "error";

const MAX_FILE_SIZE = 40 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".zip",
];

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".0", "")} МБ`;
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export default function RequestForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [sourcePage, setSourcePage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSourcePage(window.location.href);
  }, []);

  function validateFile(file: File | null) {
    if (!file || file.size === 0) {
      return "";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `Файл слишком большой. Максимальный размер — ${formatFileSize(MAX_FILE_SIZE)}.`;
    }

    const extension = getFileExtension(file.name);
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      return "Можно приложить PDF, DOC, DOCX, XLS, XLSX, JPG, PNG или ZIP.";
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

    const formData = new FormData(form);
    formData.set("requestType", "calculation");

    setStatus("sending");
    setMessage("Отправляем заявку...");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Не удалось отправить заявку.");
      }

      reachGoal("lead_form_submit", { source: sourcePage || window.location.href });

      form.reset();
      setFileName("");
      setStatus("success");
      setMessage("Заявка отправлена. Мы скоро свяжемся с вами.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте позвонить нам или написать на почту."
      );
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input name="name" placeholder="Ваше имя" autoComplete="name" required />
      <input
        name="phone"
        placeholder="Телефон"
        autoComplete="tel"
        required
      />
      <input
        className="formFull"
        name="email"
        type="email"
        placeholder="E-mail"
        autoComplete="email"
        required
      />
      <textarea name="task" placeholder="Кратко опишите задачу" required />

      <label className="fileField formFull">
        <span className="fileFieldTitle">Прикрепить файл</span>
        <span className="fileFieldText">
          Можно приложить спецификацию, проект, смету или список материалов.
          PDF, DOC, XLS, JPG, PNG или ZIP до 40 МБ.
        </span>
        <input
          ref={fileInputRef}
          name="attachment"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
          onChange={handleFileChange}
        />
        {fileName && <span className="fileFieldName">{fileName}</span>}
      </label>

      <label className="consentField">
        <input name="consent" type="checkbox" value="yes" required />
        <span>
          Я согласен на обработку персональных данных и ознакомлен с{" "}
          <a href="/privacy" target="_blank" rel="noreferrer">
            Политикой обработки персональных данных
          </a>
        </span>
      </label>

      <input type="hidden" name="sourcePage" value={sourcePage} />

      <input
        className="hiddenField"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Отправляем..." : "Получить расчёт"}
      </button>

      {message && (
        <p className={`formMessage ${status === "success" ? "success" : ""}`}>
          {message}
        </p>
      )}
    </form>
  );
}
