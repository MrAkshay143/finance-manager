'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTransaction, getLedgers } from '@/utils/api';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Form from '@/components/Form';
import { useToast } from '@/context/ToastContext';

export default function ReceiptTransactionPage() {
  const router = useRouter();
  const toast = useToast();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Get all ledgers on mount
  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        setLoading(true);
        const response = await getLedgers();
        if (response && Array.isArray(response)) {
          setLedgers(response);
        } else if (response && response.data) {
          setLedgers(response.data);
        } else {
          console.error('No ledgers found or unexpected data structure:', response);
          toast.error('Failed to load ledgers');
        }
      } catch (err) {
        console.error('Error fetching ledgers:', err);
        toast.error('Failed to load ledgers');
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
  
  const incomeLedgers = ledgers.filter(ledger => 
    ledger.group_type === 'income'
  );
  
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
      label: 'To Account (Money going to)',
      type: 'select',
      required: true,
      options: [
        ...bankCashLedgers.map(ledger => ({
          value: ledger.id,
          label: ledger.name
        }))
      ]
    },
    debit_ledger_id: {
      label: 'From Account (Source of money)',
      type: 'select',
      required: true,
      options: [
        ...incomeLedgers.map(ledger => ({
          value: ledger.id,
          label: ledger.name
        }))
      ]
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
    transaction_type: 'Receipt',
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
      
      const response = await createTransaction(values);
      
      if (response && response.success) {
        toast.success('Receipt transaction created successfully');
        router.push('/transactions');
      } else {
        toast.error(response?.message || 'Failed to create transaction');
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      toast.error('An error occurred while creating the transaction');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="New Receipt" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Receipt Transaction</h2>
            <p className="text-gray-500 text-sm">Record money coming into your account</p>
          </div>
          
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
              submitText="Save Receipt"
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