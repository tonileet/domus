import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Calendar, CheckCircle, AlertCircle, XCircle, Euro, Paperclip, X, Camera } from 'lucide-react';
import { PageHeader, CollapsiblePanel, useToast } from '../components/common';
import { useQuickAction } from '../hooks/useQuickAction';
import ReceiptScanner from '../components/ReceiptScanner';
import './Costs.css';

const Costs = () => {
    const { costs, tenants, properties, issues, addCost, updateCost } = useData();
    const [isAddingCost, setIsAddingCost] = useQuickAction();
    const { addToast } = useToast();

    // Inline expansion state
    const [expandedCostId, setExpandedCostId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // New Cost State (Top Panel)
    const [newCostData, setNewCostData] = useState({
        name: '',
        description: '',
        amount: '',
        dueDate: '',
        paidDate: '',
        utilityBillable: false,
        tenantIds: [],
        propertyIds: [],
        issueIds: [],
        attachments: []
    });

    // Receipt Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Handle scanned receipt data
    const handleScanComplete = (scannedData) => {
        setNewCostData(prev => ({
            ...prev,
            name: scannedData.name || prev.name,
            description: scannedData.description || prev.description,
            amount: scannedData.amount || prev.amount,
            dueDate: scannedData.dueDate || prev.dueDate
        }));
        setIsScannerOpen(false);
        setIsAddingCost(true);
        addToast('Receipt scanned! Please review the extracted data.');
    };

    // Handle "Add Cost" (Top Panel)
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await addCost({
                ...newCostData,
                amount: parseFloat(newCostData.amount),
                paidDate: newCostData.paidDate || null
            });
            setIsAddingCost(false);
            setNewCostData({
                name: '',
                description: '',
                amount: '',
                dueDate: '',
                paidDate: '',
                utilityBillable: false,
                tenantIds: [],
                propertyIds: [],
                issueIds: [],
                attachments: []
            });
            addToast('Cost added successfully');
        } catch {
            addToast('Failed to add cost', 'error');
        }
    };

    // Handle Inline Edit Save
    const handleInlineSave = async (e, id) => {
        e.preventDefault();
        try {
            await updateCost(id, {
                ...editFormData,
                amount: parseFloat(editFormData.amount)
            });
            setExpandedCostId(null);
            addToast('Cost updated successfully');
        } catch {
            addToast('Failed to update cost', 'error');
        }
    };

    const toggleExpand = (cost) => {
        if (expandedCostId === cost.id) {
            setExpandedCostId(null);
        } else {
            setExpandedCostId(cost.id);
            // Pre-fill form data for this cost
            setEditFormData({
                name: cost.name,
                description: cost.description,
                amount: cost.amount,
                dueDate: cost.dueDate,
                paidDate: cost.paidDate || '',
                utilityBillable: cost.utilityBillable,
                tenantIds: cost.tenantIds || [],
                propertyIds: cost.propertyIds || [],
                issueIds: cost.issueIds || [],
                attachments: cost.attachments || []
            });
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTenantSelection = (tenantId, isEditing = false) => {
        const setter = isEditing ? setEditFormData : setNewCostData;
        setter(prev => {
            const currentTenantIds = prev.tenantIds || [];
            const newTenantIds = currentTenantIds.includes(tenantId)
                ? currentTenantIds.filter(id => id !== tenantId)
                : [...currentTenantIds, tenantId];
            return { ...prev, tenantIds: newTenantIds };
        });
    };

    const handlePropertySelection = (propertyId, isEditing = false) => {
        const setter = isEditing ? setEditFormData : setNewCostData;
        setter(prev => {
            const currentPropertyIds = prev.propertyIds || [];
            const newPropertyIds = currentPropertyIds.includes(propertyId)
                ? currentPropertyIds.filter(id => id !== propertyId)
                : [...currentPropertyIds, propertyId];
            return { ...prev, propertyIds: newPropertyIds };
        });
    };

    const handleIssueSelection = (issueId, isEditing = false) => {
        const setter = isEditing ? setEditFormData : setNewCostData;
        setter(prev => {
            const currentIssueIds = prev.issueIds || [];
            const newIssueIds = currentIssueIds.includes(issueId)
                ? currentIssueIds.filter(id => id !== issueId)
                : [...currentIssueIds, issueId];
            return { ...prev, issueIds: newIssueIds };
        });
    };

    const handleFileAttachment = (fileName, isEditing = false) => {
        const setter = isEditing ? setEditFormData : setNewCostData;
        setter(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), fileName]
        }));
    };

    const removeAttachment = (index, isEditing = false) => {
        const setter = isEditing ? setEditFormData : setNewCostData;
        setter(prev => ({
            ...prev,
            attachments: (prev.attachments || []).filter((_, i) => i !== index)
        }));
    };

    // Helper to determine status icon
    const getStatusIcon = (cost) => {
        if (cost.paidDate) return <CheckCircle size={20} className="text-success" />;

        const today = new Date();
        const dueDate = new Date(cost.dueDate);

        if (dueDate < today) return <XCircle size={20} className="text-danger" />;
        return <AlertCircle size={20} className="text-warning" />;
    };

    const getStatusText = (cost) => {
        if (cost.paidDate) return `Paid on ${cost.paidDate}`;

        const today = new Date();
        const dueDate = new Date(cost.dueDate);

        if (dueDate < today) return 'Overdue';
        return 'Unpaid';
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    return (
        <div className="costs-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Costs</h1>
                </div>
                <div className="header-actions">
                    <button className="btn-outline" onClick={() => setIsScannerOpen(true)}>
                        <Camera size={20} />
                        <span>Scan Receipt</span>
                    </button>
                    <button className="btn-primary" onClick={() => setIsAddingCost(true)}>
                        <span>+ Add Cost</span>
                    </button>
                </div>
            </header>

            {isScannerOpen && (
                <ReceiptScanner
                    onScanComplete={handleScanComplete}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}

            <CollapsiblePanel title="New Cost" isOpen={isAddingCost} onClose={() => setIsAddingCost(false)}>
                <form onSubmit={handleAddSubmit}>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>Name</label>
                            <input
                                type="text"
                                required
                                value={newCostData.name}
                                onChange={e => setNewCostData({ ...newCostData, name: e.target.value })}
                                className="edit-input"
                                placeholder="e.g., Property Insurance"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Amount (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={newCostData.amount}
                                onChange={e => setNewCostData({ ...newCostData, amount: e.target.value })}
                                className="edit-input"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Description</label>
                            <textarea
                                value={newCostData.description}
                                onChange={e => setNewCostData({ ...newCostData, description: e.target.value })}
                                className="edit-textarea"
                                placeholder="Detailed description..."
                                rows="2"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Due Date</label>
                            <input
                                type="date"
                                required
                                value={newCostData.dueDate}
                                onChange={e => setNewCostData({ ...newCostData, dueDate: e.target.value })}
                                className="edit-input"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Paid Date (Optional)</label>
                            <input
                                type="date"
                                value={newCostData.paidDate}
                                onChange={e => setNewCostData({ ...newCostData, paidDate: e.target.value })}
                                className="edit-input"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="checkbox-label-inline">
                                <span>Utility Billable (can be passed to tenants)</span>
                                <input
                                    type="checkbox"
                                    checked={newCostData.utilityBillable}
                                    onChange={e => setNewCostData({ ...newCostData, utilityBillable: e.target.checked })}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Associations (Optional)</label>
                        <div className="associations-container">
                            {/* Tenants */}
                            <div className="association-group">
                                <div className="association-label">Tenants</div>
                                <div className="tenant-selection">
                                    {tenants.filter(t => t.status === 'Active').map(tenant => (
                                        <label key={tenant.id} className="tenant-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={newCostData.tenantIds.includes(tenant.id)}
                                                onChange={() => handleTenantSelection(tenant.id, false)}
                                            />
                                            <span>{tenant.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Properties */}
                            <div className="association-group">
                                <div className="association-label">Properties</div>
                                <div className="tenant-selection">
                                    {properties.map(property => (
                                        <label key={property.id} className="tenant-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={newCostData.propertyIds.includes(property.id)}
                                                onChange={() => handlePropertySelection(property.id, false)}
                                            />
                                            <span>{property.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Issues */}
                            <div className="association-group">
                                <div className="association-label">Issues</div>
                                <div className="tenant-selection">
                                    {issues.filter(i => i.status === 'Open').map(issue => (
                                        <label key={issue.id} className="tenant-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={newCostData.issueIds.includes(issue.id)}
                                                onChange={() => handleIssueSelection(issue.id, false)}
                                            />
                                            <span>{issue.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Attachments (Invoices, etc.)</label>
                        <div className="attachment-section">
                            <input
                                type="text"
                                placeholder="Enter file name (e.g., invoice_2024.pdf)"
                                className="edit-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (e.target.value.trim()) {
                                            handleFileAttachment(e.target.value.trim(), false);
                                            e.target.value = '';
                                        }
                                    }
                                }}
                            />
                            {newCostData.attachments && newCostData.attachments.length > 0 && (
                                <div className="attachment-list">
                                    {newCostData.attachments.map((file, index) => (
                                        <div key={index} className="attachment-item">
                                            <Paperclip size={14} />
                                            <span>{file}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index, false)}
                                                className="remove-attachment"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary small">Save Cost</button>
                        <button type="button" className="btn-outline small" onClick={() => setIsAddingCost(false)}>Cancel</button>
                    </div>
                </form>
            </CollapsiblePanel>

            <div className="table-container" style={{ marginTop: 'var(--spacing-lg)', background: 'none', border: 'none' }}>
                {/* Cost List */}
                <div className="cost-list">
                    {costs.map(cost => {
                        const isExpanded = expandedCostId === cost.id;
                        return (
                            <div
                                key={cost.id}
                                className={`cost-row ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleExpand(cost)}
                            >
                                <div className="cost-main-info">
                                    <div className="cost-title-block">
                                        {getStatusIcon(cost)}
                                        <div>
                                            <h3 className="cost-title">{cost.name}</h3>
                                            <p className="cost-subtitle">{getStatusText(cost)}</p>
                                        </div>
                                    </div>

                                    <div className="cost-details-block">
                                        <span className="amount-badge">
                                            <Euro size={14} />
                                            {formatAmount(cost.amount)}
                                        </span>
                                        <span className="date-badge">
                                            <Calendar size={14} />
                                            Due: {cost.dueDate}
                                        </span>
                                        {cost.utilityBillable && (
                                            <span className="utility-badge">Utility Billable</span>
                                        )}
                                    </div>
                                </div>

                                {/* Inline Edit Form */}
                                {isExpanded && (
                                    <div className="cost-edit-form" onClick={e => e.stopPropagation()}>
                                        <form onSubmit={(e) => handleInlineSave(e, cost.id)}>
                                            <div className="form-row">
                                                <div className="form-group" style={{ flex: 2 }}>
                                                    <label>Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editFormData.name}
                                                        onChange={handleEditFormChange}
                                                        className="edit-input"
                                                    />
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Amount (€)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        name="amount"
                                                        value={editFormData.amount}
                                                        onChange={handleEditFormChange}
                                                        className="edit-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Description</label>
                                                    <textarea
                                                        name="description"
                                                        value={editFormData.description}
                                                        onChange={handleEditFormChange}
                                                        className="edit-textarea"
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Due Date</label>
                                                    <input
                                                        type="date"
                                                        name="dueDate"
                                                        value={editFormData.dueDate}
                                                        onChange={handleEditFormChange}
                                                        className="edit-input"
                                                    />
                                                </div>
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label>Paid Date</label>
                                                    <input
                                                        type="date"
                                                        name="paidDate"
                                                        value={editFormData.paidDate}
                                                        onChange={handleEditFormChange}
                                                        className="edit-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group" style={{ flex: 1 }}>
                                                    <label className="checkbox-label-inline">
                                                        <span>Utility Billable</span>
                                                        <input
                                                            type="checkbox"
                                                            name="utilityBillable"
                                                            checked={editFormData.utilityBillable}
                                                            onChange={handleEditFormChange}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Associations</label>
                                                <div className="associations-container">
                                                    {/* Tenants */}
                                                    <div className="association-group">
                                                        <div className="association-label">Tenants</div>
                                                        <div className="tenant-selection">
                                                            {tenants.filter(t => t.status === 'Active').map(tenant => (
                                                                <label key={tenant.id} className="tenant-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editFormData.tenantIds.includes(tenant.id)}
                                                                        onChange={() => handleTenantSelection(tenant.id, true)}
                                                                    />
                                                                    <span>{tenant.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Properties */}
                                                    <div className="association-group">
                                                        <div className="association-label">Properties</div>
                                                        <div className="tenant-selection">
                                                            {properties.map(property => (
                                                                <label key={property.id} className="tenant-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editFormData.propertyIds.includes(property.id)}
                                                                        onChange={() => handlePropertySelection(property.id, true)}
                                                                    />
                                                                    <span>{property.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Issues */}
                                                    <div className="association-group">
                                                        <div className="association-label">Issues</div>
                                                        <div className="tenant-selection">
                                                            {issues.filter(i => i.status === 'Open').map(issue => (
                                                                <label key={issue.id} className="tenant-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editFormData.issueIds.includes(issue.id)}
                                                                        onChange={() => handleIssueSelection(issue.id, true)}
                                                                    />
                                                                    <span>{issue.title}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Attachments (Invoices, etc.)</label>
                                                <div className="attachment-section">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter file name (e.g., invoice_2024.pdf)"
                                                        className="edit-input"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (e.target.value.trim()) {
                                                                    handleFileAttachment(e.target.value.trim(), true);
                                                                    e.target.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    {editFormData.attachments && editFormData.attachments.length > 0 && (
                                                        <div className="attachment-list">
                                                            {editFormData.attachments.map((file, index) => (
                                                                <div key={index} className="attachment-item">
                                                                    <Paperclip size={14} />
                                                                    <span>{file}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeAttachment(index, true)}
                                                                        className="remove-attachment"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="btn-primary small">Save Changes</button>
                                                <button type="button" className="btn-outline small" onClick={() => setExpandedCostId(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Costs;
