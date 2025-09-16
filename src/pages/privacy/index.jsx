import React from "react";

const PrivacyPolicyPage = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="gradient-blob-1"></div>
      <div className="gradient-blob-2"></div>
      <div className="gradient-blob-3"></div>
      <div className="gradient-overlay"></div>
    </div>

    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-gradient-to-r from-yellow-400/8 via-transparent to-teal-400/6 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-6 text-lg">Your privacy is our top priority. We do not store your workout videos on our servers. Your identity is secured by blockchain technology, and you have full control over your data.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Data Collection</h2>
        <ul className="list-disc pl-5 mb-4">
          <li>We only collect data necessary for app functionality.</li>
          <li>Your workout videos remain on your device.</li>
          <li>Food scan images are processed locally.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Data Usage</h2>
        <ul className="list-disc pl-5 mb-4">
          <li>We do not sell or share your data with third parties.</li>
          <li>Data is used solely to provide app features.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Security</h2>
        <ul className="list-disc pl-5 mb-4">
          <li>Blockchain secures your identity and access.</li>
          <li>All sensitive data is encrypted.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
        <ul className="list-disc pl-5 mb-4">
          <li>You can delete your data at any time.</li>
          <li>Contact support for any privacy concerns.</li>
        </ul>
        <div className="mt-8 text-sm text-muted-foreground">
          <strong>Last updated:</strong> September 10, 2025
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
