import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { InventoryProduct } from './InventoryTable';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<InventoryProduct, 'id'> | InventoryProduct) => void;
  product?: InventoryProduct | null;
  mode: 'create' | 'edit';
}

interface FormData {
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  subsubcategory: string;
  type: 'Material' | 'Tool' | 'Equipment' | 'Rental' | 'Consumable' | 'Safety';
  description: string;
  unitPrice: string;
  unit: string;
  onHand: string;
  assigned: string;
  minStock: string;
  maxStock: string;
  supplier: string;
  location: string;
}

interface FormErrors {
  [key: string]: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  mode
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    subsubcategory: '',
    type: 'Material',
    description: '',
    unitPrice: '',
    unit: '',
    onHand: '',
    assigned: '0',
    minStock: '',
    maxStock: '',
    supplier: '',
    location: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = {
    'Plumbing': {
      'Pipes': ['Copper Pipes', 'PVC Pipes', 'PEX Pipes', 'Steel Pipes'],
      'Fittings': ['Elbows', 'Tees', 'Couplings', 'Reducers'],
      'Fixtures': ['Sinks', 'Toilets', 'Faucets', 'Showers'],
      'Valves': ['Ball Valves', 'Gate Valves', 'Check Valves']
    },
    'Electrical': {
      'Wiring': ['Romex Cable', 'THHN Wire', 'Coaxial Cable', 'Ethernet Cable'],
      'Conduit': ['EMT Conduit', 'PVC Conduit', 'Flexible Conduit'],
      'Fixtures': ['Light Fixtures', 'Outlets', 'Switches', 'Junction Boxes'],
      'Components': ['Breakers', 'Panels', 'Transformers']
    },
    'HVAC': {
      'Ductwork': ['Galvanized Ducts', 'Flexible Ducts', 'Insulated Ducts'],
      'Equipment': ['Furnaces', 'Air Conditioners', 'Heat Pumps', 'Thermostats'],
      'Filters': ['HEPA Filters', 'Pleated Filters', 'Washable Filters'],
      'Refrigerants': ['R-410A', 'R-22', 'R-134A']
    },
    'Concrete & Masonry': {
      'Concrete': ['Portland Cement', 'Ready Mix', 'Concrete Blocks'],
      'Masonry': ['Bricks', 'Stone', 'Mortar', 'Grout'],
      'Reinforcement': ['Rebar', 'Wire Mesh', 'Fiber Mesh'],
      'Tools': ['Mixers', 'Screeds', 'Floats']
    },
    'Lumber & Building Materials': {
      'Lumber': ['Dimensional Lumber', 'Plywood', 'OSB', 'Engineered Lumber'],
      'Insulation': ['Fiberglass', 'Foam Board', 'Spray Foam', 'Cellulose'],
      'Drywall': ['Standard Drywall', 'Moisture Resistant', 'Fire Resistant'],
      'Roofing': ['Shingles', 'Metal Roofing', 'Underlayment', 'Flashing']
    },
    'Tools & Equipment': {
      'Hand Tools': ['Hammers', 'Screwdrivers', 'Wrenches', 'Pliers'],
      'Power Tools': ['Drills', 'Saws', 'Sanders', 'Grinders'],
      'Heavy Equipment': ['Excavators', 'Bulldozers', 'Cranes', 'Loaders'],
      'Measuring': ['Levels', 'Tape Measures', 'Laser Levels']
    },
    'Safety & PPE': {
      'Head Protection': ['Hard Hats', 'Bump Caps', 'Face Shields'],
      'Eye Protection': ['Safety Glasses', 'Goggles', 'Welding Masks'],
      'Respiratory': ['Dust Masks', 'Respirators', 'Gas Masks'],
      'Body Protection': ['Safety Vests', 'Coveralls', 'Gloves', 'Boots']
    },
    'Hardware & Fasteners': {
      'Screws': ['Wood Screws', 'Metal Screws', 'Drywall Screws'],
      'Nails': ['Common Nails', 'Finish Nails', 'Roofing Nails'],
      'Bolts': ['Hex Bolts', 'Carriage Bolts', 'Anchor Bolts'],
      'Adhesives': ['Construction Adhesive', 'Wood Glue', 'Epoxy']
    }
  };

  const units = [
    'each', 'box', 'bag', 'roll', 'sheet', 'linear ft', 'sq ft', 'cubic ft',
    'gallon', 'quart', 'pound', 'ton', 'bundle', 'case', 'pallet'
  ];

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory || '',
        type: product.type,
        description: product.description,
        unitPrice: product.unitPrice.toString(),
        unit: product.unit,
        onHand: product.onHand.toString(),
        assigned: product.assigned.toString(),
        minStock: product.minStock.toString(),
        maxStock: product.maxStock.toString(),
        supplier: product.supplier,
        location: product.location
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        sku: '',
        category: '',
        subcategory: '',
        subsubcategory: '',
        type: 'Material',
        description: '',
        unitPrice: '',
        unit: '',
        onHand: '',
        assigned: '0',
        minStock: '',
        maxStock: '',
        supplier: '',
        location: ''
      });
    }
    setErrors({});
  }, [product, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.subcategory) newErrors.subcategory = 'Subcategory is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    // Numeric validation
    if (!formData.unitPrice.trim()) {
      newErrors.unitPrice = 'Unit price is required';
    } else if (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0) {
      newErrors.unitPrice = 'Please enter a valid price';
    }

    if (!formData.onHand.trim()) {
      newErrors.onHand = 'On hand quantity is required';
    } else if (isNaN(Number(formData.onHand)) || Number(formData.onHand) < 0) {
      newErrors.onHand = 'Please enter a valid quantity';
    }

    if (formData.assigned && (isNaN(Number(formData.assigned)) || Number(formData.assigned) < 0)) {
      newErrors.assigned = 'Please enter a valid assigned quantity';
    }

    if (!formData.minStock.trim()) {
      newErrors.minStock = 'Minimum stock is required';
    } else if (isNaN(Number(formData.minStock)) || Number(formData.minStock) < 0) {
      newErrors.minStock = 'Please enter a valid minimum stock';
    }

    if (!formData.maxStock.trim()) {
      newErrors.maxStock = 'Maximum stock is required';
    } else if (isNaN(Number(formData.maxStock)) || Number(formData.maxStock) < 0) {
      newErrors.maxStock = 'Please enter a valid maximum stock';
    }

    // Stock logic validation
    if (formData.minStock && formData.maxStock) {
      const minStock = Number(formData.minStock);
      const maxStock = Number(formData.maxStock);
      if (maxStock <= minStock) {
        newErrors.maxStock = 'Maximum stock must be greater than minimum stock';
      }
    }

    if (formData.onHand && formData.assigned) {
      const onHand = Number(formData.onHand);
      const assigned = Number(formData.assigned);
      if (assigned > onHand) {
        newErrors.assigned = 'Assigned quantity cannot exceed on hand quantity';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const onHand = Number(formData.onHand);
      const assigned = Number(formData.assigned);
      const available = onHand - assigned;

      const productData = {
        ...formData,
        unitPrice: Number(formData.unitPrice),
        onHand,
        assigned,
        available,
        minStock: Number(formData.minStock),
        maxStock: Number(formData.maxStock),
        lastUpdated: new Date().toISOString().split('T')[0],
        ...(mode === 'edit' && product ? { id: product.id } : {})
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSubcategories = () => {
    return formData.category ? Object.keys(categories[formData.category as keyof typeof categories] || {}) : [];
  };

  const getSubsubcategories = () => {
    if (!formData.category || !formData.subcategory) return [];
    const categoryData = categories[formData.category as keyof typeof categories];
    return categoryData ? categoryData[formData.subcategory as keyof typeof categoryData] || [] : [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              {mode === 'create' ? 'Add New Product' : 'Edit Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.sku ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter SKU"
                />
                {errors.sku && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.sku}
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    handleInputChange('category', e.target.value);
                    handleInputChange('subcategory', '');
                    handleInputChange('subsubcategory', '');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {Object.keys(categories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.category}
                  </div>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => {
                    handleInputChange('subcategory', e.target.value);
                    handleInputChange('subsubcategory', '');
                  }}
                  disabled={!formData.category}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.subcategory ? 'border-red-300' : 'border-gray-300'
                  } ${!formData.category ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Select subcategory</option>
                  {getSubcategories().map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.subcategory}
                  </div>
                )}
              </div>

              {/* Sub-subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-subcategory
                </label>
                <select
                  value={formData.subsubcategory}
                  onChange={(e) => handleInputChange('subsubcategory', e.target.value)}
                  disabled={!formData.subcategory}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    !formData.subcategory ? 'bg-gray-100' : ''
                  }`}
                >
                  <option value="">Select sub-subcategory</option>
                  {getSubsubcategories().map((subsubcategory) => (
                    <option key={subsubcategory} value={subsubcategory}>
                      {subsubcategory}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                >
                  <option value="Material">Material</option>
                  <option value="Tool">Tool</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Rental">Rental</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Enter product description"
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.unitPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  min="0"
                />
                {errors.unitPrice && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.unitPrice}
                  </div>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.unit ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.unit}
                  </div>
                )}
              </div>

              {/* On Hand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  On Hand Quantity *
                </label>
                <input
                  type="number"
                  value={formData.onHand}
                  onChange={(e) => handleInputChange('onHand', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.onHand ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.onHand && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.onHand}
                  </div>
                )}
              </div>

              {/* Assigned */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Quantity
                </label>
                <input
                  type="number"
                  value={formData.assigned}
                  onChange={(e) => handleInputChange('assigned', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.assigned ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.assigned && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.assigned}
                  </div>
                )}
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock *
                </label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.minStock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.minStock && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.minStock}
                  </div>
                )}
              </div>

              {/* Max Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock *
                </label>
                <input
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => handleInputChange('maxStock', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.maxStock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.maxStock && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.maxStock}
                  </div>
                )}
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.supplier ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter supplier name"
                />
                {errors.supplier && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.supplier}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Warehouse A, Shelf 3"
                />
                {errors.location && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.location}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Product' : 'Update Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;