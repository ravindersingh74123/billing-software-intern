import EmiCalculator from "../components/emi-calculator";

export default function EmiCalculatorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 grid-bg transition-colors duration-300 flex items-center justify-center p-6">
      <EmiCalculator />
    </div>
  );
}