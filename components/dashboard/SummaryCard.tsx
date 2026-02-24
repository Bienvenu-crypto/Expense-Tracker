'use client';

import React from 'react';

interface SummaryCardProps {
    icon?: string;
    title: string;
    value: string;
    subtitle: string;
    color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, value, subtitle, color }) => {
    return (
        <div className="summary-card">
            {icon && <div className="card-icon">{icon}</div>}
            <div className="card-content">
                <h3>{title}</h3>
                <p className="card-value" style={{ color: color }}>{value}</p>
                <span className="card-subtitle">{subtitle}</span>
            </div>
        </div>
    );
};

export default SummaryCard;
