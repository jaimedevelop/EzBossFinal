import React, { useState, useMemo } from 'react';
import InventoryHeader from './components/InventoryHeader';
import InventoryStats from './components/InventoryStats';
import InventorySearchFilter from './components/InventorySearchFilter';
import InventoryTable, { InventoryProduct } from './components/InventoryTable';
import ProductModal from './components/ProductModal';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<InventoryProduct[]>([
    {
      id: 1,
      name: '3/4" Copper Pipe',
      sku: 'CU-PIPE-075',
      category: 'Plumbing',
      subcategory: 'Pipes',
      subsubcategory: 'Copper Pipes',
      type: 'Material',
      description: 'Type L copper pipe for water supply lines',
      unitPrice: 8.50,
      unit: 'linear ft',
      onHand: 250,
      assigned: 75,
      available: 175,
      minStock: 50,
      maxStock: 500,
      supplier: 'Metro Plumbing Supply',
      location: 'Warehouse A, Bay 3',
      lastUpdated: '2025-01-12'
    },
    {
      id: 2,
      name: 'DeWalt 20V Circular Saw',
      sku: 'DW-SAW-20V',
      category: 'Tools & Equipment',
      subcategory: 'Power Tools',
      subsubcategory: 'Saws',
      type: 'Tool',
      description: '7-1/4" cordless circular saw with brake',
      unitPrice: 299.99,
      unit: 'each',
      onHand: 8,
      assigned: 3,
      available: 5,
      minStock: 3,
      maxStock: 15,
      supplier: 'Tool Depot Pro',
      location: 'Tool Crib, Shelf B2',
      lastUpdated: '2025-01-10'
    },
    {
      id: 3,
      name: 'Portland Cement',
      sku: 'CEM-PORT-94',
      category: 'Concrete & Masonry',
      subcategory: 'Concrete',
      subsubcategory: 'Portland Cement',
      type: 'Material',
      description: 'Type I/II Portland cement, 94 lb bags',
      unitPrice: 12.75,
      unit: 'bag',
      onHand: 45,
      assigned: 20,
      available: 25,
      minStock: 20,
      maxStock: 100,
      supplier: 'BuildMart Supply',
      location: 'Yard Storage, Section C',
      lastUpdated: '2025-01-11'
    },
    {
      id: 4,
      name: 'Safety Hard Hat',
      sku: 'PPE-HAT-001',
      category: 'Safety & PPE',
      subcategory: 'Head Protection',
      subsubcategory: 'Hard Hats',
      type: 'Safety',
      description: 'ANSI Z89.1 Type I hard hat with 4-point suspension',
      unitPrice: 25.00,
      unit: 'each',
      onHand: 12,
      assigned: 8,
      available: 4,
      minStock: 15,
      maxStock: 50,
      supplier: 'Safety First Inc',
      location: 'Office Storage, Cabinet A',
      lastUpdated: '2025-01-09'
    },
    {
      id: 5,
      name: '2x10x12 Douglas Fir',
      sku: 'LUM-DF-2X10X12',
      category: 'Lumber & Building Materials',
      subcategory: 'Lumber',
      subsubcategory: 'Dimensional Lumber',
      type: 'Material',
      description: 'Kiln-dried Douglas Fir dimensional lumber',
      unitPrice: 28.50,
      unit: 'each',
      onHand: 85,
      assigned: 30,
      available: 55,
      minStock: 25,
      maxStock: 200,
      supplier: 'Pacific Lumber Co',
      location: 'Lumber Yard, Stack 5',
      lastUpdated: '2025-01-08'
    },
    {
      id: 6,
      name: 'Mini Excavator',
      sku: 'EQ-EXC-MINI',
      category: 'Tools & Equipment',
      subcategory: 'Heavy Equipment',
      subsubcategory: 'Excavators',
      type: 'Equipment',
      description: '3.5 ton mini excavator with rubber tracks',
      unitPrice: 45000.00,
      unit: 'each',
      onHand: 2,
      assigned: 1,
      available: 1,
      minStock: 1,
      maxStock: 3,
      supplier: 'Heavy Equipment Co',
      location: 'Equipment Yard, Bay 1',
      lastUpdated: '2025-01-07'
    },
    {
      id: 7,
      name: '12 AWG THHN Wire',
      sku: 'EL-WIRE-12AWG',
      category: 'Electrical',
      subcategory: 'Wiring',
      subsubcategory: 'THHN Wire',
      type: 'Material',
      description: '12 AWG THHN/THWN copper wire, 500ft roll',
      unitPrice: 125.00,
      unit: 'roll',
      onHand: 15,
      assigned: 5,
      available: 10,
      minStock: 8,
      maxStock: 30,
      supplier: 'Electrical Supply Co',
      location: 'Warehouse B, Rack 2',
      lastUpdated: '2025-01-06'
    },
    {
      id: 8,
      name: 'Fiberglass Insulation R-19',
      sku: 'INS-FG-R19',
      category: 'Lumber & Building Materials',
      subcategory: 'Insulation',
      subsubcategory: 'Fiberglass',
      type: 'Material',
      description: '6.25" x 15" x 93" fiberglass batt insulation',
      unitPrice: 1.25,
      unit: 'sq ft',
      onHand: 2400,
      assigned: 800,
      available: 1600,
      minStock: 500,
      maxStock: 5000,
      supplier: 'Insulation Plus',
      location: 'Warehouse C, Section 1',
      lastUpdated: '2025-01-05'
    },
    {
      id: 9,
      name: 'Concrete Mixer',
      sku: 'EQ-MIX-9CF',
      category: 'Tools & Equipment',
      subcategory: 'Heavy Equipment',
      subsubcategory: 'Mixers',
      type: 'Rental',
      description: '9 cubic foot towable concrete mixer',
      unitPrice: 2500.00,
      unit: 'each',
      onHand: 3,
      assigned: 2,
      available: 1,
      minStock: 1,
      maxStock: 5,
      supplier: 'Equipment Rental Co',
      location: 'Equipment Yard, Bay 3',
      lastUpdated: '2025-01-04'
    },
    {
      id: 10,
      name: 'Wood Screws #8 x 2.5"',
      sku: 'HW-SCR-W8X25',
      category: 'Hardware & Fasteners',
      subcategory: 'Screws',
      subsubcategory: 'Wood Screws',
      type: 'Consumable',
      description: 'Phillips head wood screws, zinc plated, 1 lb box',
      unitPrice: 8.99,
      unit: 'box',
      onHand: 48,
      assigned: 12,
      available: 36,
      minStock: 20,
      maxStock: 100,
      supplier: 'Fastener World',
      location: 'Hardware Storage, Bin 15',
      lastUpdated: '2025-01-03'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.onHand <= p.minStock).length;
    const totalValue = products.reduce((sum, p) => sum + (p.onHand * p.unitPrice), 0);
    const categories = new Set(products.map(p => p.category)).size;
    const totalOnHand = products.reduce((sum, p) => sum + p.onHand, 0);
    const totalAssigned = products.reduce((sum, p) => sum + p.assigned, 0);

    return {
      totalProducts,
      lowStockItems,
      totalValue,
      categories,
      totalOnHand,
      totalAssigned
    };
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
      const matchesType = typeFilter === '' || product.type === typeFilter;
      
      let matchesStock = true;
      if (stockFilter === 'In Stock') {
        matchesStock = product.onHand > product.minStock;
      } else if (stockFilter === 'Low Stock') {
        matchesStock = product.onHand <= product.minStock && product.onHand > 0;
      } else if (stockFilter === 'Out of Stock') {
        matchesStock = product.onHand === 0;
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'stock':
          return b.onHand - a.onHand;
        case 'value':
          return (b.onHand * b.unitPrice) - (a.onHand * a.unitPrice);
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, typeFilter, stockFilter, sortBy]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewProduct = (product: InventoryProduct) => {
    // For now, just edit - could implement a read-only view later
    handleEditProduct(product);
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleSaveProduct = (productData: Omit<InventoryProduct, 'id'> | InventoryProduct) => {
    if (modalMode === 'create') {
      const newProduct: InventoryProduct = {
        ...productData as Omit<InventoryProduct, 'id'>,
        id: Math.max(...products.map(p => p.id), 0) + 1
      };
      setProducts(prev => [...prev, newProduct]);
    } else {
      const updatedProduct = productData as InventoryProduct;
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <InventoryHeader onAddProduct={handleAddProduct} />

      {/* Stats */}
      <InventoryStats stats={stats} />

      {/* Search and Filter */}
      <InventorySearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Products Table */}
      <InventoryTable
        products={filteredAndSortedProducts}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onViewProduct={handleViewProduct}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        mode={modalMode}
      />
    </div>
  );
};

export default Inventory;