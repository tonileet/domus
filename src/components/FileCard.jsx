import React from 'react';
import { FileText, Image, File } from 'lucide-react';
import './FileCard.css';

const FileCard = ({ file }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText size={40} className="file-icon pdf" />;
            case 'image': return <Image size={40} className="file-icon image" />;
            default: return <File size={40} className="file-icon default" />;
        }
    };

    return (
        <div className="file-card">
            <div className="file-preview">
                {getIcon(file.type)}
            </div>
            <div className="file-info">
                <p className="file-name" title={file.name}>{file.name}</p>
                <div className="file-meta">
                    <span>{file.date}</span>
                    <span>•</span>
                    <span>{file.size}</span>
                </div>
            </div>
        </div>
    );
};

export default FileCard;
