import React from "react";

const GuidingGifsPage = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="gradient-blob-1"></div>
      <div className="gradient-blob-2"></div>
      <div className="gradient-blob-3"></div>
      <div className="gradient-overlay"></div>
    </div>

    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-gradient-to-r from-yellow-400/8 via-transparent to-teal-400/6 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/8">
        <h1 className="text-3xl font-bold mb-4">Guiding GIFs & Instructional Materials</h1>
        <p className="mb-6 text-lg">Find professional guides and GIFs to help you perfect your form and maximize results. We are working to add more high-quality materials soon!</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg p-6 shadow flex flex-col items-center bg-gradient-to-b from-yellow-50/4 to-teal-50/4 border border-yellow-200/6">
            <img src="/assets/images/atosfit.png" alt="Squat Guide" className="mb-2 w-32 h-32 object-contain" />
            <span className="font-semibold">Squat Form</span>
          </div>
          <div className="rounded-lg p-6 shadow flex flex-col items-center bg-gradient-to-b from-yellow-50/4 to-teal-50/4 border border-yellow-200/6">
            <img src="/assets/images/no_image.png" alt="Pushup Guide" className="mb-2 w-32 h-32 object-contain" />
            <span className="font-semibold">Pushup Form</span>
          </div>
          {/* Add more GIFs/materials here as needed */}
        </div>
        <div className="mt-8 text-sm text-muted-foreground">
          <strong>Note:</strong> We are sourcing professional materials and may purchase additional guides for the best experience.
        </div>
      </div>
    </div>
  </div>
);

export default GuidingGifsPage;
