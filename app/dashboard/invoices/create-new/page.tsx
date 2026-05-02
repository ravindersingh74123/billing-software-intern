"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function CreateInvoicePage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState("");

  const [rows, setRows] = useState<Row[]>([
    { itemId: "", name: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  useEffect(() => {
    fetchCustomers();
    fetchItems();
    generateInvoiceNo();
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  // 🔹 fetch customers
  const fetchCustomers = async () => {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
  };

  // 🔹 fetch items
  const fetchItems = async () => {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(data);
  };

  // 🔹 invoice number generator
  const generateInvoiceNo = () => {
    const num = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(6, "0");
    setInvoiceNo(`INV-${num}`);
  };

  // 🔹 handle item select
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

  // 🔹 quantity change
  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...rows];
    updated[index].quantity = qty;
    updated[index].amount = qty * updated[index].rate;
    setRows(updated);
  };

  // 🔹 add row
  const addRow = () => {
    setRows([
      ...rows,
      { itemId: "", name: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  // 🔹 submit
  const handleSubmit = async () => {
    const res = await fetch("/api/invoices", {
      method: "POST",
      body: JSON.stringify({
        customerId: selectedCustomer,
        invoiceNo,
        date,
        items: rows,
        total,
      }),
    });

    if (res.ok) router.push("/dashboard/invoices");
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-6">New Invoice</h1>

      {/* Customer */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">Customer</label>
        <select
          className="w-full border rounded-md p-2 mt-1"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">Select customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Invoice Info */}
      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 rounded-md"
          value={invoiceNo}
          readOnly
        />
        <input
          type="date"
          className="border p-2 rounded-md"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Item Details</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Rate</th>
              <th className="p-3 text-left">Amount</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">

                {/* ITEM DROPDOWN */}
                <td className="p-3">
                  <select
                    className="w-full border p-2 rounded-md"
                    value={row.itemId}
                    onChange={(e) =>
                      handleItemSelect(i, e.target.value)
                    }
                  >
                    <option value="">Select item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* QTY */}
                <td className="p-3">
                  <input
                    type="number"
                    className="border p-2 rounded-md w-20"
                    value={row.quantity}
                    onChange={(e) =>
                      handleQtyChange(i, Number(e.target.value))
                    }
                  />
                </td>

                {/* RATE */}
                <td className="p-3">₹ {row.rate}</td>

                {/* AMOUNT */}
                <td className="p-3 font-medium">
                  ₹ {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD ROW */}
      <button
        onClick={addRow}
        className="mt-4 text-blue-600 text-sm"
      >
        + Add New Row
      </button>

      {/* TOTAL */}
      <div className="mt-6 text-right text-lg font-semibold">
        Total: ₹ {total}
      </div>

      {/* ACTION */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="border px-4 py-2 rounded-md"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-5 py-2 rounded-md"
        >
          Save Invoice
        </button>
      </div>
    </div>
  );
}