// // app/components/crypto-calculator.tsx

// "use client";

// import { useMemo, useState } from "react";

// const coins = ["BTC", "ETH", "SOL", "DOGE", "XRP", "BNB", "ADA"];

// export default function CryptoCalculator() {
//   const [investment, setInvestment] = useState(1000);
//   const [buyPrice, setBuyPrice] = useState(50000);
//   const [sellPrice, setSellPrice] = useState(70000);
//   const [buyFee, setBuyFee] = useState(0);
//   const [sellFee, setSellFee] = useState(0);
//   const [taxRate, setTaxRate] = useState(30);
//   const [tdsRate, setTdsRate] = useState(1);
//   const [selectedCoin, setSelectedCoin] = useState("BTC");

//   const calculations = useMemo(() => {
//     const sanitizedInvestment = Math.max(0, investment);
//     const sanitizedBuyFee = Math.max(0, buyFee);
//     const sanitizedSellFee = Math.max(0, sellFee);
//     const sanitizedBuyPrice = Math.max(0, buyPrice);
//     const sanitizedSellPrice = Math.max(0, sellPrice);

//     const investmentAfterFee = Math.max(
//       0,
//       sanitizedInvestment - sanitizedBuyFee
//     );

//     const quantity =
//       sanitizedBuyPrice > 0 ? investmentAfterFee / sanitizedBuyPrice : 0;

//     const grossSellValue = quantity * sanitizedSellPrice;
//     const totalSellValue = Math.max(0, grossSellValue - sanitizedSellFee);
//     const grossProfit = totalSellValue - sanitizedInvestment;

//     const taxableProfit = Math.max(0, grossProfit);
//     const tax = taxableProfit * (Math.max(0, taxRate) / 100);
//     const cess = tax * 0.04;
//     const totalTax = tax + cess;

//     const tds = totalSellValue * (Math.max(0, tdsRate) / 100);
//     const netProfit = grossProfit - totalTax;
//     const finalTakeHome = totalSellValue - totalTax - tds;

//     const roi = sanitizedInvestment > 0 ? (grossProfit / sanitizedInvestment) * 100 : 0;

//     return {
//       quantity,
//       grossSellValue,
//       totalSellValue,
//       grossProfit,
//       tax,
//       cess,
//       totalTax,
//       tds,
//       netProfit,
//       finalTakeHome,
//       roi,
//     };
//   }, [investment, buyPrice, sellPrice, buyFee, sellFee, taxRate, tdsRate]);

//   const positive = calculations.grossProfit >= 0;

//   const InputField = ({
//     label,
//     value,
//     setValue,
//     hint,
//     prefix = "$",
//   }: {
//     label: string;
//     value: number;
//     setValue: (value: number) => void;
//     hint?: string;
//     prefix?: string;
//   }) => (
//     <div className="space-y-2">
//       <div className="flex items-end justify-between gap-4">
//         <label className="text-sm font-semibold tracking-wide text-slate-700">
//           {label}
//         </label>
//         {hint ? (
//           <span className="text-xs font-medium text-slate-400">{hint}</span>
//         ) : null}
//       </div>

//       <div className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 focus-within:border-[#2aa7a1] focus-within:shadow-[0_0_0_4px_rgba(42,167,161,0.12)]">
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-semibold text-slate-400">{prefix}</span>
//           <input
//             type="number"
//             value={value}
//             onChange={(e) => setValue(Number(e.target.value))}
//             className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-300"
//           />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
//       {/* LEFT PANEL */}
//       <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//         <div className="relative overflow-hidden border-b border-slate-200 px-8 py-8">
//           <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(42,167,161,0.08),rgba(34,33,73,0.04),rgba(117,194,44,0.06))]" />
//           <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#2aa7a1]/10 blur-3xl" />
//           <div className="absolute -bottom-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#75c22c]/10 blur-3xl" />

//           <div className="relative flex flex-col gap-5">
//             <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2aa7a1]/20 bg-[#eaf9f8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#1f6f6b]">
//               BanavatNest • Crypto Calculator
//             </div>

//             <div className="max-w-2xl">
//               <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
//                 Crypto Profit Calculator
//               </h1>
//               <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
//                 Estimate your profit, tax, TDS, and final take-home with a clean
//                 calculator built around your brand colors.
//               </p>
//             </div>

//             <div className="grid gap-4 sm:grid-cols-3">
//               <MiniStat
//                 label="Selected coin"
//                 value={selectedCoin}
//                 tone="teal"
//               />
//               <MiniStat
//                 label="Estimated ROI"
//                 value={`${calculations.roi.toFixed(2)}%`}
//                 tone="navy"
//               />
//               <MiniStat
//                 label="Final take-home"
//                 value={`$${calculations.finalTakeHome.toFixed(2)}`}
//                 tone="green"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="px-8 py-8">
//           <h2 className="text-xl font-bold text-slate-900">Choose Cryptocurrency</h2>
//           <p className="mt-2 text-sm text-slate-500">
//             Pick a coin to keep the calculator visual consistent.
//           </p>

//           <div className="mt-5 flex flex-wrap gap-3">
//             {coins.map((coin) => (
//               <button
//                 key={coin}
//                 onClick={() => setSelectedCoin(coin)}
//                 className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
//                   selectedCoin === coin
//                     ? "border-[#2aa7a1] bg-[#eaf9f8] text-[#1f6f6b] shadow-[0_10px_30px_rgba(42,167,161,0.14)]"
//                     : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
//                 }`}
//               >
//                 <span
//                   className={`h-2.5 w-2.5 rounded-full ${
//                     selectedCoin === coin ? "bg-[#75c22c]" : "bg-slate-300"
//                   }`}
//                 />
//                 {coin}
//               </button>
//             ))}
//           </div>

//           <div className="mt-8 grid gap-6 md:grid-cols-2">
//             <InputField
//               label="Investment Amount"
//               value={investment}
//               setValue={setInvestment}
//               hint="Total amount you invest"
//             />
//             <InputField
//               label="Buy Price"
//               value={buyPrice}
//               setValue={setBuyPrice}
//               hint="Price when you buy"
//             />
//             <InputField
//               label="Sell Price"
//               value={sellPrice}
//               setValue={setSellPrice}
//               hint="Price when you sell"
//             />
//             <InputField
//               label="Buy Fee"
//               value={buyFee}
//               setValue={setBuyFee}
//               hint="Exchange or network fee"
//             />
//             <InputField
//               label="Sell Fee"
//               value={sellFee}
//               setValue={setSellFee}
//               hint="Exit or selling fee"
//             />
//             <InputField
//               label="Tax Rate (%)"
//               value={taxRate}
//               setValue={setTaxRate}
//               prefix=""
//               hint="Default 30% in India"
//             />
//             <InputField
//               label="TDS Rate (%)"
//               value={tdsRate}
//               setValue={setTdsRate}
//               prefix=""
//               hint="Usually 1% in India"
//             />
//           </div>

//           <div className="mt-8 rounded-[28px] border border-[#2aa7a1]/20 bg-[linear-gradient(135deg,rgba(42,167,161,0.08),rgba(117,194,44,0.10))] p-6">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-600">Quantity purchased</p>
//                 <p className="mt-1 text-xs text-slate-500">
//                   Based on investment and buy price
//                 </p>
//               </div>
//               <div className="text-2xl font-extrabold tracking-tight text-slate-900">
//                 {calculations.quantity.toFixed(6)}{" "}
//                 <span className="text-[#1f6f6b]">{selectedCoin}</span>
//               </div>
//             </div>

//             <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/70">
//               <div
//                 className="h-full rounded-full bg-[linear-gradient(90deg,#2aa7a1,#75c22c)]"
//                 style={{
//                   width: `${Math.min(100, Math.max(10, Math.abs(calculations.roi)))}%`,
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT PANEL */}
//       <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//         <div className="text-center">
//           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2aa7a1,#75c22c)] shadow-[0_14px_30px_rgba(42,167,161,0.24)]">
//             <span className="text-xl font-black text-white">₹</span>
//           </div>
//           <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
//             Investment Outcome
//           </h2>
//           <p className="mt-3 text-sm leading-6 text-slate-500">
//             Clean breakdown of profit, taxes and your final amount.
//           </p>
//         </div>

//         <div className="mt-8 space-y-4">
//           <ResultCard
//             title="Gross Profit / Loss"
//             value={`$${calculations.grossProfit.toFixed(2)}`}
//             sub={`${calculations.roi.toFixed(2)}% ROI`}
//             positive={positive}
//           />

//           <ResultCard
//             title="Total Tax"
//             value={`$${calculations.totalTax.toFixed(2)}`}
//           />

//           <ResultCard
//             title="TDS Deduction"
//             value={`$${calculations.tds.toFixed(2)}`}
//           />

//           <ResultCard
//             title="Net Profit"
//             value={`$${calculations.netProfit.toFixed(2)}`}
//             positive={calculations.netProfit >= 0}
//           />
//         </div>

//         <div className="mt-5 rounded-[28px] bg-[linear-gradient(135deg,#1f6f6b,#2aa7a1,#75c22c)] p-6 text-white shadow-[0_20px_40px_rgba(31,111,107,0.25)]">
//           <p className="text-sm font-medium opacity-90">Final Take Home</p>
//           <h3 className="mt-2 text-4xl font-extrabold tracking-tight">
//             ${calculations.finalTakeHome.toFixed(2)}
//           </h3>
//           <p className="mt-2 text-sm leading-6 text-white/85">
//             This is the estimated amount after fees, tax, and TDS.
//           </p>
//         </div>

//         <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-slate-500">Tax amount</span>
//             <span className="font-semibold text-slate-900">
//               ${calculations.tax.toFixed(2)}
//             </span>
//           </div>
//           <div className="mt-3 flex items-center justify-between text-sm">
//             <span className="text-slate-500">4% cess</span>
//             <span className="font-semibold text-slate-900">
//               ${calculations.cess.toFixed(2)}
//             </span>
//           </div>
//           <div className="mt-3 flex items-center justify-between text-sm">
//             <span className="text-slate-500">Sell value after fees</span>
//             <span className="font-semibold text-slate-900">
//               ${calculations.totalSellValue.toFixed(2)}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function MiniStat({
//   label,
//   value,
//   tone,
// }: {
//   label: string;
//   value: string;
//   tone: "teal" | "navy" | "green";
// }) {
//   const toneClasses = {
//     teal: "bg-[#eaf9f8] text-[#1f6f6b] border-[#2aa7a1]/15",
//     navy: "bg-[#eef1fb] text-[#222149] border-[#222149]/10",
//     green: "bg-[#f1f8e9] text-[#4a7f18] border-[#75c22c]/20",
//   };

//   return (
//     <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
//       <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
//         {label}
//       </p>
//       <p className="mt-2 text-lg font-extrabold tracking-tight">{value}</p>
//     </div>
//   );
// }

// function ResultCard({
//   title,
//   value,
//   sub,
//   positive,
// }: {
//   title: string;
//   value: string;
//   sub?: string;
//   positive?: boolean;
// }) {
//   return (
//     <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
//       <p className="text-sm font-medium text-slate-500">{title}</p>
//       <h3
//         className={`mt-2 text-3xl font-extrabold tracking-tight ${
//           positive === undefined
//             ? "text-slate-900"
//             : positive
//             ? "text-[#4a7f18]"
//             : "text-rose-600"
//         }`}
//       >
//         {value}
//       </h3>
//       {sub ? (
//         <p
//           className={`mt-1 text-sm font-semibold ${
//             positive === undefined
//               ? "text-slate-500"
//               : positive
//               ? "text-[#4a7f18]"
//               : "text-rose-500"
//           }`}
//         >
//           {sub}
//         </p>
//       ) : null}
//     </div>
//   );
// }






















"use client";

import { useMemo, useState } from "react";

const coins = ["BTC", "ETH", "SOL", "DOGE", "XRP", "BNB", "ADA"] as const;
const EPSILON = 1e-12;

type Coin = (typeof coins)[number];

type TransactionType = "BUY" | "SELL";

type Transaction = {
  id: string;
  type: TransactionType;
  coin: Coin;
  quantity: number;
  price: number;
  fee: number;
  date: string; // ISO string
};

type Lot = {
  quantity: number;
  totalCost: number;
};

type AnalysisResult = {
  holdings: number;
  averageBuyPrice: number;
  currentValue: number;
  realizedProfit: number;
  unrealizedProfit: number;
  totalBuyValue: number;
  totalSellValue: number;
  totalBuyFees: number;
  totalSellFees: number;
  tax: number;
  cess: number;
  totalTax: number;
  tds: number;
  netAfterTaxAndTds: number;
};

const initialCurrentPrices: Record<Coin, number> = coins.reduce(
  (acc, coin) => {
    acc[coin] = 0;
    return acc;
  },
  {} as Record<Coin, number>
);

export default function CryptoCalculator() {
  const [selectedCoin, setSelectedCoin] = useState<Coin>("BTC");
  const [transactionType, setTransactionType] =
    useState<TransactionType>("BUY");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [fee, setFee] = useState(0);
  const [taxRate, setTaxRate] = useState(30);
  const [tdsRate, setTdsRate] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPrices, setCurrentPrices] =
    useState<Record<Coin, number>>(initialCurrentPrices);
  const [timestamp, setTimestamp] = useState(getLocalDatetimeValue());

  const currentPrice = currentPrices[selectedCoin] ?? 0;

  const selectedCoinSummary = useMemo(
    () =>
      analyzeCoinTransactions(
        transactions,
        selectedCoin,
        currentPrice,
        taxRate,
        tdsRate
      ),
    [transactions, selectedCoin, currentPrice, taxRate, tdsRate]
  );

  const portfolioSummary = useMemo(
    () => analyzePortfolioTotals(transactions, taxRate, tdsRate),
    [transactions, taxRate, tdsRate]
  );

  const selectedCoinTransactions = useMemo(
    () =>
      sortTransactions(
        transactions.filter((transaction) => transaction.coin === selectedCoin)
      ),
    [transactions, selectedCoin]
  );

  const addTransaction = () => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
    const safePrice = Number.isFinite(price) ? Math.max(0, price) : 0;
    const safeFee = Number.isFinite(fee) ? Math.max(0, fee) : 0;

    if (safeQuantity <= 0 || safePrice <= 0) {
      return;
    }

    const currentHoldings = calculateHoldings(transactions, selectedCoin);

    if (transactionType === "SELL" && safeQuantity > currentHoldings + EPSILON) {
      alert(`Not enough ${selectedCoin} holdings to sell.`);
      return;
    }

    const safeDate = timestamp ? new Date(timestamp) : new Date();

    if (Number.isNaN(safeDate.getTime())) {
      alert("Please choose a valid date and time.");
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: transactionType,
      coin: selectedCoin,
      quantity: safeQuantity,
      price: safePrice,
      fee: safeFee,
      date: safeDate.toISOString(),
    };

    setTransactions((prev) => sortTransactions([...prev, newTransaction]));
    setQuantity(0);
    setPrice(0);
    setFee(0);
    setTimestamp(getLocalDatetimeValue());
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  const clearAllTransactions = () => {
    setTransactions([]);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
      {/* LEFT PANEL */}
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="relative overflow-hidden border-b border-slate-200 px-8 py-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(42,167,161,0.08),rgba(34,33,73,0.04),rgba(117,194,44,0.06))]" />
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#2aa7a1]/10 blur-3xl" />
          <div className="absolute -bottom-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#75c22c]/10 blur-3xl" />

          <div className="relative flex flex-col gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2aa7a1]/20 bg-[#eaf9f8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#1f6f6b]">
              BanavatNest • Portfolio Tracker
            </div>

            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Crypto Portfolio Calculator
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Track multiple buys and sells, calculate FIFO profit and loss,
                and estimate tax, TDS, and unrealized P/L for the selected coin.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MiniStat label="Selected coin" value={selectedCoin} tone="teal" />
              <MiniStat
                label="Current price"
                value={formatCurrency(currentPrice)}
                tone="navy"
              />
              <MiniStat
                label="Transactions"
                value={String(transactions.length)}
                tone="green"
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-slate-900">
            Choose Cryptocurrency
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Switch coins to view and manage that coin&apos;s transaction history
            and profit breakdown.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {coins.map((coin) => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                  selectedCoin === coin
                    ? "border-[#2aa7a1] bg-[#eaf9f8] text-[#1f6f6b] shadow-[0_10px_30px_rgba(42,167,161,0.14)]"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    selectedCoin === coin ? "bg-[#75c22c]" : "bg-slate-300"
                  }`}
                />
                {coin}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <InputField
              label="Current Price"
              value={currentPrice}
              setValue={(value) =>
                setCurrentPrices((prev) => ({
                  ...prev,
                  [selectedCoin]: value,
                }))
              }
              hint="Used for unrealized P/L"
            />

            <InputField
              label="Tax Rate (%)"
              value={taxRate}
              setValue={setTaxRate}
              prefix=""
              hint="Default 30% in India"
            />

            <InputField
              label="TDS Rate (%)"
              value={tdsRate}
              setValue={setTdsRate}
              prefix=""
              hint="Usually 1% in India"
            />
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Add Transaction
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Enter one buy or sell at a time. The app keeps the order and
                  uses FIFO for profit calculation.
                </p>
              </div>

              <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
                {selectedCoin}
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-slate-700">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) =>
                    setTransactionType(e.target.value as TransactionType)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold text-slate-900 outline-none transition-all duration-300 focus:border-[#2aa7a1] focus:shadow-[0_0_0_4px_rgba(42,167,161,0.12)]"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-slate-700">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold text-slate-900 outline-none transition-all duration-300 focus:border-[#2aa7a1] focus:shadow-[0_0_0_4px_rgba(42,167,161,0.12)]"
                />
              </div>

              <InputField
                label="Quantity"
                value={quantity}
                setValue={setQuantity}
                prefix=""
                hint={`How much ${selectedCoin} you bought or sold`}
              />

              <InputField
                label="Price"
                value={price}
                setValue={setPrice}
                hint={`Per ${selectedCoin} unit`}
              />

              <InputField
                label="Fee"
                value={fee}
                setValue={setFee}
                hint="Exchange or network fee"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={addTransaction}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f6f6b,#2aa7a1,#75c22c)] px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.01]"
              >
                Add Transaction
              </button>

              <button
                onClick={clearAllTransactions}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-100"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-[#2aa7a1]/20 bg-[linear-gradient(135deg,rgba(42,167,161,0.08),rgba(117,194,44,0.10))] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Selected Coin Holdings
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  FIFO will match sells against the earliest buys for this coin.
                </p>
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                {formatQuantity(selectedCoinSummary.holdings)}{" "}
                <span className="text-[#1f6f6b]">{selectedCoin}</span>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#2aa7a1,#75c22c)]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      10,
                      Math.abs(selectedCoinSummary.realizedProfit) > 0
                        ? Math.min(
                            100,
                            Math.abs(selectedCoinSummary.realizedProfit) / 10
                          )
                        : 10
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900">
                Transactions
              </h3>
              <p className="text-sm text-slate-500">
                {selectedCoinTransactions.length} transaction
                {selectedCoinTransactions.length === 1 ? "" : "s"} for{" "}
                {selectedCoin}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {selectedCoinTransactions.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No {selectedCoin} transactions yet.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a buy or sell above to start tracking this coin.
                  </p>
                </div>
              ) : (
                selectedCoinTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${
                          transaction.type === "BUY"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {transaction.type === "BUY" ? "B" : "S"}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-slate-900">
                            {transaction.type} {transaction.coin}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                              transaction.type === "BUY"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Qty:{" "}
                          <span className="font-semibold text-slate-700">
                            {formatQuantity(transaction.quantity)}
                          </span>{" "}
                          • Price:{" "}
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(transaction.price)}
                          </span>{" "}
                          • Fee:{" "}
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(transaction.fee)}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDisplayDate(transaction.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Transaction Value
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-slate-900">
                          {formatCurrency(transaction.quantity * transaction.price)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeTransaction(transaction.id)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-300 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2aa7a1,#75c22c)] shadow-[0_14px_30px_rgba(42,167,161,0.24)]">
            <span className="text-xl font-black text-white">₹</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Portfolio Summary
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            FIFO-based breakdown for the selected coin plus overall portfolio
            realized profit and tax estimate.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <MiniStat
            label="Selected coin"
            value={selectedCoin}
            tone="teal"
          />
          <MiniStat
            label="Current value"
            value={formatCurrency(selectedCoinSummary.currentValue)}
            tone="navy"
          />
          <MiniStat
            label="Portfolio net"
            value={formatCurrency(portfolioSummary.netAfterTaxAndTds)}
            tone="green"
          />
        </div>

        <div className="mt-8 space-y-4">
          <ResultCard
            title="Average Buy Price"
            value={formatCurrency(selectedCoinSummary.averageBuyPrice)}
            sub={
              selectedCoinSummary.holdings > 0
                ? `Based on remaining ${selectedCoin} holdings`
                : `No remaining ${selectedCoin} holdings`
            }
          />

          <ResultCard
            title="Realized Profit / Loss"
            value={formatCurrency(selectedCoinSummary.realizedProfit)}
            sub="FIFO matched sell profit before tax and TDS"
            positive={selectedCoinSummary.realizedProfit >= 0}
          />

          <ResultCard
            title="Unrealized Profit / Loss"
            value={formatCurrency(selectedCoinSummary.unrealizedProfit)}
            sub={
              currentPrice > 0
                ? `Marked to market at ${formatCurrency(currentPrice)}`
                : "Enter current price to calculate unrealized P/L"
            }
            positive={selectedCoinSummary.unrealizedProfit >= 0}
          />

          <ResultCard
            title="Tax + Cess"
            value={formatCurrency(selectedCoinSummary.totalTax)}
            sub="Tax is applied on positive realized profit only"
          />

          <ResultCard
            title="TDS Deduction"
            value={formatCurrency(selectedCoinSummary.tds)}
            sub="Estimated on sell value"
          />

          <ResultCard
            title="Net After Tax & TDS"
            value={formatCurrency(selectedCoinSummary.netAfterTaxAndTds)}
            sub="Realized profit minus tax and TDS"
            positive={selectedCoinSummary.netAfterTaxAndTds >= 0}
          />
        </div>

        <div className="mt-5 rounded-[28px] bg-[linear-gradient(135deg,#1f6f6b,#2aa7a1,#75c22c)] p-6 text-white shadow-[0_20px_40px_rgba(31,111,107,0.25)]">
          <p className="text-sm font-medium opacity-90">Selected Coin Take Home</p>
          <h3 className="mt-2 text-4xl font-extrabold tracking-tight">
            {formatCurrency(selectedCoinSummary.netAfterTaxAndTds)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/85">
            This is the estimated amount after selling fees, tax, and TDS for
            the currently selected coin.
          </p>
        </div>

        <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Total buy value</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(selectedCoinSummary.totalBuyValue)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Total sell value</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(selectedCoinSummary.totalSellValue)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Buy fees</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(selectedCoinSummary.totalBuyFees)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Sell fees</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(selectedCoinSummary.totalSellFees)}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Portfolio realized P/L</span>
            <span
              className={`font-semibold ${
                portfolioSummary.realizedProfit >= 0
                  ? "text-emerald-700"
                  : "text-rose-600"
              }`}
            >
              {formatCurrency(portfolioSummary.realizedProfit)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Portfolio tax + cess</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(portfolioSummary.totalTax)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Portfolio TDS</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(portfolioSummary.tds)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Portfolio net after deductions</span>
            <span
              className={`font-semibold ${
                portfolioSummary.netAfterTaxAndTds >= 0
                  ? "text-emerald-700"
                  : "text-rose-600"
              }`}
            >
              {formatCurrency(portfolioSummary.netAfterTaxAndTds)}
            </span>
          </div>
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-400">
          FIFO matching is applied separately for each coin. Sells are matched
          against the earliest remaining buys of the same coin.
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "teal" | "navy" | "green";
}) {
  const toneClasses = {
    teal: "bg-[#eaf9f8] text-[#1f6f6b] border-[#2aa7a1]/15",
    navy: "bg-[#eef1fb] text-[#222149] border-[#222149]/10",
    green: "bg-[#f1f8e9] text-[#4a7f18] border-[#75c22c]/20",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
        {label}
      </p>
      <p className="mt-2 text-lg font-extrabold tracking-tight">{value}</p>
    </div>
  );
}

function ResultCard({
  title,
  value,
  sub,
  positive,
}: {
  title: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3
        className={`mt-2 text-3xl font-extrabold tracking-tight ${
          positive === undefined
            ? "text-slate-900"
            : positive
            ? "text-[#4a7f18]"
            : "text-rose-600"
        }`}
      >
        {value}
      </h3>
      {sub ? (
        <p
          className={`mt-1 text-sm font-semibold ${
            positive === undefined
              ? "text-slate-500"
              : positive
              ? "text-[#4a7f18]"
              : "text-rose-500"
          }`}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function calculateHoldings(transactions: Transaction[], coin: Coin): number {
  return sortTransactions(transactions)
    .filter((transaction) => transaction.coin === coin)
    .reduce((total, transaction) => {
      return total + (transaction.type === "BUY" ? transaction.quantity : -transaction.quantity);
    }, 0);
}

function analyzeCoinTransactions(
  transactions: Transaction[],
  coin: Coin,
  currentPrice: number,
  taxRate: number,
  tdsRate: number
): AnalysisResult {
  const filtered = sortTransactions(
    transactions.filter((transaction) => transaction.coin === coin)
  );

  const lots: Lot[] = [];

  let realizedProfit = 0;
  let totalBuyValue = 0;
  let totalSellValue = 0;
  let totalBuyFees = 0;
  let totalSellFees = 0;
  let tds = 0;

  for (const transaction of filtered) {
    if (transaction.type === "BUY") {
      totalBuyValue += transaction.quantity * transaction.price;
      totalBuyFees += transaction.fee;

      lots.push({
        quantity: transaction.quantity,
        totalCost: transaction.quantity * transaction.price + transaction.fee,
      });
      continue;
    }

    totalSellValue += transaction.quantity * transaction.price;
    totalSellFees += transaction.fee;
    tds += transaction.quantity * transaction.price * (Math.max(0, tdsRate) / 100);

    let quantityToSell = transaction.quantity;

    while (quantityToSell > EPSILON && lots.length > 0) {
      const lot = lots[0];
      const lotQuantityBefore = lot.quantity;

      const usedQuantity = Math.min(quantityToSell, lotQuantityBefore);
      const costPortion =
        lotQuantityBefore > 0
          ? lot.totalCost * (usedQuantity / lotQuantityBefore)
          : 0;

      const sellValuePortion = usedQuantity * transaction.price;

      realizedProfit += sellValuePortion - costPortion - (transaction.fee * (usedQuantity / transaction.quantity));

      lot.quantity -= usedQuantity;
      lot.totalCost -= costPortion;
      quantityToSell -= usedQuantity;

      if (lot.quantity <= EPSILON) {
        lots.shift();
      }
    }
  }

  const holdings = lots.reduce((sum, lot) => sum + lot.quantity, 0);
  const remainingCostBasis = lots.reduce((sum, lot) => sum + lot.totalCost, 0);
  const averageBuyPrice = holdings > EPSILON ? remainingCostBasis / holdings : 0;
  const currentValue = holdings * Math.max(0, currentPrice);
  const unrealizedProfit = currentValue - remainingCostBasis;

  const taxableProfit = Math.max(0, realizedProfit);
  const tax = taxableProfit * (Math.max(0, taxRate) / 100);
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const netAfterTaxAndTds = realizedProfit - totalTax - tds;

  return {
    holdings,
    averageBuyPrice,
    currentValue,
    realizedProfit,
    unrealizedProfit,
    totalBuyValue,
    totalSellValue,
    totalBuyFees,
    totalSellFees,
    tax,
    cess,
    totalTax,
    tds,
    netAfterTaxAndTds,
  };
}

function analyzePortfolioTotals(
  transactions: Transaction[],
  taxRate: number,
  tdsRate: number
): AnalysisResult {
  const ordered = sortTransactions(transactions);
  const pools = new Map<Coin, Lot[]>();

  let realizedProfit = 0;
  let totalBuyValue = 0;
  let totalSellValue = 0;
  let totalBuyFees = 0;
  let totalSellFees = 0;
  let tds = 0;

  for (const transaction of ordered) {
    const pool = pools.get(transaction.coin) ?? [];

    if (transaction.type === "BUY") {
      totalBuyValue += transaction.quantity * transaction.price;
      totalBuyFees += transaction.fee;

      pool.push({
        quantity: transaction.quantity,
        totalCost: transaction.quantity * transaction.price + transaction.fee,
      });
      pools.set(transaction.coin, pool);
      continue;
    }

    totalSellValue += transaction.quantity * transaction.price;
    totalSellFees += transaction.fee;
    tds += transaction.quantity * transaction.price * (Math.max(0, tdsRate) / 100);

    let quantityToSell = transaction.quantity;

    while (quantityToSell > EPSILON && pool.length > 0) {
      const lot = pool[0];
      const lotQuantityBefore = lot.quantity;

      const usedQuantity = Math.min(quantityToSell, lotQuantityBefore);
      const costPortion =
        lotQuantityBefore > 0
          ? lot.totalCost * (usedQuantity / lotQuantityBefore)
          : 0;

      const sellValuePortion = usedQuantity * transaction.price;

      realizedProfit += sellValuePortion - costPortion - (transaction.fee * (usedQuantity / transaction.quantity));

      lot.quantity -= usedQuantity;
      lot.totalCost -= costPortion;
      quantityToSell -= usedQuantity;

      if (lot.quantity <= EPSILON) {
        pool.shift();
      }
    }
  }

  const taxableProfit = Math.max(0, realizedProfit);
  const tax = taxableProfit * (Math.max(0, taxRate) / 100);
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const netAfterTaxAndTds = realizedProfit - totalTax - tds;

  return {
    holdings: 0,
    averageBuyPrice: 0,
    currentValue: 0,
    realizedProfit,
    unrealizedProfit: 0,
    totalBuyValue,
    totalSellValue,
    totalBuyFees,
    totalSellFees,
    tax,
    cess,
    totalTax,
    tds,
    netAfterTaxAndTds,
  };
}

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}

function formatCurrency(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  const absolute = Math.abs(safe).toFixed(2);
  return `${safe < 0 ? "-" : ""}$${absolute}`;
}

function formatQuantity(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toFixed(6);
}

function getLocalDatetimeValue(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString();
}

function InputField({
  label,
  value,
  setValue,
  hint,
  prefix = "$",
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  hint?: string;
  prefix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <label className="text-sm font-semibold tracking-wide text-slate-700">
          {label}
        </label>
        {hint ? (
          <span className="text-xs font-medium text-slate-400">{hint}</span>
        ) : null}
      </div>

      <div className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 focus-within:border-[#2aa7a1] focus-within:shadow-[0_0_0_4px_rgba(42,167,161,0.12)]">
        <div className="flex items-center gap-2">
          {prefix ? (
            <span className="text-sm font-semibold text-slate-400">{prefix}</span>
          ) : null}
          <input
            type="number"
            min="0"
            step="any"
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => {
              const nextValue =
                e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
              setValue(Number.isFinite(nextValue) ? nextValue : 0);
            }}
            className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-300"
          />
        </div>
      </div>
    </div>
  );
}