import { Outlet } from "react-router-dom";

import Sidebar, { MobileNav } from "./SideBar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas md:flex-row">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-canvas">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
