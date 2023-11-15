import Image from "next/image";
import React from "react";

const TopBar = () => {
  return (
    <header className="flex justify-between items-center p-4 shadow-md">
      {/* Logo */}
      <div>
        <Image src="/path-to-your-logo.png" alt="SavvySupper Logo" className="h-8" />
      </div>
      {/* Navigation Links */}
      <nav>
        <a href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 p-2">
          Login
        </a>
        <a href="/account" className="text-sm font-medium text-gray-700 hover:text-gray-900 p-2">
          Account
        </a>
      </nav>
    </header>
  );
};

export default TopBar;
