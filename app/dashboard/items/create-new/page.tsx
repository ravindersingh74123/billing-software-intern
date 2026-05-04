//items/create-new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateItemPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "",
    description: "",
    gstRate: "",
    hsn: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.push("/dashboard/items");
    } catch {
      alert("Failed to create item");
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 min-h-full py-6">
      <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">New Item</h1>

        <div className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Name</label>
            <input
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Price</label>
            <input
              type="number"
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>

          {/* Unit */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">Unit</label>
            <input
              placeholder="e.g. pcs, kg"
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
            />
          </div>

          {/* GST Rate */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">GST Rate %</label>
            <input
              type="number"
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.gstRate}
              onChange={(e) => handleChange("gstRate", e.target.value)}
              placeholder="e.g. 5, 12, 18"
            />
          </div>

          {/* HSN */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-sm text-gray-600">HSN Number</label>
            <input
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.hsn}
              onChange={(e) => handleChange("hsn", e.target.value)}
              placeholder="e.g. 9983"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-3 items-start gap-4">
            <label className="text-sm text-gray-600 mt-2">Description</label>
            <textarea
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>

        <div className="border-t mt-8 pt-5 flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-md"
          >
            Save Item
          </button>
        </div>
      </div>
    </div>
  );
}
