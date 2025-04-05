import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QrScannerProps {
  onSuccess?: () => void;
}

const QrScanner = ({ onSuccess }: QrScannerProps) => {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      console.log(`Code scanned = ${decodedText}`);
      setScanning(false);
      await scanner.clear();

      try {
        const response = await fetch("/api/scan-nft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scannedAddress: decodedText }),
        });

        if (!response.ok) {
          throw new Error("Failed to process NFT scan");
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Error processing scan:", error);
      }
    };

    const onScanError = (error: any) => {
      console.error("QR code scan error:", error);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onSuccess]);

  return (
    <div className="text-black">
      <h1>Scan QR Code</h1>
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
};

export default QrScanner;
