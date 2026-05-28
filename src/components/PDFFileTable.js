import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';
const selectClass =
  'w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm custom-select-scroll scrollable-dropdown select-with-caret';
const numberInputClass = `${inputClass} number-input`;
const materialSelectClass = `${selectClass} min-w-[150px]`;
const gradeFieldClass = `${inputClass} min-w-[120px]`;
const gradeSelectClass = `${selectClass} min-w-[120px]`;
const thicknessFieldClass = `${numberInputClass} w-20`;

const MATERIAL_OPTIONS = ['Mild Steel', 'Stainless Steel', 'Other'];
const GRADE_OPTIONS_BY_MATERIAL = {
  'Mild Steel': ['2062', 'Other'],
  'Stainless Steel': ['302', 'Other'],
};

const FileActionButtons = ({ fileId, file, isEditing, onEdit, onSave, onCancel, onDelete }) => (
  <div className="flex items-center gap-2 shrink-0">
    {isEditing ? (
      <>
        <button
          type="button"
          onClick={() => onSave(fileId)}
          className="inline-flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          title="Save"
        >
          <CheckIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center w-10 h-10 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          title="Cancel"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </>
    ) : (
      <button
        type="button"
        onClick={() => onEdit(fileId, file)}
        className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        title="Edit"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
    )}
    <button
      type="button"
      onClick={() => onDelete(fileId)}
      className="inline-flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
      title="Delete"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  </div>
);

const PDFFileTable = ({
  files,
  onUpdateFile,
  onDeleteFile,
  materialData = [],
  showCreatedColumn = true,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  const availableMaterials = MATERIAL_OPTIONS;
  
  const getGradeOptionsForMaterial = (material) => {
    return GRADE_OPTIONS_BY_MATERIAL[material] || [];
  };

  const handleEdit = (fileId, file) => {
    const fileMaterial = file.material || 'Mild Steel';
    const isPresetMaterial = MATERIAL_OPTIONS.includes(fileMaterial);
    const selectedMaterial = isPresetMaterial ? fileMaterial : 'Other';
    const gradeOptions = getGradeOptionsForMaterial(selectedMaterial);
    const fileGrade = file.grade || '';
    const isKnownGrade = gradeOptions.includes(fileGrade);

    setEditingId(fileId);
    setEditingValues({
      partRef: file.partRef || file.name,
      material: selectedMaterial,
      customMaterial: selectedMaterial === 'Other' && fileMaterial !== 'Other' ? fileMaterial : '',
      thickness: file.thickness || '1.5',
      grade: selectedMaterial === 'Other' ? 'Other' : (isKnownGrade ? fileGrade : (fileGrade ? 'Other' : (gradeOptions[0] || ''))),
      customGrade: selectedMaterial === 'Other'
        ? (fileGrade && fileGrade !== 'Other' ? fileGrade : '')
        : (!isKnownGrade && fileGrade && fileGrade !== 'Other' ? fileGrade : ''),
      remarks: file.remarks || 'As per drawing',
      quantity: file.quantity || 1
    });
  };

  const handleSave = (fileId) => {
    if (!editingValues.remarks || editingValues.remarks.trim() === '') {
      toast.error('Please enter remarks before saving');
      return;
    }
    
    if (!editingValues.quantity || editingValues.quantity < 1) {
      toast.error('Please enter a valid quantity (minimum 1)');
      return;
    }
    
    const materialValue =
      editingValues.material === 'Other'
        ? (editingValues.customMaterial || '').trim() || 'Other'
        : editingValues.material;
    const gradeValue =
      editingValues.material === 'Other' || editingValues.grade === 'Other'
        ? (editingValues.customGrade || '').trim() || 'Other'
        : editingValues.grade;

    onUpdateFile(fileId, {
      ...editingValues,
      material: materialValue,
      grade: gradeValue
    });
    setEditingId(null);
    setEditingValues({});
    toast.success('File details updated successfully');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValues({});
  };

  const handleDelete = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      onDeleteFile(fileId);
    }
  };

  const handleInputChange = (field, value) => {
    const processedValue = typeof value === 'string' ? value.trim() : value;
    
    setEditingValues(prev => {
      const updated = {
        ...prev,
        [field]: processedValue
      };
      
      if (field === 'material') {
        if (processedValue === 'Other') {
          updated.customMaterial = updated.customMaterial || '';
          updated.grade = 'Other';
          updated.customGrade = updated.customGrade || '';
        } else {
          const grades = getGradeOptionsForMaterial(processedValue);
          updated.customMaterial = '';
          updated.grade = grades.length > 0 ? grades[0] : '';
          updated.customGrade = '';
        }
      } else if (field === 'grade') {
        if (processedValue === 'Other') {
          updated.customGrade = updated.customGrade || '';
        } else {
          updated.customGrade = '';
        }
      }
      
      return updated;
    });
  };

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getFileContext = (file, index) => {
    const fileId = file.id || index;
    const isEditing = editingId === fileId;
    const selectedMaterial = isEditing ? editingValues.material : file.material;
    const filteredGrades = getGradeOptionsForMaterial(selectedMaterial);

    return { fileId, isEditing, selectedMaterial, filteredGrades };
  };

  const renderFieldLabel = (label) => (
    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</span>
  );

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
      <style>{`
        .scrollable-dropdown {
          max-height: 38px;
          cursor: pointer;
          scrollbar-width: thin;
          scrollbar-color: #9CA3AF #F3F4F6;
        }
        .scrollable-dropdown::-webkit-scrollbar {
          width: 8px;
        }
        .scrollable-dropdown::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 4px;
        }
        .scrollable-dropdown::-webkit-scrollbar-thumb {
          background: #9CA3AF;
          border-radius: 4px;
        }
        .scrollable-dropdown::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
        .scrollable-dropdown option {
          padding: 8px 12px;
          font-size: 14px;
        }
        .scrollable-dropdown option:hover {
          background-color: #EFF6FF;
        }
        .select-with-caret {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236B7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.6rem center;
          background-size: 1rem 1rem;
        }
        .number-input {
          appearance: auto;
          -moz-appearance: auto;
        }
        .number-input::-webkit-outer-spin-button,
        .number-input::-webkit-inner-spin-button {
          -webkit-appearance: auto;
          margin: 0;
          opacity: 1;
        }
      `}</style>

      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
        <p className="text-sm text-gray-600">Manage your uploaded files and their specifications</p>
      </div>

      {/* Mobile: card layout */}
      <div className="md:hidden divide-y divide-gray-200">
        {files.map((file, index) => {
          const { fileId, isEditing, selectedMaterial, filteredGrades } =
            getFileContext(file, index);

          return (
            <article key={fileId} className="p-4 space-y-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {renderFieldLabel('Part Name')}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingValues.partRef || ''}
                      onChange={(e) => handleInputChange('partRef', e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <DocumentIcon className="h-5 w-5 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-900 break-all">
                        {file.partRef || file.name || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
                <FileActionButtons
                  fileId={fileId}
                  file={file}
                  isEditing={isEditing}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                />
              </div>

              <div className="grid grid-cols-[1.35fr_1fr] gap-2">
                <div>
                  {renderFieldLabel('Material')}
                  {isEditing ? (
                    <>
                      <select
                        value={editingValues.material || ''}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select Material</option>
                        {availableMaterials.map((material) => (
                          <option key={material} value={material}>{material}</option>
                        ))}
                      </select>
                      {selectedMaterial === 'Other' && (
                        <input
                          type="text"
                          value={editingValues.customMaterial || ''}
                          onChange={(e) => handleInputChange('customMaterial', e.target.value)}
                          placeholder="Enter other material (optional)"
                          className={`${inputClass} mt-2`}
                        />
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-900">{file.material || availableMaterials[0]}</span>
                  )}
                </div>

                <div>
                  {renderFieldLabel('Thickness')}
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingValues.thickness || ''}
                      onChange={(e) => handleInputChange('thickness', e.target.value)}
                      placeholder="e.g. 1.5"
                      className={numberInputClass}
                      disabled={!selectedMaterial}
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{file.thickness || '1.5'}mm</span>
                  )}
                </div>

                <div>
                  {renderFieldLabel('Grade')}
                  {isEditing ? (
                    (selectedMaterial === 'Other' || editingValues.grade === 'Other') ? (
                      <input
                        type="text"
                        value={editingValues.customGrade || ''}
                        onChange={(e) => handleInputChange('customGrade', e.target.value)}
                        placeholder="Enter grade (optional)"
                        className={inputClass}
                      />
                    ) : (
                      <select
                        value={editingValues.grade || ''}
                        onChange={(e) => handleInputChange('grade', e.target.value)}
                        className={selectClass}
                        disabled={!selectedMaterial}
                      >
                        {filteredGrades.map((grade) => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    )
                  ) : (
                    <span className="text-sm text-gray-900">{file.grade || '-'}</span>
                  )}
                </div>

                <div>
                  {renderFieldLabel('Quantity')}
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={editingValues.quantity || ''}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value, 10) || '')}
                        placeholder="Qty"
                        className={`${numberInputClass} ${
                          !editingValues.quantity || editingValues.quantity < 1
                            ? 'border-red-300 bg-red-50'
                            : ''
                        }`}
                      />
                      {(!editingValues.quantity || editingValues.quantity < 1) && (
                        <span className="text-xs text-red-600 mt-0.5 block">Required</span>
                      )}
                    </div>
                  ) : (
                    <span
                      className={`text-sm ${
                        !file.quantity || file.quantity < 1
                          ? 'text-red-600 font-semibold'
                          : 'text-gray-900'
                      }`}
                    >
                      {file.quantity && file.quantity >= 1 ? file.quantity : '⚠️'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {renderFieldLabel('Remark')}
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editingValues.remarks || ''}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      placeholder="Enter remarks here..."
                      className={`${inputClass} ${
                        !editingValues.remarks || editingValues.remarks.trim() === ''
                          ? 'border-red-300 bg-red-50'
                          : ''
                      }`}
                    />
                    {(!editingValues.remarks || editingValues.remarks.trim() === '') && (
                      <span className="text-xs text-red-600 mt-0.5 block">Required</span>
                    )}
                  </div>
                ) : (
                  <span
                    className={`text-sm break-words ${
                      !file.remarks || file.remarks.trim() === ''
                        ? 'text-red-600 italic'
                        : 'text-gray-900'
                    }`}
                  >
                    {file.remarks && file.remarks.trim() !== '' ? file.remarks : 'No remarks added ⚠️'}
                  </span>
                )}
              </div>

              {showCreatedColumn && (
                <div>
                  {renderFieldLabel('Created')}
                  <span className="text-sm text-gray-500">
                    {formatDate(file.createdAt || file.created)}
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Desktop: table with horizontal scroll fallback */}
      <div className="hidden md:block overflow-x-auto -mx-px">
        <table className="min-w-[900px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thickness</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              {showCreatedColumn && (
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              )}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file, index) => {
              const { fileId, isEditing, selectedMaterial, filteredGrades } =
                getFileContext(file, index);

              return (
                <tr key={fileId} className="hover:bg-gray-50">
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingValues.partRef || ''}
                        onChange={(e) => handleInputChange('partRef', e.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <div className="flex items-center">
                        <DocumentIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate" title={file.partRef || file.name}>
                          {file.partRef || file.name || 'N/A'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <>
                        <select
                          value={editingValues.material || ''}
                          onChange={(e) => handleInputChange('material', e.target.value)}
                          className={materialSelectClass}
                        >
                          <option value="">Select Material</option>
                          {availableMaterials.map((material) => (
                            <option key={material} value={material}>{material}</option>
                          ))}
                        </select>
                        {selectedMaterial === 'Other' && (
                          <input
                            type="text"
                            value={editingValues.customMaterial || ''}
                            onChange={(e) => handleInputChange('customMaterial', e.target.value)}
                            placeholder="Enter other material (optional)"
                            className={`${inputClass} mt-2`}
                          />
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-900">{file.material || availableMaterials[0]}</span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={editingValues.thickness || ''}
                        onChange={(e) => handleInputChange('thickness', e.target.value)}
                        placeholder="e.g. 1.5"
                        className={thicknessFieldClass}
                        disabled={!selectedMaterial}
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{file.thickness || '1.5'}mm</span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {isEditing ? (
                      (selectedMaterial === 'Other' || editingValues.grade === 'Other') ? (
                        <input
                          type="text"
                          value={editingValues.customGrade || ''}
                          onChange={(e) => handleInputChange('customGrade', e.target.value)}
                          placeholder="Enter grade (optional)"
                          className={gradeFieldClass}
                        />
                      ) : (
                        <select
                          value={editingValues.grade || ''}
                          onChange={(e) => handleInputChange('grade', e.target.value)}
                          className={gradeSelectClass}
                          disabled={!selectedMaterial}
                        >
                          {filteredGrades.map((grade) => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      )
                    ) : (
                      <span className="text-sm text-gray-900">{file.grade || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editingValues.remarks || ''}
                          onChange={(e) => handleInputChange('remarks', e.target.value)}
                          placeholder="Enter remarks here..."
                          className={`${inputClass} ${
                            !editingValues.remarks || editingValues.remarks.trim() === ''
                              ? 'border-red-300 bg-red-50'
                              : ''
                          }`}
                        />
                        {(!editingValues.remarks || editingValues.remarks.trim() === '') && (
                          <span className="text-xs text-red-600 mt-0.5 block">Required</span>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`text-sm truncate block ${
                          !file.remarks || file.remarks.trim() === ''
                            ? 'text-red-600 italic'
                            : 'text-gray-900'
                        }`}
                        title={file.remarks || 'Remarks required'}
                      >
                        {file.remarks && file.remarks.trim() !== '' ? file.remarks : 'No remarks added ⚠️'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {isEditing ? (
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={editingValues.quantity || ''}
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value, 10) || '')}
                          placeholder="Qty"
                          className={`${numberInputClass} ${
                            !editingValues.quantity || editingValues.quantity < 1
                              ? 'border-red-300 bg-red-50'
                              : ''
                          }`}
                        />
                        {(!editingValues.quantity || editingValues.quantity < 1) && (
                          <span className="text-xs text-red-600 mt-0.5 block">Required</span>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`text-sm ${
                          !file.quantity || file.quantity < 1
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-900'
                        }`}
                      >
                        {file.quantity && file.quantity >= 1 ? file.quantity : '⚠️'}
                      </span>
                    )}
                  </td>
                  {showCreatedColumn && (
                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(file.createdAt || file.created)}
                    </td>
                  )}
                  <td className="px-3 py-4 text-sm font-medium">
                    <FileActionButtons
                      fileId={fileId}
                      file={file}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {files.length} file{files.length !== 1 ? 's' : ''} uploaded • Click the edit icon to modify file specifications
        </p>
      </div>
    </div>
  );
};

export default PDFFileTable;
