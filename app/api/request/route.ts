import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = clean(formData.get("name"));
    const phone = clean(formData.get("phone"));
    const company = clean(formData.get("company"));
    const task = clean(formData.get("task"));
    const website = clean(formData.get("website"));

    // Простая защита от ботов: обычный человек это поле не видит и не заполняет.
    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!phone) {
      return NextResponse.json(
        { ok: false, message: "Укажите телефон для связи." },
        { status: 400 }
      );
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

    const referer = request.headers.get("referer") || "Не определена";
    const subject = "Новая заявка с сайта IDELEON";

    const text = [
      "Новая заявка с сайта IDELEON",
      "",
      `Имя: ${name || "Не указано"}`,
      `Телефон: ${phone}`,
      `Компания: ${company || "Не указана"}`,
      "",
      "Задача:",
      task || "Не указана",
      "",
      `Страница отправки: ${referer}`,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 16px">Новая заявка с сайта IDELEON</h2>
        <p><b>Имя:</b> ${escapeHtml(name || "Не указано")}</p>
        <p><b>Телефон:</b> ${escapeHtml(phone)}</p>
        <p><b>Компания:</b> ${escapeHtml(company || "Не указана")}</p>
        <p><b>Задача:</b></p>
        <p style="white-space:pre-wrap">${escapeHtml(task || "Не указана")}</p>
        <hr />
        <p style="color:#64748b"><b>Страница отправки:</b> ${escapeHtml(referer)}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"IDELEON сайт" <${mailFrom}>`,
      to: mailTo,
      cc: mailCc || undefined,
      subject,
      text,
      html,
      replyTo: smtpUser,
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

