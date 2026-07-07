import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор потолка Грильято GL онлайн | Расчёт GL15 и GL24",
  description:
    "Онлайн-калькулятор потолка Грильято GL: GL15, GL24, размер ячейки, схема монтажа, направляющие, подвесы и уголок. Скачайте КП или отправьте расчёт в Иделеон.",
};

export default function CalculatorGrilyatoGLLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
