import Image from "next/image";
import React from "react";

const TopBar: React.FC = () => {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo - Assuming the logo is white and needs a dark background to be visible */}
      <div className="relative w-32 h-10 rounded-full flex justify-center items-center">
        <Image src="/logo1.png" alt="SavvySupper Logo" layout="fill" objectFit="contain" />
      </div>
      {/* Navigation Links */}
      <div className="flex items-center">
        <div className="hidden sm:block mr-6">
          <input
            type="search"
            placeholder="Search meals..."
            className="px-4 py-2 border rounded-full"
          />
        </div>
        <a href="/login" className="text-sm text-gray-700 hover:text-gray-900 mx-2">
          Login
        </a>
        <a href="/account" className="text-sm text-gray-700 hover:text-gray-900 mx-2">
          Account
        </a>
        <a href="/cart" className="ml-6">
          <svg
            className="w-6 h-6 text-gray-700 hover:text-gray-900"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M3 3h1l1 14h16l1-14h1"></path>
            <path d="M14 10h-4"></path>
            <path d="M14 14h-4"></path>
            <path d="M10 10l1-2h2l1 2"></path>
          </svg>
        </a>
      </div>
    </header>
  );
};

export default TopBar;
