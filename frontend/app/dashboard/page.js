'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import MetricCard from '@/components/MetricCard';
import LedgerItem from '@/components/LedgerItem';
import TransactionItem from '@/components/TransactionItem';
import { getNetWorth, getLedgersByType, getRecentTransactions, getMonthlyTotals } from '@/utils/api';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [netWorth, setNetWorth] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState({ total_income: 0, total_expenses: 0 });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [netWorthData, bankData, creditCardData, transactionsData, monthlyData] = await Promise.all([
          getNetWorth(),
          getLedgersByType('bank'),
          getLedgersByType('credit-card'),
          getRecentTransactions(5),
          getMonthlyTotals()
        ]);
        
        setNetWorth(netWorthData);
        setBankAccounts(bankData);
        setCreditCards(creditCardData);
        setRecentTransactions(transactionsData);
        setMonthlyTotals(monthlyData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <div className="pb-20">
      <Header title="Dashboard" />
      
      <div className="p-4">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">Hello, {user?.name || 'User'}</h2>
          <p className="text-gray-600 text-sm">Welcome to your financial dashboard</p>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricCard
            title="Net Worth"
            value={netWorth?.net_worth}
            icon="fa-wallet"
            accentColor="blue"
            loading={loading}
          />
          
          <MetricCard
            title="Assets"
            value={netWorth?.assets}
            icon="fa-arrow-trend-up"
            accentColor="green"
            loading={loading}
          />
          
          <MetricCard
            title="Income"
            value={monthlyTotals?.total_income}
            icon="fa-money-bill-trend-up"
            accentColor="teal"
            loading={loading}
          />
          
          <MetricCard
            title="Expenses"
            value={monthlyTotals?.total_expenses}
            icon="fa-money-bill-transfer"
            accentColor="red"
            loading={loading}
          />
        </div>
        
        {/* Bank Accounts */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Bank Accounts</h3>
            <Link href="/ledgers?type=bank" className="text-blue-600 text-sm">
              View All
            </Link>
          </div>
          
          <div className="bg-white rounded-xl border overflow-hidden">
            {loading ? (
              Array(3).fill().map((_, i) => (
                <div key={i} className="animate-pulse flex p-3 border-b">
                  <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))
            ) : bankAccounts.length > 0 ? (
              bankAccounts.slice(0, 3).map(account => (
                <LedgerItem key={account.id} ledger={account} />
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">No bank accounts found</p>
            )}
          </div>
        </div>
        
        {/* Credit Cards */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Credit Cards</h3>
            <Link href="/ledgers?type=credit-card" className="text-blue-600 text-sm">
              View All
            </Link>
          </div>
          
          <div className="bg-white rounded-xl border overflow-hidden">
            {loading ? (
              Array(3).fill().map((_, i) => (
                <div key={i} className="animate-pulse flex p-3 border-b">
                  <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))
            ) : creditCards.length > 0 ? (
              creditCards.slice(0, 3).map(card => (
                <LedgerItem key={card.id} ledger={card} />
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">No credit cards found</p>
            )}
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Link href="/transactions" className="text-blue-600 text-sm">
              View All
            </Link>
          </div>
          
          <div className="bg-white rounded-xl border overflow-hidden">
            {loading ? (
              Array(5).fill().map((_, i) => (
                <div key={i} className="animate-pulse flex p-3 border-b">
                  <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 