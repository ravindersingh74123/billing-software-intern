//dashboard/items/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/items/${id}`);

      if (!res.ok) {
        router.replace("/dashboard/items");

        return;
      }

      const data = await res.json();

      setForm({
        name: data.name || "",
        price: String(data.price || ""),
        unit: data.unit || "",
        description: data.description || "",
      });
    } catch (err) {
      console.error(err);
      router.replace("/dashboard/items");
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
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      if (!res.ok) throw new Error();

      router.push("/dashboard/items");
    } catch {
      alert("Update failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 min-h-full py-6">
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl p-8">
        <h1 className="text-2xl font-semibold mb-6">Edit Item</h1>

        <div className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm text-gray-600">Name</label>
            <input
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm text-gray-600">Price</label>
            <input
              type="number"
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>

          {/* Unit */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm text-gray-600">Unit</label>
            <input
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-3 gap-4 items-start">
            <label className="text-sm text-gray-600 mt-2">Description</label>
            <textarea
              className="col-span-2 bg-white/80 border border-gray-200 rounded-md px-3 py-2"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t mt-8 pt-5 flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="px-5 py-2 bg-blue-600 text-white rounded-md"
          >
            Update Item
          </button>
        </div>
      </div>
    </div>
  );
}
