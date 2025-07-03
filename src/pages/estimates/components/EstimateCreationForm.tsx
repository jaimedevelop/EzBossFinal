import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Save, FileText } from 'lucide-react';
import { FormField } from '../../../mainComponents/forms/FormField';
import { InputField } from '../../../mainComponents/forms/InputField';
import { SelectField } from '../../../mainComponents/forms/SelectField';
import { LoadingButton } from '../../../mainComponents/ui/LoadingButton';
import { Alert } from '../../../mainComponents/ui/Alert';
import { createEstimate, generateEstimateNumber as generateEstimateNumberFromDB } from '../../../firebase/estimates';
import { getAllProjects } from '../../../firebase/database';

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
}

export const EstimateCreationForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const alertRef = React.useRef<HTMLDivElement>(null);
  
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
    notes: ''
  });

  // Generate estimate number on component mount
  useEffect(() => {
    generateEstimateNumber();
    loadProjects();
    setDefaultValidUntil();
  }, []);

  // Scroll to alert when it appears
  useEffect(() => {
    if (alert && alertRef.current) {
      alertRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Optional: Focus on the alert for accessibility
      alertRef.current.focus();
    }
  }, [alert]);

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
        setAlert({ type: 'error', message: 'Failed to load projects. Please refresh the page.' });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setAlert({ type: 'error', message: 'Failed to load projects. Please refresh the page.' });
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

  const [showCreateProjectOption, setShowCreateProjectOption] = useState(false);

  const handleProjectSelection = (projectId: string) => {
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
      // Independent estimate - clear customer info and show project creation option
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
    const newId = (formData.lineItems.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeLineItem = (id: string) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter(item => item.id !== id)
      }));
      calculateTotals();
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData(prev => {
      const updatedItems = prev.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Calculate total for this line item
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prev, lineItems: updatedItems };
    });
    // Recalculate totals after a brief delay to allow state to update
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
    setFormData(prev => ({ ...prev, discount: value }));
    setTimeout(calculateTotals, 0);
  };

  const handleTaxChange = (value: number) => {
    setFormData(prev => ({ ...prev, tax: value }));
    setTimeout(calculateTotals, 0);
  };

  const resetForm = () => {
    setFormData({
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
      notes: ''
    });
    generateEstimateNumber();
    setDefaultValidUntil();
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
        lineItems: formData.lineItems.filter(item => item.description.trim()), // Remove empty line items
        subtotal: formData.subtotal,
        discount: formData.discount,
        tax: formData.tax,
        total: formData.total,
        validUntil: formData.validUntil,
        notes: formData.notes.trim(),
        status
      };
      
      // Create estimate in Firebase
      const estimateId = await createEstimate(estimateData);
      
      setAlert({ 
        type: 'success', 
        message: `Estimate ${formData.estimateNumber} ${status === 'draft' ? 'saved as draft' : 'created'} successfully!` 
      });
      
      // Optional: Reset form for new estimate
      if (status === 'sent') {
        setTimeout(() => {
          resetForm();
        }, 2000);
      }
      
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save estimate. Please try again.' });
      console.error('Error saving estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = [
    { value: '', label: 'Independent Estimate (No Project)' },
    ...projects.map(project => ({ value: project.id, label: project.name }))
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Create New Estimate</h1>
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

          <FormField label="Project" required>
            <SelectField
              value={formData.projectId}
              onChange={(value) => handleProjectSelection(value)}
              options={projectOptions}
              placeholder="Select a project or create independent estimate"
            />
          </FormField>
        </div>

        {/* Customer Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
          
          {/* Show project creation option for independent estimates */}
          {showCreateProjectOption && formData.customerName && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 mb-2">
                This appears to be a recurring customer. Would you like to create a new project for better organization?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    // TODO: Open project creation modal or navigate to project creation
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
                onChange={(value) => setFormData(prev => ({ ...prev, customerName: value }))}
                placeholder="Enter customer name"
              />
            </FormField>

            <FormField label="Email">
              <InputField
                type="email"
                value={formData.customerEmail}
                onChange={(value) => setFormData(prev => ({ ...prev, customerEmail: value }))}
                placeholder="customer@email.com"
              />
            </FormField>

            <FormField label="Phone">
              <InputField
                type="tel"
                value={formData.customerPhone}
                onChange={(value) => setFormData(prev => ({ ...prev, customerPhone: value }))}
                placeholder="(555) 123-4567"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>

        {/* Line Items */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-5">
                  <InputField
                    value={item.description}
                    onChange={(value) => updateLineItem(item.id, 'description', value)}
                    placeholder="Description of work/materials"
                  />
                </div>
                <div className="col-span-2">
                  <InputField
                    type="number"
                    value={item.quantity.toString()}
                    onChange={(value) => updateLineItem(item.id, 'quantity', parseFloat(value) || 0)}
                    placeholder="Qty"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <InputField
                    type="number"
                    value={item.unitPrice.toString()}
                    onChange={(value) => updateLineItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <InputField
                    value={`$${item.total.toFixed(2)}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
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
                    onChange={(value) => handleDiscountChange(parseFloat(value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center gap-4">
                <label className="text-gray-600">Tax (%):</label>
                <div className="w-24">
                  <InputField
                    type="number"
                    value={formData.tax.toString()}
                    onChange={(value) => handleTaxChange(parseFloat(value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
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
              onChange={(value) => setFormData(prev => ({ ...prev, validUntil: value }))}
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for this estimate..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="border-t pt-6 flex justify-end gap-3">
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
            icon={Calculator}
          >
            Create Estimate
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};