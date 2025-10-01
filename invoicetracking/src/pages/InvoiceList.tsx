import React, { useState } from "react";
import { Invoice } from "../types/DatabaseModels";
import { User } from "../types/auth";
import { Filters } from "../components/Filters";
import { Stat } from "../components/Stat";
import { Section } from "../components/Section";
import { Card } from "../components/Card";
import { CreateInvoiceModal } from "./CreateInvoice";
import { InvoiceCard } from "../components/InvoiceCard";
import { useAuth } from "../hooks/useAuth";
interface InvoiceListProps {
    invoices?: Invoice[] | null; // allow null/undefined
    user: User;
    onUpdate: (id: number , updates: Partial<Invoice>) => void;
    onDelete: (id: number) => void;
    onCreate: (invoice: Partial<Invoice>) => void;
    onFilterChange: (filters: { search?: string; status?: string; service?: string }) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
    invoices,
    user,
    onUpdate,
    onDelete,
    onCreate,
    onFilterChange,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const { hasPermission } = useAuth()
    const canCreateInvoice = hasPermission("add_invoice");
    console.log(user)
    // Quick stats
    const stats = [
        { label: "Total", value: safeInvoices.length },
        { label: "Pending", value: safeInvoices.filter((i) => i.status === "pending_approval").length },
        { label: "Approved", value: safeInvoices.filter((i) => i.status === "approved").length },
        { label: "Rejected", value: safeInvoices.filter((i) => i.status === "rejected").length },
    ];

    return (
        <div className="space-y-8">
            {/* Stats */}
            <Section>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <Stat key={s.label} label={s.label} value={s.value} />
                    ))}
                </div>
            </Section>

            {/* Filters */}
            <Section>
                <Filters onChange={onFilterChange} />
            </Section>

            {/* Invoice grid */}
            <Section>
                {safeInvoices.length > 0 ? (
                    <>
                        <div className="flex justify-end mb-4">
                            {canCreateInvoice && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                                >
                                    + New Invoice
                                </button>
                            )}
                        </div>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                            {safeInvoices.map((invoice) => (
                                <InvoiceCard
                                    key={invoice.id}
                                    invoice={invoice}
                                    user={user}
                                    onUpdate={onUpdate}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <Card>
                        <div className="text-center text-gray-500 py-12">
                            No invoices found. Try adjusting your filters or create a new invoice.
                            {canCreateInvoice && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                                    >
                                        + New Invoice
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
                {canCreateInvoice && (
                    <CreateInvoiceModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        user={user}
                    />
                )}
            </Section>
        </div>
    );
};
