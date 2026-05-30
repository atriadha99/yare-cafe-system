"use client";

import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">System configuration</p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl">
          <Card title="General Settings">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cafe Name
                </label>
                <input
                  type="text"
                  defaultValue="Yare Cafe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>IDR (Rp)</option>
                </select>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Save Settings
              </button>
            </div>
          </Card>

          <Card title="User Management">
            <div className="space-y-4">
              <p className="text-gray-600">Manage users and roles (Coming soon)</p>
              <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                Manage Users
              </button>
            </div>
          </Card>

          <Card title="Database">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <strong>Connected to:</strong> Neon PostgreSQL
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                <span className="text-green-600 font-semibold">Connected</span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
