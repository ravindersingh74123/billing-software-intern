"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  displayName: string;
  companyName?: string;
  email?: string;
  primaryContact?: string;
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this customer?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        if (res.status === 400) {
          alert(data?.error || "Customer cannot be deleted");
          return;
        }

        if (res.status === 404) {
          router.replace("/dashboard/customers");
          return;
        }

        alert("Failed to delete customer");
        return;
      }

      // ✅ instant UI update
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  
  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>

        <button
          onClick={() => router.push("/dashboard/customers/create-new")}
          className="bg-[#0f172a] hover:bg-[#262e3f] text-white px-4 py-2 rounded-lg shadow-sm transition"
        >
          + New Customer
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table */}
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No customers yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Company</th>
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Contact</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {c.displayName}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {c.companyName || "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">{c.email || "-"}</td>

                  <td className="px-6 py-4 text-gray-600">
                    {c.primaryContact || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 IMPORTANT
                        handleDelete(c.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
