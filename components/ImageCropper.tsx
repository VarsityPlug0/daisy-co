"use client";
import { useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check } from "lucide-react";

interface Props {
  src: string;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}

function centerAspectCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
    width,
    height
  );
}

async function cropToBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0,
    canvas.width, canvas.height
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/jpeg", 0.92)
  );
}

// Fetch remote image as a local blob URL to avoid tainted canvas CORS errors
async function toLocalSrc(src: string): Promise<string> {
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  const res = await fetch(src);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export default function ImageCropper({ src, onDone, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [localSrc, setLocalSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Convert remote URL to local blob on first render
  useState(() => {
    toLocalSrc(src).then(setLocalSrc).catch(() => setLocalSrc(src));
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const c = centerAspectCrop(width, height);
    setCrop(c);
    // Pre-set completedCrop so Apply works without dragging
    setCompletedCrop({
      unit: "px",
      x: (c.x / 100) * width,
      y: (c.y / 100) * height,
      width: (c.width / 100) * width,
      height: (c.height / 100) * height,
    });
  }

  async function handleApply() {
    if (!imgRef.current || !completedCrop) return;
    setProcessing(true);
    setError("");
    try {
      const blob = await cropToBlob(imgRef.current, completedCrop);
      onDone(blob);
    } catch (e) {
      console.error("Crop error:", e);
      setError("Crop failed — try again.");
      setProcessing(false);
    }
  }

  return (
    <>
      <style>{`
        .ReactCrop__drag-handle::after {
          width: 28px !important;
          height: 28px !important;
          background: #C8B993 !important;
          border-radius: 4px !important;
          opacity: 0.9 !important;
        }
        .ReactCrop__drag-bar {
          min-height: 20px !important;
          min-width: 20px !important;
        }
        .ReactCrop__crop-selection {
          border: 2px solid #C8B993 !important;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.55) !important;
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-black/90"
        style={{ touchAction: "none" }}
      >
        <div className="bg-[#1D1D1D] border border-[#2A2A2A] sm:rounded-2xl w-full sm:max-w-2xl sm:mx-4 flex flex-col h-full sm:h-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] shrink-0">
            <h2 className="text-white font-semibold text-sm">Crop Image</h2>
            <button
              onClick={onCancel}
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Crop canvas */}
          <div className="flex-1 flex items-center justify-center bg-black p-3 overflow-hidden">
            {localSrc ? (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              >
                <img
                  ref={imgRef}
                  src={localSrc}
                  alt="Crop"
                  onLoad={onImageLoad}
                  crossOrigin="anonymous"
                  style={{
                    maxHeight: "calc(100vh - 200px)",
                    maxWidth: "100%",
                    display: "block",
                    touchAction: "none",
                  }}
                />
              </ReactCrop>
            ) : (
              <div className="w-8 h-8 border-2 border-[#C8B993] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <p className="text-center text-gray-600 text-xs py-2 shrink-0">
            Drag the corners or edges to adjust
          </p>

          {error && <p className="text-red-400 text-xs text-center pb-2">{error}</p>}

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-[#2A2A2A] shrink-0">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={processing || !completedCrop?.width}
              className="flex-1 py-3 rounded-xl bg-[#C8B993] hover:bg-[#c4a030] text-black font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check size={15} />
              {processing ? "Processing…" : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
