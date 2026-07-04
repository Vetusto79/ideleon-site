import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор профиля для ГКЛ онлайн | Расчёт профиля для гипсокартона",
  description:
    "Рассчитайте расход профиля для гипсокартона: потолок, облицовка или перегородка. Скачайте КП или отправьте расчёт в Иделеон.",
};

export default function CalculatorProfilGklLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
