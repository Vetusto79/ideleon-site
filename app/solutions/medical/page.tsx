import type { Metadata } from "next";

import Breadcrumbs from "../../components/Breadcrumbs";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import MedicalLanding from "./MedicalLanding";

export const metadata: Metadata = {
  title: "Потолочные системы для больниц, клиник и лабораторий",
  description: "Подбор и поэлементный расчёт открытых, скрытых Clip-in и специализированных потолочных систем для медицинских объектов. Поставка по России.",
  alternates: {
    canonical: "/solutions/medical",
  },
  openGraph: {
    title: "Потолочные системы для больниц, клиник и лабораторий",
    description: "Подбор, поэлементный расчёт и поставка потолочных систем для медицинских объектов по России.",
    url: "/solutions/medical",
    type: "website",
  },
};

export default function MedicalSolutionsPage() {
  return <main>
    <SiteHeader />
    <div style={{ background: "#081a31", color: "#fff", paddingTop: 10 }}>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Решения", href: "/solutions" }, { label: "Медицинские объекты" }]} />
    </div>
    <MedicalLanding />
    <SiteFooter />
  </main>;
}
