import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;

const ALLOWED_ATTACHMENT_EXTENSIONS = [
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

function clean(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".0", "")} МБ`;
}

function isAllowedAttachment(file: File) {
  return ALLOWED_ATTACHMENT_EXTENSIONS.includes(getFileExtension(file.name));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const requestType = clean(formData.get("requestType")) || "calculation";
    const name = clean(formData.get("name"));
    const phone = clean(formData.get("phone"));
    const email = clean(formData.get("email"));
    const task = clean(formData.get("task"));
    const consent = clean(formData.get("consent"));
    const sourcePage = clean(formData.get("sourcePage"));
    const website = clean(formData.get("website"));
    const uploadedAttachment = formData.get("attachment");

    const attachment =
      uploadedAttachment instanceof File && uploadedAttachment.size > 0
        ? uploadedAttachment
        : null;

    // Простая защита от ботов: обычный человек это поле не видит и не заполняет.
    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (consent !== "yes") {
      return NextResponse.json(
        {
          ok: false,
          message: "Для отправки заявки нужно согласие на обработку персональных данных.",
        },
        { status: 400 }
      );
    }

    if (requestType === "callback") {
      if (!name || !phone) {
        return NextResponse.json(
          {
            ok: false,
            message: "Укажите имя и телефон.",
          },
          { status: 400 }
        );
      }
    } else {
      if (!name || !phone || !email || !task) {
        return NextResponse.json(
          {
            ok: false,
            message: "Заполните имя, телефон, e-mail и сообщение.",
          },
          { status: 400 }
        );
      }

      if (!isValidEmail(email)) {
        return NextResponse.json(
          {
            ok: false,
            message: "Укажите корректный e-mail.",
          },
          { status: 400 }
        );
      }

      if (attachment) {
        if (attachment.size > MAX_ATTACHMENT_SIZE) {
          return NextResponse.json(
            {
              ok: false,
              message: `Файл слишком большой. Максимальный размер — ${formatFileSize(MAX_ATTACHMENT_SIZE)}.`,
            },
            { status: 400 }
          );
        }

        if (!isAllowedAttachment(attachment)) {
          return NextResponse.json(
            {
              ok: false,
              message: "Можно приложить PDF, DOC, DOCX, XLS, XLSX, JPG, PNG или ZIP.",
            },
            { status: 400 }
          );
        }
      }
    }

    // VK WorkSpace / Mail.ru: smtp.mail.ru, порт 465, SSL/TLS.
    const smtpHost = process.env.SMTP_HOST || "smtp.mail.ru";
    const smtpPort = Number(process.env.SMTP_PORT || "465");
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    const mailFrom = process.env.MAIL_FROM || smtpUser;
    const mailTo = process.env.MAIL_TO || "zakaz@ideleon.com";
    const mailCc =
      process.env.MAIL_CC || "ilya@ideleon.com,alexei@ideleon.com";

    if (!smtpUser || !smtpPassword || !mailFrom) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Форма пока не настроена. Позвоните нам или напишите на почту.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const referer = sourcePage || request.headers.get("referer") || "Не определена";
    const createdAt = new Date().toISOString();

    const isCallback = requestType === "callback";
    const subject = isCallback
      ? "Перезвонить клиенту — IDELEON"
      : "Новая заявка с сайта IDELEON";

    const consentLine = `Согласие на обработку персональных данных: получено через чекбокс формы, ${createdAt}`;
    const attachmentLine = attachment
      ? `Файл: ${attachment.name} (${formatFileSize(attachment.size)})`
      : "Файл: не приложен";

    const text = isCallback
      ? [
          "Перезвонить клиенту — IDELEON",
          "",
          `Имя: ${name}`,
          `Телефон: ${phone}`,
          "",
          consentLine,
          `Страница отправки: ${referer}`,
        ].join("\n")
      : [
          "Новая заявка с сайта IDELEON",
          "",
          `Имя: ${name}`,
          `Телефон: ${phone}`,
          `E-mail: ${email}`,
          "",
          "Сообщение:",
          task,
          "",
          attachmentLine,
          "",
          consentLine,
          `Страница отправки: ${referer}`,
        ].join("\n");

    const html = isCallback
      ? `
        <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#111827">
          <h2 style="margin:0 0 16px">Перезвонить клиенту — IDELEON</h2>
          <p><b>Имя:</b> ${escapeHtml(name)}</p>
          <p><b>Телефон:</b> ${escapeHtml(phone)}</p>
          <hr />
          <p><b>Согласие:</b> получено через чекбокс формы, ${escapeHtml(createdAt)}</p>
          <p style="color:#64748b"><b>Страница отправки:</b> ${escapeHtml(referer)}</p>
        </div>
      `
      : `
        <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#111827">
          <h2 style="margin:0 0 16px">Новая заявка с сайта IDELEON</h2>
          <p><b>Имя:</b> ${escapeHtml(name)}</p>
          <p><b>Телефон:</b> ${escapeHtml(phone)}</p>
          <p><b>E-mail:</b> ${escapeHtml(email)}</p>
          <p><b>Сообщение:</b></p>
          <p style="white-space:pre-wrap">${escapeHtml(task)}</p>
          <p><b>Файл:</b> ${
            attachment
              ? `${escapeHtml(attachment.name)} (${escapeHtml(formatFileSize(attachment.size))})`
              : "не приложен"
          }</p>
          <hr />
          <p><b>Согласие:</b> получено через чекбокс формы, ${escapeHtml(createdAt)}</p>
          <p style="color:#64748b"><b>Страница отправки:</b> ${escapeHtml(referer)}</p>
        </div>
      `;

    const attachments = [];

    if (!isCallback && attachment) {
      const arrayBuffer = await attachment.arrayBuffer();

      attachments.push({
        filename: attachment.name,
        content: Buffer.from(arrayBuffer),
        contentType: attachment.type || undefined,
      });
    }

    await transporter.sendMail({
      from: `"IDELEON сайт" <${mailFrom}>`,
      to: mailTo,
      cc: mailCc || undefined,
      subject,
      text,
      html,
      attachments,
      replyTo: isCallback ? smtpUser : email,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Request form error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Не удалось отправить заявку. Попробуйте позвонить нам или написать на почту.",
      },
      { status: 500 }
    );
  }
}
