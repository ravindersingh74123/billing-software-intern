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
  gstRate: number | null;
  hsn: string | null;
};

type Row = {
  itemId: string;
  name: string;
  quantity: number;
  rate: number;
  gstRate: number;
  gstAmount: number;
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
          gstRate: i.gstRate ?? 0,
          gstAmount: i.gstAmount ?? 0,
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

    const updatedRows = [...rows];

    const quantity = updatedRows[index].quantity;

    const rate = item.price;
    const gstRate = item.gstRate || 0;

    const taxable = rate * quantity;
    const gstAmount = (taxable * gstRate) / 100;
    const total = taxable + gstAmount;

    updatedRows[index] = {
      ...updatedRows[index],
      itemId,
      name: item.name,
      rate,
      gstRate,
      gstAmount,
      amount: total,
    };

    setRows(updatedRows);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return; // don't allow empty invoice
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRateChange = (index: number, newRate: number) => {
    const updatedRows = [...rows];

    updatedRows[index].rate = newRate;

    const quantity = updatedRows[index].quantity;
    const gstRate = updatedRows[index].gstRate;

    // 🔥 calculation
    const taxable = newRate * quantity;
    const gstAmount = (taxable * gstRate) / 100;
    const total = taxable + gstAmount;

    updatedRows[index].gstAmount = gstAmount;
    updatedRows[index].amount = total;

    setRows(updatedRows);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updatedRows = [...rows];

    updatedRows[index].quantity = qty;

    const rate = updatedRows[index].rate;
    const gstRate = updatedRows[index].gstRate;

    const taxable = rate * qty;
    const gstAmount = (taxable * gstRate) / 100;

    updatedRows[index].gstAmount = gstAmount;
    updatedRows[index].amount = taxable + gstAmount;

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        itemId: "",
        name: "",
        quantity: 1,
        rate: 0,
        gstRate: 0,
        gstAmount: 0,
        amount: 0,
      },
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
          <tr className="border-b">
            <th className="p-3 text-left w-[30%]">Item</th>
            <th className="p-3 text-center w-[10%]">Qty</th>
            <th className="p-3 text-right w-[12%]">Rate</th>
            <th className="p-3 text-center w-[10%]">GST %</th>
            <th className="p-3 text-right w-[18%]">Amount</th>
            <th className="p-3 text-right w-[15%]">Total</th>
            <th className="p-3 text-right w-[5%]">Action</th>
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

              {/* <td className="p-3 text-right font-mono tabular-nums">
                ₹ {row.rate.toFixed(2)}
              </td> */}
              <td className="p-3 text-right font-mono tabular-nums">
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) => handleRateChange(i, Number(e.target.value))}
                  className="border rounded px-2 py-1 w-24 text-center"
                />
              </td>

              <td className="p-3 text-center">{row.gstRate}%</td>

              {/* Amount */}
              <td className="p-3 text-right font-mono tabular-nums leading-tight">
                <div>₹ {(row.rate * row.quantity).toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  + ₹ {row.gstAmount.toFixed(2)}
                </div>
              </td>

              <td className="p-3 text-right font-semibold font-mono tabular-nums">
                ₹ {row.amount.toFixed(2)}
              </td>

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
