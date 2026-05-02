"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  name: string;
  price: number;
  unit?: string | null;
};

export default function ItemsPage() {
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this item?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 404) {
          router.replace("/dashboard/items");
          return;
        }
        if (res.status === 400) {
        alert(data?.error || "Item cannot be deleted");
        return;
      }
        return;
      }

      // update UI instantly
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/items", {
        method: "GET",
        credentials: "include", // ✅ important for cookies
      });

      // ✅ handle non-OK responses safely
      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", res.status, text);

        if (res.status === 401) {
          router.push("/login");
        } else {
          setError("Failed to fetch items");
        }
        return;
      }

      // ✅ safe JSON parsing
      const text = await res.text();
      const data: Item[] = text ? JSON.parse(text) : [];

      setItems(data);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Items</h1>

        <button
          onClick={() => router.push("/dashboard/items/create-new")}
          className="bg-[#0f172a] hover:bg-[#262e3f] text-white px-4 py-2 rounded-lg transition"
        >
          + New Item
        </button>
      </div>

      {/* States */}
      {loading ? (
        <div className="text-gray-500 py-10">Loading items...</div>
      ) : error ? (
        <div className="text-red-500 py-10">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500 py-10 text-center">No items yet</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Unit</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/dashboard/items/${item.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">₹ {item.price}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.unit || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 THIS FIXES EVERYTHING
                        handleDelete(item.id);
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
        </div>
      )}
    </div>
  );
}
