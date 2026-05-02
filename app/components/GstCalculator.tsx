"use client";

import { useState } from "react";

export default function GstCalculator() {
  const [amount, setAmount] = useState<number>(0);
  const [gst, setGst] = useState<number>();
  const [type, setType] = useState<"exclusive" | "inclusive">("exclusive");

  const [cost, setCost] = useState(0);
  const [costGst, setCostGst] = useState(18);

  const [sell, setSell] = useState(0);
  const [sellGst, setSellGst] = useState(18);

  const [costType, setCostType] = useState<"exclusive" | "inclusive">(
    "exclusive",
  );
  const [sellType, setSellType] = useState<"exclusive" | "inclusive">(
    "exclusive",
  );

  const calculateProfit = () => {
    // COST SIDE
    let actualCost = cost;
    let gstPaid = 0;

    if (costType === "exclusive") {
      gstPaid = (cost * costGst) / 100;
    } else {
      actualCost = cost / (1 + costGst / 100);
      gstPaid = cost - actualCost;
    }

    // SELL SIDE
    let actualSell = sell;
    let gstCollected = 0;

    if (sellType === "exclusive") {
      gstCollected = (sell * sellGst) / 100;
    } else {
      actualSell = sell / (1 + sellGst / 100);
      gstCollected = sell - actualSell;
    }

    const profit = actualSell - actualCost;
    const gstPayable = gstCollected - gstPaid;

    return {
      profit,
      gstPaid,
      gstCollected,
      gstPayable,
    };
  };

  const { profit, gstPaid, gstCollected, gstPayable } = calculateProfit();

  const calculateGST = () => {
    if (!amount || !gst) {
      return { actual: 0, gstAmount: 0, total: 0 };
    }

    if (type === "exclusive") {
      const gstAmount = (amount * gst) / 100;
      const total = amount + gstAmount;

      return {
        actual: amount,
        gstAmount,
        total,
      };
    } else {
      const actual = amount / (1 + gst / 100);
      const gstAmount = amount - actual;

      return {
        actual,
        gstAmount,
        total: amount,
      };
    }
  };

  const { actual, gstAmount, total } = calculateGST();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HERO */}
      <div className="bg-teal-500 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-3">FREE GST CALCULATOR</h1>
        <p className="opacity-90">
          Calculate GST instantly without complex math.
        </p>
      </div>

      {/* CARD */}
      <div className="max-w-4xl mx-auto -mt-12 bg-white rounded-xl shadow-lg p-8">
        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Amount */}
          <div>
            <label className="block mb-2 font-medium text-black">Amount</label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          {/* GST */}
          <div>
            <label className="block mb-2 font-medium text-gray-900">
              GST %
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={gst}
              onChange={(e) => setGst(Number(e.target.value))}
            >
              {[0, 5, 12, 18, 28].map((g) => (
                <option key={g} value={g}>
                  {g}%
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block mb-2 font-medium text-gray-900">Tax</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "exclusive" | "inclusive")
              }
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </div>
        </div>

        {/* RESULT */}
        <div className="flex items-center justify-between text-center">
          <div>
            <p className="text-3xl font-semibold text-gray-900">
              ₹{actual.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Actual Amount</p>
          </div>

          <span className="text-2xl font-bold text-gray-900">+</span>

          <div>
            <p className="text-3xl font-semibold text-green-600">
              ₹{gstAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">GST Amount</p>
          </div>

          <span className="text-2xl font-bold text-gray-900">=</span>

          <div>
            <p className="text-3xl font-semibold text-blue-600">
              ₹{total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6 text-black">
          💼 Profit Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Cost */}
          <div>
            <label className="block mb-2 font-medium text-black">
              Cost Price
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
            />
          </div>

          {/* Cost GST */}
          <div>
            <label className="block mb-2 font-medium text-black">
              GST on Purchase (%)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black"
              value={costGst}
              onChange={(e) => setCostGst(Number(e.target.value))}
            >
              {[0, 5, 12, 18, 28].map((g) => (
                <option key={g} value={g}>
                  {g}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-black">
              Tax Type (Purchase)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black"
              value={costType}
              onChange={(e) =>
                setCostType(e.target.value as "exclusive" | "inclusive")
              }
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </div>

          {/* Sell */}
          <div>
            <label className="block mb-2 font-medium text-black">
              Selling Price
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black"
              value={sell}
              onChange={(e) => setSell(Number(e.target.value))}
            />
          </div>

          {/* Sell GST */}
          <div>
            <label className="block mb-2 font-medium text-black">
              GST on Selling (%)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black"
              value={sellGst}
              onChange={(e) => setSellGst(Number(e.target.value))}
            >
              {[0, 5, 12, 18, 28].map((g) => (
                <option key={g} value={g}>
                  {g}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-black">
              Tax Type (Selling)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black"
              value={sellType}
              onChange={(e) =>
                setSellType(e.target.value as "exclusive" | "inclusive")
              }
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </div>
        </div>

        {/* RESULT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-green-600">
              ₹{profit.toFixed(2)}
            </p>
            <p className="text-sm text-black">Profit</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-black">
              ₹{gstPaid.toFixed(2)}
            </p>
            <p className="text-sm text-black">GST Paid</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-black">
              ₹{gstCollected.toFixed(2)}
            </p>
            <p className="text-sm text-black">GST Collected</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-blue-600">
              ₹{gstPayable.toFixed(2)}
            </p>
            <p className="text-sm text-black">GST Payable</p>
          </div>
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          GST - Goods and Services Tax
        </h2>
        <p className="text-gray-600 leading-relaxed">
          GST is an indirect tax introduced in India on July 1, 2017. It is
          applied to the supply of goods and services and replaces multiple
          indirect taxes previously levied.
        </p>
      </div>
    </div>
  );
}
