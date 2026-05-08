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
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(30);
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

  return (
    <div className="bg-gradient-to-b from-[#F8FCFD] to-[#EEF8FA]">
      <section className="bg-[#14163A] pb-10 rounded-[22px]">
        <div className="mx-auto max-w-[1100px]  px-5 pt-8">
          <h1 className="text-3xl font-extrabold text-white md:text-5xl">
            EMI Calculator
          </h1>

          <div className="mt-4 rounded-[22px] bg-white/95 backdrop-blur-sm p-4 shadow-xl">
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div>
                <p className="mb-5 text-lg font-semibold text-[#1B9AAA]">
                  I want to calculate -
                </p>

                <div className="mb-8 flex w-fit rounded-full bg-[#E8F6F8] p-1">
                  <button
                    type="button"
                    onClick={() => setLoanType("home")}
                    className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] ${
                      loanType === "home"
                        ? "bg-[#1B9AAA] text-white shadow-md"
                        : "text-[#6b7280]"
                    }`}
                  >
                    Home Loan
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoanType("personal")}
                    className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] ${
                      loanType === "personal"
                        ? "bg-[#1B9AAA] text-white shadow-md"
                        : "text-[#6b7280]"
                    }`}
                  >
                    Personal Loan
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoanType("car")}
                    className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] ${
                      loanType === "car"
                        ? "bg-[#1B9AAA] text-white shadow-md"
                        : "text-[#6b7280]"
                    }`}
                  >
                    Car Loan
                  </button>
                </div>

                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-[15px] font-medium text-[#243342]">
                      {loanType === "home"
                        ? "Home Loan Amount"
                        : loanType === "personal"
                          ? "Personal Loan Amount"
                          : "Car Loan Amount"}
                    </label>

                    <div className="flex overflow-hidden rounded border border-[#1B9AAA]">
                      <div className="flex items-center border-r border-[#1B9AAA] px-4 font-bold text-[#1B9AAA]">
                        ₹
                      </div>
                      <input
                        type="number"
                        value={amount}
                        min={0}
                        onChange={(e) => setAmount(Number(e.target.value || 0))}
                        className="w-52 bg-transparent px-4 py-2 font-semibold outline-none"
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
                    className="emi-slider w-full"
                    style={{
                      background: getSliderBackground(amount, 0, 20000000),
                    }}
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-[#444]">
                    <span>0</span>
                    <span>25L</span>
                    <span>50L</span>
                    <span>75L</span>
                    <span>1CR</span>
                    <span>1.5CR</span>
                    <span>2CR</span>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-[15px] font-medium text-[#243342]">
                      Loan Tenure
                    </label>

                    <div className="flex overflow-hidden rounded border border-[#1B9AAA]">
                      <input
                        type="number"
                        value={tenure}
                        min={0}
                        onChange={(e) => setTenure(Number(e.target.value || 0))}
                        className="w-28 bg-transparent px-4 py-2 font-semibold outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => setTenureType("years")}
                        className={`px-4 text-sm font-semibold transition ${
                          tenureType === "years"
                            ? "bg-[#1B9AAA] text-white"
                            : "bg-white text-[#1B9AAA]"
                        }`}
                      >
                        Years
                      </button>

                      <button
                        type="button"
                        onClick={() => setTenureType("months")}
                        className={`border-l border-[#1B9AAA] px-4 text-sm font-semibold transition ${
                          tenureType === "months"
                            ? "bg-[#1B9AAA] text-white"
                            : "bg-white text-[#1B9AAA]"
                        }`}
                      >
                        Months
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={tenureType === "years" ? 30 : 360}
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="emi-slider w-full"
                    style={{
                      background: getSliderBackground(tenure, 0, 30),
                    }}
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-[#444]">
                    {tenureType === "years" ? (
                      <>
                        <span>0Y</span>
                        <span>5Y</span>
                        <span>10Y</span>
                        <span>15Y</span>
                        <span>20Y</span>
                        <span>25Y</span>
                        <span>30Y</span>
                      </>
                    ) : (
                      <>
                        <span>0M</span>
                        <span>60M</span>
                        <span>120M</span>
                        <span>180M</span>
                        <span>240M</span>
                        <span>300M</span>
                        <span>360M</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-[15px] font-medium text-[#243342]">
                      Interest Rate
                    </label>

                    <div className="flex overflow-hidden rounded border border-[#1B9AAA]">
                      <input
                        type="number"
                        value={rate}
                        step={0.1}
                        min={0}
                        onChange={(e) => setRate(Number(e.target.value || 0))}
                        className="w-36 bg-transparent px-4 py-2 font-semibold outline-none"
                      />
                      <div className="flex items-center border-l border-[#1B9AAA] px-4 font-bold text-[#1B9AAA]">
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
                    className="emi-slider w-full"
                    style={{
                      background: getSliderBackground(rate, 0, 20),
                    }}
                  />

                  <div className="mt-2 flex justify-between text-[10px] text-[#444]">
                    <span>0%</span>
                    <span>5%</span>
                    <span>10%</span>
                    <span>15%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] bg-[#EEF8FA] p-4">
                <div className="rounded-[20px] bg-white p-5">
                  <h3 className="text-center text-lg font-bold text-[#243342]">
                    {loanType === "home"
                      ? "Home Loan EMI"
                      : loanType === "personal"
                        ? "Personal Loan EMI"
                        : "Car Loan EMI"}
                  </h3>

                  <div className="mt-2 text-center text-4xl font-extrabold text-[#1B9AAA]">
                    ₹ {formatINR(emiData.emi)}
                  </div>

                  <div className="my-5 border-t border-dashed" />

                  <div className="grid grid-cols-2">
                    {/* LEFT */}

                    <div className="flex flex-col items-center border-r border-dashed px-2 text-center">
                      <div className="min-h-[42px]">
                        <p className="text-xs text-gray-500">
                          Total Interest Payable
                        </p>

                        <p className="text-[10px] text-transparent">hidden</p>
                      </div>

                      <p className="mt-3 text-2xl font-bold leading-none text-[#0F172A]">
                        ₹ {formatINR(emiData.totalInterest)}
                      </p>
                    </div>

                    {/* RIGHT */}

                    <div className="flex flex-col items-center px-2 text-center">
                      <div className="min-h-[42px]">
                        <p className="text-xs text-gray-500">Total Payment</p>

                        <p className="text-[10px] text-gray-400">
                          (Principal + Interest)
                        </p>
                      </div>

                      <p className="mt-3 text-2xl font-bold leading-none text-[#0F172A]">
                        ₹ {formatINR(emiData.totalPayment)}
                      </p>
                    </div>
                  </div>

                  <div className="my-5 border-t border-dashed" />

                  <h4 className="text-center text-sm font-bold text-[#243342]">
                    Break-up of Total Payment
                  </h4>

                  <div className="mt-4 h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={4}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1200}
                          isAnimationActive
                        >
                          {chartData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => {
                            const numericValue =
                              typeof value === "number" ? value : 0;

                            return [`₹ ${formatINR(numericValue)}`, name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-1 flex justify-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-[#1B9AAA]" />
                      <span className="text-xs text-gray-600">
                        Total Interest
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-[#0d4778]" />
                      <span className="text-xs text-gray-600">
                        Principal Loan Amount
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-[#EEF8FA] p-10">
          <h2 className="text-center text-4xl font-bold text-[#0F172A]">
            What is EMI?
          </h2>

          <p className="mt-6 text-lg leading-9 text-[#243342]">
            Equated Monthly Instalment or EMI is the fixed amount a borrower
            pays every month towards the repayment of their loan. It has two
            components - the principal and the interest - and is usually paid on
            a fixed date every month.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FCFD] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-4xl font-bold text-[#0F172A]">
            What are the various factors that affect your due amount?
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Principal amount",
                text: "The higher the principal amount, the more you will pay in dues.",
              },
              {
                title: "Interest rates",
                text: "Interest rates play a key role in your due amount.",
              },
              {
                title: "Longer repayment tenures",
                text: "Longer repayment tenure can lower your monthly dues.",
              },
              {
                title: "Fees & penalties",
                text: "Additional charges can increase your due amount.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-[#D9EEF2] bg-white p-8 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d6d1c5] text-2xl">
                  💰
                </div>

                <h3 className="text-center text-xl font-bold text-[#c73838]">
                  {item.title}
                </h3>

                <p className="mt-5 text-center leading-8 text-[#243342]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold text-[#0F172A]">
              How to use the EMI calculator?
            </h2>

            <p className="mt-8 text-lg leading-9 text-[#243342]">
              You can use an EMI calculator to arrive at your EMI amount for
              your personal loan, home loan or even car loan.
            </p>

            <p className="mt-6 text-lg leading-9 text-[#243342]">
              Insert your loan amount, tenure and rate of interest.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="rounded-3xl bg-[#EEF8FA] p-14 text-8xl">🧮</div>
          </div>
        </div>
      </section>

      <section className="bg-[#EEF8FA] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-4xl font-bold text-[#0F172A]">
            How do EMI Calculators work?
          </h2>

          <div className="mt-12 rounded-3xl bg-white p-10">
            <p className="text-xl">The formula for calculating EMI is:</p>

            <div className="mt-8 inline-block rounded-2xl bg-[#EEF8FA] px-8 py-5 text-2xl font-bold">
              EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
            </div>

            <div className="mt-10 space-y-4 text-lg leading-9">
              <p>P = loan amount</p>
              <p>r = rate of interest</p>
              <p>n = loan tenure in months</p>
            </div>
          </div>
        </div>
      </section>

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
      `}</style>
    </div>
  );
}
