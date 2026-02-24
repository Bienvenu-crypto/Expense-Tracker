'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import Modal from './Modal';

interface ApiSettingsModalProps {
    onClose: () => void;
}

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ onClose }) => {
    const { apiKey, saveApiKey } = useExpenses();
    const [key, setKey] = useState(apiKey);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveApiKey(key);
        alert('API Key Saved Successfully!');
        onClose();
    };

    return (
        <Modal title="🤖 AI Settings" onClose={onClose}>
            <div className="warning-message" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--accent-primary)', marginBottom: '16px', padding: '16px', borderRadius: '8px' }}>
                <p>To use the advanced AI features, you need a <strong>Google Gemini API Key</strong>.</p>
                <p style={{ marginTop: '8px', fontSize: '14px' }}>
                    The key is stored locally in your browser.
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{ color: 'var(--accent-primary)', marginLeft: '4px' }}>Get a free key here</a>.
                </p>
            </div>
            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label>Gemini API Key</label>
                    <input
                        type="password"
                        placeholder="Paste your API key here..."
                        required
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Key</button>
                </div>
            </form>
        </Modal>
    );
};

export default ApiSettingsModal;
