import { siteConfig } from "./siteConfig";
import RequestLinkInterceptor from "./RequestLinkInterceptor";
import CallbackModalHost from "./CallbackModalHost";

export default function SiteHeader() {
  return (
    <>
      <RequestLinkInterceptor />
      <CallbackModalHost />
      <header className="header">
      <a className="logo" href="/">
        <img src={siteConfig.logo.horizontal} alt={siteConfig.company.name} />
      </a>

      <nav className="nav">
        {siteConfig.menu.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="headerContacts">
        {siteConfig.contacts.phones.map((phone) => (
          <a href={phone.href} key={phone.href}>
            {phone.label}
          </a>
        ))}
      </div>
      </header>
    </>
  );
}
