//app/customers/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCustomerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: "",
    displayName: "",
    primaryContact: "",
    email: "",
    pan: "",
    gstin: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      console.log(data)
      setForm({
        companyName: data.companyName || "",
        displayName: data.displayName || "",
        primaryContact: data.primaryContact || "",
        email: data.email || "",
        pan: data.pan || "",
        gstin: data.gstin || "",
        addressLine1: data.addressLine1 || "",
        addressLine2: data.addressLine2 || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        bankName: data.bankName || "",
        accountName: data.accountName || "",
        accountNumber: data.accountNumber || "",
        ifsc: data.ifsc || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.push("/dashboard/customers");
    } catch {
      alert("Update failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 min-h-full py-6">
      <div className="max-w-4xl mx-auto rounded-2xl border border-white/30 bg-white/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-8">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Edit Customer
        </h1>

        {/* Form */}
        <div className="space-y-5">
          {/* Company */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Company Name</label>
            <input
              className="col-span-2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>

          {/* Display Name */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Display Name</label>
            <input
              className="col-span-2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Primary Contact</label>
            <input
              className="col-span-2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.primaryContact}
              onChange={(e) => handleChange("primaryContact", e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              type="email"
              className="col-span-2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* PAN */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">PAN</label>
            <input
              className="col-span-2 border rounded-md px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.pan}
              onChange={(e) => handleChange("pan", e.target.value)}
            />
          </div>

          {/* GSTIN */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">GSTIN</label>
            <input
              className="col-span-2 border rounded-md px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.gstin}
              onChange={(e) => handleChange("gstin", e.target.value)}
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-700 pt-4">Address</h2>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Address Line 1</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.addressLine1}
              onChange={(e) => handleChange("addressLine1", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Address Line 2</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.addressLine2}
              onChange={(e) => handleChange("addressLine2", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">City</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">State</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Pincode</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-700 pt-4">
            Bank Details
          </h2>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Bank Name</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Account Name</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.accountName}
              onChange={(e) => handleChange("accountName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Account Number</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">IFSC Code</label>
            <input
              className="col-span-2 bg-white/60 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.ifsc}
              onChange={(e) => handleChange("ifsc", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t mt-8 pt-5 flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="px-5 py-2 text-sm bg-[#0f172a] hover:bg-[#262e3f] text-white rounded-md"
          >
            Update Customer
          </button>
        </div>
      </div>
    </div>
  );
}
