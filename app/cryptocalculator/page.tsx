// app/cryptocalculator/page.tsx

import CryptoCalculator from "@/app/components/crypto-calculator";

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 grid-bg transition-colors duration-300 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <CryptoCalculator />
      </div>
    </div>
  );
}