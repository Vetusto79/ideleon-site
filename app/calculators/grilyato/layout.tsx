import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор потолка Грильято онлайн | Расчёт расхода материалов",
  description:
    "Онлайн-калькулятор потолка Грильято: площадь, периметр, ячейка, направляющие, подвесы и уголок. Скачайте КП или отправьте расчёт в Иделеон.",
};

export default function CalculatorGrilyatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
