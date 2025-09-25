import React from "react";
import { Invoice } from "../types/DatabaseModels";
import { User } from "../types/auth";
import { Card } from "../components/Card";
import { CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";

interface InvoiceCardProps {
    invoice: Invoice;
    user: User;
    onUpdate: (id: string, updates: Partial<Invoice>) => void;
    onDelete: (id: string) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
    invoice,
    user,
    onUpdate,
    onDelete,
}) => {
    const statusColors: Record<string, string> = {
        pending_approval: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        paid: "bg-blue-100 text-blue-800",
    };

    return (
        <Card className="flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">#{invoice.number}</h3>
                <span
                    className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[invoice.status] || "bg-gray-100 text-gray-600"
                        }`}
                >
                    {invoice.status.replace("_", " ")}
                </span>
            </div>

            {/* Body */}
            <div className="space-y-2 text-sm text-gray-700">
                <p>
                    <span className="font-medium">Vendor:</span> {invoice.vendorName}
                </p>
                <p>
                    <span className="font-medium">Total:</span>{" "}
                    {invoice.totalAmount.toFixed(2)} {invoice.currency}
                </p>
                <p>
                    <span className="font-medium">Invoice Date:</span> {invoice.invoiceDate}
                </p>
                <p>
                    <span className="font-medium">Due Date:</span>{" "}
                    {invoice.dueDate || "N/A"}
                </p>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex flex-col gap-2">
                {invoice.status === "pending_approval" && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onUpdate(invoice.id, { status: "approved" })}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                        >
                            <CheckCircle className="h-4 w-4" /> Approve
                        </button>

                        <button
                            onClick={() => onUpdate(invoice.id, { status: "rejected" })}
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
                        onClick={() => onDelete(invoice.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </div>
            </div>
        </Card>
    );
};
