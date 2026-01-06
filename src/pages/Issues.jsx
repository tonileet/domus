import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AlertCircle, CheckCircle, Search, Activity, Calendar, Paperclip, File, Trash2 } from 'lucide-react';
import { PageHeader, CollapsiblePanel, useToast } from '../components/common';
import { useQuickAction } from '../hooks/useQuickAction';
import './Issues.css';

const Issues = () => {
    const { issues, properties, tenants, resolveIssue, addIssue, updateIssue } = useData();
    const [isAddingIssue, setIsAddingIssue] = useQuickAction();
    const { addToast } = useToast();

    const [filterStatus, setFilterStatus] = useState('Open'); // 'All', 'Open', 'Closed'
    const [searchTerm, setSearchTerm] = useState('');

    const [newIssueData, setNewIssueData] = useState({ title: '', description: '', priority: 'Medium', propertyId: '' });

    // Inline Expansion State
    const [expandedIssueId, setExpandedIssueId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // File input ref for inline editing (we need one per expanded item conceptually, but since only one opens at a time, one ref is enough if managed correctly)
    const fileInputRef = React.useRef(null);

    // Filter Logic
    const filteredIssues = issues.filter(issue => {
        const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Helper to get names
    const getPropertyName = (id) => properties.find(p => p.id === id)?.name || 'Unknown Property';
    const getTenantName = (id) => tenants.find(t => t.id === id)?.name || null;

    const handleResolve = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await resolveIssue(id);
            if (expandedIssueId === id) {
                setExpandedIssueId(null);
            }
            addToast('Issue resolved');
        } catch (err) {
            addToast('Failed to resolve issue', 'error');
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await addIssue({
                ...newIssueData,
                tenantId: null // Optional: add tenant selection later
            });
            setIsAddingIssue(false);
            setNewIssueData({ title: '', description: '', priority: 'Medium', propertyId: '' });
            addToast('Issue reported successfully');
        } catch (err) {
            addToast('Failed to report issue', 'error');
        }
    };

    // Inline Editing Logic
    const handleIssueClick = (issue) => {
        if (expandedIssueId === issue.id) {
            setExpandedIssueId(null);
            setEditFormData({});
        } else {
            setExpandedIssueId(issue.id);
            setEditFormData({ ...issue });
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            await updateIssue(expandedIssueId, editFormData);
            setExpandedIssueId(null);
            addToast('Issue updated successfully');
        } catch (err) {
            addToast('Failed to update issue', 'error');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newFile = {
                id: `f${Date.now()}`,
                name: file.name,
                url: URL.createObjectURL(file), // Create a preview URL
                type: file.type
            };
            setEditFormData(prev => ({
                ...prev,
                attachments: [...(prev.attachments || []), newFile]
            }));
        }
    };

    return (
        <div className="page-container">
            <PageHeader title="Issues & Requests" onAction={() => setIsAddingIssue(true)} />

            {/* Filters & Search */}
            <div className="issues-controls">
                <div className="search-bar">
                    <Search size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filterStatus === 'Open' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('Open')}
                    >
                        Open
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'Closed' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('Closed')}
                    >
                        Closed
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'All' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('All')}
                    >
                        All
                    </button>
                </div>
            </div>

            <CollapsiblePanel title="New Issue" isOpen={isAddingIssue} onClose={() => setIsAddingIssue(false)}>
                <form onSubmit={handleAddSubmit}>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Issue Title"
                            required
                            value={newIssueData.title}
                            onChange={e => setNewIssueData({ ...newIssueData, title: e.target.value })}
                            className="edit-input"
                            style={{ flex: 2 }}
                        />
                        <select
                            value={newIssueData.priority}
                            onChange={e => setNewIssueData({ ...newIssueData, priority: e.target.value })}
                            className="edit-select"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <select
                            required
                            value={newIssueData.propertyId}
                            onChange={e => setNewIssueData({ ...newIssueData, propertyId: e.target.value })}
                            className="edit-select"
                            style={{ width: '100%' }}
                        >
                            <option value="">Select Property...</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <textarea
                            placeholder="Description"
                            value={newIssueData.description}
                            onChange={e => setNewIssueData({ ...newIssueData, description: e.target.value })}
                            className="edit-textarea"
                            rows="3"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary small">Save Issue</button>
                        <button type="button" className="btn-outline small" onClick={() => setIsAddingIssue(false)}>Cancel</button>
                    </div>
                </form>
            </CollapsiblePanel>

            {/* Issues List */}
            <div className="all-issues-list">
                {filteredIssues.length > 0 ? (
                    filteredIssues.map(issue => {
                        const isExpanded = expandedIssueId === issue.id;
                        return (
                            <div
                                key={issue.id}
                                className={`issue-row item-status-${issue.status.toLowerCase()} ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => handleIssueClick(issue)}
                            >
                                <div className="issue-main-info">
                                    <div className="issue-title-block">
                                        {issue.status === 'Open' ? (
                                            <AlertCircle size={20} className="text-warning" />
                                        ) : (
                                            <CheckCircle size={20} className="text-success" />
                                        )}
                                        <div>
                                            <h3 className="issue-title">{issue.title}</h3>
                                            <p className="issue-subtitle">
                                                {getPropertyName(issue.propertyId)}
                                                {issue.tenantId && ` • ${getTenantName(issue.tenantId)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="issue-details-block">
                                        <span className={`priority-badge ${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                                        <span className="date-badge">
                                            <Calendar size={14} />
                                            {issue.dueDate || 'No due date'}
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="issue-edit-form" onClick={(e) => e.stopPropagation()}>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={editFormData.title || ''}
                                                onChange={handleEditChange}
                                                className="edit-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={editFormData.description || ''}
                                                onChange={handleEditChange}
                                                className="edit-textarea"
                                                rows="3"
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Priority</label>
                                                <select
                                                    name="priority"
                                                    value={editFormData.priority || 'Medium'}
                                                    onChange={handleEditChange}
                                                    className="edit-select"
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Status</label>
                                                <select
                                                    name="status"
                                                    value={editFormData.status || ''}
                                                    onChange={handleEditChange}
                                                    className="edit-select"
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label>Due Date</label>
                                                <input
                                                    type="date"
                                                    name="dueDate"
                                                    value={editFormData.dueDate || ''}
                                                    onChange={handleEditChange}
                                                    className="edit-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label>Attachments</label>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileUpload}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <button className="btn-text small" onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current.click();
                                                }}>
                                                    <Paperclip size={14} /> Add File
                                                </button>
                                            </div>
                                            <div className="attachments-list">
                                                {(editFormData.attachments && editFormData.attachments.length > 0) ? (
                                                    editFormData.attachments.map(file => (
                                                        <div key={file.id} className="attachment-item">
                                                            <div className="file-info">
                                                                <File size={16} className="text-muted" />
                                                                <a href={file.url} className="file-link" target="_blank" rel="noopener noreferrer">{file.name}</a>
                                                            </div>
                                                            <button className="btn-icon-danger" onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditFormData(prev => ({
                                                                    ...prev,
                                                                    attachments: prev.attachments.filter(f => f.id !== file.id)
                                                                }));
                                                            }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted small">No attachments.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button className="btn-primary small" onClick={handleSave}>Save</button>
                                            {issue.status === 'Open' && (
                                                <button className="btn-outline small" onClick={(e) => handleResolve(issue.id, e)}>
                                                    Mark Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <Activity size={48} className="text-muted" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No issues found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Issues;

