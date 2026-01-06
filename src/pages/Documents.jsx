import React, { useState } from 'react';
import { Search, Folder, File } from 'lucide-react';
import FileCard from '../components/FileCard';
import { useData } from '../context/DataContext';
import { PageHeader, CollapsiblePanel, useToast } from '../components/common';
import { useQuickAction } from '../hooks/useQuickAction';
import './Documents.css';

const Documents = () => {
    const { documents } = useData();
    const [isAddingDocument, setIsAddingDocument] = useQuickAction();
    const { addToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['All', 'Leases', 'Invoices', 'Insurance', 'Misc'];

    const filteredDocs = documents.filter(doc => {
        const matchCategory = selectedCategory === 'All' || doc.category === selectedCategory;
        const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="documents-container">
            <PageHeader title="Documents" onAction={() => setIsAddingDocument(true)} />

            <CollapsiblePanel title="Upload Document" isOpen={isAddingDocument} onClose={() => setIsAddingDocument(false)}>
                <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <p className="text-muted">Document upload functionality coming soon.</p>
                    <button className="btn-outline small" style={{ marginTop: '1rem' }} onClick={() => setIsAddingDocument(false)}>Close</button>
                </div>
            </CollapsiblePanel>

            <div className="documents-layout">
                {/* Sidebar Filter */}
                <aside className="docs-sidebar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <nav className="category-nav">
                        <p className="nav-label">Categories</p>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                <Folder size={18} />
                                <span>{cat}</span>
                                {cat === 'All' && <span className="count">{documents.length}</span>}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Grid */}
                <main className="docs-grid-area">
                    {filteredDocs.length > 0 ? (
                        <div className="files-grid">
                            {filteredDocs.map(doc => (
                                <FileCard key={doc.id} file={doc} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-docs">
                            <File size={48} className="text-muted" />
                            <p>No documents found.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Documents;
