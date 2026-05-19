import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserInfoDisplay = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const fields = [
    { label: 'Name', value: `${user.firstName} ${user.lastName}`.trim() },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phoneNumber },
    { label: 'Department', value: user.department },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
        <span className="mr-2">👤</span>
        User Information
      </h3>
      
      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-700 border-b pb-2">Personal Details</h4>
        
        <div className="space-y-3">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-start sm:gap-4"
            >
              <span className="text-sm font-medium text-gray-600 shrink-0">{label}:</span>
              <span className="text-sm text-gray-800 break-words sm:text-right">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserInfoDisplay;
