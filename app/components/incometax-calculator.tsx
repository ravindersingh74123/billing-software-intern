"use client";

import { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Info, 
  AlertTriangle, 
  BarChart3, 
  ChevronDown, 
  Calculator, 
  RotateCcw,
  ArrowRight
} from "lucide-react";

type TaxPayer =
  | ""
  | "Individual"
  | "HUF"
  | "AOPs/BOI"
  | "Firms/LLP"
  | "Domestic Company"
  | "Foreign Company";

type AgeCategory =
  | ""
  | "Less than 60 years"
  | "Equal to 60 years or more but less than 80 years"
  | "Equal to 80 years or more";

type ResidentialStatus = "" | "Resident" | "Non-Resident";
type RegimeOpt = "" | "Yes" | "No";

type Slab = {
  limit: number;
  rate: number;
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function calculateSlabTax(income: number, slabs: Slab[]) {
  let tax = 0;
  let previousLimit = 0;

  for (const slab of slabs) {
    const upperLimit = Math.min(income, slab.limit);

    if (upperLimit > previousLimit) {
      tax += (upperLimit - previousLimit) * slab.rate;
      previousLimit = upperLimit;
    }

    if (income <= slab.limit) break;
  }

  return tax;
}

function getOldRegimeSlabs(category: AgeCategory): Slab[] {
  const basicExemption =
    category === "Equal to 80 years or more"
      ? 500000
      : category === "Equal to 60 years or more but less than 80 years"
        ? 300000
        : 250000;

  return [
    { limit: basicExemption, rate: 0 },
    { limit: basicExemption + 250000, rate: 0.05 },
    { limit: basicExemption + 750000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];
}

function getNewRegimeSlabs(): Slab[] {
  return [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.1 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];
}

function getSurchargeRate(income: number) {
  if (income > 50000000) return 0.37;
  if (income > 20000000) return 0.25;
  if (income > 10000000) return 0.15;
  if (income > 5000000) return 0.1;
  return 0;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function IncomeTaxCalculator() {
  const [formData, setFormData] = useState<{
    assessmentYear: string;
    taxPayer: TaxPayer;
    category: AgeCategory;
    residentialStatus: ResidentialStatus;
    regimeOptOut: RegimeOpt;
    income: string;
  }>({
    assessmentYear: "2026-27",
    taxPayer: "",
    category: "",
    residentialStatus: "",
    regimeOptOut: "",
    income: "",
  });

  const [attempted, setAttempted] = useState(false);

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      assessmentYear: "2026-27",
      taxPayer: "",
      category: "",
      residentialStatus: "",
      regimeOptOut: "",
      income: "",
    });
    setAttempted(false);
  };

  const calculations = useMemo(() => {
    const income = Math.max(0, Number(formData.income || 0));
    const isIndividual = formData.taxPayer === "Individual";
    const useOldRegime = formData.regimeOptOut === "Yes";

    let incomeTax = 0;
    let rebate87A = 0;

    if (income > 0) {
      if (!isIndividual) {
        incomeTax = income * 0.3;
      } else {
        if (useOldRegime) {
          incomeTax = calculateSlabTax(income, getOldRegimeSlabs(formData.category));
          if (income <= 500000) {
            rebate87A = Math.min(incomeTax, 12500);
          }
        } else {
          incomeTax = calculateSlabTax(income, getNewRegimeSlabs());
          if (income <= 700000) {
            rebate87A = Math.min(incomeTax, 25000);
          }
        }
      }
    }

    const taxAfterRebate = Math.max(0, incomeTax - rebate87A);
    const surchargeRate = getSurchargeRate(income);
    const surcharge = taxAfterRebate * surchargeRate;
    const cess = (taxAfterRebate + surcharge) * 0.04;
    const totalTax = taxAfterRebate + surcharge + cess;

    return {
      income,
      incomeTax,
      rebate87A,
      taxAfterRebate,
      surcharge,
      cess,
      totalTax,
      isIndividual,
      useOldRegime,
      surchargeRate,
    };
  }, [formData.category, formData.income, formData.regimeOptOut, formData.taxPayer]);

  const chartData = useMemo(
    () => [
      {
        name: "Tax after rebate",
        value: Math.max(0, calculations.taxAfterRebate),
      },
      {
        name: "Surcharge",
        value: Math.max(0, calculations.surcharge),
      },
      {
        name: "Cess",
        value: Math.max(0, calculations.cess),
      },
    ],
    [calculations.taxAfterRebate, calculations.surcharge, calculations.cess],
  );

  const payerOptions: TaxPayer[] = [
    "Individual",
    "HUF",
    "AOPs/BOI",
    "Firms/LLP",
    "Domestic Company",
    "Foreign Company",
  ];

  const categoryOptions: AgeCategory[] = [
    "Less than 60 years",
    "Equal to 60 years or more but less than 80 years",
    "Equal to 80 years or more",
  ];

  const residentialOptions: ResidentialStatus[] = ["Resident", "Non-Resident"];

  const assessmentYears = ["2026-27", "2025-26", "2024-25"];

  const SelectField = ({
    label,
    value,
    onChange,
    options,
    error = false,
  }: {
    label: string;
    value: string;
    onChange: (value: any) => void;
    options: string[];
    error?: boolean;
  }) => (
    <div className="space-y-3">
      <label className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
        {label} <span className="text-[#3A9B9B]">*</span>
      </label>

      <div
        className={[
          "relative overflow-hidden rounded-xl border bg-zinc-50 dark:bg-zinc-950 transition-all duration-300",
          error
            ? "border-red-400 focus-within:border-red-500"
            : "border-zinc-200 dark:border-zinc-800 focus-within:border-[#3A9B9B]",
        ].join(" ")}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent px-4 py-3.5 pr-12 text-sm font-medium text-zinc-800 dark:text-zinc-200 outline-none"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
      </div>
    </div>
  );

  const hasIncomeError = attempted && !formData.income;
  const finalRegimeLabel = calculations.isIndividual
    ? calculations.useOldRegime
      ? "Old Regime"
      : "New Regime"
    : "Flat Estimate";

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] grid-bg transition-colors duration-300">
      {/* Page Header */}
      <header className="bg-white/80 dark:bg-zinc-900/50 pt-24 pb-20 border-b border-gray-100 dark:border-zinc-800 mb-12 relative overflow-hidden backdrop-blur-sm">
        {/* Decorative Blobs for Dark Mode */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3A9B9B]/10 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/2 hidden dark:block" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2D3561]/10 blur-[130px] rounded-full translate-y-1/2 -translate-x-1/2 hidden dark:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3A9B9B]/20 bg-[#E8F7F7] dark:bg-[#3A9B9B]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#3A9B9B] mb-6">
              Financial Tools
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-zinc-100 mb-8 tracking-tighter leading-tight">
              Income Tax <span className="text-[#3A9B9B]">Calculator</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 dark:text-zinc-400 font-medium leading-relaxed max-w-3xl">
              Accurately estimate your tax liability based on the latest assessment year rules. 
              Compare regimes and plan your finances effectively.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#3A9B9B]" />
                AY: {formData.assessmentYear}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#5BBD4A]" />
                {finalRegimeLabel}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-[1fr_0.8fr]"
        >
          {/* Form Section */}
          <motion.section 
            variants={itemVariants}
            className="rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  Tax Details
                </h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">
                  Provide your income and status information.
                </p>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#3A9B9B] bg-[#E8F7F7] dark:bg-[#3A9B9B]/10 px-4 py-2 rounded-full">
                Required Fields *
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <SelectField
                label="Assessment Year"
                value={formData.assessmentYear}
                onChange={(value) => handleChange("assessmentYear", value)}
                options={assessmentYears}
              />

              <SelectField
                label="Tax Payer Type"
                value={formData.taxPayer}
                onChange={(value) => {
                  handleChange("taxPayer", value);
                  if (value !== "Individual") {
                    handleChange("category", "");
                    handleChange("residentialStatus", "");
                  }
                }}
                options={payerOptions}
              />

              {formData.taxPayer === "Individual" && (
                <>
                  <SelectField
                    label="Age Category"
                    value={formData.category}
                    onChange={(value) => handleChange("category", value)}
                    options={categoryOptions}
                  />

                  <SelectField
                    label="Residential Status"
                    value={formData.residentialStatus}
                    onChange={(value) =>
                      handleChange("residentialStatus", value)
                    }
                    options={residentialOptions}
                  />
                </>
              )}

              <div className="md:col-span-2">
                <SelectField
                  label="Opt out of New Regime (u/s 115BAC)?"
                  value={formData.regimeOptOut}
                  onChange={(value) => handleChange("regimeOptOut", value)}
                  options={["Yes", "No"]}
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
                  Net Taxable Income <span className="text-[#3A9B9B]">*</span>
                </label>

                <div
                  className={[
                    "relative overflow-hidden rounded-xl border bg-zinc-50 dark:bg-zinc-950 transition-all duration-300",
                    hasIncomeError
                      ? "border-red-400 focus-within:border-red-500"
                      : "border-zinc-200 dark:border-zinc-800 focus-within:border-[#3A9B9B]",
                  ].join(" ")}
                >
                  <div className="absolute left-0 top-0 flex h-full w-14 items-center justify-center border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-bold">
                    ₹
                  </div>

                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 10,00,000"
                    value={formData.income}
                    onChange={(e) => handleChange("income", e.target.value)}
                    className="h-14 w-full bg-transparent pl-16 pr-5 text-base font-semibold text-zinc-800 dark:text-zinc-200 outline-none placeholder:text-zinc-400"
                  />
                </div>

                {hasIncomeError && (
                  <p className="text-sm font-medium text-red-500 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Please enter your taxable income.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setAttempted(true)}
                className="flex-1 rounded-full bg-[#5BBD4A] dark:bg-[#3A9B9B] px-8 py-4 text-sm font-black text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" /> Calculate Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={resetForm}
                className="rounded-full border-2 border-[#2D3561] dark:border-zinc-700 bg-transparent px-8 py-4 text-sm font-black text-[#2D3561] dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> Reset
              </motion.button>
            </div>
          </motion.section>

          {/* Results Sidebar */}
          <div className="space-y-8">
            {/* Main Result Card */}
            <motion.section 
              variants={itemVariants}
              className="rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 md:p-10 text-zinc-900 dark:text-white shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A9B9B]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-[#3A9B9B] mb-2">
                  Total Tax Payable
                </p>
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
                  ₹ {formatINR(calculations.totalTax)}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 dark:bg-white/10 border border-zinc-100 dark:border-white/10 p-4 text-sm font-medium text-zinc-600 dark:text-zinc-200">
                    <Info className="w-5 h-5 text-[#3A9B9B] shrink-0" />
                    Includes Income Tax, Surcharge, and Education Cess.
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-100 dark:bg-white/10 px-4 py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/5">
                      {finalRegimeLabel}
                    </span>
                    {formData.taxPayer && (
                      <span className="rounded-full bg-zinc-100 dark:bg-white/10 px-4 py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/5">
                        {formData.taxPayer}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Chart Section */}
            <motion.section 
              variants={itemVariants}
              className="rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 md:p-10 shadow-sm"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#3A9B9B]" /> Tax Composition
                </h3>
              </div>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#3A9B9B" /> {/* Teal */}
                      <Cell fill="#2D3561" /> {/* Navy */}
                      <Cell fill="#5BBD4A" /> {/* Green */}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: '16px', 
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

              <div className="mt-8 space-y-3">
                {[
                  { label: "Tax After Rebate", value: calculations.taxAfterRebate, color: "bg-[#3A9B9B]" },
                  { label: "Surcharge", value: calculations.surcharge, color: "bg-[#2D3561]" },
                  { label: "Cess", value: calculations.cess, color: "bg-[#5BBD4A]" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">₹ {formatINR(item.value)}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Detailed Breakdown */}
            <motion.div variants={itemVariants} className="space-y-4">
              {[
                { title: "Base Income Tax", value: calculations.incomeTax, icon: "tax" },
                { title: "87A Rebate", value: calculations.rebate87A, icon: "rebate" },
                { title: "Total Payable", value: calculations.totalTax, icon: "total" },
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="group rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 flex items-center justify-between hover:border-[#3A9B9B]/30 transition-all duration-300"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-1">
                      {item.title}
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                      ₹ {formatINR(item.value)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F7F7] dark:bg-[#3A9B9B]/10 flex items-center justify-center text-[#3A9B9B] group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-[2rem] bg-zinc-100 dark:bg-zinc-900/30 p-8 text-center border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Disclaimer: This calculator is for estimation purposes only. Always consult with a qualified tax professional for precise tax planning and filing. Calculations are based on standard slab rates for the selected assessment year.
          </p>
        </div>
      </footer>
    </div>
  );
}