"use client";

import { useEffect, useState } from "react";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function RequestForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [sourcePage, setSourcePage] = useState("");

  useEffect(() => {
    setSourcePage(window.location.href);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
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

      form.reset();
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
