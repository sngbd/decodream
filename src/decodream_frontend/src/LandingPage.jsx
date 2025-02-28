import React from "react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-center justify-center text-white">
      <nav className="absolute top-0 left-0 w-full flex justify-between p-6 px-12">
        <div className="text-xl font-bold">DigiSignID</div>
        <div className="space-x-6 hidden md:flex">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Digital Signature</a>
          <a href="#" className="hover:underline">Document Validation</a>
          <a href="#" className="hover:underline">Pricing & Subscription</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-full shadow-lg hover:bg-gray-200">Sign In</button>
      </nav>

      <div className="text-center mt-20">
        <h1 className="text-5xl font-extrabold">DigiSignID</h1>
        <p className="text-lg mt-4">Empowering Your Documents, Securing Your Signatures</p>
        <div className="mt-6 space-x-4">
          <button className="bg-purple-800 px-6 py-3 rounded-full shadow-lg hover:bg-purple-700">Start Signing</button>
          <button className="bg-white text-purple-800 px-6 py-3 rounded-full shadow-lg hover:bg-gray-200">Document Validator</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
