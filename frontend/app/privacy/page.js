'use client';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function PrivacyPage() {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="Privacy Policy" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Last updated: March 10, 2024
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">1. Introduction</h2>
            <p className="mb-4">
              At Finance Manager, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Service.
            </p>
            <p className="mb-4">
              By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">2. Information We Collect</h2>
            <p className="mb-4">
              We collect several types of information for various purposes to provide and improve our Service:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide certain personally identifiable information, including your name, email address, and financial data.</li>
              <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used.</li>
              <li><strong>Cookies and Tracking Data:</strong> We use cookies and similar tracking technologies to track activity on our Service.</li>
            </ul>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
            <p className="mb-4">
              We use the collected data for various purposes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">4. Data Security</h2>
            <p className="mb-4">
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">5. Your Data Rights</h2>
            <p className="mb-4">
              You have certain rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>The right to access, update, or delete the information we have about you</li>
              <li>The right to rectification (to correct inaccurate information)</li>
              <li>The right to object to our processing of your data</li>
              <li>The right to data portability (to receive a copy of your data)</li>
              <li>The right to withdraw consent</li>
            </ul>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">6. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p className="mb-4">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
            
            <h2 className="text-lg font-semibold mt-6 mb-3">7. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:contact@imakshay.in" className="text-blue-600 hover:underline">contact@imakshay.in</a>
            </p>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 