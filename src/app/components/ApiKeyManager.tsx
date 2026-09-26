import React from 'react';
import { Key } from 'lucide-react';

interface ApiKeyManagerProps {
  onKeyAdded?: () => void;
}

export function ApiKeyManager({ onKeyAdded }: ApiKeyManagerProps) {
  const handleAddKey = async () => {
    try {
      // This component should be wrapped by the proper system that handles secret creation
      // For now, we'll provide instructions
      alert('Please use the "Add Secret" button in the top-right corner of the Figma Make interface to add your RESEND_API_KEY');
      if (onKeyAdded) {
        onKeyAdded();
      }
    } catch (error) {
      console.error('Error adding API key:', error);
    }
  };

  return (
    <button
      onClick={handleAddKey}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
    >
      <Key className="w-4 h-4" />
      Add Resend API Key
    </button>
  );
}
