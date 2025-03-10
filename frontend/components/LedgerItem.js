'use client';

import Link from 'next/link';
import { formatCurrency } from '@/utils/format';

export default function LedgerItem({ ledger, onDelete }) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-800">{ledger.name}</p>
        <p className="text-sm text-gray-500">
          {ledger.account_number && <span className="mr-2">#{ledger.account_number}</span>}
          Balance: {formatCurrency(ledger.balance || ledger.opening_balance || 0)}
        </p>
      </div>
      <div className="flex space-x-2">
        <Link 
          href={`/ledgers/${ledger.id}/edit`}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </Link>
        <button 
          onClick={() => onDelete && onDelete(ledger.id, ledger.name)}
          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  );
} 