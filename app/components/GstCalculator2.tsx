"use client";

import { useMemo, useState, useEffect } from "react";

type TaxType = "exclusive" | "inclusive";

type GstCalculationResult = {
  actual: number;
  gstAmount: number;
  total: number;
};

type ProfitCalculationResult = {
  actualCost: number;
  gstPaid: number;
  actualSell: number;
  gstCollected: number;
  profit: number;
  gstPayable: number;
};

type PredictedPriceResult = {
  actualCost: number;
  gstPaid: number;
  baseSellingPrice: number;
  predictedGst: number;
  predictedSellingPrice: number;
  predictedSellingLabel: string;
};

function normalizeBaseAmount(amount: number, rate: number, taxType: TaxType) {
  if (taxType === "inclusive") {
    return amount / (1 + rate / 100);
  }

  return amount;
}

function calculateTaxAmount(baseAmount: number, rate: number) {
  return (baseAmount * rate) / 100;
}

export default function GstCalculator() {
  // =========================
  // GST CALCULATOR STATE
  // =========================
  const [amount, setAmount] = useState<number>(0);
  const [gst, setGst] = useState<number>(18);
  const [type, setType] = useState<TaxType>("exclusive");

  // =========================
  // PROFIT CALCULATOR STATE
  // =========================
  const [cost, setCost] = useState<number>(100);
  const [costGst, setCostGst] = useState<number>(18);
  const [costType, setCostType] = useState<TaxType>("inclusive");

  const [sell, setSell] = useState<number>(150);
  const [sellGst, setSellGst] = useState<number>(18);
  const [sellType, setSellType] = useState<TaxType>("exclusive");

  // User-editable desired profit
  const [desiredProfit, setDesiredProfit] = useState<number>(65);
  const [profitPercentage, setProfitPercentage] = useState<number>(0);

  // =========================
  // GST CALCULATION
  // =========================
  const gstResult: GstCalculationResult = useMemo(() => {
    if (!amount) {
      return {
        actual: 0,
        gstAmount: 0,
        total: 0,
      };
    }

    if (type === "exclusive") {
      const gstAmount = calculateTaxAmount(amount, gst);

      return {
        actual: amount,
        gstAmount,
        total: amount + gstAmount,
      };
    }

    const actual = normalizeBaseAmount(amount, gst, "inclusive");
    const gstAmount = amount - actual;

    return {
      actual,
      gstAmount,
      total: amount,
    };
  }, [amount, gst, type]);

  // =========================
  // PROFIT CALCULATION
  // =========================
  const profitResult: ProfitCalculationResult = useMemo(() => {
    const actualCost = normalizeBaseAmount(cost, costGst, costType);

    const gstPaid =
      costType === "inclusive"
        ? cost - actualCost
        : calculateTaxAmount(cost, costGst);

    const actualSell = normalizeBaseAmount(sell, sellGst, sellType);

    const gstCollected =
      sellType === "inclusive"
        ? sell - actualSell
        : calculateTaxAmount(sell, sellGst);

    const profit = actualSell - actualCost;
    const gstPayable = gstCollected - gstPaid;

    return {
      actualCost,
      gstPaid,
      actualSell,
      gstCollected,
      profit,
      gstPayable,
    };
  }, [cost, costGst, costType, sell, sellGst, sellType]);

  // =========================
  // PREDICTED SELLING PRICE
  // =========================
  const predictedResult: PredictedPriceResult = useMemo(() => {
    const actualCost = normalizeBaseAmount(cost, costGst, costType);

    const baseSellingPrice = actualCost + desiredProfit;
    const predictedGst = calculateTaxAmount(baseSellingPrice, sellGst);

    let predictedSellingPrice = baseSellingPrice;
    let predictedSellingLabel = "Exclusive Selling Price";

    if (sellType === "exclusive") {
      predictedSellingPrice = baseSellingPrice;
      predictedSellingLabel = "Exclusive Selling Price";
    } else {
      predictedSellingPrice = baseSellingPrice + predictedGst;
      predictedSellingLabel = "Inclusive Selling Price";
    }

    return {
      actualCost,
      gstPaid:
        costType === "inclusive"
          ? cost - actualCost
          : calculateTaxAmount(cost, costGst),
      baseSellingPrice,
      predictedGst,
      predictedSellingPrice,
      predictedSellingLabel,
    };
  }, [cost, costGst, costType, desiredProfit, sellGst, sellType]);

  // =========================
  // SYNC PROFIT % <-> AMOUNT
  // =========================
  const actualCostForSync = normalizeBaseAmount(cost, costGst, costType);

  // when desiredProfit changes → update %
  const handleDesiredProfitChange = (value: number) => {
    setDesiredProfit(value);

    if (actualCostForSync > 0) {
      setProfitPercentage((value / actualCostForSync) * 100);
    } else {
      setProfitPercentage(0);
    }
  };

  // when % changes → update desiredProfit
  const handleProfitPercentageChange = (value: number) => {
    setProfitPercentage(value);

    const profit = (actualCostForSync * value) / 100;
    setDesiredProfit(profit);
  };
  // =========================
  // AUTO SYNC WHEN COST CHANGES
  // =========================
  useEffect(() => {
    const actualCost = normalizeBaseAmount(cost, costGst, costType);

    if (actualCost > 0) {
      const profit = (actualCost * profitPercentage) / 100;
      setDesiredProfit(profit);
    }
  }, [cost, costGst, costType]);

  useEffect(() => {
    const actualCost = normalizeBaseAmount(cost, costGst, costType);

    if (actualCost > 0) {
      const percentage = (desiredProfit / actualCost) * 100;
      setProfitPercentage(percentage);
    }
  }, [desiredProfit]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      {/* ========================= HEADER ========================= */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            GST Calculator
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Calculate GST, profit, payable tax, and predicted selling price with
            a cleaner dashboard-style layout.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          {/* ========================= GST CALCULATOR ========================= */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    GST Calculator
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Calculate GST instantly
                  </h2>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                  Exclusive / Inclusive
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="grid gap-5 md:grid-cols-3">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>

                {/* GST % */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    GST %
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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

                {/* Tax Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Tax Type
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    value={type}
                    onChange={(e) => setType(e.target.value as TaxType)}
                  >
                    <option value="exclusive">Exclusive</option>
                    <option value="inclusive">Inclusive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-sm text-slate-500">Actual Amount</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    ₹{gstResult.actual.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <p className="text-sm text-emerald-700">GST Amount</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
                    ₹{gstResult.gstAmount.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
                  <p className="text-sm text-blue-700">Total Amount</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-blue-700">
                    ₹{gstResult.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================= PROFIT CALCULATOR ========================= */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-sky-50 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                    Profit Calculator
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Profit, GST paid, and payable tax
                  </h2>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                  Live profit summary
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="grid gap-5 md:grid-cols-3">
                {/* Cost Price */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                  />
                </div>

                {/* GST on Purchase */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    GST on Purchase (%)
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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

                {/* Purchase Tax Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Tax Type (Purchase)
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={costType}
                    onChange={(e) => setCostType(e.target.value as TaxType)}
                  >
                    <option value="exclusive">Exclusive</option>
                    <option value="inclusive">Inclusive</option>
                  </select>
                </div>

                {/* Selling Price */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={sell}
                    onChange={(e) => setSell(Number(e.target.value))}
                  />
                </div>

                {/* GST on Selling */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    GST on Selling (%)
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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

                {/* Selling Tax Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Tax Type (Selling)
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={sellType}
                    onChange={(e) => setSellType(e.target.value as TaxType)}
                  >
                    <option value="exclusive">Exclusive</option>
                    <option value="inclusive">Inclusive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <p className="text-sm text-emerald-700">Profit</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
                    ₹{profitResult.profit.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-sm text-slate-500">GST Paid</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    ₹{profitResult.gstPaid.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-sm text-slate-500">GST Collected</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    ₹{profitResult.gstCollected.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
                  <p className="text-sm text-blue-700">GST Payable</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-blue-700">
                    ₹{profitResult.gstPayable.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {/* Profit Percentage */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <label className="text-sm font-semibold text-slate-700">
                    Profit Percentage (%)
                  </label>
                  <input
                    type="number"
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={profitPercentage}
                    onChange={(e) =>
                      handleProfitPercentageChange(Number(e.target.value))
                    }
                  />
                </div>

                {/* Desired Profit */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <label className="text-sm font-semibold text-slate-700">
                    Desired Profit
                  </label>
                  <input
                    type="number"
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    value={desiredProfit}
                    onChange={(e) =>
                      handleDesiredProfitChange(Number(e.target.value))
                    }
                  />
                </div>

                {/* Predicted Selling Price */}
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                  <label className="text-sm font-semibold text-indigo-700">
                    Predicted Selling Price
                  </label>
                  <input
                    type="number"
                    className="mt-2 w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-slate-900 outline-none"
                    value={predictedResult.predictedSellingPrice.toFixed(2)}
                    readOnly
                  />
                  <p className="mt-3 text-xs leading-5 text-indigo-700/80">
                    {predictedResult.predictedSellingLabel} based on your
                    desired profit and selling tax type.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Actual Cost</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    ₹{predictedResult.actualCost.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Base Selling Price</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    ₹{predictedResult.baseSellingPrice.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <p className="text-sm text-emerald-700">
                    Predicted GST on Sale
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-700">
                    ₹{predictedResult.predictedGst.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            {/* HEADER */}
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                User Guide
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                How to Use the GST Calculator
              </h2>

              <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-600">
                Easily calculate GST amounts, total prices, profits, and GST
                payable using the calculator above. Simply enter your amount,
                select the GST percentage, and choose whether the tax is
                inclusive or exclusive.
              </p>
            </div>

            {/* STEP CARDS */}
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700">
                  1
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Enter Amount
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Enter the product or service amount in the calculator input
                  field.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700">
                  2
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Select GST Rate
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose the applicable GST slab such as 5%, 12%, 18%, or 28%
                  based on your product or service category.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700">
                  3
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Choose Tax Type
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Select Inclusive if GST is already included in the amount or
                  Exclusive if GST should be added separately.
                </p>
              </div>
            </div>

            {/* EXAMPLE SECTION */}
            <div className="mt-10 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT */}
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Example Calculation
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    GST Calculation Example
                  </h3>

                  <p className="mt-3 leading-7 text-slate-700">
                    Suppose a product costs <strong>₹100</strong> and GST is
                    <strong> 18%</strong>.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                      <p className="text-sm font-medium text-slate-600">
                        Exclusive GST
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ₹100 + 18 Total Amount = ₹118
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Actual Amount = ₹100 | GST Amount = ₹18
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                      <p className="text-sm font-medium text-slate-600">
                        Inclusive GST
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        Total Amount ₹100 already includes GST
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Actual Amount = ₹84.75 | GST Amount = ₹15.25
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="grid gap-4 sm:grid-cols-2 lg:w-[360px]">
                  <div className="rounded-2xl border border-white/60 bg-white/90 p-5 text-center shadow-sm">
                    <p className="text-sm text-slate-500">Actual Amount</p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      ₹100
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/90 p-5 text-center shadow-sm">
                    <p className="text-sm text-emerald-700">GST Amount (18%)</p>

                    <p className="mt-2 text-3xl font-bold text-emerald-700">
                      ₹18
                    </p>
                  </div>

                  <div className="sm:col-span-2 rounded-2xl border border-white/60 bg-white/90 p-5 text-center shadow-sm">
                    <p className="text-sm text-blue-700">Total Amount</p>

                    <p className="mt-2 text-4xl font-bold text-blue-700">
                      ₹118
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PREDICTED SELLING PRICE GUIDE */}
            <div className="mt-10 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT CONTENT */}
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                    Selling Price Prediction
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    How to Use Predicted Selling Price
                  </h3>

                  <p className="mt-4 leading-7 text-slate-700">
                    The calculator can automatically predict the selling price
                    required to achieve your desired profit based on the GST
                    type and your cost price.
                  </p>

                  {/* STEPS */}
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                      <p className="font-semibold text-slate-900">
                        Step 1 — Enter Cost Price
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Add the original purchase price of the product along
                        with GST details.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                      <p className="font-semibold text-slate-900">
                        Step 2 — Enter Desired Profit or Profit %
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        You can either enter the exact profit amount you want or
                        simply provide the desired profit percentage.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                      <p className="font-semibold text-slate-900">
                        Step 3 — Get Predicted Selling Price
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        The calculator automatically predicts the final selling
                        price needed to achieve your target profit after GST
                        calculations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE EXAMPLE */}
                <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lg">
                  <h4 className="text-lg font-bold text-slate-900">Example</h4>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-600">Cost Price</span>

                      <span className="font-bold text-slate-900">₹100</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-600">
                        Desired Profit
                      </span>

                      <span className="font-bold text-emerald-700">₹50</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-600">GST Rate</span>

                      <span className="font-bold text-slate-900">18%</span>
                    </div>

                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center">
                      <p className="text-sm text-indigo-700">
                        Predicted Selling Price
                      </p>

                      <p className="mt-2 text-4xl font-bold text-indigo-700">
                        ₹177
                      </p>

                      <p className="mt-2 text-xs leading-5 text-indigo-700/80">
                        ₹150 base selling price + 18% GST
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM TIPS */}
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h4 className="text-lg font-bold text-emerald-800">
                    🎯 Desired Profit
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    Enter the exact amount of profit you want to earn from the
                    product.
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <h4 className="text-lg font-bold text-orange-800">
                    📊 Profit Percentage
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-orange-700">
                    Instead of fixed profit, you can use profit percentage like
                    20%, 30%, or 50% to automatically calculate selling price.
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <h4 className="text-lg font-bold text-blue-800">
                    🧾 Base Selling Price
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-blue-700">
                    Base selling price is the actual product price before adding
                    GST on the final sale.
                  </p>
                </div>
              </div>
            </div>

            {/* EXTRA TIPS */}
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <h3 className="text-lg font-bold text-orange-800">
                  💡 Inclusive vs Exclusive
                </h3>

                <p className="mt-3 text-sm leading-6 text-orange-700">
                  Inclusive prices already contain GST inside the amount.
                  Exclusive prices add GST separately after calculation.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <h3 className="text-lg font-bold text-purple-800">
                  📈 Profit Calculation
                </h3>

                <p className="mt-3 text-sm leading-6 text-purple-700">
                  The Profit Calculator helps businesses understand actual
                  earnings after considering GST paid and GST collected.
                </p>
              </div>
            </div>
          </section>

          {/* ========================= INFO SECTION ========================= */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Learn GST
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                GST — Goods and Services Tax
              </h2>

              <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-600">
                GST is an indirect tax introduced in India on July 1, 2017. It
                is applied to the supply of goods and services and replaced
                multiple indirect taxes such as VAT, Service Tax, and Excise
                Duty.
              </p>
            </div>

            {/* INFO CARDS */}
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {/* What is GST */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 text-3xl">📘</div>

                <h3 className="text-lg font-bold text-slate-900">
                  What is GST?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  GST is a value-added tax charged on goods and services at
                  every stage of sale. Businesses collect GST from customers and
                  pay it to the government after adjusting input tax credits.
                </p>
              </div>

              {/* Inclusive GST */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-3 text-3xl">💰</div>

                <h3 className="text-lg font-bold text-emerald-800">
                  Inclusive GST
                </h3>

                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  Inclusive GST means the GST amount is already included in the
                  entered price.
                </p>

                <div className="mt-4 rounded-xl bg-white/80 p-3 text-sm font-medium text-emerald-800">
                  Example: ₹118 inclusive of 18% GST
                  <br />
                  Actual Price = ₹100
                  <br />
                  GST = ₹18
                </div>
              </div>

              {/* Exclusive GST */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="mb-3 text-3xl">🧾</div>

                <h3 className="text-lg font-bold text-blue-800">
                  Exclusive GST
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-700">
                  Exclusive GST means GST is added separately on top of the
                  entered amount.
                </p>

                <div className="mt-4 rounded-xl bg-white/80 p-3 text-sm font-medium text-blue-800">
                  Example: ₹100 + 18% GST
                  <br />
                  GST = ₹18
                  <br />
                  Final Amount = ₹118
                </div>
              </div>

              {/* Input Tax Credit */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <div className="mb-3 text-3xl">🔄</div>

                <h3 className="text-lg font-bold text-purple-800">
                  Input Tax Credit (ITC)
                </h3>

                <p className="mt-2 text-sm leading-6 text-purple-700">
                  Businesses can reduce the GST they owe by claiming credit for
                  GST already paid on purchases and expenses.
                </p>
              </div>

              {/* GST Slabs */}
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <div className="mb-3 text-3xl">📊</div>

                <h3 className="text-lg font-bold text-orange-800">
                  Common GST Slabs
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <div
                      key={rate}
                      className="rounded-xl bg-white px-4 py-3 text-center shadow-sm"
                    >
                      <p className="text-xl font-bold text-orange-700">
                        {rate}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profit Tip */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <div className="mb-3 text-3xl">📈</div>

                <h3 className="text-lg font-bold text-rose-800">Profit Tip</h3>

                <p className="mt-2 text-sm leading-6 text-rose-700">
                  Always calculate profit using the base amount before GST. GST
                  collected from customers is payable to the government and
                  should not be treated as business profit.
                </p>
              </div>
            </div>

            {/* BOTTOM NOTE */}
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">
                Quick Summary
              </h3>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>
                  ✅ Inclusive tax means GST is already included in the amount.
                </li>

                <li>
                  ✅ Exclusive tax means GST is added separately to the amount.
                </li>

                <li>
                  ✅ Businesses can claim GST paid on purchases using Input Tax
                  Credit.
                </li>

                <li>✅ GST payable = GST collected − GST paid.</li>

                <li>
                  ✅ Profit should always be calculated before GST adjustments.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
