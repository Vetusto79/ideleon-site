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
  breadcrumbParent?: LinkItem;
  lead: string;
  children: ReactNode;
  calculatorLinks: LinkItem[];
  ctaLabel: string;
  ctaText: string;
  ctaHref?: string;
  ctaDisclaimer?: string;
  leadId?: string;
  leadTitle?: string;
  leadCaptureText: string;
  relatedLinks: LinkItem[];
};

export default function SeoArticleLayout({
  title,
  breadcrumb,
  breadcrumbParent,
  lead,
  children,
  calculatorLinks,
  ctaLabel,
  ctaText,
  ctaHref,
  ctaDisclaimer,
  leadId = "request",
  leadTitle = "Получить расчёт проекта",
  leadCaptureText,
  relatedLinks,
}: Props) {
  const primaryCtaHref = ctaHref ?? calculatorLinks[0]?.href;
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Статьи", href: "/articles" },
    ...(breadcrumbParent ? [breadcrumbParent] : []),
    { label: breadcrumb },
  ];

  return (
    <main>
      <SiteHeader />

      <article className="articlePage">
        <div className="articleHeader">
          <Breadcrumbs
            items={breadcrumbItems}
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
            {primaryCtaHref ? (
              primaryCtaHref.startsWith("/calculators/") ? (
                <TrackedCalculationLink
                  className="button primary"
                  href={primaryCtaHref}
                >
                  {ctaLabel} →
                </TrackedCalculationLink>
              ) : (
                <a className="button primary" href={primaryCtaHref}>
                  {ctaLabel} →
                </a>
              )
            ) : null}
            {ctaDisclaimer ? (
              <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, opacity: 0.86 }}>
                {ctaDisclaimer}
              </p>
            ) : null}
          </section>

          <LeadCapture
            id={leadId}
            title={leadTitle}
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
