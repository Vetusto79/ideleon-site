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
            <div className="navItem" key={item.href}>
              <a href={item.href} className={item.children ? "navLink navLinkWithDropdown" : "navLink"}>
                {item.label}
                {item.children ? <span className="navArrow">▾</span> : null}
              </a>

              {item.children ? (
                <div className="navDropdown">
                  {item.children.map((child) => (
                    <div className={child.children ? "navDropdownItem navDropdownItemWithChildren" : "navDropdownItem"} key={child.href}>
                      <a href={child.href}>
                        <span>{child.label}</span>
                        {child.children ? <span className="navSubArrow">›</span> : null}
                      </a>

                      {child.children ? (
                        <div className="navSubmenu">
                          {child.children.map((subchild) => (
                            <a href={subchild.href} key={subchild.href}>{subchild.label}</a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="headerContacts">
          {siteConfig.contacts.phones.map((phone) => (
            <a href={phone.href} key={phone.href}>{phone.label}</a>
          ))}
        </div>
      </header>
    </>
  );
}
