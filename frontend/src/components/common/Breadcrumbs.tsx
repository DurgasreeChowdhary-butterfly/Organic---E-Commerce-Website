import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

/** Simple breadcrumb trail for listing/detail pages. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-xs text-brown-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {item.to ? (
            <Link to={item.to} className="hover:text-forest-700">{item.label}</Link>
          ) : (
            <span className="text-forest-700 font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="w-3 h-3" />}
        </span>
      ))}
    </nav>
  );
}
