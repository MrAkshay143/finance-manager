'use client';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function TermsPage() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="Terms of Service" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Terms of Service</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Last updated: March 10, 2024
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Finance Manager ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our website, mobile application, and services (collectively, the "Service").
            </p>
            <p className="mb-4">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">2. Using Our Service</h2>
            <p className="mb-4">
              You must be at least 18 years old to use our Service. By using our Service, you represent and warrant that you meet this requirement.
            </p>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account.
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">3. User Content</h2>
            <p className="mb-4">
              Our Service allows you to input, store, and manage your financial data. You retain all rights to your data, and we will not use or share it with third parties except as necessary to provide the Service.
            </p>
            <p className="mb-4">
              You are solely responsible for the accuracy and completeness of any data you input into the Service.
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">4. Prohibited Uses</h2>
            <p className="mb-4">
              You may not use our Service for any illegal purpose or in violation of any local, state, national, or international law. You also agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Use the Service to transmit any viruses, malware, or other harmful code</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Harass, abuse, or harm another person through use of the Service</li>
              <li>Use the Service for any fraudulent or deceptive purpose</li>
            </ul>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">5. Changes to Terms</h2>
            <p className="mb-4">
              We may modify these Terms at any time. If we make changes, we will provide notice by updating the date at the top of these Terms.
            </p>
            <p className="mb-4">
              Your continued use of our Service after we post any modifications to the Terms will constitute your acknowledgment of the modifications and your consent to abide by the modified Terms.
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">6. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at: <a href="mailto:contact@imakshay.in" className="text-blue-600 hover:underline">contact@imakshay.in</a>
            </p>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 