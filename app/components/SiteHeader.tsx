"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "./siteConfig";
import RequestLinkInterceptor from "./RequestLinkInterceptor";
import CallbackModalHost from "./CallbackModalHost";

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openRoot, setOpenRoot] = useState<string | null>(null);
  const [openChild, setOpenChild] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle("mobileMenuLocked", mobileOpen);

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    function closeOnDesktop() {
      if (window.innerWidth > 1100) setMobileOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);

    return () => {
      document.body.classList.remove("mobileMenuLocked");
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [mobileOpen]);

  function closeMenu() {
    setMobileOpen(false);
    setOpenRoot(null);
    setOpenChild(null);
  }

  function toggleRoot(key: string) {
    setOpenRoot((current) => (current === key ? null : key));
    setOpenChild(null);
  }

  function toggleChild(key: string) {
    setOpenChild((current) => (current === key ? null : key));
  }

  const primaryPhone = siteConfig.contacts.phones[0];

  return (
    <>
      <RequestLinkInterceptor />
      <CallbackModalHost />

      <header className={mobileOpen ? "header headerMobileOpen" : "header"}>
        <a className="logo" href="/" onClick={closeMenu}>
          <img src={siteConfig.logo.horizontal} alt={siteConfig.company.name} />
        </a>

        <div className="mobileHeaderControls">
          {primaryPhone ? (
            <a className="mobileCallButton" href={primaryPhone.href} aria-label={`Позвонить ${primaryPhone.label}`}>
              Позвонить
            </a>
          ) : null}

          <button
            type="button"
            className="mobileMenuButton"
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            aria-controls="site-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav id="site-navigation" className={mobileOpen ? "nav navMobileOpen" : "nav"}>
          {siteConfig.menu.map((item) => {
            const rootExpanded = openRoot === item.href;

            return (
              <div
                className={rootExpanded ? "navItem mobileExpanded" : "navItem"}
                key={item.href}
              >
                <a
                  href={item.href}
                  className={item.children ? "navLink navLinkWithDropdown" : "navLink"}
                  onClick={closeMenu}
                >
                  {item.label}
                  {item.children ? <span className="navArrow">▾</span> : null}
                </a>

                {item.children ? (
                  <button
                    type="button"
                    className="mobileNavToggle"
                    aria-label={`${rootExpanded ? "Свернуть" : "Развернуть"} раздел ${item.label}`}
                    aria-expanded={rootExpanded}
                    onClick={() => toggleRoot(item.href)}
                  >
                    <span>⌄</span>
                  </button>
                ) : null}

                {item.children ? (
                  <div className="navDropdown">
                    {item.children.map((child) => {
                      const childExpanded = openChild === child.href;

                      return (
                        <div
                          className={
                            child.children
                              ? childExpanded
                                ? "navDropdownItem navDropdownItemWithChildren mobileChildExpanded"
                                : "navDropdownItem navDropdownItemWithChildren"
                              : "navDropdownItem"
                          }
                          key={child.href}
                        >
                          <a href={child.href} onClick={closeMenu}>
                            <span>{child.label}</span>
                            {child.children ? <span className="navSubArrow">›</span> : null}
                          </a>

                          {child.children ? (
                            <button
                              type="button"
                              className="mobileChildToggle"
                              aria-label={`${childExpanded ? "Свернуть" : "Развернуть"} раздел ${child.label}`}
                              aria-expanded={childExpanded}
                              onClick={() => toggleChild(child.href)}
                            >
                              <span>⌄</span>
                            </button>
                          ) : null}

                          {child.children ? (
                            <div className="navSubmenu">
                              {child.children.map((subchild) => (
                                <a href={subchild.href} key={subchild.href} onClick={closeMenu}>
                                  {subchild.label}
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="mobileNavContacts">
            <strong>Связаться с Иделеон</strong>
            {siteConfig.contacts.phones.map((phone) => (
              <a href={phone.href} key={phone.href} onClick={closeMenu}>
                {phone.label}
              </a>
            ))}
          </div>
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
