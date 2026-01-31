import { generateBreadcrumbListSchema } from "@/lib/seo/schemas";

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = generateBreadcrumbListSchema(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {index > 0 && <span>/</span>}
            {item.url ? (
              <a
                href={item.url}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <span className="text-foreground font-medium">{item.name}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
