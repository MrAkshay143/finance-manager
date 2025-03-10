'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function NewTransactionPage() {
  const router = useRouter();
  
  const transactionTypes = [
    {
      name: 'Receipt',
      icon: 'fa-arrow-down',
      color: 'bg-green-500',
      description: 'Money coming into your account',
      path: '/transactions/new/receipt'
    },
    {
      name: 'Payment',
      icon: 'fa-arrow-up',
      color: 'bg-red-500',
      description: 'Money going out of your account',
      path: '/transactions/new/payment'
    },
    {
      name: 'Transfer',
      icon: 'fa-right-left',
      color: 'bg-blue-500',
      description: 'Move money between accounts',
      path: '/transactions/new/transfer'
    },
    {
      name: 'Journal Entry',
      icon: 'fa-pen',
      color: 'bg-purple-500',
      description: 'Record adjustments or corrections',
      path: '/transactions/new/journal'
    }
  ];
  
  const handleSelectType = (path) => {
    router.push(path);
  };
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="New Transaction" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Select Transaction Type</h2>
            <p className="text-gray-500 text-sm">Choose the type of transaction you want to create</p>
          </div>
          
          <div className="space-y-3">
            {transactionTypes.map((type) => (
              <div
                key={type.name}
                className="border border-gray-200 rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSelectType(type.path)}
              >
                <div className={`w-10 h-10 ${type.color} rounded-full flex items-center justify-center text-white mr-4`}>
                  <i className={`fa-solid ${type.icon}`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{type.name}</h3>
                  <p className="text-gray-500 text-sm">{type.description}</p>
                </div>
                <div className="text-gray-400">
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 