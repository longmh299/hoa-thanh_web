"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategoryChips({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();

  return (
    <div className="mb-8">

      <p className="text-sm text-gray-500 mb-3">
        Chọn dòng máy:
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2">

        {categories.map((cat) => {
          const active = pathname === `/${cat.slug}`;

          return (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition border
                ${
                  active
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
            >
              {cat.name}
            </Link>
          );
        })}

      </div>
    </div>
  );
}