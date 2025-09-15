import React, { useState } from 'react';
import { Invoice, InvoiceHistory, InvoiceStatus } from '../types/invoice';
import { User } from '../types/auth';
import { services, users, invoiceHistory } from '../data/mockData';
import {
    X,
    Calendar,
    User as UserIcon,
    Building,
    Euro,
    FileText,
    Clock,
    MessageSquare,
    ArrowRight,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface InvoiceDetailsProps {
    invoice: Invoice;
    user: User;
    onClose: () => void;
    onUpdate: (invoiceId: string, updates: Partial<Invoice>) => void;
}

const statusStyles = {
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_payment: 'bg-blue-100 text-blue-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
    draft: 'Brouillon',
    pending_approval: 'En attente d\'approbation',
    approved: 'Approuvée',
    rejected: 'Rejetée',
    in_payment: 'En cours de paiement',
    paid: 'Payée',
    cancelled: 'Annulée'
};

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, user, onClose, onUpdate }) => {
    const [comment, setComment] = useState('');
    const service = services.find(s => s.id === invoice.currentService);
    const assignedUser = users.find(u => u.id === invoice.assignedTo);
    const history = invoiceHistory.filter(h => h.invoiceId === invoice.id);

    const handleStatusChange = (newStatus: InvoiceStatus, comment?: string) => {
        onUpdate(invoice.id, { status: newStatus });
        // Dans une vraie application, on ajouterait également l'entrée à l'historique
        setComment('');
    };

    const handleTransferService = (newServiceId: string) => {
        const newService = services.find(s => s.id === newServiceId);
        if (newService) {
            onUpdate(invoice.id, { currentService: newServiceId });
        }
    };

    const getNextActions = () => {
        const actions = [];

        switch (invoice.status) {
            case 'draft':
                if (user.permissions.includes('edit_invoice')) {
                    actions.push(
                        { label: 'Soumettre pour approbation', status: 'pending_approval', color: 'blue' }
                    );
                }
                break;
            case 'pending_approval':
                if (user.permissions.includes('approve_invoice')) {
                    actions.push(
                        { label: 'Approuver', status: 'approved', color: 'green' }
                    );
                }
                if (user.permissions.includes('reject_invoice')) {
                    actions.push(
                        { label: 'Rejeter', status: 'rejected', color: 'red' }
                    );
                }
                break;
            case 'approved':
                if (user.permissions.includes('approve_invoice')) {
                    actions.push(
                        { label: 'Initier le paiement', status: 'in_payment', color: 'blue' }
                    );
                }
                break;
            case 'in_payment':
                if (user.permissions.includes('approve_invoice')) {
                    actions.push(
                        { label: 'Marquer comme payée', status: 'paid', color: 'green' }
                    );
                }
                break;
        }

        return actions;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Détails de la facture</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="font-medium">{invoice.number}</p>
                                            <p className="text-sm text-gray-600">{invoice.vendor}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Euro className="h-5 w-5 text-gray-400 mr-3" />
                                        <span className="font-semibold text-lg">{invoice.amount.toLocaleString()} {invoice.currency}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm">Créée le {new Date(invoice.createdDate).toLocaleDateString('fr-FR')}</p>
                                            <p className="text-sm">Échéance le {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                                <p className="text-gray-600">{invoice.description}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statut et assignation</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Statut actuel</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusStyles[invoice.status]}`}>
                                            {statusLabels[invoice.status]}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Building className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="font-medium">{service?.name}</p>
                                            <p className="text-sm text-gray-600">Service actuel</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="font-medium">{assignedUser?.name}</p>
                                            <p className="text-sm text-gray-600">Assignée à</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    {getNextActions().length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions disponibles</h3>
                            <div className="flex flex-wrap gap-2">
                                {getNextActions().map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleStatusChange(action.status as InvoiceStatus)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${action.color === 'green'
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : action.color === 'red'
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transfert vers un autre service */}
                    {user.permissions.includes('transfer_invoice') && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Transférer vers un service</h3>
                            <div className="flex flex-wrap gap-2">
                                {services.filter(s => s.id !== invoice.currentService).map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => handleTransferService(service.id)}
                                        className="px-3 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
                                    >
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        {service.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Historique */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Historique des actions</h3>
                        <div className="space-y-4">
                            {history.map((entry) => (
                                <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">{entry.action}</p>
                                            <span className="text-sm text-gray-500">
                                                {new Date(entry.timestamp).toLocaleDateString('fr-FR')} à {' '}
                                                {new Date(entry.timestamp).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">Par {entry.userName}</p>
                                        {entry.comment && (
                                            <div className="mt-2 p-3 bg-white rounded border-l-4 border-blue-400">
                                                <p className="text-sm text-gray-700">{entry.comment}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ajouter un commentaire */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ajouter un commentaire</h3>
                        <div className="space-y-3">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Votre commentaire..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                            />
                            <button
                                onClick={() => {
                                    // Dans une vraie app, on sauvegarderait le commentaire
                                    setComment('');
                                }}
                                disabled={!comment.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <MessageSquare className="h-4 w-4 inline mr-2" />
                                Ajouter le commentaire
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};