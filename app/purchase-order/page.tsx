"use client";

import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  requestedByUser: { name: string };
}

export default function PurchaseOrderPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const response = await fetch("/api/purchase-order");
        const data = await response.json();
        setPos(data);
      } catch (error) {
        console.error("Failed to fetch POs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPOs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "ORDERED":
        return "bg-purple-100 text-purple-800";
      case "RECEIVED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600 mt-1">Manage supplier orders</p>
          </div>
          <Button variant="primary">+ Create PO</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-600">Total POs</p>
              <p className="text-3xl font-bold">{pos.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {pos.filter((p) => p.status === "PENDING").length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-blue-600">
                {pos.filter((p) => p.status === "APPROVED").length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600">Received</p>
              <p className="text-3xl font-bold text-green-600">
                {pos.filter((p) => p.status === "RECEIVED").length}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <Table
            headers={["PO Number", "Status", "Amount", "Requested By", "Date", "Actions"]}
          >
            {pos.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-semibold">{po.poNumber}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      po.status
                    )}`}
                  >
                    {po.status}
                  </span>
                </TableCell>
                <TableCell>
                  {po.totalAmount
                    ? `Rp ${(po.totalAmount / 100).toLocaleString("id-ID")}`
                    : "-"}
                </TableCell>
                <TableCell>{po.requestedByUser.name}</TableCell>
                <TableCell>
                  {new Date(po.createdAt).toLocaleDateString("id-ID")}
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
          {pos.length === 0 && !isLoading && (
            <p className="text-center text-gray-600 py-8">No purchase orders yet</p>
          )}
        </Card>
      </div>
    </Shell>
  );
}
