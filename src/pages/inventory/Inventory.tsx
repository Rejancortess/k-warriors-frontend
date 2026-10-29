import React from "react";

import { TrendingUp, Archive, TriangleAlert, Ban, Search, Barcode, Dot, Pencil, Trash } from 'lucide-react';

const Inventory = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 font-medium">TOTAL PRODUCTS</p>
            <h3 className="text-3xl font-bold mt-1">00</h3>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
              <span><TrendingUp className="w-4 h-4" /></span> +0 added this week
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Archive className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 font-medium">LOW STOCK</p>
            <h3 className="text-3xl font-bold mt-1">00</h3>
            <p className="text-xs text-gray-400 mt-2">Action Required</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
            <TriangleAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 font-medium">OUT OF STOCK</p>
            <h3 className="text-3xl font-bold mt-1">00</h3>
            <p className="text-xs text-red-500 font-medium"><TriangleAlert className="w-4 h-4 inline"/> ReStock</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Ban className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"> */}
        {/* Filter Bar */}
        <div className="relative flex justify-between items-center mb-6">
          <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter products by name, or barcode..."
            className="w-96 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button className="px-5 py-1 bg-emerald-800 text-white text-sm font-medium rounded-3xl hover:bg-emerald-900 transition-colors">
            All
          </button>
        {/* </div> */}

      </div>
        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                <th className="pb-3 font-bold">Product Name</th>
                <th className="pb-3 font-bold">Barcode</th>
                <th className="pb-3 font-bold">Current Stock</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {[
                { name: "Sample Product #1", barcode: "480123456789", stock: "120 units", status: "Normal", statusColor: "bg-emerald-50 text-emerald-600"},
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50">
                  <td className="py-4 font-medium text-gray-800">{item.name}</td>
                  <td className="py-4 text-gray-500 font-mono text-xs"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200"><Barcode className="w-4 h-4 inline" /> {item.barcode}</span></td>
                  <td className="py-4 font-semibold text-gray-800">
                    {item.stock.split(" ")[0]} <span className="text-gray-400 font-normal text-xs">units</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.statusColor}`}>
                      <Dot className="w-10 h-10 inline" /> {item.status}
                    </span>
                  </td>
                  <td className="py-4 space-x-4">
                    <button className="text-gray-500 hover:text-gray-700 text-xs font-medium"><Pencil className="w-4 h-4 inline" /> Edit</button>
                    <button className="text-red-500 hover:text-red-700 text-xs font-medium"><Trash className="w-4 h-4 inline" /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer*/}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span>Showing <strong>1</strong> of <strong>#</strong> registered products</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded bg-emerald-800 text-white font-medium">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">2</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">3</button>
            <span>...</span>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">10</button>
          </div>
        </div>
    </div>
  );
};

export default Inventory;
