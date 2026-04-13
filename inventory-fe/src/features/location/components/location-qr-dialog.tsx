import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { env } from "@/config/env";
import type { LocationInfo } from "../api/use-locations";

interface LocationQrDialogProps {
  location: LocationInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LocationQrDialog({ location, open, onOpenChange }: LocationQrDialogProps) {
  if (!location) return null;

  const qrUrl = `${env.VITE_PUBLIC_URL}/public/location/${location.id}`;

  const downloadQR = () => {
    const svg = document.getElementById("location-qr-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const padding = 40;
      const titleSpace = 50;
      const footerSpace = 40;
      const qrSize = img.width;

      canvas.width = qrSize + padding * 2;
      canvas.height = qrSize + titleSpace + footerSpace + padding * 2;

      if (!ctx) return;

      // Fill background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Location Name
      ctx.fillStyle = "black";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(location.name, canvas.width / 2, padding + titleSpace / 2);

      // Draw QR Code
      ctx.drawImage(img, padding, padding + titleSpace);

      // Draw Footer Text
      ctx.fillStyle = "#6b7280"; // muted-foreground color
      ctx.font = "18px sans-serif";
      ctx.fillText(
        "Scan to see items inside",
        canvas.width / 2,
        canvas.height - padding - footerSpace / 2
      );

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${location.name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const printQR = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = document.getElementById("location-qr-svg");
    if (!svg) return;

    const svgHtml = svg.outerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${location.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .container { text-align: center; border: 2px solid #000; padding: 40px; border-radius: 20px; }
            h1 { margin-bottom: 20px; font-size: 24px; }
            p { margin-top: 20px; color: #666; }
            svg { width: 300px; height: 300px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${location.name}</h1>
            ${svgHtml}
            <p>Scan to see items inside</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Location QR Code</DialogTitle>
          <DialogDescription>
            Scan this code to see all items inside <strong>{location.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-6 p-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <QRCodeSVG
              id="location-qr-svg"
              value={qrUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="flex flex-col gap-1 justify-center items-center">
            <p className="text-sm font-medium">{location.name}</p>
            <p className="text-xs text-muted-foreground">{location.floor}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={downloadQR}>
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button size="sm" onClick={printQR}>
            <Printer className="mr-2 h-4 w-4" />
            Print Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { LocationQrDialog };
