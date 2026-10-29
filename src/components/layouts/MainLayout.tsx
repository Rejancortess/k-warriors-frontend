import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Global Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Global Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F9F9FF]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
