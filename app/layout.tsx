import "./globals.css";

export const metadata = {
  title: "Иделеон — строительные материалы",
  description:
    "Комплексные поставки строительных материалов для объектов любого масштаба",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
