"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import Image from "next/image";

import { type HashResponse } from "@/lib/validation";
import { type Dictionary } from "@/lib/i18n";

type Props = {
  dictionary: Dictionary;
  proof: HashResponse;
};

export function ProofDetails({ dictionary, proof: initialProof }: Props) {
  const [proof, setProof] = useState<HashResponse>(initialProof);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrStyle, setQrStyle] = useState<"watermark" | "branded">("watermark");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const postmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copyStatus === "copied") {
      const timeout = setTimeout(() => setCopyStatus("idle"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copyStatus]);

  // Poll for verification status if pending
  useEffect(() => {
    if (proof.status !== "pending") {
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/hash?id=${proof.id}`);

        if (response.ok) {
          const updatedProof = await response.json();
          
          if (updatedProof.status !== proof.status) {
            setProof(updatedProof);
          }
        }
      } catch (error) {
        // Status check failed
      }
    };

    // Check status immediately
    checkStatus();

    // Then poll every 3 seconds for faster updates
    const intervalId = setInterval(checkStatus, 3000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [proof.id, proof.status]);

  // Generate QR code when component mounts or style changes
  useEffect(() => {
    const generateQRCode = async () => {
      if (typeof window === "undefined") return;
      
      // Always use production URL for QR code - point to public verification page
      const url = `https://marka-proof.org/proof/${proof.id}`;
      
      // Different QR code styles
      const qrOptions = {
        watermark: {
          width: 400,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#00000000", // Transparent background for watermark
          },
        },
        branded: {
          width: 400,
          margin: 2,
          color: {
            dark: "#78350f", // Vintage brown (amber-900)
            light: "#00000000", // Transparent background for overlay
          },
        },
      };

      const selectedOptions = qrOptions[qrStyle];
      
      try {
        const qrUrl = await QRCode.toDataURL(url, selectedOptions);
        setQrDataUrl(qrUrl);

        // Also render to canvas if available
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, url, selectedOptions);
        }
      } catch (error) {
        // Error generating QR code
      }
    };

    generateQRCode();
  }, [proof.id, qrStyle]);

  const handleDownloadQR = async () => {
    if (!qrDataUrl) return;

    // For branded style, capture the entire composition
    if (qrStyle === "branded" && postmarkRef.current) {
      try {
        // Dynamically import modern-screenshot (best quality & CSS support)
        const { domToPng } = await import("modern-screenshot");
        
        // Capture with high quality settings
        const dataUrl = await domToPng(postmarkRef.current, {
          scale: 2, // 2x resolution for crisp output
          quality: 1,
          backgroundColor: null,
        });
        
        const link = document.createElement("a");
        link.download = `proof-${proof.hash.substring(0, 8)}-postmark.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        // Fallback to QR only
        downloadQROnly();
      }
    } else {
      downloadQROnly();
    }
  };

  const downloadQROnly = () => {
    const link = document.createElement("a");
    const styleLabel = qrStyle === "watermark" ? "watermark" : "postmark";
    link.download = `proof-${proof.hash.substring(0, 8)}-${styleLabel}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = () => {
    switch (proof.status) {
      case "confirmed":
      case "verified": // ✅ Treat verified same as confirmed
        return "text-green-800 bg-green-50/80 border-green-300/60";
      case "failed":
        return "text-red-800 bg-red-50/80 border-red-300/60";
      case "pending":
      default:
        return "text-yellow-800 bg-yellow-50/80 border-yellow-300/60";
    }
  };

  const getStatusText = () => {
    switch (proof.status) {
      case "confirmed":
      case "verified": // ✅ Treat verified same as confirmed
        return dictionary["result.statusConfirmed"];
      case "failed":
        return dictionary["result.statusFailed"];
      case "pending":
      default:
        return dictionary["result.statusPending"];
    }
  };

  return (
    <section className="flex flex-col gap-4">
      {/* Status Badge */}
      <div className={`paper-card letter-edge flex items-center gap-2 rounded-sm border-2 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          {proof.status === "pending" && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          <span className="text-sm font-semibold uppercase tracking-wide">{getStatusText()}</span>
        </div>
      </div>

      {/* Hash Card with Date */}
      <div className="paper-card letter-edge rounded-sm border-2 border-neutral-300/40 bg-neutral-50/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {dictionary["result.hashLabel"]}
        </p>
        <p className="break-all font-mono text-sm text-neutral-800">
          {proof.hash}
        </p>
        <div className="mt-4 border-t border-neutral-300/40 pt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Registration Date
          </p>
          <p className="text-sm text-neutral-800">
            {new Date(proof.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transaction Card */}
      {proof.tonscanUrl && (
        <div className="paper-card letter-edge rounded-sm border-2 border-neutral-300/40 bg-neutral-50/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            {dictionary["result.transactionLabel"]}
          </p>
          <a
            href={proof.tonscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-neutral-700"
          >
            View on Tonscan
            <span aria-hidden>&rarr;</span>
          </a>
        </div>
      )}

      {/* Error Card */}
      {proof.status === "failed" && proof.errorMessage && (
        <div className="paper-card letter-edge rounded-sm border-2 border-red-300/60 bg-red-50/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-700">
            Error
          </p>
          <p className="text-sm text-red-800">{proof.errorMessage}</p>
        </div>
      )}

      {/* QR Code Section - Always Visible */}
      <div className="space-y-3">
        {qrDataUrl && (
          <div className="paper-card letter-edge rounded-sm border-2 border-neutral-300/40 bg-neutral-50/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                {dictionary["result.qrCodeTitle"]}
              </p>
              
              {/* Style Selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQrStyle("watermark")}
                  className={`rounded px-4 py-1.5 text-xs font-medium transition ${
                    qrStyle === "watermark"
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  Watermark
                </button>
                <button
                  type="button"
                  onClick={() => setQrStyle("branded")}
                  className={`rounded px-4 py-1.5 text-xs font-medium transition ${
                    qrStyle === "branded"
                      ? "bg-amber-800 text-amber-50"
                      : "bg-white text-neutral-700 hover:bg-amber-50"
                  }`}
                >
                  Postmark
                </button>
              </div>
            </div>

            {/* Style Description */}
            <div className="mb-4 rounded border border-neutral-200 bg-white p-3">
              <p className="text-xs text-neutral-600">
                {qrStyle === "watermark" && "Transparent background - perfect for overlaying on images and documents"}
                {qrStyle === "branded" && "Fully transparent vintage postmark - perfect for overlaying on any background"}
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              {/* QR Code Preview */}
              {qrStyle === "branded" ? (
                // Simple Vintage Postmark Style with preview background
                <div className="relative inline-block">
                  {/* Checkered background for preview only */}
                  <div className="absolute inset-0 rounded-2xl" style={{
                    backgroundImage: 'repeating-conic-gradient(#e5e5e5 0% 25%, transparent 0% 50%)',
                    backgroundPosition: '0 0, 10px 10px',
                    backgroundSize: '20px 20px',
                    zIndex: 0
                  }} />
                  
                  {/* Actual postmark (will be exported without checkered bg) */}
                  <div ref={postmarkRef} className="relative inline-block rounded-2xl p-8 shadow-lg" style={{
                    fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                    backgroundColor: 'transparent',
                    zIndex: 1
                  }}>
                    {/* Top label */}
                    <div className="mb-3 text-center">
                    <p style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.25em',
                      color: 'rgb(120, 53, 15, 0.7)',
                      fontFamily: 'inherit'
                    }}>
                      Verified on Blockchain
                    </p>
                  </div>
                  
                  {/* Simple double border frame */}
                  <div className="relative rounded-lg border-2 p-3 shadow-sm" style={{
                    borderColor: 'rgba(120, 53, 15, 0.2)',
                    backgroundColor: 'transparent'
                  }}>
                    <div className="rounded border-2 p-3" style={{
                      borderColor: 'rgba(120, 53, 15, 0.3)',
                      backgroundColor: 'transparent'
                    }}>
                      <canvas ref={canvasRef} className="hidden" />
                      <Image
                        src={qrDataUrl}
                        alt="QR Code"
                        width={400}
                        height={400}
                        className="h-auto w-full max-w-[400px]"
                      />
                    </div>
                  </div>
                  
                  {/* Bottom date stamp */}
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="h-px flex-1" style={{ backgroundColor: 'rgba(120, 53, 15, 0.2)' }} />
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'rgb(120, 53, 15)',
                      fontFamily: 'inherit'
                    }}>
                      {new Date(proof.createdAt).toLocaleDateString('en-US', { 
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <div className="h-px flex-1" style={{ backgroundColor: 'rgba(120, 53, 15, 0.2)' }} />
                  </div>
                </div>
                </div>
              ) : (
                // Watermark style
                <div className="rounded-sm border-2 border-neutral-200 bg-transparent p-4 shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
                style={{
                  backgroundImage: 'repeating-conic-gradient(#e5e5e5 0% 25%, transparent 0% 50%)',
                  backgroundPosition: '0 0, 10px 10px',
                  backgroundSize: '20px 20px'
                }}
                >
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  <Image
                    src={qrDataUrl}
                    alt="QR Code"
                    width={400}
                    height={400}
                    className="h-auto w-full max-w-[400px]"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Download QR Button */}
        <button
          type="button"
          onClick={handleDownloadQR}
          className="letter-edge flex h-14 w-full items-center justify-center gap-2 rounded-sm border-2 border-neutral-400/60 bg-neutral-800 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition-all hover:bg-neutral-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] active:scale-[0.98]"
          style={{letterSpacing: '0.05em'}}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download QR
        </button>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              // Always use production URL for sharing
              const url = `https://marka-proof.org/proof/${proof.id}`;
              await navigator.clipboard.writeText(url);
              setCopyStatus("copied");
            } catch (error) {
              setCopyStatus("error");
            }
          }}
          disabled={proof.status === "pending"}
          className="letter-edge flex h-14 w-full items-center justify-center gap-2 rounded-sm border-2 border-neutral-400/60 bg-white text-sm font-semibold uppercase tracking-wider text-neutral-900 shadow-[0_3px-10px_rgba(0,0,0,0.1)] transition-all hover:bg-neutral-50 hover:shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          style={{letterSpacing: '0.05em'}}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copyStatus === "idle"
            ? "Copy Link"
            : copyStatus === "copied"
              ? "Link Copied!"
              : "Failed to Copy"}
        </button>
      </div>
    </section>
  );
}

