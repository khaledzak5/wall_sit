import React from "react";

const PricingPage = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="gradient-blob-1"></div>
      <div className="gradient-blob-2"></div>
      <div className="gradient-blob-3"></div>
      <div className="gradient-overlay"></div>
    </div>

    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="bg-gradient-to-r from-yellow-400/8 via-transparent to-teal-400/6 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/8">
        <h1 className="text-3xl font-bold mb-2">Pricing</h1>
        <p className="mb-4 text-lg">We're in beta — all plans and premium features are currently free while we test and learn. Below are the intended plans and the features that will be paywalled after beta.</p>
        <div className="mt-2 mb-6 text-sm text-muted-foreground">
          <strong>Paywall quotas (example):</strong> Minutes of tracking (10 hours free per month), Chatbot messages (100 messages free per month), Food scanning (50 items free per month).
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Free */}
          <div className="rounded-lg p-6 shadow bg-gradient-to-b from-yellow-50/4 to-teal-50/4 border border-yellow-200/6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Free <span className="text-sm font-medium text-accent ml-2">(Beta)</span></h2>
            <p className="text-sm text-muted-foreground mb-4">Best for casual users — generous free tier during beta.</p>
            <ul className="mb-4 list-disc pl-5 text-sm space-y-1">
              <li><strong>10 hours</strong> tracking / month</li>
              <li><strong>100</strong> chatbot messages / month</li>
              <li><strong>50</strong> food scans / month</li>
            </ul>
            <div className="mt-auto"> 
              <div className="text-2xl font-bold mb-4">Free</div>
              <button onClick={() => window.location.href = '/register-screen'} className="w-full bg-primary text-white py-2 rounded-lg">Get started — Free</button>
            </div>
          </div>

          {/* Premium */}
          <div className="rounded-lg p-6 shadow bg-gradient-to-b from-yellow-50/4 to-teal-50/4 border border-yellow-200/6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Premium</h2>
            <p className="text-sm text-muted-foreground mb-4">More usage for power users.</p>
            <ul className="mb-4 list-disc pl-5 text-sm space-y-1">
              <li><strong>50 hours</strong> tracking / month</li>
              <li><strong>500</strong> chatbot messages / month</li>
              <li><strong>250</strong> food scans / month</li>
            </ul>
            <div className="mt-auto">
              <div className="text-sm font-semibold mb-3 text-muted-foreground">Free during beta</div>
              <button disabled className="w-full border border-border text-muted-foreground py-2 rounded-lg bg-muted/10">Free in Beta</button>
            </div>
          </div>

          {/* Premium Plus */}
          <div className="rounded-lg p-6 shadow bg-gradient-to-b from-yellow-50/4 to-teal-50/4 border border-yellow-200/6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Premium Plus</h2>
            <p className="text-sm text-muted-foreground mb-4">For power users and teams — top-tier usage.</p>
            <ul className="mb-4 list-disc pl-5 text-sm space-y-1">
              <li><strong>Unlimited</strong> tracking</li>
              <li><strong>Unlimited</strong> chatbot messages</li>
              <li><strong>Unlimited</strong> food scans</li>
            </ul>
            <div className="mt-auto">
              <div className="text-sm font-semibold mb-3 text-muted-foreground">Free during beta</div>
              <button disabled className="w-full border border-border text-muted-foreground py-2 rounded-lg bg-muted/10">Free in Beta</button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <strong>Note:</strong> All premium features and subscriptions are free during this beta period. The quotas above represent the intended paywall after beta. Enjoy the beta — your feedback helps shape pricing.
        </div>
      </div>
    </div>
  </div>
);

export default PricingPage;
