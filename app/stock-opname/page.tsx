"use client";

import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

interface StockOpname {
  id: string;
  opnameNumber: string;
  status: string;
  createdAt: string;
  performedByUser: { name: string };
}

export default function StockOpnamePage() {
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOpnames = async () => {
      try {
        const response = await fetch("/api/stock-opname");
        const data = await response.json();
        setOpnames(data || []);
      } catch (error) {
        console.error("Failed to fetch opnames:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpnames();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "ADJUSTED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Opname</h1>
            <p className="text-gray-600 mt-1">Inventory verification</p>
          </div>
          <Button variant="primary">+ Start Opname</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-600">Total Opnames</p>
              <p className="text-3xl font-bold">{opnames.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600">Draft</p>
              <p className="text-3xl font-bold text-gray-600">
                {opnames.filter((o) => o.status === "DRAFT").length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600">Adjusted</p>
              <p className="text-3xl font-bold text-green-600">
                {opnames.filter((o) => o.status === "ADJUSTED").length}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <Table
            headers={["Opname #", "Status", "Performed By", "Date", "Actions"]}
          >
            {opnames.map((opname) => (
              <TableRow key={opname.id}>
                <TableCell className="font-semibold">
                  {opname.opnameNumber}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      opname.status
                    )}`}
                  >
                    {opname.status}
                  </span>
                </TableCell>
                <TableCell>{opname.performedByUser.name}</TableCell>
                <TableCell>
                  {new Date(opname.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:underline">View</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {opnames.length === 0 && !isLoading && (
            <p className="text-center text-gray-600 py-8">No stock opnames yet</p>
          )}
        </Card>
      </div>
    </Shell>
  );
}
