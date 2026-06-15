import Script from "next/script";
import { YM_COUNTER_ID } from "./metrika";

export default function YandexMetrika() {
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {
              if (document.scripts[j].src === r) { return; }
            }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=${YM_COUNTER_ID}', 'ym');

          ym(${YM_COUNTER_ID}, 'init', {
            ssr: true,
            webvisor: true,
            clickmap: true,
            ecommerce: "dataLayer",
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce: true,
            trackLinks: true
          });

          document.addEventListener("click", function(event) {
            var target = event.target;
            if (!target || !target.closest) return;

            var clickable = target.closest("a, button");
            if (!clickable) return;

            var text = (clickable.textContent || "").trim().toLowerCase();
            var href = clickable.getAttribute("href") || "";

            if (href.indexOf("tel:") === 0) {
              if (text.indexOf("позвонить") !== -1) {
                ym(${YM_COUNTER_ID}, "reachGoal", "click_callback", {
                  source: location.href,
                  text: clickable.textContent || ""
                });
              } else {
                ym(${YM_COUNTER_ID}, "reachGoal", "click_phone", {
                  source: location.href,
                  phone: href
                });
              }
              return;
            }

            if (text.indexOf("перезвоните") !== -1 || text.indexOf("перезвонить") !== -1) {
              ym(${YM_COUNTER_ID}, "reachGoal", "click_callback", {
                source: location.href,
                text: clickable.textContent || ""
              });
              return;
            }

            if (text.indexOf("получить расч") !== -1 || href === "#request" || href === "/#request") {
              ym(${YM_COUNTER_ID}, "reachGoal", "click_calculation", {
                source: location.href,
                text: clickable.textContent || "",
                href: href
              });
            }
          }, true);
        `}
      </Script>

      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${YM_COUNTER_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
