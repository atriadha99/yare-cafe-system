"use client";

import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

interface Menu {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch("/api/menu");
        const data = await response.json();
        setMenus(data);
      } catch (error) {
        console.error("Failed to fetch menus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-1">Manage cafe menu items</p>
          </div>
          <Button variant="primary">+ Add Menu</Button>
        </div>

        <Card>
          <Table headers={["Name", "Price", "Stock", "Status", "Actions"]}>
            {menus.map((menu) => (
              <TableRow key={menu.id}>
                <TableCell>{menu.name}</TableCell>
                <TableCell>Rp {(menu.price / 100).toLocaleString("id-ID")}</TableCell>
                <TableCell>{menu.stock}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      menu.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {menu.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:underline">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {menus.length === 0 && !isLoading && (
            <p className="text-center text-gray-600 py-8">No menu items yet</p>
          )}
        </Card>
      </div>
    </Shell>
  );
}
