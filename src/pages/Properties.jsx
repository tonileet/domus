import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import PropertyCard from '../components/PropertyCard';
import { PageHeader, CollapsiblePanel, useToast } from '../components/common';
import { useQuickAction } from '../hooks/useQuickAction';

const Properties = () => {
    const { properties, addProperty } = useData();
    const [isAddingProperty, setIsAddingProperty] = useQuickAction();
    const { addToast } = useToast();

    // New Property State
    const [newPropertyData, setNewPropertyData] = useState({
        name: '',
        location: '',
        size: '',
        status: 'Occupied',
        condition: 'Good',
        coldRent: '',
        nebenkosten: ''
    });

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure numeric values are stored as numbers
            const propertyToAdd = {
                ...newPropertyData,
                size: newPropertyData.size ? Number(newPropertyData.size) : null,
                coldRent: newPropertyData.coldRent ? Number(newPropertyData.coldRent) : 0,
                nebenkosten: newPropertyData.nebenkosten ? Number(newPropertyData.nebenkosten) : 0
            };

            await addProperty(propertyToAdd);
            setIsAddingProperty(false);
            setNewPropertyData({
                name: '',
                location: '',
                size: '',
                status: 'Occupied',
                condition: 'Good',
                coldRent: '',
                nebenkosten: ''
            });
            addToast('Property added successfully');
        } catch {
            addToast('Failed to add property', 'error');
        }
    };

    return (
        <div className="page-container">
            <PageHeader title="Properties" onAction={() => setIsAddingProperty(true)} />

            <CollapsiblePanel title="New Property" isOpen={isAddingProperty} onClose={() => setIsAddingProperty(false)}>
                <form onSubmit={handleAddSubmit}>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Property Name</label>
                            <input
                                type="text"
                                required
                                value={newPropertyData.name}
                                onChange={e => setNewPropertyData({ ...newPropertyData, name: e.target.value })}
                                className="edit-input"
                                placeholder="e.g. Sunset Apartments, Apt 4"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Location</label>
                            <input
                                type="text"
                                required
                                value={newPropertyData.location}
                                onChange={e => setNewPropertyData({ ...newPropertyData, location: e.target.value })}
                                className="edit-input"
                                placeholder="Address or Area"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Square Meter (m²)</label>
                            <input
                                type="number"
                                min="0"
                                value={newPropertyData.size}
                                onChange={e => setNewPropertyData({ ...newPropertyData, size: e.target.value })}
                                className="edit-input"
                                placeholder="e.g. 85"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Status</label>
                            <select
                                value={newPropertyData.status}
                                onChange={e => setNewPropertyData({ ...newPropertyData, status: e.target.value })}
                                className="edit-select"
                            >
                                <option value="Occupied">Occupied</option>
                                <option value="Vacant">Vacant</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Condition</label>
                            <select
                                value={newPropertyData.condition}
                                onChange={e => setNewPropertyData({ ...newPropertyData, condition: e.target.value })}
                                className="edit-select"
                            >
                                <option value="Good">Good</option>
                                <option value="Needs Repair">Needs Repair</option>
                                <option value="Renovated">Renovated</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Cold Rent (€)</label>
                            <input
                                type="number"
                                min="0"
                                value={newPropertyData.coldRent}
                                onChange={e => setNewPropertyData({ ...newPropertyData, coldRent: e.target.value })}
                                className="edit-input"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Nebenkosten (€)</label>
                            <input
                                type="number"
                                min="0"
                                value={newPropertyData.nebenkosten}
                                onChange={e => setNewPropertyData({ ...newPropertyData, nebenkosten: e.target.value })}
                                className="edit-input"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary small">Save Property</button>
                        <button type="button" className="btn-outline small" onClick={() => setIsAddingProperty(false)}>Cancel</button>
                    </div>
                </form>
            </CollapsiblePanel>

            <div className="properties-grid">
                {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </div>
    );
};

export default Properties;
