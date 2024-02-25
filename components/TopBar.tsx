import Image from "next/image";
import Link from "next/link";
import React from "react";

const TopBar: React.FC = () => {
  return (
    <header className="py-4 px-6 flex justify-between items-center">
      <Link href="/" passHref>
        <div className="relative w-32 h-10 rounded-full flex justify-center items-center">
          <Image src="/logo1.png" alt="SavvySupper Logo" layout="fill" objectFit="contain" />
        </div>
      </Link>
      <div className="flex items-center">
        <a href="/recipes" className="text-sm hover mx-2">
          All Recipes
        </a>
      </div>
    </header>
  );
};

export default TopBar;
