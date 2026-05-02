// "use client";

// import { useMemo, useState } from "react";

// type TaxType = "exclusive" | "inclusive";

// type GstCalculationResult = {
//   actual: number;
//   gstAmount: number;
//   total: number;
// };

// type ProfitCalculationResult = {
//   actualCost: number;
//   gstPaid: number;
//   actualSell: number;
//   gstCollected: number;
//   profit: number;
//   gstPayable: number;
// };

// type PredictedPriceResult = {
//   actualCost: number;
//   gstPaid: number;
//   baseSellingPrice: number;
//   predictedGst: number;
//   predictedSellingPrice: number;
//   predictedSellingLabel: string;
// };

// function normalizeBaseAmount(amount: number, rate: number, taxType: TaxType) {
//   if (taxType === "inclusive") {
//     return amount / (1 + rate / 100);
//   }

//   return amount;
// }

// function calculateTaxAmount(baseAmount: number, rate: number) {
//   return (baseAmount * rate) / 100;
// }

// export default function GstCalculator() {
//   // =========================
//   // GST CALCULATOR STATE
//   // =========================
//   const [amount, setAmount] = useState<number>(0);
//   const [gst, setGst] = useState<number>(18);
//   const [type, setType] = useState<TaxType>("exclusive");

//   // =========================
//   // PROFIT CALCULATOR STATE
//   // =========================
//   const [cost, setCost] = useState<number>(100);
//   const [costGst, setCostGst] = useState<number>(18);
//   const [costType, setCostType] = useState<TaxType>("inclusive");

//   const [sell, setSell] = useState<number>(150);
//   const [sellGst, setSellGst] = useState<number>(18);
//   const [sellType, setSellType] = useState<TaxType>("exclusive");

//   // User-editable desired profit
//   const [desiredProfit, setDesiredProfit] = useState<number>(65);

//   // =========================
//   // GST CALCULATION
//   // =========================
//   const gstResult: GstCalculationResult = useMemo(() => {
//     if (!amount) {
//       return {
//         actual: 0,
//         gstAmount: 0,
//         total: 0,
//       };
//     }

//     if (type === "exclusive") {
//       const gstAmount = calculateTaxAmount(amount, gst);

//       return {
//         actual: amount,
//         gstAmount,
//         total: amount + gstAmount,
//       };
//     }

//     const actual = normalizeBaseAmount(amount, gst, "inclusive");
//     const gstAmount = amount - actual;

//     return {
//       actual,
//       gstAmount,
//       total: amount,
//     };
//   }, [amount, gst, type]);

//   // =========================
//   // PROFIT CALCULATION
//   // =========================
//   const profitResult: ProfitCalculationResult = useMemo(() => {
//     const actualCost = normalizeBaseAmount(cost, costGst, costType);

//     const gstPaid =
//       costType === "inclusive"
//         ? cost - actualCost
//         : calculateTaxAmount(cost, costGst);

//     const actualSell = normalizeBaseAmount(sell, sellGst, sellType);

//     const gstCollected =
//       sellType === "inclusive"
//         ? sell - actualSell
//         : calculateTaxAmount(sell, sellGst);

//     const profit = actualSell - actualCost;
//     const gstPayable = gstCollected - gstPaid;

//     return {
//       actualCost,
//       gstPaid,
//       actualSell,
//       gstCollected,
//       profit,
//       gstPayable,
//     };
//   }, [cost, costGst, costType, sell, sellGst, sellType]);

//   // =========================
//   // PREDICTED SELLING PRICE
//   // =========================
//   const predictedResult: PredictedPriceResult = useMemo(() => {
//     const actualCost = normalizeBaseAmount(cost, costGst, costType);

//     const baseSellingPrice = actualCost + desiredProfit;
//     const predictedGst = calculateTaxAmount(baseSellingPrice, sellGst);

//     let predictedSellingPrice = baseSellingPrice;
//     let predictedSellingLabel = "Exclusive Selling Price";

//     if (sellType === "exclusive") {
//       predictedSellingPrice = baseSellingPrice;
//       predictedSellingLabel = "Exclusive Selling Price";
//     } else {
//       predictedSellingPrice = baseSellingPrice + predictedGst;
//       predictedSellingLabel = "Inclusive Selling Price";
//     }

//     return {
//       actualCost,
//       gstPaid:
//         costType === "inclusive"
//           ? cost - actualCost
//           : calculateTaxAmount(cost, costGst),
//       baseSellingPrice,
//       predictedGst,
//       predictedSellingPrice,
//       predictedSellingLabel,
//     };
//   }, [cost, costGst, costType, desiredProfit, sellGst, sellType]);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* ========================= HERO ========================= */}
//       <div className="bg-teal-500 text-white py-16 text-center">
//         <h1 className="text-4xl font-bold mb-3">FREE GST CALCULATOR</h1>
//         <p className="opacity-90">
//           Calculate GST instantly without complex math.
//         </p>
//       </div>

//       {/* ========================= GST CALCULATOR CARD ========================= */}
//       <div className="max-w-4xl mx-auto -mt-12 bg-white rounded-xl shadow-lg p-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           {/* Amount */}
//           <div>
//             <label className="block mb-2 font-medium text-black">Amount</label>
//             <input
//               type="number"
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               placeholder="Enter amount"
//               value={amount}
//               onChange={(e) => setAmount(Number(e.target.value))}
//             />
//           </div>

//           {/* GST % */}
//           <div>
//             <label className="block mb-2 font-medium text-black">GST %</label>
//             <select
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={gst}
//               onChange={(e) => setGst(Number(e.target.value))}
//             >
//               {[0, 5, 12, 18, 28].map((g) => (
//                 <option key={g} value={g}>
//                   {g}%
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Tax Type */}
//           <div>
//             <label className="block mb-2 font-medium text-black">Tax</label>
//             <select
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={type}
//               onChange={(e) => setType(e.target.value as TaxType)}
//             >
//               <option value="exclusive">Exclusive</option>
//               <option value="inclusive">Inclusive</option>
//             </select>
//           </div>
//         </div>

//         {/* GST RESULT */}
//         <div className="flex items-center justify-between text-center gap-4">
//           <div className="flex-1">
//             <p className="text-3xl font-semibold text-gray-900">
//               ₹{gstResult.actual.toFixed(2)}
//             </p>
//             <p className="text-sm text-gray-500">Actual Amount</p>
//           </div>

//           <span className="text-2xl font-bold text-gray-900">+</span>

//           <div className="flex-1">
//             <p className="text-3xl font-semibold text-green-600">
//               ₹{gstResult.gstAmount.toFixed(2)}
//             </p>
//             <p className="text-sm text-gray-500">GST Amount</p>
//           </div>

//           <span className="text-2xl font-bold text-gray-900">=</span>

//           <div className="flex-1">
//             <p className="text-3xl font-semibold text-blue-600">
//               ₹{gstResult.total.toFixed(2)}
//             </p>
//             <p className="text-sm text-gray-500">Total Amount</p>
//           </div>
//         </div>
//       </div>

//       {/* ========================= PROFIT CALCULATOR ========================= */}
//       <div className="max-w-4xl mx-auto mt-12 bg-white rounded-xl shadow-lg p-8">
//         <h2 className="text-xl font-bold mb-6 text-black">
//           💼 Profit Calculator
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           {/* Cost Price */}
//           <div>
//             <label className="block mb-2 font-medium text-black">
//               Cost Price
//             </label>
//             <input
//               type="number"
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={cost}
//               onChange={(e) => setCost(Number(e.target.value))}
//             />
//           </div>

//           {/* GST on Purchase */}
//           <div>
//             <label className="block mb-2 font-medium text-black">
//               GST on Purchase (%)
//             </label>
//             <select
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={costGst}
//               onChange={(e) => setCostGst(Number(e.target.value))}
//             >
//               {[0, 5, 12, 18, 28].map((g) => (
//                 <option key={g} value={g}>
//                   {g}%
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Purchase Tax Type */}
//           <div>
//             <label className="block mb-2 font-medium text-black">
//               Tax Type (Purchase)
//             </label>
//             <select
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={costType}
//               onChange={(e) => setCostType(e.target.value as TaxType)}
//             >
//               <option value="exclusive">Exclusive</option>
//               <option value="inclusive">Inclusive</option>
//             </select>
//           </div>

//           {/* Selling Price */}
//           <div>
//             <label className="block mb-2 font-medium text-black">
//               Selling Price
//             </label>
//             <input
//               type="number"
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={sell}
//               onChange={(e) => setSell(Number(e.target.value))}
//             />
//           </div>

//           {/* GST on Selling */}
//           <div>
//             <label className="block mb-2 font-medium text-black">
//               GST on Selling (%)
//             </label>
//             <select
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={sellGst}
//               onChange={(e) => setSellGst(Number(e.target.value))}
//             >
//               {[0, 5, 12, 18, 28].map((g) => (
//                 <option key={g} value={g}>
//                   {g}%
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Selling Tax Type */}
//           <div>
//             <label className="block mb-2 font-medium text-black">
//               Tax Type (Selling)
//             </label>
//             <select
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={sellType}
//               onChange={(e) => setSellType(e.target.value as TaxType)}
//             >
//               <option value="exclusive">Exclusive</option>
//               <option value="inclusive">Inclusive</option>
//             </select>
//           </div>

//           {/* Desired Profit - new editable row */}
//           <div>
//             <label className="block mb-2 font-medium text-black">
//               Desired Profit
//             </label>
//             <input
//               type="number"
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={desiredProfit}
//               onChange={(e) => setDesiredProfit(Number(e.target.value))}
//             />
//           </div>

//           {/* Predicted Selling Price - follows selling tax type */}
//           <div className="md:col-span-2">
//             <label className="block mb-2 font-medium text-black">
//               Predicted Selling Price
//             </label>
//             <input
//               type="number"
//               className="w-full border rounded-md px-3 py-2 text-black bg-white"
//               value={predictedResult.predictedSellingPrice.toFixed(2)}
//               readOnly
//             />
//             <p className="mt-2 text-xs text-gray-500">
//               {predictedResult.predictedSellingLabel} based on your desired
//               profit and selling tax type.
//             </p>
//           </div>
//         </div>

//         {/* RESULT */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//           <div>
//             <p className="text-lg font-semibold text-green-600">
//               ₹{profitResult.profit.toFixed(2)}
//             </p>
//             <p className="text-sm text-black">Profit</p>
//           </div>

//           <div>
//             <p className="text-lg font-semibold text-black">
//               ₹{profitResult.gstPaid.toFixed(2)}
//             </p>
//             <p className="text-sm text-black">GST Paid</p>
//           </div>

//           <div>
//             <p className="text-lg font-semibold text-black">
//               ₹{profitResult.gstCollected.toFixed(2)}
//             </p>
//             <p className="text-sm text-black">GST Collected</p>
//           </div>

//           <div>
//             <p className="text-lg font-semibold text-blue-600">
//               ₹{profitResult.gstPayable.toFixed(2)}
//             </p>
//             <p className="text-sm text-black">GST Payable</p>
//           </div>
//         </div>

//         {/* Optional mini breakdown */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="rounded-lg border p-4">
//             <p className="text-sm text-gray-500">Actual Cost</p>
//             <p className="text-lg font-semibold text-black">
//               ₹{predictedResult.actualCost.toFixed(2)}
//             </p>
//           </div>

//           <div className="rounded-lg border p-4">
//             <p className="text-sm text-gray-500">Base Selling Price</p>
//             <p className="text-lg font-semibold text-black">
//               ₹{predictedResult.baseSellingPrice.toFixed(2)}
//             </p>
//           </div>

//           <div className="rounded-lg border p-4">
//             <p className="text-sm text-gray-500">Predicted GST on Sale</p>
//             <p className="text-lg font-semibold text-green-600">
//               ₹{predictedResult.predictedGst.toFixed(2)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ========================= INFO SECTION ========================= */}
//       <div className="max-w-4xl mx-auto mt-12 px-4 pb-12">
//         <h2 className="text-2xl font-bold mb-4 text-gray-900">
//           GST - Goods and Services Tax
//         </h2>
//         <p className="text-gray-600 leading-relaxed">
//           GST is an indirect tax introduced in India on July 1, 2017. It is
//           applied to the supply of goods and services and replaces multiple
//           indirect taxes previously levied.
//         </p>
//       </div>
//     </div>
//   );
// }

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
    <div className="min-h-screen bg-gray-100">
      {/* ========================= HERO ========================= */}
      <div className="bg-teal-500 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-3">FREE GST CALCULATOR</h1>
        <p className="opacity-90">
          Calculate GST instantly without complex math.
        </p>
      </div>

      {/* ========================= GST CALCULATOR CARD ========================= */}
      <div className="max-w-4xl mx-auto -mt-12 bg-white rounded-xl shadow-lg p-8">
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

          {/* GST % */}
          <div>
            <label className="block mb-2 font-medium text-black">GST %</label>
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

          {/* Tax Type */}
          <div>
            <label className="block mb-2 font-medium text-black">Tax</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={type}
              onChange={(e) => setType(e.target.value as TaxType)}
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </div>
        </div>

        {/* GST RESULT */}
        <div className="flex items-center justify-between text-center gap-4">
          <div className="flex-1">
            <p className="text-3xl font-semibold text-gray-900">
              ₹{gstResult.actual.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Actual Amount</p>
          </div>

          <span className="text-2xl font-bold text-gray-900">+</span>

          <div className="flex-1">
            <p className="text-3xl font-semibold text-green-600">
              ₹{gstResult.gstAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">GST Amount</p>
          </div>

          <span className="text-2xl font-bold text-gray-900">=</span>

          <div className="flex-1">
            <p className="text-3xl font-semibold text-blue-600">
              ₹{gstResult.total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </div>
      </div>

      {/* ========================= PROFIT CALCULATOR ========================= */}
      <div className="max-w-4xl mx-auto mt-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6 text-black">
          💼 Profit Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Cost Price */}
          <div>
            <label className="block mb-2 font-medium text-black">
              Cost Price
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
            />
          </div>

          {/* GST on Purchase */}
          <div>
            <label className="block mb-2 font-medium text-black">
              GST on Purchase (%)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
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
          <div>
            <label className="block mb-2 font-medium text-black">
              Tax Type (Purchase)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={costType}
              onChange={(e) => setCostType(e.target.value as TaxType)}
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block mb-2 font-medium text-black">
              Selling Price
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={sell}
              onChange={(e) => setSell(Number(e.target.value))}
            />
          </div>

          {/* GST on Selling */}
          <div>
            <label className="block mb-2 font-medium text-black">
              GST on Selling (%)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
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
          <div>
            <label className="block mb-2 font-medium text-black">
              Tax Type (Selling)
            </label>
            <select
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={sellType}
              onChange={(e) => setSellType(e.target.value as TaxType)}
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </div>

          {/* Desired Profit - new editable row */}
          {/* Profit Percentage */}
          <div>
            <label className="block mb-2 font-medium text-black">
              Profit Percentage (%)
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={profitPercentage}
              onChange={(e) =>
                handleProfitPercentageChange(Number(e.target.value))
              }
            />
          </div>

          {/* Desired Profit */}
          <div>
            <label className="block mb-2 font-medium text-black">
              Desired Profit
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={desiredProfit}
              onChange={(e) =>
                handleDesiredProfitChange(Number(e.target.value))
              }
            />
          </div>

          {/* Predicted Selling Price */}
          <div>
            <label className="block mb-2 font-medium text-black">
              Predicted Selling Price
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              value={predictedResult.predictedSellingPrice.toFixed(2)}
              readOnly
            />
            <p className="mt-2 text-xs text-gray-500">
              {predictedResult.predictedSellingLabel} based on your desired
              profit and selling tax type.
            </p>
          </div>
        </div>

        {/* RESULT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-green-600">
              ₹{profitResult.profit.toFixed(2)}
            </p>
            <p className="text-sm text-black">Profit</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-black">
              ₹{profitResult.gstPaid.toFixed(2)}
            </p>
            <p className="text-sm text-black">GST Paid</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-black">
              ₹{profitResult.gstCollected.toFixed(2)}
            </p>
            <p className="text-sm text-black">GST Collected</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-blue-600">
              ₹{profitResult.gstPayable.toFixed(2)}
            </p>
            <p className="text-sm text-black">GST Payable</p>
          </div>
        </div>

        {/* Optional mini breakdown */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Actual Cost</p>
            <p className="text-lg font-semibold text-black">
              ₹{predictedResult.actualCost.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Base Selling Price</p>
            <p className="text-lg font-semibold text-black">
              ₹{predictedResult.baseSellingPrice.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Predicted GST on Sale</p>
            <p className="text-lg font-semibold text-green-600">
              ₹{predictedResult.predictedGst.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ========================= INFO SECTION ========================= */}
      <div className="max-w-4xl mx-auto mt-12 px-4 pb-12">
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
