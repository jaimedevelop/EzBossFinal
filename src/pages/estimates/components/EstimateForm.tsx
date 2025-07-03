import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Save, FileText, Download, CreditCard, Edit as EditIcon, Eye } from 'lucide-react';
import { FormField } from '../../../mainComponents/forms/FormField';
import { InputField } from '../../../mainComponents/forms/InputField';
import { SelectField } from '../../../mainComponents/forms/SelectField';
import { LoadingButton } from '../../../mainComponents/ui/LoadingButton';
import { Alert } from '../../../mainComponents/ui/Alert';
import { 
  createEstimate, 
  updateEstimate,
  getEstimateById,
  generateEstimateNumber as generateEstimateNumberFromDB 
} from '../../../firebase/estimates';
import { getProjects } from '../../../firebase/database';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Project {
  id: string;
  name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

interface EstimateFormData {
  estimateNumber: string;
  projectId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectDescription: string;
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  validUntil: string;
  notes: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
}

interface EstimateFormProps {
  mode: 'create' | 'edit' | 'view';
  estimateId?: string;
  onSave?: () => void;
  onCancel?: () => void;
  onConvertToInvoice?: (estimateData: EstimateFormData) => void;
  onDownloadPDF?: (estimateData: EstimateFormData) => void;
}

export const EstimateForm: React.FC<EstimateFormProps> = ({
  mode,
  estimateId,
  onSave,
  onCancel,
  onConvertToInvoice,
  onDownloadPDF
}) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const alertRef = React.useRef<HTMLDivElement>(null);
  const [showCreateProjectOption, setShowCreateProjectOption] = useState(false);
  
  const [formData, setFormData] = useState<EstimateFormData>({
    estimateNumber: '',
    projectId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    projectDescription: '',
    lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    validUntil: '',
    notes: '',
    status: 'draft'
  });

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  // Load data on component mount
  useEffect(() => {
    if (isCreating) {
      generateEstimateNumber();
      setDefaultValidUntil();
    } else if (estimateId) {
      loadEstimate();
    }
    loadProjects();
  }, [mode, estimateId]);

  // Scroll to alert when it appears
  useEffect(() => {
    if (alert && alertRef.current) {
      alertRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      alertRef.current.focus();
    }
  }, [alert]);

  const loadEstimate = async () => {
    if (!estimateId) return;
    
    try {
      setLoading(true);
      const estimate = await getEstimateById(estimateId);
      if (estimate) {
        setFormData({
          estimateNumber: estimate.estimateNumber,
          projectId: estimate.projectId || '',
          customerName: estimate.customerName,
          customerEmail: estimate.customerEmail,
          customerPhone: estimate.customerPhone,
          projectDescription: estimate.projectDescription || '',
          lineItems: estimate.lineItems || [],
          subtotal: estimate.subtotal,
          discount: estimate.discount,
          tax: estimate.tax,
          total: estimate.total,
          validUntil: estimate.validUntil,
          notes: estimate.notes || '',
          status: estimate.status
        });
      }
    } catch (error) {
      console.error('Error loading estimate:', error);
      setAlert({ type: 'error', message: 'Failed to load estimate. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const generateEstimateNumber = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const estimateNumber = await generateEstimateNumberFromDB(currentYear);
      setFormData(prev => ({
        ...prev,
        estimateNumber
      }));
    } catch (error) {
      console.error('Error generating estimate number:', error);
      setAlert({ type: 'error', message: 'Failed to generate estimate number. Please try again.' });
    }
  };

  const loadProjects = async () => {
    try {
      const result = await getProjects();
      if (result.success) {
        setProjects(result.data || []);
      } else {
        console.error('Error loading projects:', result.error);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const setDefaultValidUntil = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      validUntil: thirtyDaysFromNow.toISOString().split('T')[0]
    }));
  };

  const handleProjectSelection = (projectId: string) => {
    if (isReadOnly) return;
    
    const selectedProject = projects.find(p => p.id === projectId);
    if (selectedProject) {
      setFormData(prev => ({
        ...prev,
        projectId,
        customerName: selectedProject.customer_name,
        customerEmail: selectedProject.customer_email,
        customerPhone: selectedProject.customer_phone
      }));
      setShowCreateProjectOption(false);
    } else {
      setFormData(prev => ({
        ...prev,
        projectId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: ''
      }));
      setShowCreateProjectOption(true);
    }
  };

  const addLineItem = () => {
    if (isReadOnly) return;
    
    const newId = (formData.lineItems.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeLineItem = (id: string) => {
    if (isReadOnly || formData.lineItems.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
    setTimeout(calculateTotals, 0);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    if (isReadOnly) return;
    
    setFormData(prev => {
      const updatedItems = prev.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prev, lineItems: updatedItems };
    });
    setTimeout(calculateTotals, 0);
  };

  const calculateTotals = () => {
    setFormData(prev => {
      const subtotal = prev.lineItems.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = (subtotal * prev.discount) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * prev.tax) / 100;
      const total = taxableAmount + taxAmount;

      return {
        ...prev,
        subtotal,
        total
      };
    });
  };

  const handleDiscountChange = (value: number) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, discount: value }));
    setTimeout(calculateTotals, 0);
  };

  const handleTaxChange = (value: number) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, tax: value }));
    setTimeout(calculateTotals, 0);
  };

  const saveEstimate = async (status: 'draft' | 'sent' = 'draft') => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.customerName.trim()) {
        setAlert({ type: 'error', message: 'Customer name is required.' });
        setLoading(false);
        return;
      }

      if (formData.lineItems.length === 0 || !formData.lineItems.some(item => item.description.trim())) {
        setAlert({ type: 'error', message: 'At least one line item with description is required.' });
        setLoading(false);
        return;
      }

      // Prepare estimate data for Firebase
      const estimateData = {
        projectId: formData.projectId || null,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        projectDescription: formData.projectDescription.trim(),
        lineItems: formData.lineItems.filter(item => item.description.trim()),
        subtotal: formData.subtotal,
        discount: formData.discount,
        tax: formData.tax,
        total: formData.total,
        validUntil: formData.validUntil,
        notes: formData.notes.trim(),
        status
      };
      
      if (isEditing && estimateId) {
        // Update existing estimate
        await updateEstimate(estimateId, estimateData);
        setAlert({ 
          type: 'success', 
          message: `Estimate ${formData.estimateNumber} updated successfully!` 
        });
      } else {
        // Create new estimate
        await createEstimate(estimateData);
        setAlert({ 
          type: 'success', 
          message: `Estimate ${formData.estimateNumber} ${status === 'draft' ? 'saved as draft' : 'created'} successfully!` 
        });
      }
      
      // Call onSave callback
      if (onSave) {
        setTimeout(() => {
          onSave();
        }, 1500);
      }
      
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save estimate. Please try again.' });
      console.error('Error saving estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Estimate';
      case 'edit': return `Edit Estimate ${formData.estimateNumber}`;
      case 'view': return `View Estimate ${formData.estimateNumber}`;
      default: return 'Estimate';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'create': return <FileText className="w-6 h-6 text-blue-600" />;
      case 'edit': return <EditIcon className="w-6 h-6 text-orange-600" />;
      case 'view': return <Eye className="w-6 h-6 text-green-600" />;
      default: return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  const projectOptions = [
    { value: '', label: 'Independent Estimate (No Project)' },
    ...projects.map(project => ({ value: project.id, label: project.name }))
  ];

  if (loading && (isEditing || mode === 'view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getIcon()}
          <h1 className="text-2xl font-semibold text-gray-900">{getTitle()}</h1>
        </div>
        
        {/* View mode action buttons */}
        {isReadOnly && (
          <div className="flex items-center gap-3">
            {onDownloadPDF && (
              <LoadingButton
                onClick={() => onDownloadPDF(formData)}
                variant="secondary"
                icon={Download}
              >
                Download PDF
              </LoadingButton>
            )}
            
            {formData.status === 'approved' && onConvertToInvoice && (
              <LoadingButton
                onClick={() => onConvertToInvoice(formData)}
                icon={CreditCard}
              >
                Convert to Invoice
              </LoadingButton>
            )}
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>

      {alert && (
        <div ref={alertRef} tabIndex={-1} className="mb-6">
          <Alert type={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); saveEstimate('draft'); }} className="space-y-6">
        {/* Estimate Number and Project Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Estimate Number" required>
            <InputField
              value={formData.estimateNumber}
              disabled
              className="bg-gray-50"
            />
          </FormField>

          <FormField label="Project">
            <SelectField
              value={formData.projectId}
              onChange={(e) => handleProjectSelection(e.target.value)}
              options={projectOptions}
              placeholder="Select a project or create independent estimate"
              disabled={isReadOnly}
            />
          </FormField>
        </div>

        {/* Status (for edit/view modes) */}
        {!isCreating && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Status">
              <SelectField
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'expired', label: 'Expired' }
                ]}
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        )}

        {/* Customer Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
          
          {/* Show project creation option for independent estimates */}
          {!isReadOnly && showCreateProjectOption && formData.customerName && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 mb-2">
                This appears to be a recurring customer. Would you like to create a new project for better organization?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    setAlert({ type: 'warning', message: 'Project creation will be available in the next update!' });
                  }}
                >
                  Create New Project
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={() => setShowCreateProjectOption(false)}
                >
                  Continue as Independent
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Customer Name" required>
              <InputField
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="Email">
              <InputField
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="customer@email.com"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label="Phone">
              <InputField
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(555) 123-4567"
                disabled={isReadOnly}
              />
            </FormField>
          </div>
        </div>

        {/* Project Description */}
        <div className="border-t pt-6">
          <FormField label="Project Description">
            <textarea
              value={formData.projectDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
              placeholder="Describe the work to be performed..."
              rows={3}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            />
          </FormField>
        </div>

        {/* Line Items */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            )}
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-3 items-center mb-2 text-sm font-medium text-gray-700">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-2">Total</div>
            {!isReadOnly && <div className="col-span-1">Actions</div>}
          </div>

          <div className="space-y-3">
            {formData.lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-5">
                  <InputField
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Description of work/materials"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="col-span-2">
                  <InputField
                    type="number"
                    value={item.quantity.toString()}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="Qty"
                    min="0"
                    step="0.01"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="col-span-2">
                  <InputField
                    type="number"
                    value={item.unitPrice.toString()}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="col-span-2">
                  <InputField
                    value={`$${item.total.toFixed(2)}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                {!isReadOnly && (
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={formData.lineItems.length === 1}
                      className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-6">
          <div className="flex justify-end">
            <div className="w-full max-w-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <label className="text-gray-600">Discount (%):</label>
                <div className="w-24">
                  <InputField
                    type="number"
                    value={formData.discount.toString()}
                    onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center gap-4">
                <label className="text-gray-600">Tax (%):</label>
                <div className="w-24">
                  <InputField
                    type="number"
                    value={formData.tax.toString()}
                    onChange={(e) => handleTaxChange(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${formData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Valid Until and Notes */}
        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Valid Until" required>
            <InputField
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              disabled={isReadOnly}
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for this estimate..."
              rows={3}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            />
          </FormField>
        </div>

        {/* Actions */}
        {!isReadOnly && (
          <div className="border-t pt-6 flex justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            
            <LoadingButton
              type="button"
              variant="secondary"
              onClick={() => saveEstimate('draft')}
              loading={loading}
              icon={Save}
            >
              Save as Draft
            </LoadingButton>
            
            <LoadingButton
              type="submit"
              loading={loading}
              icon={isEditing ? Save : Calculator}
            >
              {isEditing ? 'Update Estimate' : 'Create Estimate'}
            </LoadingButton>
          </div>
        )}
      </form>
    </div>
  );
};