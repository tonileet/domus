import React, { useState } from 'react';
import { Mail, Phone, BookUser, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PageHeader, CollapsiblePanel, ConfirmModal, useToast } from '../components/common';
import { useQuickAction } from '../hooks/useQuickAction';

const Contacts = () => {
    const { contacts, addContact, updateContact, deleteContact } = useData();
    const [isAddingContact, setIsAddingContact] = useQuickAction();
    const { addToast } = useToast();

    // Inline expansion state
    const [expandedContactId, setExpandedContactId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ open: false, contactId: null, contactName: '' });

    // New Contact State
    const [newContactData, setNewContactData] = useState({
        name: '',
        role: '',
        description: '',
        contactInfo: ''
    });

    // Handle "Add Contact"
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await addContact(newContactData);
            setIsAddingContact(false);
            setNewContactData({
                name: '',
                role: '',
                description: '',
                contactInfo: ''
            });
            addToast('Contact added successfully');
        } catch {
            addToast('Failed to add contact', 'error');
        }
    };

    // Handle Inline Edit Save
    const handleInlineSave = async (e, id) => {
        e.preventDefault();
        try {
            await updateContact(id, editFormData);
            setExpandedContactId(null);
            addToast('Contact updated successfully');
        } catch {
            addToast('Failed to update contact', 'error');
        }
    };

    const toggleExpand = (contact) => {
        if (expandedContactId === contact.id) {
            setExpandedContactId(null);
        } else {
            setExpandedContactId(contact.id);
            setEditFormData({
                name: contact.name,
                role: contact.role || '',
                description: contact.description,
                contactInfo: contact.contactInfo
            });
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle delete with confirmation
    const confirmDelete = async () => {
        try {
            await deleteContact(deleteModal.contactId);
            setExpandedContactId(null);
            setDeleteModal({ open: false, contactId: null, contactName: '' });
            addToast('Contact deleted successfully');
        } catch {
            addToast('Failed to delete contact', 'error');
        }
    };

    return (
        <div className="page-container">
            <PageHeader title="Contacts" onAction={() => setIsAddingContact(true)} />

            {/* Add Contact Panel */}
            <CollapsiblePanel title="New Contact" isOpen={isAddingContact} onClose={() => setIsAddingContact(false)}>
                <form onSubmit={handleAddSubmit}>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Name</label>
                            <input
                                type="text"
                                required
                                value={newContactData.name}
                                onChange={e => setNewContactData({ ...newContactData, name: e.target.value })}
                                className="edit-input"
                                placeholder="Full Name or Company"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Function</label>
                            <input
                                type="text"
                                required
                                value={newContactData.role}
                                onChange={e => setNewContactData({ ...newContactData, role: e.target.value })}
                                className="edit-input"
                                placeholder="Electrician, Plumber, etc."
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Contact Info</label>
                            <input
                                type="text"
                                required
                                value={newContactData.contactInfo}
                                onChange={e => setNewContactData({ ...newContactData, contactInfo: e.target.value })}
                                className="edit-input"
                                placeholder="Phone or Email"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Description</label>
                            <input
                                type="text"
                                value={newContactData.description}
                                onChange={e => setNewContactData({ ...newContactData, description: e.target.value })}
                                className="edit-input"
                                placeholder="Additional notes"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary small">Save Contact</button>
                        <button type="button" className="btn-outline small" onClick={() => setIsAddingContact(false)}>Cancel</button>
                    </div>
                </form>
            </CollapsiblePanel>

            {/* Contacts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {contacts.map(contact => {
                    const isExpanded = expandedContactId === contact.id;
                    return (
                        <div
                            key={contact.id}
                            style={{
                                display: 'flex',
                                flexDirection: isExpanded ? 'column' : 'row',
                                alignItems: isExpanded ? 'stretch' : 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'var(--color-bg-surface)',
                                border: `1px solid ${isExpanded ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                cursor: isExpanded ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                gap: 'var(--spacing-md)',
                                boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none'
                            }}
                            onClick={() => toggleExpand(contact)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', minWidth: '300px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', backgroundColor: 'var(--color-bg-base)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)'
                                    }}>
                                        <BookUser size={20} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2px', color: 'var(--color-text-main)' }}>{contact.name}</h3>
                                            {contact.role && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontWeight: 500
                                                }}>
                                                    {contact.role}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{contact.description}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-base)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                                        {contact.contactInfo.includes('@') ? <Mail size={14} /> : <Phone size={14} />}
                                        {contact.contactInfo}
                                    </div>
                                </div>
                            </div>

                            {/* Inline Edit Form */}
                            {isExpanded && (
                                <div style={{
                                    paddingTop: 'var(--spacing-md)',
                                    marginTop: 'var(--spacing-sm)',
                                    borderTop: '1px solid var(--color-border)',
                                    animation: 'fadeIn 0.2s ease-out'
                                }} onClick={e => e.stopPropagation()}>
                                    <form onSubmit={(e) => handleInlineSave(e, contact.id)}>
                                        <div className="form-row">
                                            <div className="form-group" style={{ flex: 1 }}>
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
                                                <label>Function</label>
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={editFormData.role}
                                                    onChange={handleEditFormChange}
                                                    className="edit-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Contact Info</label>
                                                <input
                                                    type="text"
                                                    name="contactInfo"
                                                    value={editFormData.contactInfo}
                                                    onChange={handleEditFormChange}
                                                    className="edit-input"
                                                />
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Description</label>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={editFormData.description}
                                                    onChange={handleEditFormChange}
                                                    className="edit-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn-primary small">Save Changes</button>
                                            <button type="button" className="btn-outline small" onClick={() => setExpandedContactId(null)}>Cancel</button>
                                            <button
                                                type="button"
                                                className="btn-danger small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteModal({ open: true, contactId: contact.id, contactName: contact.name });
                                                }}
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <ConfirmModal
                isOpen={deleteModal.open}
                title="Delete Contact"
                message={`Are you sure you want to permanently delete ${deleteModal.contactName}?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, contactId: null, contactName: '' })}
            />
        </div>
    );
};

export default Contacts;
