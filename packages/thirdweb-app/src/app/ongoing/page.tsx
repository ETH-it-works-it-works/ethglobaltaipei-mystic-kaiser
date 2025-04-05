// "use client";

// import { useState } from "react";
// import QRCode from "react-qr-code";
// import QrScanner from "../../components/custom/scanner";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../components/ui/dialog";
// import { useThirdWeb } from "@/hooks/useThirdWeb";
// import Navbar from "@/components/custom/navbar";

// export default function OngoingEvent() {
//   const { account } = useThirdWeb();
//   const [scanCount, setScanCount] = useState(0);
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const handleScanSuccess = () => {
//     setScanCount((prev) => prev + 1);
//     setDialogOpen(false);
//     window.location.reload();
//   };

//   return (
//     <div className="flex flex-col justify-center items-center mt-16 p-4 space-y-8">
//       <Navbar />
//       <h1 className="text-3xl font-bold">Ongoing Event</h1>

//       {account?.address ? (
//         <>
//           <div className="bg-white p-4 rounded-lg shadow-lg">
//             <QRCode value={account?.address} size={256} />
//           </div>

//           <div className="text-center">
//             <p className="text-lg font-semibold">Your Scan Count</p>
//             <p className="text-4xl font-bold">{scanCount}</p>
//           </div>

//           <div className="text-center max-w-md">
//             <h2 className="text-xl font-semibold mb-2">{eventData.title}</h2>
//             <p className="text-gray-600">{eventData.description}</p>
//             <p className="text-gray-600 mt-2">{eventData.location}</p>
//             <p className="text-gray-600">{eventData.date}</p>
//           </div>

//           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//             <DialogTrigger asChild>
//               <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
//                 Scan QR Code
//               </button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[425px]">
//               <DialogHeader>
//                 <DialogTitle>Scan QR Code</DialogTitle>
//               </DialogHeader>
//               <QrScanner onSuccess={handleScanSuccess} />
//             </DialogContent>
//           </Dialog>
//         </>
//       ) : (
//         <p className="text-lg">Please connect your wallet to participate</p>
//       )}
//     </div>
//   );
// }
