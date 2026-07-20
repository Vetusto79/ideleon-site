import type { ReactNode } from "react";

import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Breadcrumbs from "../../components/Breadcrumbs";
import LeadCapture from "../../components/LeadCapture";
import TrackedCalculationLink from "./TrackedCalculationLink";

type LinkItem = {
  href: string;
  label: string;
};

type Props = {
  title: string;
  breadcrumb: string;
  lead: string;
  children: ReactNode;
  calculatorLinks: LinkItem[];
  ctaLabel: string;
  ctaText: string;
  leadCaptureText: string;
  relatedLinks: LinkItem[];
};

export default function SeoArticleLayout({
  title,
  breadcrumb,
  lead,
  children,
  calculatorLinks,
  ctaLabel,
  ctaText,
  leadCaptureText,
  relatedLinks,
}: Props) {
  return (
    <main>
      <SiteHeader />

      <article className="articlePage">
        <div className="articleHeader">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Статьи", href: "/articles" },
              { label: breadcrumb },
            ]}
          />
          <p className="label">Статья</p>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>

        <div className="articleContent">
          {children}

          {calculatorLinks.length > 1 ? (
            <div className="relatedArticles">
              <strong>Выберите калькулятор</strong>
              {calculatorLinks.map((link) => (
                <TrackedCalculationLink href={link.href} key={link.href}>
                  {link.label}
                </TrackedCalculationLink>
              ))}
            </div>
          ) : null}

          <section className="articleCta">
            <h2>{ctaLabel}</h2>
            <p>{ctaText}</p>
            <TrackedCalculationLink
              className="button primary"
              href={calculatorLinks[0].href}
            >
              {ctaLabel} →
            </TrackedCalculationLink>
          </section>

          <LeadCapture
            id="request"
            title="Получить расчёт проекта"
            text={leadCaptureText}
          />

          <div className="relatedArticles">
            <strong>Полезные разделы</strong>
            {relatedLinks.map((link) =>
              link.href.startsWith("/calculators/") ? (
                <TrackedCalculationLink href={link.href} key={link.href}>
                  {link.label}
                </TrackedCalculationLink>
              ) : (
                <a href={link.href} key={link.href}>
                  {link.label}
                </a>
              ),
            )}
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
