import React from 'react';

export const CollapsiblePanel = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)',
            animation: 'slideDown 0.2s ease-out'
        }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.125rem' }}>{title}</h3>
            {children}
        </div>
    );
};
