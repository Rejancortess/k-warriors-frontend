import { useState } from 'react';
import { Check, ScanBarcode } from 'lucide-react';

const StockIn = () => {
  const [barcode, setBarcode] = useState('');
  const dummyBarcode = '890123456789';
  const isBarcodeMatched = barcode === dummyBarcode;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4 bg-gray-50 min-h-screen">

      {/* Head Part ni */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 flex justify-between">

        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center">1</span>
            <span className="text-sm font-semibold text-emerald-800">Scan Code</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Hardware input</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-gray font-semibold text-xs flex items-center justify-center">2</span>
            <span className="text-sm font-semibold text-gray-800">Verify Code</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Barcode Match</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 font-semibold text-xs flex items-center justify-center">3</span>
            <span className="text-sm font-semibold text-gray-800">Quantity</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Set batch units</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 font-semibold text-xs flex items-center justify-center">4</span>
            <span className="text-sm font-semibold text-gray-800">Add Stock</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Instant commit</p>
        </div>

      </div>

      {/* Body Part ni */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 space-y-6">

        {/* Barcode Part ni */}
        <div>
          <div className="flex justify-between items-center mb-2">

            <label className="text-lg font-semibold text-gray-900">Scan Product <span className="text-red-500">*</span>
            </label>

            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-2 rounded-full font-medium">Barcode or QR</span>

          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">

            <div className="flex items-center space-x-3 text-gray-800 font-medium text-sm">
              <ScanBarcode className="w-5 h-5 text-gray-800" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ''))}
                placeholder="123456789"
                className="bg-transparent focus:outline-none w-full"
              />
            </div>

            {isBarcodeMatched && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" />
                <span>Code matched</span>
              </div>
            )}
          </div>

          <div>
            <div className='flex justify-between items-center mt-4 mb-4'>

              <label className="text-lg font-semibold text-gray-900">Product Name
              </label>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockIn;