"use client";

import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

interface PurchaseOrderItem {
  id: string;
  quantityRequested: number;
}

interface SupplierInfo {
  name: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  requestedByUser: { name: string };
  supplier?: SupplierInfo | null;
  items?: PurchaseOrderItem[];
}

export default function PurchaseOrderPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const refreshPOs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/purchase-order");
      const data = await response.json();
      setPos(data);
    } catch (error) {
      console.error("Failed to refresh POs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (po: PurchaseOrder, action: string) => {
    setActionLoading(po.id);

    const payload: Record<string, unknown> = { action };

    if (action === "receive") {
      payload.items = po.items?.map((item) => ({
        purchaseOrderItemId: item.id,
        quantityReceived: item.quantityRequested,
      })) ?? [];
    }

    try {
      const response = await fetch(`/api/purchase-order/${po.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Action failed");
      }

      await refreshPOs();
    } catch (error) {
      console.error(`Failed to ${action} PO:`, error);
    } finally {
      setActionLoading(null);
    }
  };

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
            headers={["PO Number", "Status", "Supplier", "Amount", "Requested By", "Date", "Actions"]}
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
                <TableCell>{po.supplier?.name ?? "-"}</TableCell>
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
                  <div className="flex flex-wrap gap-2">
                    {po.status === "PENDING" && (
                      <button
                        disabled={actionLoading === po.id}
                        onClick={() => handleAction(po, "approve")}
                        className="text-blue-600 hover:underline"
                      >
                        {actionLoading === po.id ? "Processing..." : "Approve"}
                      </button>
                    )}
                    {po.status === "APPROVED" && (
                      <button
                        disabled={actionLoading === po.id}
                        onClick={() => handleAction(po, "order")}
                        className="text-purple-600 hover:underline"
                      >
                        {actionLoading === po.id ? "Processing..." : "Mark Ordered"}
                      </button>
                    )}
                    {po.status === "ORDERED" && (
                      <button
                        disabled={actionLoading === po.id}
                        onClick={() => handleAction(po, "receive")}
                        className="text-green-600 hover:underline"
                      >
                        {actionLoading === po.id ? "Processing..." : "Mark Received"}
                      </button>
                    )}
                    {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
                      <button
                        disabled={actionLoading === po.id}
                        onClick={() => handleAction(po, "cancel")}
                        className="text-red-600 hover:underline"
                      >
                        {actionLoading === po.id ? "Processing..." : "Cancel"}
                      </button>
                    )}
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
