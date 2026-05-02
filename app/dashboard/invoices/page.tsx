"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Invoice = {
  id: string;
  invoiceNo: string;
  issueDate: string;
  totalAmount: number;
  customer: {
    displayName: string;
  };
};

export default function InvoicesPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");

      if (!res.ok) {
        console.error("Failed to fetch invoices");
        return;
      }

      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this invoice?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Delete failed");
        return;
      }

      // remove from UI instantly
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">All Invoices</h1>

        <button
          onClick={() => router.push("/dashboard/invoices/create-new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + New
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Invoice#</th>
              <th className="px-6 py-3 text-left">Customer Name</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">{formatDate(inv.issueDate)}</td>

                  {/* Clickable invoice */}
                  <td
                    className="px-6 py-4 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                  >
                    {inv.invoiceNo}
                  </td>

                  <td className="px-6 py-4">{inv.customer?.displayName}</td>

                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                      Draft
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(inv.totalAmount)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
