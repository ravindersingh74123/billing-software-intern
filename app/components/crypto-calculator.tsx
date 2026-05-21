"use client";

import { useMemo, useState, useEffect } from "react";

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
  createdAt: number | string;
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
  taxableProfit: number;
  totalBuyValue: number;
  totalSellValue: number;
  totalBuyFees: number;
  totalSellFees: number;
  tax: number;
  totalTax: number;
  tds: number;
  netAfterTaxAndTds: number;
};

type PortfolioRow = {
  coin: Coin;
  holdings: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedProfit: number;
  realizedProfit: number;
  netProfit: number;
  allocation: number;
  taxableProfit: number;
  totalSellValue: number;
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
  const [timestamp, setTimestamp] = useState(getLocalDatetimeValue());
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // ── Settings — always start with static defaults
  const [taxRate, setTaxRate] = useState(30);
  const [tdsRate, setTdsRate] = useState(1);
  const [currentPrices, setCurrentPrices] =
    useState<Record<Coin, number>>(initialCurrentPrices);

  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crypto/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTransactions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch transactions:", err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    try {
      const lsTax = localStorage.getItem("taxRate");
      const lsTds = localStorage.getItem("tdsRate");
      const lsPrices = localStorage.getItem("currentPrices");
      if (lsTax !== null) setTaxRate(Number(lsTax));
      if (lsTds !== null) setTdsRate(Number(lsTds));
      if (lsPrices) {
        const parsed = JSON.parse(lsPrices);
        setCurrentPrices({ ...initialCurrentPrices, ...parsed });
      }
    } catch {
      // Ignore
    }

    fetch("/api/crypto/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Settings fetch failed");
        return res.json();
      })
      .then((data) => {
        if (typeof data.taxRate === "number") setTaxRate(data.taxRate);
        if (typeof data.tdsRate === "number") setTdsRate(data.tdsRate);
        if (data.currentPrices && typeof data.currentPrices === "object") {
          setCurrentPrices({ ...initialCurrentPrices, ...data.currentPrices });
        }
      })
      .catch((err) => {
        console.warn("Could not load settings from DB, using localStorage:", err);
      })
      .finally(() => {
        setSettingsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem("taxRate", taxRate.toString());
  }, [taxRate, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem("tdsRate", tdsRate.toString());
  }, [tdsRate, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem("currentPrices", JSON.stringify(currentPrices));
  }, [currentPrices, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    const timer = setTimeout(() => {
      fetch("/api/crypto/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxRate, tdsRate, currentPrices }),
      }).catch((err) => console.warn("Settings save failed:", err));
    }, 600);
    return () => clearTimeout(timer);
  }, [taxRate, tdsRate, currentPrices, settingsLoaded]);

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
    () => analyzePortfolioTotals(transactions, currentPrices, taxRate, tdsRate),
    [transactions, currentPrices, taxRate, tdsRate]
  );

  const portfolioRows = useMemo(
    () => buildPortfolioRows(transactions, currentPrices, taxRate, tdsRate),
    [transactions, currentPrices, taxRate, tdsRate]
  );

  const selectedCoinTransactions = useMemo(
    () =>
      sortTransactions(
        transactions.filter((transaction) => transaction.coin === selectedCoin)
      ),
    [transactions, selectedCoin]
  );

  const addTransaction = async () => {
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

    const tempId = crypto.randomUUID();
    const newTransaction: Transaction = {
      id: tempId,
      type: transactionType,
      coin: selectedCoin,
      quantity: safeQuantity,
      price: safePrice,
      fee: safeFee,
      date: safeDate.toISOString(),
      createdAt: Date.now(),
    };

    setTransactions((prev) => sortTransactions([...prev, newTransaction]));
    setQuantity(0);
    setPrice(0);
    setFee(0);
    setTimestamp(getLocalDatetimeValue());

    try {
      const res = await fetch("/api/crypto/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });

      if (!res.ok) {
        throw new Error("Failed to save transaction");
      }
      const savedTransaction = await res.json();
      setTransactions((prev) =>
        sortTransactions(
          prev.map((t) => (t.id === tempId ? savedTransaction : t))
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error saving transaction");
      setTransactions((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const removeTransaction = async (id: string) => {
    const transactionToRemove = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    
    try {
      await fetch(`/api/crypto/transactions/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      if (transactionToRemove) {
        setTransactions((prev) => sortTransactions([...prev, transactionToRemove]));
      }
    }
  };

  const clearAllTransactions = () => {
    alert("Clearing all via UI only. To delete permanently, remove individually.");
    setTransactions([]);
  };

  return (
    <div className="flex flex-col gap-10 bg-white dark:bg-zinc-950 min-h-screen transition-colors duration-300">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
      {/* LEFT PANEL */}
      <div className="overflow-hidden rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl transition-all">
        <div className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800 px-8 py-10">
          {/* Decorative Blobs for Dark Mode */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3A9B9B]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 hidden dark:block" />
          
          <div className="relative flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#3A9B9B]/20 bg-[#E8F7F7] dark:bg-[#3A9B9B]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#3A9B9B]">
              Portfolio Tracker
            </div>

            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-tighter text-[#2D3561] dark:text-zinc-100 sm:text-5xl">
                Crypto Portfolio <span className="text-[#3A9B9B]">Calculator</span>
              </h1>
              <p className="mt-4 text-base font-medium leading-7 text-zinc-500 dark:text-zinc-400">
                Track multiple buys and sells, calculate FIFO profit and loss,
                and estimate tax, TDS, and unrealized P/L for your digital assets.
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
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
            Choose Cryptocurrency
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Switch coins to view and manage that coin&apos;s transaction history.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {coins.map((coin) => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={`inline-flex items-center gap-3 rounded-2xl border px-6 py-3.5 text-sm font-black transition-all duration-300 ${
                  selectedCoin === coin
                    ? "border-[#3A9B9B] bg-[#E8F7F7] dark:bg-[#3A9B9B]/20 text-[#3A9B9B] shadow-lg shadow-[#3A9B9B]/10"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-[#3A9B9B]/30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    selectedCoin === coin ? "bg-[#5BBD4A]" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
                {coin}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <InputField
              label="Current Price"
              value={currentPrice}
              setValue={(value) =>
                setCurrentPrices((prev) => ({
                  ...prev,
                  [selectedCoin]: value,
                }))
              }
              hint="For Unrealized P/L"
            />

            <InputField
              label="Tax Rate (%)"
              value={taxRate}
              setValue={setTaxRate}
              prefix=""
              hint="Default 30% India"
            />

            <InputField
              label="TDS Rate (%)"
              value={tdsRate}
              setValue={setTdsRate}
              prefix=""
              hint="Usually 1% India"
            />
          </div>

          <div className="mt-10 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                  Add Transaction
                </h3>
                <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Enter buy or sell details. Uses FIFO for profit calculation.
                </p>
              </div>

              <div className="hidden rounded-full bg-[#3A9B9B] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white sm:block">
                {selectedCoin}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase opacity-70">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) =>
                    setTransactionType(e.target.value as TransactionType)
                  }
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 font-bold text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-[#3A9B9B]"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase opacity-70">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 font-bold text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-[#3A9B9B]"
                />
              </div>

              <InputField
                label="Quantity"
                value={quantity}
                setValue={setQuantity}
                prefix=""
              />

              <InputField
                label="Price"
                value={price}
                setValue={setPrice}
              />

              <InputField
                label="Fee"
                value={fee}
                setValue={setFee}
              />
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={addTransaction}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#5BBD4A] dark:bg-[#3A9B9B] px-8 py-4 text-sm font-black text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                Add Transaction
              </button>

              <button
                onClick={clearAllTransactions}
                className="inline-flex items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-transparent px-8 py-4 text-sm font-black text-zinc-600 dark:text-zinc-400 transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                Transactions
              </h3>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {selectedCoinTransactions.length} Records
              </p>
            </div>

            <div className="space-y-4">
              {selectedCoinTransactions.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-12 text-center">
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                    No {selectedCoin} activity yet
                  </p>
                </div>
              ) : (
                selectedCoinTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${
                          transaction.type === "BUY"
                            ? "bg-[#E8F7F7] text-[#3A9B9B] dark:bg-[#3A9B9B]/10"
                            : "bg-red-50 text-red-600 dark:bg-red-500/10"
                        }`}
                      >
                        {transaction.type === "BUY" ? "B" : "S"}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                            {transaction.type} {transaction.coin}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                              transaction.type === "BUY"
                                ? "bg-[#5BBD4A] text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </div>

                        <p className="mt-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Qty: <span className="text-zinc-800 dark:text-zinc-200">{formatQuantity(transaction.quantity)}</span> 
                          <span className="mx-2 opacity-30">|</span> 
                          Price: <span className="text-zinc-800 dark:text-zinc-200">{formatCurrency(transaction.price)}</span>
                        </p>

                        <p className="mt-2 text-[10px] font-black text-zinc-400 opacity-50">
                          {formatDisplayDate(transaction.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Value</p>
                        <p className="mt-1 text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                          {formatCurrency(transaction.quantity * transaction.price)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeTransaction(transaction.id)}
                        className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
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
      <div className="rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 shadow-sm">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#3A9B9B] shadow-xl shadow-[#3A9B9B]/20">
            <span className="text-2xl font-black text-white">₹</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-[#2D3561] dark:text-zinc-100">
            Portfolio Summary
          </h2>
          <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Overall portfolio realized profit and tax estimate based on matched trades.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <MiniStat
            label="Holdings"
            value={formatQuantity(selectedCoinSummary.holdings)}
            tone="teal"
          />
          <MiniStat
            label="Current Value"
            value={formatCurrency(selectedCoinSummary.currentValue)}
            tone="navy"
          />
          <MiniStat
            label="Portfolio Net"
            value={formatCurrency(portfolioSummary.netAfterTaxAndTds)}
            tone="green"
          />
        </div>

        <div className="space-y-4">
          <ResultCard
            title="Average Buy Price"
            value={formatCurrency(selectedCoinSummary.averageBuyPrice)}
            sub={selectedCoinSummary.holdings > 0 ? `Remaining ${selectedCoin}` : "No holdings"}
          />

          <ResultCard
            title="Realized P/L"
            value={formatCurrency(selectedCoinSummary.realizedProfit)}
            sub="FIFO matched sells"
            positive={selectedCoinSummary.realizedProfit >= 0}
          />

          <ResultCard
            title="Taxable Profit"
            value={formatCurrency(selectedCoinSummary.taxableProfit)}
            sub="India Tax Rules"
            positive={selectedCoinSummary.taxableProfit >= 0}
          />

          <ResultCard
            title="Unrealized P/L"
            value={formatCurrency(selectedCoinSummary.unrealizedProfit)}
            sub="Mark to Market"
            positive={selectedCoinSummary.unrealizedProfit >= 0}
          />

          <ResultCard
            title="Tax Estimate"
            value={formatCurrency(selectedCoinSummary.totalTax)}
            sub={`${taxRate}% on gains`}
          />

          <ResultCard
            title="Net Take Home"
            value={formatCurrency(selectedCoinSummary.netAfterTaxAndTds)}
            sub="After Tax & TDS"
            positive={selectedCoinSummary.netAfterTaxAndTds >= 0}
          />
        </div>

        <div className="mt-10 rounded-[2rem] bg-[#2D3561] dark:bg-[#3A9B9B] p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Selected Coin Payout</p>
            <h3 className="text-4xl font-black tracking-tighter">
              {formatCurrency(selectedCoinSummary.netAfterTaxAndTds)}
            </h3>
            <p className="mt-4 text-xs font-medium leading-relaxed opacity-70">
              Estimated amount after selling fees, 30% tax, and 1% TDS.
            </p>
          </div>
        </div>
      </div>
      </div>

      <div className="px-4">
        <PortfolioSummaryCards rows={portfolioRows} />
      </div>

      <div className="hidden md:block px-4">
        <PortfolioTable rows={portfolioRows} />
      </div>

      <div className="md:hidden px-4">
        <PortfolioMobileCards rows={portfolioRows} />
      </div>

      <div className="px-4 pb-20">
        <TaxSummarySection
          rows={portfolioRows}
          taxRate={taxRate}
          tdsRate={tdsRate}
        />
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  setValue,
  hint,
  prefix = "₹",
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  hint?: string;
  prefix?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <label className="text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
          {label}
        </label>
        {hint ? (
          <span className="text-[10px] font-black text-[#3A9B9B] uppercase tracking-widest">{hint}</span>
        ) : null}
      </div>

      <div className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 shadow-sm transition-all focus-within:border-[#3A9B9B] focus-within:shadow-lg focus-within:shadow-[#3A9B9B]/5">
        <div className="flex items-center gap-3">
          {prefix ? (
            <span className="text-sm font-black text-[#3A9B9B]">{prefix}</span>
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
            className="w-full bg-transparent text-base font-bold text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-300"
          />
        </div>
      </div>
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
    <div className="rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 transition-all hover:shadow-md">
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</p>
      <h3
        className={`mt-2 text-2xl font-black tracking-tighter ${
          positive === undefined
            ? "text-zinc-900 dark:text-zinc-100"
            : positive
            ? "text-[#5BBD4A]"
            : "text-red-500"
        }`}
      >
        {value}
      </h3>
      {sub ? (
        <p
          className={`mt-1 text-[10px] font-black uppercase tracking-widest ${
            positive === undefined
              ? "text-zinc-400"
              : positive
              ? "text-[#5BBD4A]/70"
              : "text-red-500/70"
          }`}
        >
          {sub}
        </p>
      ) : null}
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
    teal: "bg-[#E8F7F7] text-[#3A9B9B] border-[#3A9B9B]/20 dark:bg-[#3A9B9B]/10",
    navy: "bg-[#F0F2F9] text-[#2D3561] border-[#2D3561]/20 dark:bg-[#2D3561]/10 dark:text-zinc-100",
    green: "bg-[#F2F9F1] text-[#5BBD4A] border-[#5BBD4A]/20 dark:bg-[#5BBD4A]/10",
  };

  return (
    <div className={`rounded-2xl border p-4 transition-all ${toneClasses[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
        {label}
      </p>
      <p className="mt-2 text-lg font-black tracking-tighter">{value}</p>
    </div>
  );
}

function TaxSummarySection({
  rows,
  taxRate,
  tdsRate,
}: {
  rows: PortfolioRow[];
  taxRate: number;
  tdsRate: number;
}) {
  if (rows.length === 0) return null;

  const taxableProfit = rows.reduce((s, r) => s + r.taxableProfit, 0);
  const estimatedTax = taxableProfit * Math.max(0, taxRate) / 100;
  const tdsDeducted = rows.reduce(
    (s, r) => s + r.totalSellValue * (Math.max(0, tdsRate) / 100),
    0
  );
  const totalRealized = rows.reduce((s, r) => s + r.realizedProfit, 0);
  const afterTaxRealizedProfit = totalRealized - estimatedTax - tdsDeducted;
  const effectiveTaxRate =
    taxableProfit > 0 ? (estimatedTax / taxableProfit) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl mt-12">
      <div className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800 px-8 py-8">
        <div className="absolute inset-0 bg-[#3A9B9B]/5 dark:bg-[#3A9B9B]/10" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3A9B9B] text-white shadow-lg">
            <span className="text-xl font-black">%</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#2D3561] dark:text-zinc-100 tracking-tighter">Tax Summary</h3>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              India-compliant crypto tax breakdown · FIFO matched
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
        <TaxCard
          label="Taxable Profit"
          value={formatCurrency(taxableProfit)}
          sub="Sum of gains only"
          positive={taxableProfit >= 0}
        />
        <TaxCard
          label="Estimated Tax"
          value={formatCurrency(estimatedTax)}
          sub={`${taxRate}% Rate`}
        />
        <TaxCard
          label="TDS Deducted"
          value={formatCurrency(tdsDeducted)}
          sub={`${tdsRate}% on Selling`}
        />
        <TaxCard
          label="Take Home Profit"
          value={formatCurrency(afterTaxRealizedProfit)}
          sub="After Tax & TDS"
          positive={afterTaxRealizedProfit >= 0}
          highlight
        />
        <TaxCard
          label="Effective Rate"
          value={formatPercentage(effectiveTaxRate)}
          sub={taxableProfit > 0 ? "Tax ÷ Gains" : "No Gains"}
        />
      </div>

      <p className="px-8 pb-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        Note: Tax applies only to profitable SELL trades. Gains and losses do not offset under current India rules.
      </p>
    </div>
  );
}

function TaxCard({
  label,
  value,
  sub,
  positive,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[2rem] border p-6 transition-all hover:shadow-md ${
        highlight
          ? "border-[#3A9B9B]/30 bg-[#E8F7F7] dark:bg-[#3A9B9B]/10"
          : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-3 text-2xl font-black tracking-tighter ${
          positive === true
            ? "text-[#5BBD4A]"
            : positive === false
            ? "text-red-500"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[10px] font-black uppercase tracking-widest opacity-50">{sub}</p>
      )}
    </div>
  );
}

function PortfolioSummaryCards({ rows }: { rows: PortfolioRow[] }) {
  if (rows.length === 0) return null;

  const totalValue = rows.reduce((s, r) => s + r.currentValue, 0);
  const totalInvested = rows.reduce((s, r) => s + r.investedValue, 0);
  const totalUnrealized = rows.reduce((s, r) => s + r.unrealizedProfit, 0);
  const totalRealized = rows.reduce((s, r) => s + r.realizedProfit, 0);
  const totalNet = rows.reduce((s, r) => s + r.netProfit, 0);

  return (
    <div className="space-y-6 mt-12">
      <div>
        <h2 className="text-2xl font-black text-[#2D3561] dark:text-zinc-100 tracking-tighter uppercase">
          Portfolio Overview
        </h2>
        <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Live snapshot across all your crypto holdings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Portfolio Value" value={formatCurrency(totalValue)} tone="teal" />
        <SummaryCard label="Total Invested" value={formatCurrency(totalInvested)} tone="navy" />
        <SummaryCard
          label="Unrealized P/L"
          value={formatCurrency(totalUnrealized)}
          tone={totalUnrealized >= 0 ? "green" : "rose"}
          positive={totalUnrealized >= 0}
        />
        <SummaryCard
          label="Realized P/L"
          value={formatCurrency(totalRealized)}
          tone={totalRealized >= 0 ? "green" : "rose"}
          positive={totalRealized >= 0}
        />
        <SummaryCard
          label="Net P/L"
          value={formatCurrency(totalNet)}
          tone={totalNet >= 0 ? "green" : "rose"}
          positive={totalNet >= 0}
          className="col-span-2 md:col-span-1"
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  positive,
  className = "",
}: {
  label: string;
  value: string;
  tone: "teal" | "navy" | "green" | "rose";
  positive?: boolean;
  className?: string;
}) {
  const bg: Record<string, string> = {
    teal: "bg-[#E8F7F7] dark:bg-[#3A9B9B]/10 border-[#3A9B9B]/20",
    navy: "bg-[#F0F2F9] dark:bg-[#2D3561]/10 border-[#2D3561]/20",
    green: "bg-[#F2F9F1] dark:bg-[#5BBD4A]/10 border-[#5BBD4A]/20",
    rose: "bg-red-50 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20",
  };
  const valueColor =
    positive === true
      ? "text-[#5BBD4A]"
      : positive === false
      ? "text-red-500"
      : "text-zinc-900 dark:text-zinc-100";

  return (
    <div className={`rounded-2xl border p-5 transition-all hover:shadow-md ${bg[tone]} ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
        {label}
      </p>
      <p className={`mt-3 text-xl font-black tracking-tighter ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

const TABLE_COLS = [
  "Coin", "Holdings", "Avg Buy", "Current Price",
  "Invested", "Current Value", "Unrealized P/L", "Realized P/L", "Net P/L", "Allocation",
];

function PortfolioTable({ rows }: { rows: PortfolioRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-lg mt-10">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-8 py-6">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Holdings Detail</h3>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {rows.length} Active Coins
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/80">
              {TABLE_COLS.map((col, i) => (
                <th
                  key={col}
                  className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr
                key={row.coin}
                className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
              >
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A9B9B] text-[10px] font-black text-white shadow-sm">
                      {row.coin.slice(0, 3)}
                    </div>
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{row.coin}</span>
                  </div>
                </td>
                <td className="px-5 py-5 text-right text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
                  {formatQuantity(row.holdings)}
                </td>
                <td className="px-5 py-5 text-right text-xs font-bold text-zinc-500">
                  {formatCurrency(row.averageBuyPrice)}
                </td>
                <td className="px-5 py-5 text-right text-xs font-bold text-zinc-500">
                  {formatCurrency(row.currentPrice)}
                </td>
                <td className="px-5 py-5 text-right text-xs font-black text-zinc-900 dark:text-zinc-200">
                  {formatCurrency(row.investedValue)}
                </td>
                <td className="px-5 py-5 text-right text-sm font-black text-[#2D3561] dark:text-zinc-100 tracking-tighter">
                  {formatCurrency(row.currentValue)}
                </td>
                <td className={`px-5 py-5 text-right text-sm font-black tracking-tighter ${row.unrealizedProfit >= 0 ? "text-[#5BBD4A]" : "text-red-500"}`}>
                  {formatCurrency(row.unrealizedProfit)}
                </td>
                <td className={`px-5 py-5 text-right text-sm font-black tracking-tighter ${row.realizedProfit >= 0 ? "text-[#5BBD4A]" : "text-red-500"}`}>
                  {formatCurrency(row.realizedProfit)}
                </td>
                <td className={`px-5 py-5 text-right text-sm font-black tracking-tighter ${row.netProfit >= 0 ? "text-[#5BBD4A]" : "text-red-500"}`}>
                  {formatCurrency(row.netProfit)}
                </td>
                <td className="px-5 py-5 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-300">
                      {formatPercentage(row.allocation)}
                    </span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-[#3A9B9B] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, row.allocation))}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PortfolioMobileCards({ rows }: { rows: PortfolioRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (rows.length === 0) return null;

  const toggle = (coin: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(coin)) next.delete(coin);
      else next.add(coin);
      return next;
    });
  };

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Portfolio Details</h3>
      </div>
      {rows.map((row) => {
        const isOpen = expanded.has(row.coin);
        return (
          <div
            key={row.coin}
            className="overflow-hidden rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm"
          >
            <button
              onClick={() => toggle(row.coin)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A9B9B] text-[10px] font-black text-white shadow-sm">
                  {row.coin.slice(0, 3)}
                </div>
                <div>
                  <p className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{row.coin}</p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {formatQuantity(row.holdings)} Held
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                    {formatCurrency(row.currentValue)}
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${row.netProfit >= 0 ? "text-[#5BBD4A]" : "text-red-500"}`}>
                    {row.netProfit >= 0 ? "+" : ""}{formatCurrency(row.netProfit)}
                  </p>
                </div>
                <span className={`text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>⌄</span>
              </div>
            </button>
            {isOpen && (
              <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 px-6 py-6">
                <MobileDetailRow label="Mark to Market" value={formatCurrency(row.currentPrice)} />
                <MobileDetailRow label="Average Cost" value={formatCurrency(row.averageBuyPrice)} />
                <MobileDetailRow label="Total Invested" value={formatCurrency(row.investedValue)} />
                <MobileDetailRow
                  label="Unrealized P/L"
                  value={formatCurrency(row.unrealizedProfit)}
                  positive={row.unrealizedProfit >= 0}
                />
                <MobileDetailRow
                  label="Realized P/L"
                  value={formatCurrency(row.realizedProfit)}
                  positive={row.realizedProfit >= 0}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Portfolio Weight</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-[#3A9B9B]"
                        style={{ width: `${Math.min(100, Math.max(0, row.allocation))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100">
                      {formatPercentage(row.allocation)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MobileDetailRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
      <span
        className={`text-sm font-black tracking-tighter ${
          positive === undefined
            ? "text-zinc-900 dark:text-zinc-100"
            : positive
            ? "text-[#5BBD4A]"
            : "text-red-500"
        }`}
      >
        {value}
      </span>
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
  let taxableProfit = 0;
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
    let sellTransactionProfit = 0;

    while (quantityToSell > EPSILON && lots.length > 0) {
      const lot = lots[0];
      const lotQuantityBefore = lot.quantity;
      const usedQuantity = Math.min(quantityToSell, lotQuantityBefore);
      const costPortion = lotQuantityBefore > 0 ? lot.totalCost * (usedQuantity / lotQuantityBefore) : 0;
      const sellValuePortion = usedQuantity * transaction.price;
      sellTransactionProfit += sellValuePortion - costPortion - (transaction.fee * (usedQuantity / transaction.quantity));
      lot.quantity -= usedQuantity;
      lot.totalCost -= costPortion;
      quantityToSell -= usedQuantity;
      if (lot.quantity <= EPSILON) lots.shift();
    }

    realizedProfit += sellTransactionProfit;
    if (sellTransactionProfit > 0) taxableProfit += sellTransactionProfit;
  }

  const holdings = lots.reduce((sum, lot) => sum + lot.quantity, 0);
  const remainingCostBasis = lots.reduce((sum, lot) => sum + lot.totalCost, 0);
  const averageBuyPrice = holdings > EPSILON ? remainingCostBasis / holdings : 0;
  const currentValue = holdings * Math.max(0, currentPrice);
  const unrealizedProfit = currentValue - remainingCostBasis;
  const totalTax = taxableProfit * (Math.max(0, taxRate) / 100);
  const netAfterTaxAndTds = realizedProfit - totalTax - tds;

  return {
    holdings,
    averageBuyPrice,
    currentValue,
    realizedProfit,
    unrealizedProfit,
    taxableProfit,
    totalBuyValue,
    totalSellValue,
    totalBuyFees,
    totalSellFees,
    tax: totalTax,
    totalTax,
    tds,
    netAfterTaxAndTds,
  };
}

function analyzePortfolioTotals(
  transactions: Transaction[],
  currentPrices: Record<Coin, number>,
  taxRate: number,
  tdsRate: number
): AnalysisResult {
  const ordered = sortTransactions(transactions);
  const pools = new Map<Coin, Lot[]>();
  let realizedProfit = 0;
  let taxableProfit = 0;
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
    let sellTransactionProfit = 0;
    while (quantityToSell > EPSILON && pool.length > 0) {
      const lot = pool[0];
      const lotQuantityBefore = lot.quantity;
      const usedQuantity = Math.min(quantityToSell, lotQuantityBefore);
      const costPortion = lotQuantityBefore > 0 ? lot.totalCost * (usedQuantity / lotQuantityBefore) : 0;
      const sellValuePortion = usedQuantity * transaction.price;
      sellTransactionProfit += sellValuePortion - costPortion - (transaction.fee * (usedQuantity / transaction.quantity));
      lot.quantity -= usedQuantity;
      lot.totalCost -= costPortion;
      quantityToSell -= usedQuantity;
      if (lot.quantity <= EPSILON) pool.shift();
    }
    realizedProfit += sellTransactionProfit;
    if (sellTransactionProfit > 0) taxableProfit += sellTransactionProfit;
  }

  let holdings = 0;
  let remainingCostBasis = 0;
  let currentValue = 0;
  for (const [coin, poolLots] of pools.entries()) {
    const coinHoldings = poolLots.reduce((sum, lot) => sum + lot.quantity, 0);
    const coinCostBasis = poolLots.reduce((sum, lot) => sum + lot.totalCost, 0);
    const coinCurrentPrice = Math.max(0, currentPrices[coin] || 0);
    holdings += coinHoldings;
    remainingCostBasis += coinCostBasis;
    currentValue += coinHoldings * coinCurrentPrice;
  }

  const totalTax = taxableProfit * (Math.max(0, taxRate) / 100);
  return {
    holdings,
    averageBuyPrice: 0,
    currentValue,
    realizedProfit,
    unrealizedProfit: currentValue - remainingCostBasis,
    taxableProfit,
    totalBuyValue,
    totalSellValue,
    totalBuyFees,
    totalSellFees,
    tax: totalTax,
    totalTax,
    tds,
    netAfterTaxAndTds: realizedProfit - totalTax - tds,
  };
}

function buildPortfolioRows(
  transactions: Transaction[],
  currentPrices: Record<Coin, number>,
  taxRate: number,
  tdsRate: number
): PortfolioRow[] {
  const raw: Omit<PortfolioRow, "allocation">[] = [];
  for (const coin of coins) {
    const cp = Math.max(0, currentPrices[coin] ?? 0);
    const a = analyzeCoinTransactions(transactions, coin, cp, taxRate, tdsRate);
    const hasActivity = a.holdings > 0 || Math.abs(a.realizedProfit) > 1e-9 || Math.abs(a.unrealizedProfit) > 1e-9;
    if (!hasActivity) continue;
    raw.push({
      coin,
      holdings: a.holdings,
      averageBuyPrice: a.averageBuyPrice,
      currentPrice: cp,
      investedValue: a.holdings * a.averageBuyPrice,
      currentValue: a.currentValue,
      unrealizedProfit: a.unrealizedProfit,
      realizedProfit: a.realizedProfit,
      netProfit: a.realizedProfit + a.unrealizedProfit,
      taxableProfit: a.taxableProfit,
      totalSellValue: a.totalSellValue,
    });
  }
  const totalCurrentValue = raw.reduce((s, r) => s + r.currentValue, 0);
  return raw.map((r) => ({
    ...r,
    allocation: totalCurrentValue > 0 ? (r.currentValue / totalCurrentValue) * 100 : 0,
  }));
}

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return diff;
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });
}

function formatCurrency(value: number) {
  const absolute = Math.abs(Number.isFinite(value) ? value : 0).toFixed(2);
  return `${value < 0 ? "-" : ""}₹${absolute}`;
}

function formatQuantity(value: number) {
  return (Number.isFinite(value) ? value : 0).toFixed(6);
}

function getLocalDatetimeValue(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDisplayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
}

function formatPercentage(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
}
