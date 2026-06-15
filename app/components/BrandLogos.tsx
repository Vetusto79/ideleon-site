import { siteConfig } from "./siteConfig";

export default function BrandLogos() {
  return (
    <div className="brandGrid brandLogoGrid">
      {siteConfig.brands.map((brand) => (
        <a
          className="brandCard brandLogoCard"
          href={brand.href}
          target="_blank"
          rel="noreferrer"
          key={brand.name}
          aria-label={brand.name}
        >
          <img src={brand.logo} alt={brand.name} />
          <span>{brand.name}</span>
        </a>
      ))}
    </div>
  );
}
