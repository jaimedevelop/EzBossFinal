import React, { useState, useMemo } from 'react';
import EstimatesHeader from './components/EstimatesHeader';
import EstimatesStats from './components/EstimatesStats';
import EstimatesSearchFilter from './components/EstimatesSearchFilter';
import EstimatesTable, { Estimate } from './components/EstimatesTable';
import EstimateModal from './components/EstimateModal';

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: 1,
      estimateNumber: 'EST-2025-001',
      client: 'Green Valley Homes',
      clientEmail: 'contact@greenvalley.com',
      clientPhone: '+1 (555) 123-4567',
      projectName: 'Residential Complex Phase 2',
      description: 'Construction of 24-unit residential complex with modern amenities',
      status: 'Pending',
      createdDate: '2025-01-10',
      validUntil: '2025-02-10',
      subtotal: 425000,
      taxRate: 0.085,
      taxAmount: 36125,
      total: 461125,
      lineItems: [
        { id: 1, description: 'Foundation and excavation', quantity: 1, unitPrice: 85000, total: 85000 },
        { id: 2, description: 'Framing and structural work', quantity: 1, unitPrice: 120000, total: 120000 },
        { id: 3, description: 'Electrical installation', quantity: 1, unitPrice: 65000, total: 65000 },
        { id: 4, description: 'Plumbing installation', quantity: 1, unitPrice: 55000, total: 55000 },
        { id: 5, description: 'HVAC system installation', quantity: 1, unitPrice: 45000, total: 45000 },
        { id: 6, description: 'Interior finishing', quantity: 1, unitPrice: 55000, total: 55000 }
      ],
      notes: 'Price valid for 30 days. Materials subject to availability.'
    },
    {
      id: 2,
      estimateNumber: 'EST-2025-002',
      client: 'Metro Business Solutions',
      clientEmail: 'projects@metrobiz.com',
      clientPhone: '+1 (555) 234-5678',
      projectName: 'Office Building Renovation',
      description: 'Complete renovation of 5-story office building including modernization',
      status: 'Approved',
      createdDate: '2025-01-08',
      validUntil: '2025-02-08',
      subtotal: 180000,
      taxRate: 0.085,
      taxAmount: 15300,
      total: 195300,
      lineItems: [
        { id: 1, description: 'Demolition and cleanup', quantity: 1, unitPrice: 25000, total: 25000 },
        { id: 2, description: 'Electrical system upgrade', quantity: 1, unitPrice: 45000, total: 45000 },
        { id: 3, description: 'HVAC modernization', quantity: 1, unitPrice: 55000, total: 55000 },
        { id: 4, description: 'Flooring installation', quantity: 5000, unitPrice: 8, total: 40000 },
        { id: 5, description: 'Painting and finishing', quantity: 1, unitPrice: 15000, total: 15000 }
      ]
    },
    {
      id: 3,
      estimateNumber: 'EST-2025-003',
      client: 'Sunset Retail Group',
      clientEmail: 'development@sunsetretail.com',
      clientPhone: '+1 (555) 345-6789',
      projectName: 'Shopping Center Expansion',
      description: 'Expansion of existing shopping center with additional retail spaces',
      status: 'Under Review',
      createdDate: '2025-01-12',
      validUntil: '2025-02-12',
      subtotal: 750000,
      taxRate: 0.085,
      taxAmount: 63750,
      total: 813750,
      lineItems: [
        { id: 1, description: 'Site preparation and excavation', quantity: 1, unitPrice: 95000, total: 95000 },
        { id: 2, description: 'Steel frame construction', quantity: 1, unitPrice: 185000, total: 185000 },
        { id: 3, description: 'Roofing and waterproofing', quantity: 1, unitPrice: 85000, total: 85000 },
        { id: 4, description: 'Electrical and lighting', quantity: 1, unitPrice: 125000, total: 125000 },
        { id: 5, description: 'Plumbing and utilities', quantity: 1, unitPrice: 95000, total: 95000 },
        { id: 6, description: 'Interior build-out', quantity: 1, unitPrice: 165000, total: 165000 }
      ]
    },
    {
      id: 4,
      estimateNumber: 'EST-2025-004',
      client: 'Harbor Point LLC',
      clientEmail: 'construction@harborpoint.com',
      clientPhone: '+1 (555) 456-7890',
      projectName: 'Waterfront Condominiums',
      description: 'Luxury waterfront condominium development with marina access',
      status: 'Rejected',
      createdDate: '2025-01-05',
      validUntil: '2025-02-05',
      subtotal: 920000,
      taxRate: 0.085,
      taxAmount: 78200,
      total: 998200,
      lineItems: [
        { id: 1, description: 'Marine foundation work', quantity: 1, unitPrice: 150000, total: 150000 },
        { id: 2, description: 'Structural steel and concrete', quantity: 1, unitPrice: 285000, total: 285000 },
        { id: 3, description: 'Waterproofing and sealing', quantity: 1, unitPrice: 95000, total: 95000 },
        { id: 4, description: 'High-end electrical systems', quantity: 1, unitPrice: 125000, total: 125000 },
        { id: 5, description: 'Premium plumbing fixtures', quantity: 1, unitPrice: 85000, total: 85000 },
        { id: 6, description: 'Luxury interior finishes', quantity: 1, unitPrice: 180000, total: 180000 }
      ]
    },
    {
      id: 5,
      estimateNumber: 'EST-2025-005',
      client: 'Industrial Park Corp',
      clientEmail: 'projects@industrialpark.com',
      clientPhone: '+1 (555) 567-8901',
      projectName: 'Warehouse Complex',
      description: 'Multi-building warehouse complex with distribution facilities',
      status: 'Draft',
      createdDate: '2025-01-09',
      validUntil: '2025-02-09',
      subtotal: 650000,
      taxRate: 0.085,
      taxAmount: 55250,
      total: 705250,
      lineItems: [
        { id: 1, description: 'Site development and grading', quantity: 1, unitPrice: 85000, total: 85000 },
        { id: 2, description: 'Pre-engineered building systems', quantity: 3, unitPrice: 125000, total: 375000 },
        { id: 3, description: 'Loading dock construction', quantity: 8, unitPrice: 15000, total: 120000 },
        { id: 4, description: 'Industrial electrical systems', quantity: 1, unitPrice: 70000, total: 70000 }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('estimateNumber');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  // Calculate stats
  const stats = useMemo(() => {
    const totalEstimates = estimates.length;
    const pendingEstimates = estimates.filter(e => e.status === 'Pending' || e.status === 'Under Review').length;
    const approvedEstimates = estimates.filter(e => e.status === 'Approved').length;
    const totalValue = estimates.reduce((sum, e) => sum + e.total, 0);
    const averageValue = totalValue / totalEstimates;
    const conversionRate = totalEstimates > 0 ? Math.round((approvedEstimates / totalEstimates) * 100) : 0;

    return {
      totalEstimates,
      pendingEstimates,
      approvedEstimates,
      totalValue,
      averageValue,
      conversionRate
    };
  }, [estimates]);

  // Filter and sort estimates
  const filteredAndSortedEstimates = useMemo(() => {
    let filtered = estimates.filter(estimate => {
      const matchesSearch = searchTerm === '' || 
        estimate.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || estimate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort estimates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'estimateNumber':
          return a.estimateNumber.localeCompare(b.estimateNumber);
        case 'client':
          return a.client.localeCompare(b.client);
        case 'createdDate':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'validUntil':
          return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
        case 'total':
          return b.total - a.total;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [estimates, searchTerm, statusFilter, sortBy]);

  const handleNewEstimate = () => {
    setSelectedEstimate(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteEstimate = (estimateId: number) => {
    if (window.confirm('Are you sure you want to delete this estimate? This action cannot be undone.')) {
      setEstimates(prev => prev.filter(e => e.id !== estimateId));
    }
  };

  const handleSaveEstimate = (estimateData: Omit<Estimate, 'id'> | Estimate) => {
    if (modalMode === 'create') {
      const newEstimate: Estimate = {
        ...estimateData as Omit<Estimate, 'id'>,
        id: Math.max(...estimates.map(e => e.id), 0) + 1
      };
      setEstimates(prev => [...prev, newEstimate]);
    } else {
      const updatedEstimate = estimateData as Estimate;
      setEstimates(prev => prev.map(e => e.id === updatedEstimate.id ? updatedEstimate : e));
    }
  };

  const handleConvertToInvoice = (estimate: Estimate) => {
    // Placeholder for invoice conversion
    alert(`Converting estimate ${estimate.estimateNumber} to invoice. This feature will create a new invoice with the same line items and client information.`);
  };

  const handleDownloadPDF = (estimate: Estimate) => {
    // Placeholder for PDF generation
    alert(`Generating PDF for estimate ${estimate.estimateNumber}. This feature will create a professional PDF document with your company branding.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <EstimatesHeader onNewEstimate={handleNewEstimate} />

      {/* Stats */}
      <EstimatesStats stats={stats} />

      {/* Search and Filter */}
      <EstimatesSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Estimates Table */}
      <EstimatesTable
        estimates={filteredAndSortedEstimates}
        onEditEstimate={handleEditEstimate}
        onDeleteEstimate={handleDeleteEstimate}
        onViewEstimate={handleViewEstimate}
        onConvertToInvoice={handleConvertToInvoice}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Estimate Modal */}
      <EstimateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEstimate}
        estimate={selectedEstimate}
        mode={modalMode}
        onConvertToInvoice={handleConvertToInvoice}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};

export default Estimates;