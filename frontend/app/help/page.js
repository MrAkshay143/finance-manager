'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq');
  
  const faqItems = [
    {
      id: 1,
      question: 'How do I add a new transaction?',
      answer: 'To add a new transaction, navigate to the Transactions page using the bottom navigation bar, then tap the + button at the bottom right. Choose the type of transaction you want to create (Payment, Receipt, Transfer, or Journal) and fill in the required details.'
    },
    {
      id: 2,
      question: 'How do I create a new ledger account?',
      answer: 'To create a new ledger account, go to the Ledgers page using the bottom navigation bar. Tap the + button at the bottom right and select "New Ledger". Fill in the required details like name, group, and opening balance, then tap "Create Ledger".'
    },
    {
      id: 3,
      question: 'How can I view my financial reports?',
      answer: 'You can view various financial reports by navigating to the Reports page using the bottom navigation bar. From there, select the type of report you want to view, such as Balance Sheet, Income & Expense, or Net Worth.'
    },
    {
      id: 4,
      question: 'Can I export my transaction data?',
      answer: 'Yes, you can export your transaction data from the Reports section. Navigate to the Transaction History report, and you\'ll find an export option that lets you download your data in CSV format.'
    },
    {
      id: 5,
      question: 'How do I update my profile information?',
      answer: 'To update your profile information, tap on "Profile" in the bottom navigation bar or go to Settings -> Profile. From there, you can update your name, email, and password.'
    },
    {
      id: 6,
      question: 'How can I create a backup of my data?',
      answer: 'You can create a backup of your data from the Settings page. Navigate to Settings -> Application -> Backup Data and tap on "Create Backup". The backup file will be available for download.'
    },
    {
      id: 7,
      question: 'How do I reset my password?',
      answer: 'If you\'re logged in, you can reset your password from the Profile page. If you\'re not logged in, use the "Forgot Password" link on the login page to receive a password reset link via email.'
    }
  ];
  
  const guides = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'fa-flag-checkered',
      color: 'bg-blue-100 text-blue-600',
      description: 'Learn the basics of Finance Manager',
      sections: [
        {
          title: 'Creating your first ledger',
          content: 'Start by creating ledgers for your bank accounts, credit cards, and expense categories.'
        },
        {
          title: 'Recording transactions',
          content: 'Learn how to record different types of transactions like payments, receipts, and transfers.'
        },
        {
          title: 'Navigating the dashboard',
          content: 'Understand the dashboard metrics and quick access features.'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Using Reports',
      icon: 'fa-chart-line',
      color: 'bg-green-100 text-green-600',
      description: 'Get insights from your financial data',
      sections: [
        {
          title: 'Balance Sheet',
          content: 'View your assets and liabilities at a glance.'
        },
        {
          title: 'Income & Expense Report',
          content: 'Track your income and expenses by category over time.'
        },
        {
          title: 'Net Worth Tracking',
          content: 'Monitor how your net worth changes over time.'
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: 'fa-gear',
      color: 'bg-purple-100 text-purple-600',
      description: 'Power user tips and techniques',
      sections: [
        {
          title: 'Journal Entries',
          content: 'Use journal entries for complex accounting operations.'
        },
        {
          title: 'Data Backup & Restore',
          content: 'Learn how to backup and restore your financial data.'
        },
        {
          title: 'Customizing Categories',
          content: 'Create custom ledger groups to organize your finances your way.'
        }
      ]
    }
  ];
  
  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };
  
  return (
    <div className="pb-20">
      <Header title="Help Center" backButton={true} backButtonHref="/settings" />
      
      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'faq' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('faq')}
          >
            FAQs
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'guides' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('guides')}
          >
            Guides
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* FAQs */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            
            {faqItems.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl border overflow-hidden">
                <button
                  className="w-full p-4 text-left flex justify-between items-center"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <i className={`fa-solid ${openFaq === faq.id ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400`}></i>
                </button>
                
                {openFaq === faq.id && (
                  <div className="p-4 bg-gray-50 border-t">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-medium text-blue-600 mb-2">Still need help?</h3>
              <p className="text-gray-700 text-sm mb-3">
                If you couldn't find the answer to your question, please contact our support team.
              </p>
              <a 
                href="mailto:support@financemanager.com" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
        
        {/* Guides */}
        {activeTab === 'guides' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">User Guides</h2>
            
            <div className="space-y-4">
              {guides.map((guide) => (
                <div key={guide.id} className="bg-white rounded-xl border overflow-hidden">
                  <div className="p-4 flex items-start">
                    <div className={`${guide.color} rounded-full w-10 h-10 flex items-center justify-center mr-3`}>
                      <i className={`fa-solid ${guide.icon}`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{guide.title}</h3>
                      <p className="text-gray-500 text-sm">{guide.description}</p>
                    </div>
                  </div>
                  
                  <div className="border-t">
                    {guide.sections.map((section, index) => (
                      <div key={index} className={index > 0 ? 'border-t' : ''}>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-700 mb-1">{section.title}</h4>
                          <p className="text-gray-600 text-sm">{section.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-2">Looking for more detailed documentation?</p>
              <a 
                href="#" 
                className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                View Full Documentation
              </a>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
} 