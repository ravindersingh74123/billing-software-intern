// app/cryptocalculator/page.tsx

import CryptoCalculator from "@/app/components/crypto-calculator";

export default function Page() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eefaf8_0%,_#f6f8fb_38%,_#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <CryptoCalculator />
      </div>
    </div>
  );
}