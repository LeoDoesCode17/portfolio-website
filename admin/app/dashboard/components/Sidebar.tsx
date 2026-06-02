// app/dashboard/components/Sidebar.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";

type ItemKey = "all" | "published" | "create" | "deleted" | "add-post-section";

const items: { key: ItemKey; label: string; href: string }[] = [
  { key: "all",       label: "All posts",       href: "/dashboard" },
  { key: "published", label: "Published posts", href: "/dashboard/published" },
  { key: "create",    label: "Create new post", href: "/dashboard/create" },
  { key: "deleted",   label: "Deleted posts",   href: "/dashboard/deleted" },
  { key: "add-post-section",   label: "Add post section",   href: "/dashboard/add-post-section" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(href: string) {
    router.push(href);
    router.refresh();
  }

  return (
    <aside className="w-full sm:w-56 flex-shrink-0 border-b border-slate-800 bg-slate-950/80 sm:border-b-0 sm:border-r">
      <nav className="flex sm:flex-col">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const baseClasses =
            "flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer transition";
          const activeClasses =
            "bg-slate-900 text-sky-300 border-b sm:border-b-0 sm:border-l-2 sm:border-l-sky-500";
          const inactiveClasses =
            "text-slate-300 hover:bg-slate-900/60 hover:text-sky-200";

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleClick(item.href)}
              className={`${baseClasses} ${
                isActive ? activeClasses : inactiveClasses
              } text-left`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}