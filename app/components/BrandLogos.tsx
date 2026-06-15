import { siteConfig } from "./siteConfig";

const marqueeBrands = [...siteConfig.brands, ...siteConfig.brands];

export default function BrandLogos() {
  return (
    <div className="brandMarquee" aria-label="Поставщики и производители">
      <div className="brandMarqueeTrack">
        {marqueeBrands.map((brand, index) => (
          <div
            className="brandCard brandLogoCard"
            key={`${brand.name}-${index}`}
            aria-hidden={index >= siteConfig.brands.length}
          >
            <img src={brand.logo} alt={brand.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
