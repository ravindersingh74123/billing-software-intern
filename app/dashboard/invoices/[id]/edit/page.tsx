"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Customer = {
  id: string;
  displayName: string;
};

type Item = {
  id: string;
  name: string;
  price: number;
};

type Row = {
  itemId: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
};

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState("");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [invRes, custRes, itemRes] = await Promise.all([
        fetch(`/api/invoices/${id}`),
        fetch("/api/customers"),
        fetch("/api/items"),
      ]);

      // 🔴 handle invoice response safely
      if (!invRes.ok) {
        const text = await invRes.text();
        console.error("Invoice API error:", invRes.status, text);
        return;
      }

      const invText = await invRes.text();
      const invoice = invText ? JSON.parse(invText) : null;

      if (!invoice) {
        console.error("Invoice empty");
        return;
      }

      // ✅ others
      const customers = await custRes.json();
      const items = await itemRes.json();

      setCustomers(customers);
      setItems(items);

      setCustomerId(invoice.customerId);
      setInvoiceNo(invoice.invoiceNo);
      setDate(invoice.issueDate.slice(0, 10));

      setRows(
        invoice.items.map((i: any) => ({
          itemId: i.itemId || "",
          name: i.name,
          quantity: i.quantity,
          rate: i.price,
          amount: i.total,
        })),
      );
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      itemId,
      name: item.name,
      rate: item.price,
      amount: item.price * updated[index].quantity,
    };

    setRows(updated);
  };
  const removeRow = (index: number) => {
    if (rows.length === 1) return; // don't allow empty invoice
    setRows(rows.filter((_, i) => i !== index));
  };
  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...rows];
    updated[index].quantity = qty;
    updated[index].amount = qty * updated[index].rate;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { itemId: "", name: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleUpdate = async () => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        customerId,
        invoiceNo,
        date,
        items: rows,
        total,
      }),
    });

    if (res.ok) router.push("/dashboard/invoices");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Invoice</h1>

      {/* Customer */}
      <select
        className="border p-2 rounded mb-4 w-full"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
      >
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.displayName}
          </option>
        ))}
      </select>

      {/* Table */}
      <table className="w-full border rounded-xl overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-center">Qty</th>
            <th className="p-3 text-center">Rate</th>
            <th className="p-3 text-center">Amount</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              {/* Item */}
              <td className="p-3">
                <select
                  className="w-full border p-2 rounded"
                  value={row.itemId}
                  onChange={(e) => handleItemSelect(i, e.target.value)}
                >
                  <option value="">Select item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </td>

              {/* Qty */}
              <td className="p-3 text-center">
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => handleQtyChange(i, Number(e.target.value))}
                  className="border p-2 w-20 rounded text-center"
                />
              </td>

              {/* Rate */}
              <td className="p-3 text-center">₹ {row.rate}</td>

              {/* Amount */}
              <td className="p-3 text-center font-medium">₹ {row.amount}</td>

              {/* Delete */}
              <td className="p-3 text-right">
                <button
                  onClick={() => removeRow(i)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow} className="mt-4 text-blue-600 hover:underline">
        + Add Row
      </button>

      <div className="mt-6 text-right font-semibold">Total: ₹ {total}</div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Update Invoice
        </button>
      </div>
    </div>
  );
}


