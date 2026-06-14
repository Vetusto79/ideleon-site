"use client";

import { useEffect, useState } from "react";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function CallbackModalHost() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [sourcePage, setSourcePage] = useState("");

  function openModal() {
    setSourcePage(window.location.href);
    setIsOpen(true);
    setStatus("idle");
    setMessage("");
  }

  function closeModal() {
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href^="tel:"]') as HTMLAnchorElement | null;

      if (!link) return;

      const text = (link.textContent || "").trim().toLowerCase();

      // Перехватываем только кнопки с текстом «Позвонить».
      // Телефоны в шапке и футере остаются обычными tel-ссылками.
      if (!text.includes("позвонить")) return;

      event.preventDefault();
      openModal();
    }

    function handleOpenEvent() {
      openModal();
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("ideleon:openCallbackModal", handleOpenEvent);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("ideleon:openCallbackModal", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.body.classList.add("modalOpen");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("modalOpen");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("requestType", "callback");
    formData.set("sourcePage", sourcePage || window.location.href);

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
      setMessage("Заявка отправлена. Мы скоро перезвоним.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте позвонить нам."
      );
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={closeModal}>
      <div
        className="callbackModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-callback-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modalClose"
          type="button"
          aria-label="Закрыть окно"
          onClick={closeModal}
        >
          ×
        </button>

        <p className="label">Обратный звонок</p>
        <h2 id="global-callback-title">Перезвонить вам?</h2>
        <p className="modalLead">
          Оставьте имя и телефон — мы получим заявку на почту и свяжемся с вами.
        </p>

        <form className="callbackForm" onSubmit={handleSubmit}>
          <input name="name" placeholder="Ваше имя" autoComplete="name" required />
          <input
            name="phone"
            placeholder="Телефон"
            autoComplete="tel"
            required
          />

          <label className="consentField compact">
            <input name="consent" type="checkbox" value="yes" required />
            <span>
              Я согласен на обработку персональных данных и ознакомлен с{" "}
              <a href="/privacy" target="_blank" rel="noreferrer">
                политикой
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
            {status === "sending" ? "Отправляем..." : "Перезвонить"}
          </button>

          {message && (
            <p className={`formMessage ${status === "success" ? "success" : ""}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
