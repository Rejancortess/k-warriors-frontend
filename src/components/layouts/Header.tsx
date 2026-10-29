import { Bell, Search, UserRound } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [search, setSearch] = useState("");

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Global Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-blue-500"
        />
      </div>

      {/* Header Actions */}
      <div className="ml-4 flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-gray-600 hover:text-blue-600"
        >
          <Bell size={22} />
        </button>

        <button
          type="button"
          aria-label="User profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <UserRound size={22} />
        </button>
      </div>
    </header>
  );
}
