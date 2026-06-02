"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalMenuItems: number;
  totalInventoryItems: number;
  lowStockCount: number;
  totalInventoryValue: number;
  pendingPOs: number;
  totalUsers: number;
}

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  date: string;
}

interface MenuItem {
  id: string;
}

interface InventoryMaterial {
  id: string;
  stock: number;
  minStock: number;
  unitCost: number;
}

interface PurchaseOrderItem {
  id: string;
  status: string;
}

interface UserItem {
  id: string;
}

interface InventoryTransaction {
  id: string;
  type: string;
  quantity: number;
  rawMaterial?: {
    name?: string;
  };
  reason?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [menus, inventory, pos, users, transactions] = await Promise.all([
          fetch("/api/menu", { signal: controller.signal }).then((r) =>
            r.ok
              ? r.json() as Promise<MenuItem[]>
              : Promise.reject(new Error("Failed to fetch menu"))
          ),
          fetch("/api/inventory", { signal: controller.signal }).then((r) =>
            r.ok
              ? r.json() as Promise<InventoryMaterial[]>
              : Promise.reject(new Error("Failed to fetch inventory"))
          ),
          fetch("/api/purchase-order", { signal: controller.signal }).then((r) =>
            r.ok
              ? r.json() as Promise<PurchaseOrderItem[]>
              : Promise.reject(new Error("Failed to fetch POs"))
          ),
          fetch("/api/users", { signal: controller.signal }).then((r) =>
            r.ok
              ? r.json() as Promise<UserItem[]>
              : Promise.reject(new Error("Failed to fetch users"))
          ),
          fetch("/api/inventory/transactions", { signal: controller.signal }).then((r) =>
            r.ok
              ? r.json() as Promise<InventoryTransaction[]>
              : Promise.reject(new Error("Failed to fetch transactions"))
          ),
        ]);

        const lowStockCount = inventory.filter(
          (item) => item.stock <= item.minStock
        ).length;

        const totalValue = inventory.reduce(
          (sum, item) => sum + item.stock * (item.unitCost || 0),
          0
        );

        const pendingPOs = pos.filter(
          (po) => po.status === "PENDING"
        ).length;

        setStats({
          totalMenuItems: menus.length,
          totalInventoryItems: inventory.length,
          lowStockCount,
          totalInventoryValue: totalValue / 100,
          pendingPOs,
          totalUsers: users.length,
        });

        setRecentActivities(
          transactions
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5)
            .map((transaction) => ({
              id: transaction.id,
              title: `${transaction.type.toUpperCase()} ${transaction.quantity} ${transaction.rawMaterial?.name ?? "item"}`,
              detail: transaction.reason || "Inventory update",
              date: new Date(transaction.createdAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            }))
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Failed to fetch stats:", err);
          setError(err.message || "An error occurred while fetching data.");
        } else if (!(err instanceof Error)) {
          setError("An error occurred while fetching data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    return () => controller.abort();
  }, [refreshTrigger]);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to Yare Cafe ERP System</p>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            isLoading={isLoading}
          >
            ↻ Refresh Data
          </Button>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Menu Items"
            value={isLoading ? "..." : stats?.totalMenuItems ?? 0}
            icon="☕"
          />
          <StatCard
            label="Inventory Items"
            value={isLoading ? "..." : stats?.totalInventoryItems ?? 0}
            icon="📦"
          />
          <StatCard
            label="Low Stock Items"
            value={isLoading ? "..." : stats?.lowStockCount ?? 0}
            trend={stats?.lowStockCount && stats.lowStockCount > 0 ? "down" : "up"}
            icon="⚠️"
          />
          <StatCard
            label="Inventory Value"
            value={isLoading ? "..." : `Rp ${(stats?.totalInventoryValue ?? 0).toLocaleString("id-ID")}`}
            icon="💰"
          />
          <StatCard
            label="Pending POs"
            value={isLoading ? "..." : stats?.pendingPOs ?? 0}
            icon="🛒"
          />
          <StatCard 
            label="Total Users" 
            value={isLoading ? "..." : stats?.totalUsers ?? 0} 
            icon="👥" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Activity">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-gray-200 p-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                      <span className="text-xs text-gray-500">{activity.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{activity.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No recent activity</p>
            )}
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <Link href="/menu" className="block">
                <Button className="w-full">Add Menu Item</Button>
              </Link>
              <Link href="/inventory" className="block">
                <Button className="w-full">Add Raw Material</Button>
              </Link>
              <Link href="/purchase-order" className="block">
                <Button className="w-full">Create Purchase Order</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
