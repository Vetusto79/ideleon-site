type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Навигационная цепочка">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span className="crumbItem" key={`${item.label}-${index}`}>
            {item.href && !isLast ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && <span className="crumbSep">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
