import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', ...props }) => {
    return (
        <div className="stat-card" {...props}>
            <div className={`icon-container bg-${color}`}>
                <Icon size={24} color={`var(--color-${color})`} />
            </div>
            <div className="stat-content">
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
                {trend && <span className="stat-trend">{trend}</span>}
            </div>
        </div>
    );
};

export default StatCard;
