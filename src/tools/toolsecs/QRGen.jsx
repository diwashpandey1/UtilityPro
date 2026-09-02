import React, { useState, useEffect, useRef } from "react";
import QRCodeLib from "qrcode";
import { QrCode, Download, Link, Type } from "lucide-react";

const STANDARD_SIZES = [128, 256, 512, 750, 1000];
const PREVIEW_SIZE = 128;

function sanitizeFileName(name) {
  return name.trim().replace(/\s+/g, "-").replace(/[^\w\-\.]/g, "") || "qr-code";
}

function maybePrefixUrl(value) {
  if (/\S+\.\S+/.test(value) && !/^\w+:\/\//.test(value)) {
    return "https://" + value;
  }
  return value;
}

export default function QRGen() {
  const [data, setData] = useState("https://www.example.com");
  const [dataType, setDataType] = useState("url");
  const [dimension, setDimension] = useState(256);
  const [color, setColor] = useState("#000000");
  const [fileName, setFileName] = useState("qr-code");
  const [error, setError] = useState("");

  const previewCanvas = useRef(null);
  const downloadCanvas = useRef(null);
  const debounceRef = useRef(null);

  const validate = () => {
    setError("");
    if (!data.trim()) {
      setError("Please enter something.");
      return false;
    }
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
      setError("Invalid hex color.");
      return false;
    }
    return true;
  };

  // ⭐ Async QR generation function
  const generateQr = async () => {
    if (!validate()) return;

    const content = dataType === "url" ? maybePrefixUrl(data.trim()) : data;

    const dlCanvas = downloadCanvas.current;
    const pvCanvas = previewCanvas.current;

    if (!dlCanvas || !pvCanvas) return;

    // --- High Resolution Canvas ---
    await QRCodeLib.toCanvas(dlCanvas, content, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: dimension,
      color: { dark: color, light: "#ffffff" }
    });

    // --- Preview Canvas (Always 128px) ---
    await QRCodeLib.toCanvas(pvCanvas, content, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: PREVIEW_SIZE,
      color: { dark: color, light: "#ffffff" }
    });
  };

  // ⭐ useEffect without async return
  useEffect(() => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // Call async function safely
      generateQr();
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [data, dataType, dimension, color]);

  // Initial QR render on mount
  useEffect(() => {
    generateQr();
  }, []);

  const downloadPng = () => {
    const c = downloadCanvas.current;
    const link = document.createElement("a");
    link.download = `${sanitizeFileName(fileName)}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
          <QrCode size={36} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">QR Code Generator</h1>
          <p className="text-sm text-gray-500">No distortion. High-res PNG. Correct preview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-5">

          {/* Content */}
          <div className="p-4 bg-gray-50 rounded-lg border shadow-sm">
            <label className="text-sm font-medium">Content to Encode</label>
            <div className="flex gap-3 mt-2">
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-28 px-3 py-2 border rounded-lg"
              >
                <option value="url">URL</option>
                <option value="text">Text</option>
              </select>

              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {dataType === "url" ? <Link size={18} /> : <Type size={18} />}
                </span>

                <input
                  type="text"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Size + Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border shadow-sm">
              <label className="text-sm font-medium">Output Resolution (PNG)</label>
              <select
                value={dimension}
                onChange={(e) => setDimension(Number(e.target.value))}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                {STANDARD_SIZES.map((s) => (
                  <option key={s} value={s}>{s} × {s} px</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border shadow-sm">
              <label className="text-sm font-medium">QR Color</label>
              <div className="flex flex-col  gap-3 items-center mt-2">
                <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-full h-10 border rounded-lg"/>
                <input type="text" value={color} onChange={(e)=>setColor(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg font-mono w-full"/>
              </div>
            </div>
          </div>

          {/* File Name */}
          <div className="p-4 bg-gray-50 rounded-lg border shadow-sm">
            <label className="text-sm font-medium">File Name</label>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT SIDE — PREVIEW */}
        <div className="lg:col-span-1 flex flex-col items-center p-4 bg-blue-50 border rounded-xl shadow max-w-[260px] mx-auto">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>

          <div className="bg-white border rounded-lg p-3 mb-4 flex items-center justify-center"
            style={{ width: 152, height: 152 }}>
            <canvas
              ref={previewCanvas}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              style={{
                width: PREVIEW_SIZE,
                height: PREVIEW_SIZE,
                imageRendering: "pixelated"
              }}
            />
          </div>

          <p className="text-xs mb-3">
            PNG Output: <strong>{dimension}×{dimension}</strong>
          </p>

          <button
            onClick={downloadPng}
            className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download PNG
          </button>

          {/* Hidden high-res canvas */}
          <canvas ref={downloadCanvas} width={dimension} height={dimension} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}
