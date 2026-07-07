import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор треугольного Грильято онлайн | Расчёт материалов",
  description: "Онлайн-калькулятор треугольного Грильято: профили, диагональные элементы, направляющие, подвесы и обрамление.",
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
