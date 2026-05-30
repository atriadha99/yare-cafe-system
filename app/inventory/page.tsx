"use client";

import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  unitCost: number;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("/api/inventory");
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
            <p className="text-gray-600 mt-1">Manage raw materials and stock</p>
          </div>
          <Button variant="primary">+ Add Material</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {materials.length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {materials.filter((m) => m.stock <= m.minStock).length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                Rp {(
                  materials.reduce((sum, m) => sum + m.stock * m.unitCost, 0) /
                  100
                ).toLocaleString("id-ID")}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <Table
            headers={["SKU", "Name", "Unit", "Stock", "Min Stock", "Cost", "Actions"]}
          >
            {materials.map((material) => {
              const isLowStock = material.stock <= material.minStock;
              return (
                <TableRow
                  key={material.id}
                  className={isLowStock ? "bg-red-50" : ""}
                >
                  <TableCell>{material.sku}</TableCell>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell
                    className={isLowStock ? "text-red-600 font-semibold" : ""}
                  >
                    {material.stock}
                  </TableCell>
                  <TableCell>{material.minStock}</TableCell>
                  <TableCell>
                    Rp {(material.unitCost / 100).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
          {materials.length === 0 && !isLoading && (
            <p className="text-center text-gray-600 py-8">No materials yet</p>
          )}
        </Card>
      </div>
    </Shell>
  );
}
