import React, { useState, useEffect, useRef } from 'react'; import {
    Upload,
    X,
    Camera,
    Edit,
    
} from 'lucide-react';
import { Invoice } from '../types/DatabaseModels';
import { User } from '../types/auth';
import { useInvoices } from '../hooks/useInvoices';
export const CreateInvoiceModal = ({
    isOpen,
    onClose,
    onSubmit,
    user
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (invoice: Partial<Invoice>) => void;
    user: User;
}) => {
    const [createMethod, setCreateMethod] = useState<'manual' | 'upload' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState<Partial<Invoice>>({
        vendor_name: '',
        description: '',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        currency: 'EUR',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        payment_terms: 30,
        current_service: user.service,
        created_by: user.id
    });
    const createInvoice= useInvoices();
    const uploadInvoiceFile = useInvoices();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (formData.subtotal && formData.tax_amount !== undefined) {
            setFormData(prev => ({
                ...prev,
                totalAmount: (prev.subtotal || 0) + (prev.tax_amount || 0)
            }));
        }
    }, [formData.subtotal, formData.tax_amount]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsProcessing(true);
        setUploadProgress(0);

        try {
            const file = files[0];

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            const result = await uploadInvoiceFile(file, {
                currentService: user.service,
                createdBy: user.id
            });

            setUploadProgress(100);
            setTimeout(() => {
                onSubmit(result);
                onClose();
                resetForm();
            }, 500);

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const result = await createInvoice(formData);
            onSubmit(result);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Creation failed:', error);
            alert('Invoice creation failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setCreateMethod(null);
        setUploadProgress(0);
        setFormData({
            vendor_name: '',
            description: '',
            subtotal: 0,
            tax_amount: 0,
            total_amount: 0,
            currency: 'EUR',
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            payment_terms: 30,
            current_service: user.service,
            created_by: user.id
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Create New Invoice</h2>
                        <button
                            onClick={() => {
                                onClose();
                                resetForm();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {!createMethod && (
                        <div className="space-y-4">
                            <p className="text-gray-600 mb-6">How would you like to create the invoice?</p>

                            <button
                                onClick={() => setCreateMethod('manual')}
                                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <Edit className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
                                <p className="text-gray-600">Enter invoice details manually</p>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <Upload className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                                <p className="text-gray-600">Upload PDF, image or scan - AI will extract data</p>
                            </button>

                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <Camera className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
                                <p className="text-gray-600">Capture invoice with camera - AI will extract data</p>
                            </button>
                        </div>
                    )}

                    {createMethod === 'manual' && (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.vendor_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.subtotal}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subtotal: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.tax_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        value={formData.total_amount}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.invoice_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCreateMethod(null)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isProcessing ? 'Creating...' : 'Create Invoice'}
                                </button>
                            </div>
                        </form>
                    )}

                    {isProcessing && createMethod === 'upload' && (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
                            <p className="text-gray-600 mb-4">AI is extracting invoice data...</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{uploadProgress}% complete</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
            />
        </div>
    );
};
