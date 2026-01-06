import React from 'react';
import { Plus } from 'lucide-react';

export const PageHeader = ({ title, actionLabel = 'Add', onAction }) => {
    return (
        <header className="page-header">
            <div>
                <h1 className="page-title">{title}</h1>
            </div>
            {onAction && (
                <button className="btn-primary" onClick={onAction}>
                    <Plus size={20} />
                    <span>{actionLabel}</span>
                </button>
            )}
        </header>
    );
};
