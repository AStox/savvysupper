import Image from "next/image";
import React from "react";

const TopBar: React.FC = () => {
  return (
    <header className="py-4 px-6 flex justify-between items-center">
      {/* Logo - Assuming the logo is white and needs a dark background to be visible */}
      <div className="relative w-32 h-10 rounded-full flex justify-center items-center">
        <Image src="/logo1.png" alt="SavvySupper Logo" layout="fill" objectFit="contain" />
      </div>
      <div className="flex items-center">
        <a href="/login" className="text-sm hover mx-2">
          Login
        </a>
        <a href="/account" className="text-sm hover mx-2">
          Account
        </a>
      </div>
    </header>
  );
};

export default TopBar;
