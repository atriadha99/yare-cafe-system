"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, StatCard } from "@/components/ui/Card";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalMenuItems: number;
  totalInventoryItems: number;
  lowStockCount: number;
  totalInventoryValue: number;
  pendingPOs: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMenuItems: 0,
    totalInventoryItems: 0,
    lowStockCount: 0,
    totalInventoryValue: 0,
    pendingPOs: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [menus, inventory, pos] = await Promise.all([
          fetch("/api/menu").then((r) => r.json()),
          fetch("/api/inventory").then((r) => r.json()),
          fetch("/api/purchase-order").then((r) => r.json()),
        ]);

        const lowStockCount = inventory.filter(
          (item: any) => item.stock <= item.minStock
        ).length;

        const totalValue = inventory.reduce(
          (sum: number, item: any) => sum + item.stock * item.unitCost,
          0
        );

        const pendingPOs = pos.filter(
          (po: any) => po.status === "PENDING"
        ).length;

        setStats({
          totalMenuItems: menus.length,
          totalInventoryItems: inventory.length,
          lowStockCount,
          totalInventoryValue: totalValue / 100, // Convert from cents
          pendingPOs,
          totalUsers: 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Yare Cafe ERP System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Menu Items"
            value={stats.totalMenuItems}
            icon="☕"
          />
          <StatCard
            label="Inventory Items"
            value={stats.totalInventoryItems}
            icon="📦"
          />
          <StatCard
            label="Low Stock Items"
            value={stats.lowStockCount}
            trend={stats.lowStockCount > 0 ? "down" : "up"}
            icon="⚠️"
          />
          <StatCard
            label="Inventory Value"
            value={`Rp ${stats.totalInventoryValue.toLocaleString("id-ID")}`}
            icon="💰"
          />
          <StatCard
            label="Pending POs"
            value={stats.pendingPOs}
            icon="🛒"
          />
          <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Activity">
            <p className="text-gray-600">No recent activity</p>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Add Menu Item
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Add Raw Material
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Create Purchase Order
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
