import { useState } from 'react';
import { Check, ScanBarcode } from 'lucide-react';

const StockIn = () => {
  const [barcode, setBarcode] = useState('');
  const dummyBarcode = '890123456789';
  const isBarcodeMatched = barcode === dummyBarcode;

  return (
    <div className="mx-auto min-h-screen max-w-3xl space-y-4 bg-gray-50 p-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      {/* Head Part ni */}
      <div className="flex justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">

        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center">1</span>
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Scan Code</span>
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-400">Hardware input</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">2</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Verify Code</span>
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-400">Barcode Match</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">3</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Quantity</span>
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-400">Set batch units</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">4</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Add Stock</span>
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-400">Instant commit</p>
        </div>

      </div>

      {/* Body Part ni */}
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">

        {/* Barcode Part ni */}
        <div>
          <div className="flex justify-between items-center mb-2">

            <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Scan Product <span className="text-red-500">*</span>
            </label>

            <span className="rounded-full bg-gray-100 px-2 py-2 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">Barcode or QR</span>

          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">

            <div className="flex items-center space-x-3 text-sm font-medium text-gray-800 dark:text-gray-200">
              <ScanBarcode className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ''))}
                placeholder="123456789"
                className="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            {isBarcodeMatched && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Check className="h-4 w-4" />
                <span>Code matched</span>
              </div>
            )}
          </div>

          <div>
            <div className='flex justify-between items-center mt-4 mb-4'>

              <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Name
              </label>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockIn;