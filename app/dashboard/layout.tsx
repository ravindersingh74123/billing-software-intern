// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();

//   const navItems = [
//     { name: "Home", href: "/dashboard" },
//     { name: "Customers", href: "/dashboard/customers" },
//   ];

//   return (
//     <div className="flex h-[calc(100vh-56px)]">
      
//       {/* Sidebar */}
//       <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
        
//         {/* Logo */}
//         <div className="h-14 flex items-center px-4 border-b border-gray-700 font-semibold">
//           Invoice
//         </div>

//         {/* Nav */}
//         <nav className="p-3 space-y-2">
//           {navItems.map((item) => {
//             const isActive = pathname === item.href;

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`block px-3 py-2 rounded-lg transition ${
//                   isActive
//                     ? "bg-blue-600"
//                     : "hover:bg-blue-600/70"
//                 }`}
//               >
//                 {item.name}
//               </Link>
//             );
//           })}
//         </nav>
//       </aside>

//       {/* Page Content */}
//       <main className="flex-1 p-6 overflow-auto">
//         {children}
//       </main>
//     </div>
//   );
// }


















"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard" },
    { name: "Customers", href: "/dashboard/customers" },
    { name: "Items", href: "/dashboard/items" },
    { name: "Invoices", href: "/dashboard/invoices" },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
        
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-700 font-semibold">
          Invoice
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/"); // ✅ fixes nested routes

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-gray-800"
                    : "hover:bg-gray-600/70"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}