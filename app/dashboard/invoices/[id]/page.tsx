"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InvoiceViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState<any>();

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
  try {
    const res = await fetch(`/api/invoices/${id}`);

    if (!res.ok) {
      router.push("/dashboard/invoices");
      return;
    }

    const data = await res.json();
    
    if (!data) {
      router.push("/dashboard/invoices");
      return;
    }

    setInvoice(data);

  } catch (err) {
    console.error(err);
    router.push("/dashboard/invoices");
  }
};
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB");
  }
  function convertToWords(num: number) {
    return "Rupees " + num + " only"; // replace later with real lib
  }
  const handleDownload = () => {
    window.print(); // simple version
  };

  if (!invoice) return <div className="p-6">Loading...</div>;

return (
    <div className="p-6">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">{invoice.invoiceNo}</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/dashboard/invoices/${id}/edit`)}
            className="px-4 py-2 border rounded-md"
          >
            Edit
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Download
          </button>
        </div>
      </div>

      {/* 🔹 Template */}
      <div className="flex justify-center p-6 bg-gray-100">
        <div className="invoice-container relative w-[794px] min-h-[1123px] bg-white shadow">

          {/* 🔹 Letterhead */}
          <img
            src="/letterhead.png"
            alt="Letterhead Background"
            className="absolute inset-0 w-full h-full object-contain opacity-95 pointer-events-none"
          />

          {/* 🔹 CONTENT */}
          <div className="relative z-10 text-[13px] h-full flex flex-col">

            {/* 🔹 Top Section - Adjusted pt-[260px] to clear the letterhead header image */}
            <div className="pt-[260px] px-10 flex justify-between">

              {/* LEFT */}
              <div className="space-y-1">
                <p><strong>PAN:</strong> {invoice.customer?.pan}</p>
                <p><strong>GSTIN:</strong> {invoice.customer?.gstin}</p>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <h2 className="text-[16px] font-semibold mb-2">
                  TAX INVOICE
                </h2>
                <p>
                  <strong>Invoice No:</strong> {invoice.invoiceNo}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>

            {/* 🔹 Bill To */}
            <div className="mt-[40px] px-10">
              <p className="font-semibold mb-2 text-sm">Bill To</p>
              <p className="font-medium">{invoice.customer?.displayName}</p>
              <p className="text-gray-700">{invoice.customer?.companyName}</p>
            </div>

            {/* 🔹 Table */}
            <table className="w-[85%] mx-auto mt-8 border border-gray-500 text-[13px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-500">
                  <th className="p-3 text-left font-semibold">#</th>
                  <th className="p-3 text-left font-semibold">Item</th>
                  <th className="p-3 text-center font-semibold">Qty</th>
                  <th className="p-3 text-center font-semibold">Rate</th>
                  <th className="p-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>

              <tbody>
                {invoice.items.map((item: any, i: number) => (
                  <tr key={item.id} className="border-b border-gray-300 last:border-b-0">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-center">₹ {item.price}</td>
                    <td className="p-3 text-right">₹ {item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 🔹 Totals */}
            <div className="mt-6 flex justify-end px-10">
              <div className="w-72 text-[13px] border border-gray-300 p-4 rounded-md bg-gray-50/50">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-medium">₹ {invoice.totalAmount}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">IGST (18%)</span>
                  <span className="font-medium">₹ {(invoice.totalAmount * 0.18).toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold border-t border-gray-300 mt-2 pt-3 text-[14px]">
                  <span>Total</span>
                  <span>₹ {(invoice.totalAmount * 1.18).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 🔹 Amount in Words */}
            <div className="mt-8 px-10 text-gray-700 font-medium">
              Amount in Words: <span className="italic font-normal">{convertToWords(invoice.totalAmount)}</span>
            </div>

            {/* 🔹 Footer */}
            <div className="mt-auto pt-10 pb-10 px-10 text-[12px] text-gray-500 text-center">
              Thank you for your business and collaboration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
