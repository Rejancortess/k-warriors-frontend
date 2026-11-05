import { Outlet } from "react-router-dom";

import Sidebar from "./SideBar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Global Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Global Header */}
        <Header />
        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F9F9FF] p-6 dark:bg-gray-900">
        <main className="flex flex-1 flex-col overflow-y-auto bg-[#F9F9FF]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
