
import React from 'react';
import { Link } from 'react-router-dom';

export const VoltMarketFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VM</span>
              </div>
              <span className="text-xl font-bold">VoltMarket</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The global marketplace for data center sites, hosting, and equipment. 
              Connect with industry professionals and find your next opportunity.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <div className="space-y-2">
              <Link to="/voltmarket/listings" className="block text-gray-400 hover:text-white">
                Browse Listings
              </Link>
              <Link to="/voltmarket/create-listing" className="block text-gray-400 hover:text-white">
                Create Listing
              </Link>
              <Link to="/voltmarket/dashboard" className="block text-gray-400 hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <div className="space-y-2">
              <Link to="/voltmarket/about" className="block text-gray-400 hover:text-white">
                About
              </Link>
              <Link to="/voltmarket/contact" className="block text-gray-400 hover:text-white">
                Contact
              </Link>
              <Link to="/voltmarket/terms" className="block text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link to="/voltmarket/privacy" className="block text-gray-400 hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 VoltMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
