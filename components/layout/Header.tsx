"use client";

import { useSession } from "next-auth/react";
import React from "react";

export const Header: React.FC = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500">{session?.user?.name}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900">
            {session?.user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};
