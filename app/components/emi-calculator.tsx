"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function getSliderBackground(value: number, min: number, max: number) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return `linear-gradient(to right, #1B9AAA 0%, #1B9AAA ${percent}%, #dddddd ${percent}%, #dddddd 100%)`;
}

const COLORS = ["#1B9AAA", "#14163A"];

export default function EmiCalculator() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(3);
  const [tenureType, setTenureType] = useState<"years" | "months">("years");

  const [loanType, setLoanType] = useState<"home" | "personal" | "car">("home");

  const emiData = useMemo(() => {
    const months = tenureType === "years" ? tenure * 12 : tenure;

    if (!months || amount <= 0) {
      return {
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
      };
    }

    const monthlyRate = rate / 12 / 100;

    if (monthlyRate === 0) {
      return {
        emi: amount / months,
        totalPayment: amount,
        totalInterest: 0,
      };
    }

    const pow = Math.pow(1 + monthlyRate, months);
    const emi = (amount * monthlyRate * pow) / (pow - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - amount;

    return {
      emi,
      totalPayment,
      totalInterest,
    };
  }, [amount, rate, tenure, tenureType]);

  const chartData = useMemo(
    () => [
      {
        name: "Total Interest",
        value: Math.max(0, emiData.totalInterest),
      },
      {
        name: "Principal Loan Amount",
        value: Math.max(0, amount),
      },
    ],
    [amount, emiData.totalInterest],
  );

  const [showBreakdown, setShowBreakdown] = useState(false);

  const loanMonths = useMemo(() => {
    return tenureType === "years" ? tenure * 12 : tenure;
  }, [tenure, tenureType]);

  const monthlyBreakdown = useMemo(() => {
    if (!loanMonths || amount <= 0 || emiData.emi <= 0) return [];

    const rows = [];
    const monthlyRate = rate / 12 / 100;
    let balance = amount;

    for (let month = 1; month <= loanMonths; month++) {
      const openingBalance = balance;
      const interest = monthlyRate === 0 ? 0 : openingBalance * monthlyRate;
      const principal =
        monthlyRate === 0 ? amount / loanMonths : emiData.emi - interest;

      const principalPaid = month === loanMonths ? openingBalance : principal;
      const closingBalance = Math.max(0, openingBalance - principalPaid);

      rows.push({
        month,
        openingBalance,
        emi: emiData.emi,
        interest,
        principal: principalPaid,
        closingBalance,
      });

      balance = closingBalance;
    }

    return rows;
  }, [amount, rate, loanMonths, emiData.emi]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen transition-colors duration-300">
      <div className="print:hidden">
        <section className="bg-zinc-50 dark:bg-zinc-900/50 pb-12 rounded-[2.5rem] border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
          <div className="mx-auto max-w-6xl px-5 pt-12">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3A9B9B]/20 bg-[#E8F7F7] dark:bg-[#3A9B9B]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#3A9B9B] shadow-sm">
                Financial Planning
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-[#2D3561] dark:text-zinc-100 sm:text-5xl md:text-6xl tracking-tighter">
                EMI <span className="text-[#3A9B9B]">Calculator</span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400 sm:text-base font-medium">
                Calculate monthly EMI payments, total interest, and repayment
                amount instantly with a modern and easy-to-use calculator.
              </p>
            </div>

            <div className="mt-4 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 md:p-8 shadow-xl">
              <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                <div className="space-y-10">
                  <div>
                    <p className="mb-6 text-lg font-bold text-[#2D3561] dark:text-zinc-100">
                      I want to calculate
                    </p>

                    <div className="mb-8 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setLoanType("home")}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${loanType === "home"
                            ? "bg-[#3A9B9B] text-white shadow-lg shadow-[#3A9B9B]/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        Home Loan
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoanType("personal")}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${loanType === "personal"
                            ? "bg-[#3A9B9B] text-white shadow-lg shadow-[#3A9B9B]/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        Personal Loan
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoanType("car")}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${loanType === "car"
                            ? "bg-[#3A9B9B] text-white shadow-lg shadow-[#3A9B9B]/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        Car Loan
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase opacity-70">
                          {loanType === "home"
                            ? "Home Loan Amount"
                            : loanType === "personal"
                              ? "Personal Loan Amount"
                              : "Car Loan Amount"}
                        </label>

                        <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus-within:border-[#3A9B9B] transition-colors">
                          <div className="flex items-center border-r border-zinc-200 dark:border-zinc-800 px-4 font-black text-[#3A9B9B] bg-zinc-100 dark:bg-zinc-900">
                            ₹
                          </div>
                          <input
                            type="number"
                            value={amount}
                            min={0}
                            onChange={(e) =>
                              setAmount(Number(e.target.value || 0))
                            }
                            className="w-40 bg-transparent px-4 py-2.5 font-bold text-zinc-800 dark:text-zinc-100 outline-none"
                          />
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={20000000}
                        step={100000}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="emi-slider w-full accent-[#3A9B9B]"
                      />

                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <span>0</span>
                        <span>50L</span>
                        <span>1CR</span>
                        <span>1.5CR</span>
                        <span>2CR</span>
                      </div>
                    </div>

                    {/* Tenure Input */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase opacity-70">
                          Loan Tenure
                        </label>

                        <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus-within:border-[#3A9B9B] transition-colors">
                          <input
                            type="number"
                            value={tenure}
                            min={0}
                            onChange={(e) =>
                              setTenure(Number(e.target.value || 0))
                            }
                            className="w-24 bg-transparent px-4 py-2.5 font-bold text-zinc-800 dark:text-zinc-100 outline-none"
                          />

                          <div className="flex border-l border-zinc-200 dark:border-zinc-800">
                            <button
                              type="button"
                              onClick={() => setTenureType("years")}
                              className={`px-3 text-[10px] font-black uppercase tracking-tighter transition-all ${tenureType === "years"
                                  ? "bg-[#3A9B9B] text-white"
                                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                }`}
                            >
                              Yrs
                            </button>

                            <button
                              type="button"
                              onClick={() => setTenureType("months")}
                              className={`border-l border-zinc-200 dark:border-zinc-800 px-3 text-[10px] font-black uppercase tracking-tighter transition-all ${tenureType === "months"
                                  ? "bg-[#3A9B9B] text-white"
                                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                }`}
                            >
                              Mos
                            </button>
                          </div>
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={tenureType === "years" ? 30 : 360}
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="emi-slider w-full accent-[#3A9B9B]"
                      />

                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {tenureType === "years" ? (
                          <>
                            <span>0Y</span>
                            <span>10Y</span>
                            <span>20Y</span>
                            <span>30Y</span>
                          </>
                        ) : (
                          <>
                            <span>0M</span>
                            <span>120M</span>
                            <span>240M</span>
                            <span>360M</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rate Input */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase opacity-70">
                          Interest Rate
                        </label>

                        <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus-within:border-[#3A9B9B] transition-colors">
                          <input
                            type="number"
                            value={rate}
                            step={0.1}
                            min={0}
                            onChange={(e) => setRate(Number(e.target.value || 0))}
                            className="w-24 bg-transparent px-4 py-2.5 font-bold text-zinc-800 dark:text-zinc-100 outline-none"
                          />
                          <div className="flex items-center border-l border-zinc-200 dark:border-zinc-800 px-4 font-black text-[#3A9B9B] bg-zinc-100 dark:bg-zinc-900">
                            %
                          </div>
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={0.1}
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="emi-slider w-full accent-[#3A9B9B]"
                      />

                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <span>0%</span>
                        <span>5%</span>
                        <span>10%</span>
                        <span>15%</span>
                        <span>20%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result Column */}
                <div className="rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col h-full">
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-center text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                      Monthly EMI
                    </h3>

                    <div className="text-center text-5xl font-black text-[#2D3561] dark:text-zinc-100 tracking-tighter mb-8">
                      ₹{formatINR(emiData.emi)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Interest</p>
                        <p className="text-xl font-black text-[#2D3561] dark:text-zinc-200 leading-none">
                          ₹{formatINR(emiData.totalInterest)}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Pay</p>
                        <p className="text-xl font-black text-[#2D3561] dark:text-zinc-200 leading-none">
                          ₹{formatINR(emiData.totalPayment)}
                        </p>
                      </div>
                    </div>

                    <div className="h-[200px] w-full mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#3A9B9B" /> {/* Teal */}
                            <Cell fill="#2D3561" /> {/* Navy */}
                          </Pie>
                          <Tooltip
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                              backgroundColor: 'var(--tooltip-bg, #fff)',
                              color: 'var(--tooltip-color, #000)'
                            }}
                            itemStyle={{ color: 'var(--tooltip-color, #000)' }}
                            formatter={(value: any) => [`₹ ${formatINR(value)}`, 'Amount']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 mt-auto">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#3A9B9B]" />
                          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Total Interest</span>
                        </div>
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                          {emiData.totalPayment > 0 ? (emiData.totalInterest / emiData.totalPayment * 100).toFixed(1) : 0}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#2D3561]" />
                          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Principal</span>
                        </div>
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                          {emiData.totalPayment > 0 ? (amount / emiData.totalPayment * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 rounded-full bg-[#5BBD4A] dark:bg-[#3A9B9B] px-8 py-4 text-sm font-black text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Generate Report
                </button>

                <button
                  type="button"
                  onClick={() => setShowBreakdown((prev) => !prev)}
                  className="flex-1 rounded-full border-2 border-[#2D3561] dark:border-zinc-700 bg-transparent px-8 py-4 text-sm font-black text-[#2D3561] dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {showBreakdown ? "Hide Schedule" : "View Schedule"}
                  <span className={`transition-transform duration-300 ${showBreakdown ? "rotate-180" : ""}`}>⌄</span>
                </button>
              </div>

              {/* Breakdown Section */}
              {showBreakdown && (
                <div className="mt-8 overflow-hidden rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          <th className="px-6 py-4">Mo</th>
                          <th className="px-6 py-4">Balance</th>
                          <th className="px-6 py-4 text-[#3A9B9B]">EMI</th>
                          <th className="px-6 py-4">Interest</th>
                          <th className="px-6 py-4">Principal</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {monthlyBreakdown.map((row) => (
                          <tr key={row.month} className="hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                            <td className="px-6 py-4 text-xs font-black text-zinc-900 dark:text-zinc-100">
                              {row.month}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                              ₹{formatINR(row.openingBalance)}
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-[#3A9B9B]">
                              ₹{formatINR(row.emi)}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-red-500/80">
                              ₹{formatINR(row.interest)}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-green-500/80">
                              ₹{formatINR(row.principal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Info Sections */}
        <div className="max-w-6xl mx-auto px-5 py-24 grid gap-16">
          <section className="rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 p-10 md:p-16 border border-zinc-100 dark:border-zinc-800 text-center transition-colors">
            <h2 className="text-3xl md:text-5xl font-black text-[#2D3561] dark:text-zinc-100 tracking-tighter mb-8 leading-tight">
              Understanding <span className="text-[#3A9B9B]">EMI</span>
            </h2>

            <p className="mx-auto max-w-3xl text-lg md:text-xl font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
              Equated Monthly Instalment or EMI is the fixed amount a borrower
              pays every month towards the repayment of their loan. It has two
              components - the principal and the interest - and is usually paid
              on a fixed date every month.
            </p>
          </section>

          <section className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Principal amount",
                text: "The higher the principal amount, the more you will pay in dues.",
                icon: "💰"
              },
              {
                title: "Interest rates",
                text: "Interest rates play a key role in your due amount.",
                icon: "📈"
              },
              {
                title: "Repayment tenure",
                text: "Longer repayment tenure can lower your monthly dues.",
                icon: "⏳"
              },
              {
                title: "Fees & penalties",
                text: "Additional charges can increase your due amount.",
                icon: "📑"
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F7F7] dark:bg-[#3A9B9B]/10 text-2xl">
                  {item.icon}
                </div>

                <h3 className="text-lg font-black text-[#2D3561] dark:text-zinc-100 uppercase tracking-tight mb-4">
                  {item.title}
                </h3>

                <p className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.text}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* --- PRINT ONLY LAYOUT --- */}
      <div className="hidden print:block bg-white text-black min-h-screen max-w-5xl mx-auto print:p-8">
        {/* Company Header */}
        <div className="flex items-center justify-between border-b-[3px] border-slate-900 pb-6 mb-8">
          <div className="flex flex-shrink-0 items-center justify-center">
            <img
              src="/logo.png"
              className="h-14 w-32 object-contain"
              alt="Logo"
            />
          </div>
          <div className="flex flex-col items-end gap-2 text-sm font-semibold text-slate-800">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              info@banavatnest.com
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
              www.banavatnest.com
            </span>
          </div>
        </div>

        {/* Report Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-[#1B9AAA] uppercase tracking-wider">
            EMI Loan Report
          </h1>
          <p className="text-slate-600 font-medium mt-2 text-sm">
            Generated on {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-4 inline-block rounded-full border border-[#1B9AAA] bg-[#EEF8FA] px-4 py-1 text-sm font-bold text-[#1B9AAA] uppercase tracking-widest">
            {loanType} Loan
          </div>
        </div>

        {/* Summary Details */}
        <div className="mb-10 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 uppercase tracking-widest">
            Loan Summary
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loan Amount</p>
              <p className="text-xl font-bold text-slate-900">₹ {formatINR(amount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Interest Rate</p>
              <p className="text-xl font-bold text-slate-900">{rate}% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tenure</p>
              <p className="text-xl font-bold text-slate-900">{tenure} {tenureType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Monthly EMI</p>
              <p className="text-xl font-bold text-[#1B9AAA]">₹ {formatINR(emiData.emi)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Interest</p>
              <p className="text-xl font-bold text-red-600">₹ {formatINR(emiData.totalInterest)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Payment</p>
              <p className="text-xl font-bold text-slate-900">₹ {formatINR(emiData.totalPayment)}</p>
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="mb-12 flex justify-center items-center">
          <div className="w-[300px] h-[300px] relative">
            <PieChart width={300} height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Payment</p>
              <p className="text-lg font-black text-slate-900">₹ {formatINR(emiData.totalPayment)}</p>
            </div>
          </div>
          <div className="ml-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-[#1B9AAA]" />
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Interest</p>
                <p className="text-sm font-bold text-slate-900">₹ {formatINR(emiData.totalInterest)} ({emiData.totalPayment > 0 ? (emiData.totalInterest / emiData.totalPayment * 100).toFixed(1) : 0}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-[#14163A]" />
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Principal Amount</p>
                <p className="text-sm font-bold text-slate-900">₹ {formatINR(amount)} ({emiData.totalPayment > 0 ? (amount / emiData.totalPayment * 100).toFixed(1) : 0}%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Month-wise Breakdown */}
        <div className="w-full page-break-before-auto">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 uppercase tracking-widest">
            Month-wise Repayment Schedule
          </h2>
          <table className="min-w-full border-collapse border border-slate-200 text-sm text-left">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr className="text-slate-700 uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3 font-bold border-r border-slate-200">Month</th>
                <th className="px-4 py-3 font-bold border-r border-slate-200">Opening Balance</th>
                <th className="px-4 py-3 font-bold border-r border-slate-200">EMI</th>
                <th className="px-4 py-3 font-bold border-r border-slate-200">Interest</th>
                <th className="px-4 py-3 font-bold border-r border-slate-200">Principal</th>
                <th className="px-4 py-3 font-bold">Closing Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.map((row, index) => (
                <tr key={row.month} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-2 border-r border-slate-200 font-medium">{row.month}</td>
                  <td className="px-4 py-2 border-r border-slate-200 text-slate-700">₹ {formatINR(row.openingBalance)}</td>
                  <td className="px-4 py-2 border-r border-slate-200 text-slate-700 font-semibold text-[#1B9AAA]">₹ {formatINR(row.emi)}</td>
                  <td className="px-4 py-2 border-r border-slate-200 text-red-600">₹ {formatINR(row.interest)}</td>
                  <td className="px-4 py-2 border-r border-slate-200 text-green-700">₹ {formatINR(row.principal)}</td>
                  <td className="px-4 py-2 text-slate-900 font-medium">₹ {formatINR(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-medium uppercase tracking-widest">
          Generated by EMI Calculator • Not an official bank statement
        </div>
      </div>

      <style jsx global>{`
        .emi-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          outline: none;
        }

        .emi-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 999px;
          background: transparent;
        }

        .emi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #ffffff;
          border: 3px solid #1b9aaa;
          cursor: pointer;
          margin-top: -5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .emi-slider::-moz-range-track {
          height: 6px;
          border-radius: 999px;
          background: transparent;
        }

        .emi-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #ffffff;
          border: 3px solid #1b9aaa;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        @media print {
          @page {
            margin: 15mm;
            size: auto;
          }
          tr, td, th {
            page-break-inside: avoid;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
