'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/utils/format';
import { deleteTransaction } from '@/utils/api';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '@/context/ToastContext';

export default function TransactionItem({ 
  transaction, 
  showDate = true,
  linkToDetail = true,
  onDelete = null
}) {
  const router = useRouter();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    id,
    transaction_date,
    amount,
    narration,
    transaction_type,
    debit_ledger_name,
    credit_ledger_name,
    debit_ledger_type,
    credit_ledger_type
  } = transaction;
  
  // Get transaction type details
  const getTypeDetails = (type) => {
    switch (type) {
      case 'Receipt':
        return {
          icon: 'fa-arrow-down',
          color: 'bg-green-50 text-green-600',
          mainAccount: credit_ledger_name,
          counterAccount: debit_ledger_name,
          description: `To ${debit_ledger_name}`
        };
      case 'Payment':
        return {
          icon: 'fa-arrow-up',
          color: 'bg-red-50 text-red-600',
          mainAccount: debit_ledger_name,
          counterAccount: credit_ledger_name,
          description: `From ${credit_ledger_name}`
        };
      case 'Contra':
        return {
          icon: 'fa-right-left',
          color: 'bg-blue-50 text-blue-600',
          mainAccount: credit_ledger_name,
          counterAccount: debit_ledger_name,
          description: `${credit_ledger_name} ↔ ${debit_ledger_name}`
        };
      case 'Journal':
        return {
          icon: 'fa-pen',
          color: 'bg-purple-50 text-purple-600',
          mainAccount: debit_ledger_name,
          counterAccount: credit_ledger_name,
          description: `${debit_ledger_name} / ${credit_ledger_name}`
        };
      default:
        return {
          icon: 'fa-circle',
          color: 'bg-gray-50 text-gray-600',
          mainAccount: debit_ledger_name,
          counterAccount: credit_ledger_name,
          description: `${debit_ledger_name} / ${credit_ledger_name}`
        };
    }
  };
  
  const typeDetails = getTypeDetails(transaction_type);
  
  // Handle edit transaction
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/transactions/${id}/edit`);
  };
  
  // Show delete confirmation dialog
  const showDeleteConfirmation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  
  // Handle delete transaction
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction(id);
      
      // Close dialog
      setShowDeleteDialog(false);
      
      // Show success toast
      toast.success('Transaction deleted successfully');
      
      // Call onDelete callback if provided
      if (onDelete && typeof onDelete === 'function') {
        onDelete(id);
      } else {
        // Reload the page if no callback is provided
        window.location.reload();
      }
    } catch (error) {
      toast.error(`Failed to delete transaction: ${error.message || 'Unknown error'}`);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  const content = (
    <div className="flex items-start justify-between p-3 border-b group">
      <div className="flex items-start">
        <div className={`rounded-full ${typeDetails.color} w-10 h-10 flex items-center justify-center mr-3 mt-1`}>
          <i className={`fa-solid ${typeDetails.icon}`}></i>
        </div>
        
        <div>
          <h3 className="font-medium">{narration || typeDetails.description}</h3>
          
          <p className="text-gray-500 text-xs">
            <span className="inline-block">{typeDetails.description}</span>
            {showDate && (
              <span className="mx-1">•</span>
            )}
            {showDate && (
              <span className="inline-block">{formatDate(transaction_date, 'short')}</span>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="text-right mr-3">
          <p className="font-semibold">{formatCurrency(amount)}</p>
          <p className="text-gray-500 text-xs capitalize">{transaction_type.toLowerCase()}</p>
        </div>
        
        {/* Action buttons - only show on hover */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleEdit}
            className="text-gray-500 hover:text-blue-600 p-1"
            title="Edit"
            disabled={isDeleting}
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            onClick={showDeleteConfirmation}
            className="text-gray-500 hover:text-red-600 p-1 ml-1"
            title="Delete"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-trash"></i>
            )}
          </button>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={
          <div>
            <p>Are you sure you want to delete this transaction?</p>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(transaction_date, 'full')}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{transaction_type.toLowerCase()}</span>
              </div>
            </div>
            <p className="mt-3 text-red-600 text-xs">
              <i className="fa-solid fa-triangle-exclamation mr-1"></i>
              This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon="fa-trash"
        iconClass="text-red-500"
        isLoading={isDeleting}
      />
    </div>
  );
  
  if (linkToDetail) {
    return (
      <Link 
        href={`/transactions/${id}`}
        className="block focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors"
      >
        {content}
      </Link>
    );
  }
  
  return content;
} 