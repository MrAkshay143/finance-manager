'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getCreditCardDues } from '@/utils/api';
import { formatCurrency, formatDate } from '@/utils/format';

export default function CreditCardDuesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [duesData, setDuesData] = useState({
    cards: [],
    totalDue: 0
  });
  
  useEffect(() => {
    const fetchDuesData = async () => {
      try {
        setLoading(true);
        const data = await getCreditCardDues();
        setDuesData(data);
      } catch (err) {
        console.error('Error fetching credit card dues:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDuesData();
  }, []);
  
  // Helper function to determine status color
  const getStatusColor = (dueAmount, limit) => {
    if (!limit) return 'text-gray-600';
    
    const utilization = Math.abs(dueAmount) / limit * 100;
    if (utilization < 30) return 'text-green-600';
    if (utilization < 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="pb-20">
      <Header 
        title="Credit Card Dues" 
        backButton={true} 
        backButtonHref="/reports" 
      />
      
      <div className="p-4">
        {/* Summary */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <h2 className="text-sm text-gray-600 mb-1">Total Credit Card Dues</h2>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(Math.abs(duesData.totalDue))}
              </p>
              <p className="text-sm text-gray-500">
                Across {duesData.cards.length} credit cards
              </p>
            </>
          )}
        </div>
        
        {/* Credit Cards List */}
        <div className="bg-white rounded-xl border overflow-hidden mb-4">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold">Credit Cards</h3>
          </div>
          
          {loading ? (
            <div className="divide-y">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex justify-between mb-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-gray-200 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : duesData.cards.length > 0 ? (
            <div className="divide-y">
              {duesData.cards
                .sort((a, b) => a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0)
                .map((card) => (
                  <div key={card.id} className="p-4">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">{card.name}</h4>
                      <span className={`font-semibold ${getStatusColor(card.balance, card.limit)}`}>
                        {formatCurrency(Math.abs(card.balance))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{card.accountNumber}</span>
                      {card.dueDate && (
                        <span>
                          Due on: <span className="font-medium">{formatDate(card.dueDate)}</span>
                        </span>
                      )}
                    </div>
                    
                    {card.limit > 0 && (
                      <>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Credit Limit: {formatCurrency(card.limit)}</span>
                          <span>
                            Used: {((Math.abs(card.balance) / card.limit) * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${getUtilizationColor(Math.abs(card.balance) / card.limit)}`}
                            style={{ width: `${Math.min((Math.abs(card.balance) / card.limit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                    
                    {card.paymentDue && card.dueDate && new Date(card.dueDate) <= new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)) && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => router.push('/transactions/new/payment')}
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Pay Now
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                <i className="fa-solid fa-credit-card text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Credit Cards Found</h3>
              <p className="text-gray-500 text-sm mb-4">
                You don't have any credit cards set up in your account.
              </p>
              <button
                onClick={() => router.push('/ledgers/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add a Credit Card
              </button>
            </div>
          )}
        </div>
        
        {/* Tips */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <h3 className="font-semibold mb-2">Credit Card Tips</h3>
          
          <div className="space-y-3">
            <div className="flex">
              <div className="rounded-full bg-blue-100 text-blue-600 p-2 mr-3 flex-shrink-0">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <p className="text-sm text-gray-600">
                Pay the full amount due on time to avoid interest charges.
              </p>
            </div>
            
            <div className="flex">
              <div className="rounded-full bg-blue-100 text-blue-600 p-2 mr-3 flex-shrink-0">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <p className="text-sm text-gray-600">
                Keep your credit utilization below 30% for better credit scores.
              </p>
            </div>
            
            <div className="flex">
              <div className="rounded-full bg-blue-100 text-blue-600 p-2 mr-3 flex-shrink-0">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <p className="text-sm text-gray-600">
                Set up reminders for due dates to avoid late payment fees.
              </p>
            </div>
          </div>
        </div>
        
        {/* Export Button */}
        {duesData.cards.length > 0 && (
          <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-file-export mr-2"></i>
            Export Report
          </button>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}

// Helper function to get utilization color
function getUtilizationColor(utilization) {
  if (utilization < 0.3) return 'bg-green-500';
  if (utilization < 0.7) return 'bg-yellow-500';
  return 'bg-red-500';
} 