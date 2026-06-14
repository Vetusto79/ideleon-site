"use client";

import { useEffect } from "react";

export default function RequestLinkInterceptor() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href="/#request"], a[href="#request"]') as HTMLAnchorElement | null;

      if (!link) return;

      const requestBlock = document.getElementById("request");
      if (!requestBlock) return;

      event.preventDefault();

      requestBlock.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      const newUrl = `${window.location.pathname}${window.location.search}#request`;
      window.history.replaceState(null, "", newUrl);
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
