import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Users } from 'lucide-react';
import './Group.css';

interface GroupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Group({ isOpen, onClose }: GroupProps) {
    if (!isOpen) return null;
    return (
        <div>
            <h1>Gruppi</h1>
        </div>
    );
}