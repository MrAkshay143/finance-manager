'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTransaction, getLedgers } from '@/utils/api';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Form from '@/components/Form';
import { useToast } from '@/context/ToastContext';

export default function PaymentTransactionPage() {
  const router = useRouter();
  const toast = useToast();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    ledgersLoaded: 0,
    bankCashCount: 0,
    expenseCount: 0
  });
  
  // Get all ledgers on mount
  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        setLoading(true);
        const response = await getLedgers();
        if (response && Array.isArray(response)) {
          setLedgers(response);
          
          // Debug info
          setDebugInfo({
            ledgersLoaded: response.length,
            bankCashCount: response.filter(l => l.group_type === 'bank' || l.group_type === 'cash').length,
            expenseCount: response.filter(l => l.group_type === 'expense').length
          });
        } else if (response && response.data) {
          setLedgers(response.data);
          
          // Debug info
          setDebugInfo({
            ledgersLoaded: response.data.length,
            bankCashCount: response.data.filter(l => l.group_type === 'bank' || l.group_type === 'cash').length,
            expenseCount: response.data.filter(l => l.group_type === 'expense').length
          });
        } else {
          // No ledgers found
          setDebugInfo({
            ledgersLoaded: 0,
            bankCashCount: 0,
            expenseCount: 0
          });
          toast.error('No ledgers found or invalid response format');
        }
      } catch (err) {
        console.error('Error fetching ledgers:', err);
        toast.error('Failed to load ledgers: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchLedgers();
  }, [toast]);
  
  // Filter ledgers by type
  const bankCashLedgers = ledgers.filter(ledger => 
    ledger.group_type === 'bank' || ledger.group_type === 'cash'
  );
  
  const expenseLedgers = ledgers.filter(ledger => 
    ledger.group_type === 'expense'
  );
  
  // If no ledgers of specific type found, provide all ledgers as fallback
  const selectableBankCashLedgers = bankCashLedgers.length > 0 ? bankCashLedgers : ledgers;
  const selectableExpenseLedgers = expenseLedgers.length > 0 ? expenseLedgers : ledgers;
  
  // Define form fields
  const formFields = {
    transaction_date: {
      label: 'Date',
      type: 'date',
      required: true
    },
    amount: {
      label: 'Amount',
      type: 'number',
      required: true,
      min: '0.01',
      step: '0.01',
      placeholder: 'Enter amount'
    },
    credit_ledger_id: {
      label: 'From Account (Money coming from)',
      type: 'select',
      required: true,
      options: selectableBankCashLedgers.map(ledger => ({
        value: ledger.id,
        label: `${ledger.name} ${ledger.group_type ? `(${ledger.group_type})` : ''}`
      }))
    },
    debit_ledger_id: {
      label: 'To Account (Where money is going)',
      type: 'select',
      required: true,
      options: selectableExpenseLedgers.map(ledger => ({
        value: ledger.id,
        label: `${ledger.name} ${ledger.group_type ? `(${ledger.group_type})` : ''}`
      }))
    },
    narration: {
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter description',
      rows: 3
    },
    reference_number: {
      label: 'Reference Number',
      type: 'text',
      placeholder: 'Enter reference number (optional)'
    }
  };
  
  // Initial form values
  const initialValues = {
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'Payment',
    amount: '',
    narration: '',
    debit_ledger_id: '',
    credit_ledger_id: '',
    reference_number: ''
  };
  
  // Handle form submission
  const handleSubmit = async (values) => {
    if (values.debit_ledger_id === values.credit_ledger_id) {
      toast.error('Debit and credit accounts cannot be the same');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Log the data being sent
      console.log('Transaction data being sent:', values);
      
      const response = await createTransaction(values);
      
      if (response && (response.success || response.id)) {
        toast.success('Payment transaction created successfully');
        router.push('/transactions');
      } else {
        // Detailed error message
        let errorMsg = 'Failed to create transaction';
        if (response && response.message) {
          errorMsg += `: ${response.message}`;
        } else if (response && response.error) {
          errorMsg += `: ${response.error}`;
        }
        toast.error(errorMsg);
        console.error('Transaction creation response:', response);
      }
    } catch (err) {
      console.error('Transaction creation error:', err);
      toast.error(`Failed to create transaction: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="New Payment" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Payment Transaction</h2>
            <p className="text-gray-500 text-sm">Record money going out of your account</p>
          </div>
          
          {/* Debug info - will be hidden in production */}
          {debugInfo.ledgersLoaded === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              No ledgers loaded. Please create ledger accounts first.
            </div>
          )}
          
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i>
                <span className="text-gray-500">Loading accounts...</span>
              </div>
            </div>
          ) : (
            <Form
              fields={formFields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isSubmitting={submitting}
              submitText="Save Payment"
              onCancel={() => router.back()}
              cancelText="Cancel"
            />
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 