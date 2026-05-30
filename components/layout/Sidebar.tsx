"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/menu", label: "Menu", icon: "☕" },
  { href: "/inventory", label: "Inventory", icon: "📦" },
  { href: "/purchase-order", label: "Purchase Order", icon: "🛒" },
  { href: "/stock-opname", label: "Stock Opname", icon: "📋" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Yare Cafe</h1>
        <p className="text-xs text-gray-400">ERP System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
          Logout
        </button>
      </div>
    </aside>
  );
};
