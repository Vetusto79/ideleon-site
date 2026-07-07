import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор Диагональное Грильято онлайн | Расчёт расхода материалов",
  description: "Онлайн-калькулятор потолка Диагональное Грильято: решётка, профили, диагональный элемент, направляющие, подвесы и уголок.",
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
