"use client";

import { useState, useMemo } from "react";

export default function EmiCalculator() {
  const [amount, setAmount] = useState(200000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(24);

  // EMI Calculation
  const emiData = useMemo(() => {
    if (rate === 0) {
      const emi = amount / tenure;
      return {
        emi,
        total: amount,
        interest: 0,
      };
    }

    const monthlyRate = rate / 12 / 100;

    const emi =
      (amount *
        monthlyRate *
        Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);

    const total = emi * tenure;
    const interest = total - amount;

    return { emi, total, interest };
  }, [amount, rate, tenure]);

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-4xl grid md:grid-cols-2 gap-6">
      
      {/* LEFT SIDE */}
      <div className="space-y-6">

        {/* Loan Amount */}
        <div>
          <label className="font-medium">Loan Amount</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="range"
              min={0}
              max={4000000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-32 border rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="font-medium">Interest Rate (%)</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="range"
              min={0}
              max={25}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={rate}
              step={0.1}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-24 border rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* Tenure */}
        <div>
          <label className="font-medium">Tenure (Months)</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="range"
              min={0}
              max={120}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-24 border rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* EMI Display */}
        <div className="bg-gray-100 rounded-xl p-4 text-lg font-semibold">
          Your EMI: ₹ {emiData.emi.toFixed(0)}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center items-center bg-gray-50 rounded-xl p-6">
        <div className="text-gray-500">Total Amount Payable</div>
        <div className="text-3xl font-bold mt-2">
          ₹ {emiData.total.toFixed(0)}
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between w-64">
            <span>Principal</span>
            <span>₹ {amount}</span>
          </div>
          <div className="flex justify-between w-64">
            <span>Interest</span>
            <span>₹ {emiData.interest.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}