import { siteConfig } from "./siteConfig";

export default function SiteFooter() {
  return (
    <footer id="contacts" className="footer">
      <div>
        <img
          className="footerLogo"
          src={siteConfig.logo.horizontal}
          alt={siteConfig.company.name}
        />
        <p>Комплексные поставки строительных материалов и решений.</p>
      </div>

      <div>
        <strong>Контакты</strong>
        {siteConfig.contacts.phones.map((phone) => (
          <p key={phone.href}>
            <a href={phone.href}>{phone.label}</a>
          </p>
        ))}
        {siteConfig.contacts.emails.map((email) => (
          <p key={email}>
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        ))}
        <p>{siteConfig.company.city}</p>
      </div>

      <div>
        <strong>Реквизиты</strong>
        <p>{siteConfig.company.fullName}</p>
        <p>ИНН: {siteConfig.company.inn}</p>
        <p>ОГРН: {siteConfig.company.ogrn}</p>
      </div>

      <div>
        <strong>Документы</strong>
        {siteConfig.documents.map((document) => (
          <p key={document.href}>
            <a href={document.href}>{document.label}</a>
          </p>
        ))}
      </div>
    </footer>
  );
}
