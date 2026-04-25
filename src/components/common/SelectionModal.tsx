// SelectionModal.tsx - (A suggested utility component for the above solution)

import React, {useState} from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

interface SelectionItem {
    id: string;
    title: string;
    subtitle?: string;
    disabled: boolean;
    disabledReason?: string;
}

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: SelectionItem[];
    onSelect: (id: string) => void;
    selectedId: string | null;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    items, 
    onSelect, 
    selectedId 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-5 sticky top-[65px] bg-white border-b z-10">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search school or program..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Application List */}
                <div className="p-5 flex-grow overflow-y-auto space-y-3">
                    {filteredItems.length === 0 ? (
                         <p className="text-center text-gray-500 italic mt-4">No applications found matching "{searchTerm}".</p>
                    ) : (
                        filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => !item.disabled && onSelect(item.id)}
                                disabled={item.disabled}
                                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                                    item.disabled
                                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-70'
                                        : item.id === selectedId
                                            ? 'bg-indigo-50 border-indigo-600 ring-4 ring-indigo-200 shadow-md'
                                            : 'bg-white border-gray-200 hover:shadow-md hover:border-indigo-500'
                                }`}
                            >
                                <h4 className="font-bold text-base text-gray-900 truncate">{item.title}</h4>
                                <p className="text-xs text-gray-500 mb-2">{item.subtitle}</p>
                                
                                {item.disabled ? (
                                    <div className="flex items-center text-xs font-semibold text-red-600 mt-1">
                                        <FaExclamationTriangle className="mr-1" /> {item.disabledReason}
                                    </div>
                                ) : item.id === selectedId ? (
                                    <div className="flex items-center text-xs font-semibold text-indigo-600 mt-1">
                                        <FaCheckCircle className="mr-1" /> Currently Selected
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">Click to select</p>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectionModal;