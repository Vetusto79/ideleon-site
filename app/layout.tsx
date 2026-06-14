import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ideleon-site.relaxdev.ru"),
  title: {
    default: "Иделеон — поставка строительных материалов для объектов",
    template: "%s | Иделеон",
  },
  description:
    "Иделеон поставляет строительные материалы и потолочные системы для застройщиков, подрядчиков, строительных компаний и магазинов. Расчёт материалов и доставка по России.",
  keywords: [
    "строительные материалы",
    "поставщик строительных материалов",
    "профиль для гипсокартона",
    "кассетные потолки",
    "потолки грильято",
    "реечные потолки",
    "ревизионные люки",
    "фальшполы",
    "сендвич-панели",
    "металлопрокат",
    "арматура",
  ],
  authors: [{ name: "ООО ИДЕЛЕОН" }],
  creator: "ООО ИДЕЛЕОН",
  publisher: "ООО ИДЕЛЕОН",
  openGraph: {
    title: "Иделеон — поставка строительных материалов для объектов",
    description:
      "Поставляем строительные материалы и потолочные системы. Помогаем подобрать материалы, выполнить расчёт и организовать поставку по России.",
    url: "https://ideleon-site.relaxdev.ru",
    siteName: "Иделеон",
    locale: "ru_RU",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
