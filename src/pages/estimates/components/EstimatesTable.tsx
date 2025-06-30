import React from 'react';
import { Calendar, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Eye, Edit, Trash2, Download, CreditCard } from 'lucide-react';

export interface Estimate {
  id: number;
  estimateNumber: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  projectName: string;
  description: string;
  status: 'Draft' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired';
  createdDate: string;
  validUntil: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  lineItems: LineItem[];
  notes?: string;
}

export interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

interface EstimatesTableProps {
  estimates: Estimate[];
  onEditEstimate: (estimate: Estimate) => void;
  onDeleteEstimate: (estimateId: number) => void;
  onViewEstimate: (estimate: Estimate) => void;
  onConvertToInvoice: (estimate: Estimate) => void;
  onDownloadPDF: (estimate: Estimate) => void;
}

const EstimatesTable: React.FC<EstimatesTableProps> = ({
  estimates,
  onEditEstimate,
  onDeleteEstimate,
  onViewEstimate,
  onConvertToInvoice,
  onDownloadPDF
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Draft':
        return { color: 'bg-gray-100 text-gray-800', icon: FileText };
      case 'Pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'Under Review':
        return { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
      case 'Approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'Rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'Expired':
        return { color: 'bg-gray-100 text-gray-800', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText };
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const canConvertToInvoice = (status: string) => {
    return status === 'Approved';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">All Estimates</h2>
        <p className="text-sm text-gray-600 mt-1">{estimates.length} total estimates</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estimates.map((estimate) => {
              const statusConfig = getStatusConfig(estimate.status);
              const StatusIcon = statusConfig.icon;
              const expired = isExpired(estimate.validUntil);
              
              return (
                <tr key={estimate.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{estimate.estimateNumber}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Created: {estimate.createdDate}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {estimate.lineItems.length} line items
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{estimate.client}</div>
                      <div className="text-sm text-gray-500">{estimate.clientEmail}</div>
                      <div className="text-xs text-gray-400">{estimate.clientPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <div className="font-medium truncate">{estimate.projectName}</div>
                      {estimate.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {estimate.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {estimate.status}
                      </span>
                      {expired && estimate.status !== 'Approved' && estimate.status !== 'Rejected' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Expired
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ${estimate.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Subtotal: ${estimate.subtotal.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tax: ${estimate.taxAmount.toLocaleString()} ({(estimate.taxRate * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${expired ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {estimate.validUntil}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewEstimate(estimate)}
                        className="text-gray-400 hover:text-orange-600 transition-colors"
                        title="View Estimate"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditEstimate(estimate)}
                        className="text-gray-400 hover:text-orange-600 transition-colors"
                        title="Edit Estimate"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDownloadPDF(estimate)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {canConvertToInvoice(estimate.status) && (
                        <button
                          onClick={() => onConvertToInvoice(estimate)}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="Convert to Invoice"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteEstimate(estimate.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Estimate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstimatesTable;