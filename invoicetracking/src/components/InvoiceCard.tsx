import React, { useState } from "react";
import { Invoice } from "../types/DatabaseModels";
import { User } from "../types/auth";
import { Card } from "../components/Card";
import { CheckCircle, XCircle, Edit, Trash2, ArrowRightLeft } from "lucide-react";

interface InvoiceCardProps {
    invoice: Invoice;
    user: User;
    onUpdate: (id: number, updates: Partial<Invoice>) => void;
    onDelete: (id: number) => void;
    onTransfer: (id: number, assignedTo: number) => void; // 👈 new
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
    invoice,
    user,
    onUpdate,
    onDelete,
    onTransfer,
}) => {
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);

    const statusColors: Record<string, string> = {
        pending_approval: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        paid: "bg-blue-100 text-blue-800",
    };

    return (
        <Card className="flex flex-col justify-between h-full w-full max-w-sm p-4 bg-white rounded-xl shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 truncate">
                    #{invoice.number}
                </h3>
                <span
                    className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[invoice.status] || "bg-gray-100 text-gray-600"
                        }`}
                >
                    {invoice.status.replace("_", " ")}
                </span>
            </div>

            {/* Body */}
            <div className="space-y-2 text-sm text-gray-700 flex-1">
                <p className="truncate">
                    <span className="font-medium">Vendor:</span> {invoice.vendor_name}
                </p>
                <p>
                    <span className="font-medium">Total:</span>{" "}
                    {typeof invoice.total_amount === "number"
                        ? invoice.total_amount.toFixed(2)
                        : invoice.total_amount || "N/A"}{" "}
                    {invoice.currency}
                </p>
                <p>
                    <span className="font-medium">Invoice Date:</span>{" "}
                    {invoice.invoice_date}
                </p>
                <p>
                    <span className="font-medium">Due Date:</span>{" "}
                    {invoice.due_date || "N/A"}
                </p>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex flex-col gap-2">
                {invoice.status === "pending_approval" && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onUpdate(invoice.id!, { status: "approved" })}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                        >
                            <CheckCircle className="h-4 w-4" /> Approve
                        </button>

                        <button
                            onClick={() => onUpdate(invoice.id!, { status: "rejected" })}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                        >
                            <XCircle className="h-4 w-4" /> Reject
                        </button>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => console.log("TODO: open edit modal")}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        <Edit className="h-4 w-4" /> Edit
                    </button>

                    <button
                        onClick={() => onDelete(invoice.id!)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>

                    <button
                        onClick={() => setIsTransferOpen(true)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                    >
                        <ArrowRightLeft className="h-4 w-4" /> Transfer
                    </button>
                </div>
            </div>

            {/* Transfer Popup */}
            {isTransferOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Transfer Invoice
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Select the user/service to assign this invoice to:
                        </p>

                        <select
                            className="w-full border rounded-md px-3 py-2 mb-4"
                            value={selectedUser ?? ""}
                            onChange={(e) => setSelectedUser(Number(e.target.value))}
                        >
                            <option value="">-- Select User --</option>
                            {/* Replace with real workflow users fetched from props or hook */}
                            <option value={1}>User A (Next Service)</option>
                            <option value={2}>User B (Next Service)</option>
                            <option value={3}>User C (Next Service)</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsTransferOpen(false)}
                                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!selectedUser}
                                onClick={() => {
                                    if (selectedUser) {
                                        onTransfer(invoice.id!, selectedUser);
                                    }
                                    setIsTransferOpen(false);
                                }}
                                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
