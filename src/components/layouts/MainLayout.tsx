import { Outlet } from "react-router-dom";

import Sidebar from "./SideBar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Global Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Global Header */}
        <Header />
        {/* Dynamic Page Content */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
