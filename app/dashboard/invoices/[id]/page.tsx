// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";

// export default function InvoiceViewPage() {
//   const { id } = useParams();
//   const router = useRouter();

//   const [invoice, setInvoice] = useState<any>();

//   const ITEMS_PER_PAGE = 6;

//   function chunkArray<T>(arr: T[], size: number) {
//     const chunks: T[][] = [];
//     for (let i = 0; i < arr.length; i += size) {
//       chunks.push(arr.slice(i, i + size));
//     }
//     return chunks;
//   }

//   useEffect(() => {
//     fetchInvoice();
//   }, [id]);

//   const fetchInvoice = async () => {
//     try {
//       const res = await fetch(`/api/invoices/${id}`);

//       if (!res.ok) {
//         router.push("/dashboard/invoices");
//         return;
//       }

//       const data = await res.json();
//       console.log(data);

//       if (!data) {
//         router.push("/dashboard/invoices");
//         return;
//       }

//       setInvoice(data);
//     } catch (err) {
//       console.error(err);
//       router.push("/dashboard/invoices");
//     }
//   };
//   function formatDate(date: string) {
//     return new Date(date).toLocaleDateString("en-GB");
//   }
//   function convertToWords(num: number) {
//     return "Rupees " + num + " only"; // replace later with real lib
//   }

//   const handleDownload = () => {
//     window.print(); // simple version
//   };

//   if (!invoice) return <div className="p-6">Loading...</div>;

//   const subtotal = invoice.items.reduce(
//     (sum: number, i: any) => sum + (i.taxableAmount ?? i.price * i.quantity),
//     0,
//   );

//   const totalGST = invoice.items.reduce(
//     (sum: number, i: any) => sum + (i.gstAmount ?? 0),
//     0,
//   );

//   const grandTotal = subtotal + totalGST;

//   const pages = chunkArray(invoice.items, ITEMS_PER_PAGE);

//   return (
//     <>
//       <style jsx global>{`
//         @media print {
//           html,
//           body {
//             margin: 0 !important;
//             padding: 0 !important;
//             background: #fff !important;
//           }

//           body * {
//             visibility: hidden !important;
//           }

//           .print-area,
//           .print-area * {
//             visibility: visible !important;
//             color: #000 !important;
//             -webkit-print-color-adjust: exact !important;
//             print-color-adjust: exact !important;
//           }

//           .no-print {
//             display: none !important;
//           }

//           .print-page {
//             break-after: page;
//             page-break-after: always;
//             margin: 0 !important;
//             box-shadow: none !important;
//           }
//         }

//         @page {
//           size: A4 portrait;
//           margin: 0;
//         }
//         .print-page {
//           page-break-after: always;
//           break-after: page;
//           break-inside: avoid;
//         }

//         table,
//         tr,
//         td {
//           page-break-inside: avoid;
//         }
//       `}</style>

//       <div className="p-6">
//         {/* 🔹 Header */}
//         <div className="flex justify-between items-center mb-6 no-print">
//           <h1 className="text-xl font-semibold">{invoice.invoiceNo}</h1>

//           <div className="flex gap-3">
//             <button
//               onClick={() => router.push(`/dashboard/invoices/${id}/edit`)}
//               className="px-4 py-2 border rounded-md"
//             >
//               Edit
//             </button>

//             <button
//               onClick={handleDownload}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md"
//             >
//               Download
//             </button>
//           </div>
//         </div>

//         {/* 🔹 Template */}
//         <div className="flex justify-center p-0 bg-white print-wrapper">
//           <div className="w-[794px] print-area">
//             {pages.map((pageItems, pageIndex) => {
//               const isLastPage = pageIndex === pages.length - 1;

//               return (
//                 <div
//                   key={pageIndex}
//                   className="relative w-[794px] min-h-[1123px] bg-white shadow mb-6 break-after-page print-page"
//                 >
//                   <img
//                     src="/letterhead.png"
//                     alt="Letterhead Background"
//                     className="absolute inset-0 z-0 w-full h-full object-cover opacity-95 pointer-events-none"
//                   />

//                   <div className="relative z-10 text-[13px] h-full flex flex-col">
//                     {/* top header */}
//                     <div className=" px-10 mt-[220px] flex justify-between">
//                       <div className="space-y-1">
//                         <p>
//                           <strong>PAN:</strong> {invoice.customer?.pan}
//                         </p>
//                         <p>
//                           <strong>GSTIN:</strong> {invoice.customer?.gstin}
//                         </p>
//                         <p>
//                           <strong>Bank Name:</strong>{" "}
//                           {invoice.customer?.bankName}
//                         </p>
//                         <p>
//                           <strong>Account Name:</strong>{" "}
//                           {invoice.customer?.accountName}
//                         </p>
//                         <p>
//                           <strong>Account Number:</strong>{" "}
//                           {invoice.customer?.accountNumber}
//                         </p>
//                         <p>
//                           <strong>IFSC:</strong> {invoice.customer?.ifsc}
//                         </p>
//                       </div>

//                       <div className="text-right">
//                         <h2 className="text-[16px] font-semibold mb-2">
//                           TAX INVOICE
//                         </h2>
//                         <p>
//                           <strong>Invoice No:</strong> {invoice.invoiceNo}
//                         </p>
//                         <p>
//                           <strong>Date:</strong> {formatDate(invoice.issueDate)}
//                         </p>
//                       </div>
//                     </div>

//                     {/* bill to only on first page */}
//                     {
//                       <div className="mt-[40px] px-10">
//                         <p className="font-semibold mb-2 text-sm">Bill To</p>
//                         <p className="text-gray-700">
//                           {invoice.customer?.companyName}
//                         </p>
//                         <p className="text-gray-700">
//                           {invoice.customer?.addressLine1}
//                         </p>
//                         <p className="text-gray-700">
//                           {invoice.customer?.city}, {invoice.customer?.state},{" "}
//                           {invoice.customer?.pincode}
//                         </p>
//                       </div>
//                     }

//                     {/* table */}
//                     <table className="w-[85%] mx-auto mt-8 border border-gray-500 text-[13px] table-fixed">
//                       <thead className="bg-gray-50">
//                         <tr className="border-b border-gray-300 last:border-b-0 break-inside-avoid">
//                           <th className="p-3 text-left font-semibold">#</th>
//                           <th className="p-3 text-left font-semibold">Item</th>
//                           <th className="p-3 text-center font-semibold">Qty</th>
//                           <th className="p-3 text-center font-semibold">
//                             Rate
//                           </th>
//                           <th className="p-3 text-center font-semibold">
//                             GST %
//                           </th>
//                           <th className="p-3 text-right font-semibold">
//                             Amount
//                           </th>
//                           <th className="p-3 text-right font-semibold">
//                             Total
//                           </th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {pageItems.map((item: any, i: number) => {
//                           const rowIndex = pageIndex * ITEMS_PER_PAGE + i + 1;

//                           return (
//                             <tr
//                               key={item.id}
//                               className="border-b border-gray-300 last:border-b-0 break-inside-avoid"
//                             >
//                               <td className="p-3">{rowIndex}</td>
//                               <td className="p-3">{item.name}</td>
//                               <td className="p-3 text-center">
//                                 {item.quantity}
//                               </td>
//                               <td className="p-3 text-center">
//                                 ₹ {item.price}
//                               </td>
//                               <td className="p-3 text-center">
//                                 {item.gstRate ?? 0}%
//                               </td>
//                               <td className="p-3 text-right font-mono">
//                                 <div>
//                                   ₹ {(item.price * item.quantity).toFixed(2)}
//                                 </div>
//                                 <div className="text-xs text-gray-500">
//                                   + ₹ {item.gstAmount.toFixed(2)}
//                                 </div>
//                               </td>
//                               <td className="p-3 text-right font-semibold font-mono">
//                                 ₹ {item.total.toFixed(2)}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>

//                     {/* totals only on last page */}
//                     {isLastPage && (
//                       <>
//                         <div className="mt-6 flex justify-end px-10">
//                           <div className="w-72 text-[13px] border border-gray-300 p-4 rounded-md bg-gray-50/50">
//                             <div className="flex justify-between mb-2">
//                               <span className="text-gray-600">Sub Total</span>
//                               <span className="font-medium">
//                                 ₹ {subtotal.toFixed(2)}
//                               </span>
//                             </div>

//                             <div className="flex justify-between mb-2">
//                               <span className="text-gray-600">Total GST</span>
//                               <span className="font-medium">
//                                 ₹ {totalGST.toFixed(2)}
//                               </span>
//                             </div>

//                             <div className="flex justify-between font-bold border-t border-gray-300 mt-2 pt-3 text-[14px]">
//                               <span>Total</span>
//                               <span>₹ {grandTotal.toFixed(2)}</span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* <div className="mt-8 px-10 text-gray-700 font-medium">
//                           Amount in Words:{" "}
//                           <span className="italic font-normal">
//                             {convertToWords(grandTotal)}
//                           </span>
//                         </div> */}
//                       </>
//                     )}

//                     {/* content area */}
//                     {/* <div className="mt-auto pt-10 pb-10 px-10 text-[12px] text-gray-500 text-center">
//                     Thank you for your business and collaboration.
//                   </div> */}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  gstRate?: number | null;
  gstAmount?: number | null;
  taxableAmount?: number | null;
  total?: number | null;
};

type Customer = {
  pan?: string | null;
  gstin?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  companyName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  displayName?: string | null;
};

type Invoice = {
  id: string;
  invoiceNo: string;
  issueDate: string;
  totalAmount?: number;
  customer?: Customer;
  items: InvoiceItem[];
};

export default function InvoiceViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // Keep this a little conservative so the middle section stays inside the page
  const ITEMS_PER_PAGE = 5;

  function chunkArray<T>(arr: T[], size: number) {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);

      if (!res.ok) {
        router.push("/dashboard/invoices");
        return;
      }

      const data = await res.json();

      if (!data) {
        router.push("/dashboard/invoices");
        return;
      }

      setInvoice(data);
    } catch (err) {
      console.error(err);
      router.push("/dashboard/invoices");
    }
  };

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB");
  }

  function convertToWords(num: number) {
    return "Rupees " + num + " only";
  }

  const handleDownload = () => {
    window.print();
  };

  if (!invoice) return <div className="p-6">Loading...</div>;

  const safeItems = invoice.items ?? [];

  const subtotal = safeItems.reduce(
    (sum: number, i: InvoiceItem) =>
      sum + (i.taxableAmount ?? i.price * i.quantity),
    0,
  );

  const totalGST = safeItems.reduce(
    (sum: number, i: InvoiceItem) => sum + (i.gstAmount ?? 0),
    0,
  );

  const grandTotal = subtotal + totalGST;
  const pages = chunkArray(safeItems, ITEMS_PER_PAGE);

  return (
    <>
      <style jsx global>{`
        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }

          .no-print {
            display: none !important;
          }

          .print-page {
            break-after: page;
            page-break-after: always;
            break-inside: avoid;
            page-break-inside: avoid;
            box-shadow: none !important;
            margin: 0 !important;
          }

          .print-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }
      `}</style>

      <div className="p-6">
        {/* Header / actions */}
        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-xl font-semibold">{invoice.invoiceNo}</h1>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/dashboard/invoices/${id}/edit`)}
              className="px-4 py-2 border rounded-md"
            >
              Edit
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Download
            </button>
          </div>
        </div>

        {/* Printable area */}
        <div className="flex justify-center bg-white p-0 print-area">
          <div className="w-[794px]">
            {pages.map((pageItems, pageIndex) => {
              const isLastPage = pageIndex === pages.length - 1;

              return (
                <div
                  key={pageIndex}
                  className="relative w-[794px] min-h-[1123px] bg-white shadow overflow-hidden print-page"
                >
                  {/* Background letterhead */}
                  <img
                    src="/letterhead.png"
                    alt="Letterhead Background"
                    className="absolute inset-0 z-0 w-full h-full object-cover opacity-95 pointer-events-none"
                  />

                  {/* Content */}
                  <div className="relative z-10 text-[13px] min-h-[1123px] flex flex-col">
                    {/* Top block */}
                    <div className="px-10 mt-[220px] flex justify-between">
                      <div className="space-y-1">
                        <p>
                          <strong>PAN:</strong> {invoice.customer?.pan || "-"}
                        </p>
                        <p>
                          <strong>GSTIN:</strong>{" "}
                          {invoice.customer?.gstin || "-"}
                        </p>
                        <p>
                          <strong>Bank Name:</strong>{" "}
                          {invoice.customer?.bankName || "-"}
                        </p>
                        <p>
                          <strong>Account Name:</strong>{" "}
                          {invoice.customer?.accountName || "-"}
                        </p>
                        <p>
                          <strong>Account Number:</strong>{" "}
                          {invoice.customer?.accountNumber || "-"}
                        </p>
                        <p>
                          <strong>IFSC:</strong> {invoice.customer?.ifsc || "-"}
                        </p>
                      </div>

                      <div className="text-right">
                        <h2 className="text-[16px] font-semibold mb-2">
                          TAX INVOICE
                        </h2>
                        <p>
                          <strong>Invoice No:</strong> {invoice.invoiceNo}
                        </p>
                        <p>
                          <strong>Date:</strong> {formatDate(invoice.issueDate)}
                        </p>
                      </div>
                    </div>

                    {/* Bill To only on first page */}
                    {
                      <div className="mt-[40px] px-10">
                        <p className="font-semibold mb-2 text-sm">Bill To</p>
                        <p className="text-gray-700">
                          {invoice.customer?.companyName || "-"}
                        </p>
                        <p className="text-gray-700">
                          {invoice.customer?.addressLine1 || "-"}
                        </p>
                        <p className="text-gray-700">
                          {invoice.customer?.addressLine2 || ""}
                        </p>
                        <p className="text-gray-700">
                          {invoice.customer?.city || "-"},{" "}
                          {invoice.customer?.state || "-"},{" "}
                          {invoice.customer?.pincode || "-"}
                        </p>
                      </div>
                    }

                    {/* Items table */}
                    <div className="mt-8">
                      <table className="w-[85%] mx-auto border border-gray-500 text-[13px] table-fixed">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-300 break-inside-avoid">
                            <th className="p-3 text-left font-semibold w-[6%]">
                              #
                            </th>
                            <th className="p-3 text-left font-semibold w-[26%]">
                              Item
                            </th>
                            <th className="p-3 text-center font-semibold w-[10%]">
                              Qty
                            </th>
                            <th className="p-3 text-center font-semibold w-[12%]">
                              Rate
                            </th>
                            <th className="p-3 text-center font-semibold w-[10%]">
                              GST %
                            </th>
                            <th className="p-3 text-right font-semibold w-[18%]">
                              Amount
                            </th>
                            <th className="p-3 text-right font-semibold w-[18%]">
                              Total
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {pageItems.map((item: InvoiceItem, i: number) => {
                            const rowIndex = pageIndex * ITEMS_PER_PAGE + i + 1;
                            const taxable =
                              item.taxableAmount ?? item.price * item.quantity;
                            const gstAmount = item.gstAmount ?? 0;
                            const total = item.total ?? taxable + gstAmount;

                            return (
                              <tr
                                key={item.id}
                                className="border-b border-gray-300 last:border-b-0 break-inside-avoid"
                              >
                                <td className="p-3 align-top">{rowIndex}</td>
                                <td className="p-3 align-top">{item.name}</td>
                                <td className="p-3 text-center align-top">
                                  {item.quantity}
                                </td>
                                <td className="p-3 text-center align-top">
                                  {formatINR(item.price)}
                                </td>
                                <td className="p-3 text-center align-top">
                                  {item.gstRate ?? 0}%
                                </td>
                                <td className="p-3 text-right font-mono align-top tabular-nums">
                                  <div>{formatINR(taxable)}</div>
                                  <div className="text-xs text-gray-500">
                                    + {formatINR(gstAmount)}
                                  </div>
                                </td>
                                <td className="p-3 text-right font-semibold font-mono align-top tabular-nums">
                                  {formatINR(total)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom totals only on last page */}
                    {isLastPage && (
                      <div className="mt-auto px-10 pb-[120px]">
                        <div className="mt-6 flex justify-end">
                          <div className="w-72 text-[13px] border border-gray-300 p-4 rounded-md bg-gray-50/50">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Sub Total</span>
                              <span className="font-medium">
                                {formatINR(subtotal)}
                              </span>
                            </div>

                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Total GST</span>
                              <span className="font-medium">
                                {formatINR(totalGST)}
                              </span>
                            </div>

                            <div className="flex justify-between font-bold border-t border-gray-300 mt-2 pt-3 text-[14px]">
                              <span>Total</span>
                              <span>{formatINR(grandTotal)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 text-gray-700 font-medium">
                          Amount in Words:{" "}
                          <span className="italic font-normal">
                            {convertToWords(grandTotal)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
