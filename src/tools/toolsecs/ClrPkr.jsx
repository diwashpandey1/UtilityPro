import React, {useState, useEffect, useRef} from "react";
import {
   Pipette,
   Upload,
   Crosshair,
   Image as ImageIcon,
   Download,
   Copy,
   Check,
   RefreshCcw,
   Trash2,
} from "lucide-react";

// --- COLOR UTILITY FUNCTIONS ---

const hexToRgb = (hex) => {
   let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result
      ? {
           r: parseInt(result[1], 16),
           g: parseInt(result[2], 16),
           b: parseInt(result[3], 16),
        }
      : {r: 0, g: 0, b: 0};
};

const rgbToHex = (r, g, b) => {
   return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
   );
};

const rgbToHsl = (r, g, b) => {
   r /= 255;
   g /= 255;
   b /= 255;
   const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
   let h,
      s,
      l = (max + min) / 2;

   if (max === min) {
      h = s = 0; // achromatic
   } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
         case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
         case g:
            h = (b - r) / d + 2;
            break;
         case b:
            h = (r - g) / d + 4;
            break;
      }
      h /= 6;
   }
   return {h: h * 360, s: s * 100, l: l * 100};
};

const hslToRgb = (h, s, l) => {
   h /= 360;
   s /= 100;
   l /= 100;
   let r, g, b;

   if (s === 0) {
      r = g = b = l; // achromatic
   } else {
      const hue2rgb = (p, q, t) => {
         if (t < 0) t += 1;
         if (t > 1) t -= 1;
         if (t < 1 / 6) return p + (q - p) * 6 * t;
         if (t < 1 / 2) return q;
         if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
         return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
   }
   return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
   };
};

// --- COMPONENT ---

export default function ClrPkr() {
   // State
   const [baseColor, setBaseColor] = useState("#3B82F6");
   const [shades, setShades] = useState([]);
   const [settings, setSettings] = useState({
      count: 6,
      lighten: 25,
      darken: 25,
   });

   // Image State
   const [imageSrc, setImageSrc] = useState(null);
   const [imageSize, setImageSize] = useState({w: 0, h: 0});

   // UI Interaction State
   const [copied, setCopied] = useState(null); // stores the text copied
   const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);

   // Refs
   const imageCanvasRef = useRef(null);
   const paletteCanvasRef = useRef(null);
   const fileInputRef = useRef(null);

   // -- 1. INIT & UTILS --

   useEffect(() => {
      if (window.EyeDropper) {
         setIsEyeDropperSupported(true);
      }
   }, []);

   const copyToClipboard = (text) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
   };

   // -- 2. COLOR LOGIC --

   useEffect(() => {
      generateShades();
   }, [baseColor, settings]);

   const generateShades = () => {
      const {r, g, b} = hexToRgb(baseColor);
      const hsl = rgbToHsl(r, g, b);

      const newShades = [];

      // Calculate lighter shades
      const lightStep =
         settings.lighten / Math.max(1, Math.floor(settings.count / 2));
      // Calculate darker shades
      const darkStep =
         settings.darken / Math.max(1, Math.floor(settings.count / 2));

      // We want the base color to be roughly in the middle
      const midPoint = Math.floor(settings.count / 2);

      for (let i = 0; i < settings.count; i++) {
         let newL = hsl.l;

         if (i < midPoint) {
            // Lighter (going backwards from midpoint)
            const factor = midPoint - i;
            newL = Math.min(100, hsl.l + lightStep * factor);
         } else if (i > midPoint) {
            // Darker
            const factor = i - midPoint;
            newL = Math.max(0, hsl.l - darkStep * factor);
         } else {
            // Base Color
            newL = hsl.l;
         }

         const rgb = hslToRgb(hsl.h, hsl.s, newL);
         const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
         newShades.push(hex);
      }

      // Sort logic: usually palettes go Light -> Dark or Dark -> Light.
      // Our math above puts light at 0 and dark at end if lightness > base.
      // Let's ensure they are sorted by lightness for a smooth gradient.
      newShades.sort((a, b) => {
         const rgbA = hexToRgb(a);
         const hslA = rgbToHsl(rgbA.r, rgbA.g, rgbA.b);
         const rgbB = hexToRgb(b);
         const hslB = rgbToHsl(rgbB.r, rgbB.g, rgbB.b);
         return hslB.l - hslA.l; // Lightest first
      });

      setShades(newShades);
   };

   // -- 3. PALETTE PREVIEW & DOWNLOAD --

   useEffect(() => {
      // Draw the vertical palette to the hidden/visible canvas
      const canvas = paletteCanvasRef.current;
      if (!canvas || shades.length === 0) return;

      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const blockHeight = h / shades.length;
      shades.forEach((color, i) => {
         // 1. Draw Color Block
         ctx.fillStyle = color;
         ctx.fillRect(0, i * blockHeight, w, blockHeight);

         // 2. Draw Hex Text
         // Calculate brightness to decide text color (black or white)
         const {r, g, b} = hexToRgb(color);
         const brightness = (r * 299 + g * 587 + b * 114) / 1000;

         ctx.fillStyle = brightness > 128 ? "#000000" : "#ffffff";
         ctx.font = "bold 12px monospace";
         ctx.textAlign = "center";
         ctx.textBaseline = "middle";

         const y = i * blockHeight + blockHeight / 2;
         ctx.fillText(color.toUpperCase(), w / 2, y);
      });
   }, [shades]);

   const handleDownloadPalette = () => {
      const canvas = paletteCanvasRef.current;
      if (!canvas) return;

      // Create a temporary link
      const link = document.createElement("a");
      link.download = `palette-${baseColor.substring(1)}.png`;
      link.href = canvas.toDataURL();
      link.click();
   };

   // -- 4. IMAGE HANDLING --

   const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         const img = new Image();
         img.onload = () => {
            setImageSrc(img);
            setImageSize({w: img.width, h: img.height});
         };
         img.src = event.target.result;
      };
      reader.readAsDataURL(file);
   };

   // Draw image to canvas when loaded
   useEffect(() => {
      if (imageSrc && imageCanvasRef.current) {
         const canvas = imageCanvasRef.current;
         const ctx = canvas.getContext("2d");

         // We need to fit the image into the container aspect ratio visually,
         // but for accuracy, we draw it at a standardized resolution or intrinsic.
         // Let's match the parent container width behavior.

         // For simplicity in this demo, we'll fix the internal resolution but use CSS for display.
         canvas.width = 300;
         canvas.height = 500;

         // Draw image "contain" style
         const hRatio = canvas.width / imageSrc.width;
         const vRatio = canvas.height / imageSrc.height;
         const ratio = Math.min(hRatio, vRatio);

         const centerShift_x = (canvas.width - imageSrc.width * ratio) / 2;
         const centerShift_y = (canvas.height - imageSrc.height * ratio) / 2;

         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.fillStyle = "#eeeeee"; // Background for transparency
         ctx.fillRect(0, 0, canvas.width, canvas.height);

         ctx.drawImage(
            imageSrc,
            0,
            0,
            imageSrc.width,
            imageSrc.height,
            centerShift_x,
            centerShift_y,
            imageSrc.width * ratio,
            imageSrc.height * ratio
         );
      }
   }, [imageSrc]);

   const handleCanvasClick = (e) => {
      if (!imageSrc || !imageCanvasRef.current) return;

      const canvas = imageCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();

      // Calculate click position relative to canvas
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setBaseColor(hex);
   };

   const openSystemEyeDropper = async () => {
      if (!window.EyeDropper) return;
      try {
         const eyeDropper = new window.EyeDropper();
         const result = await eyeDropper.open();
         setBaseColor(result.sRGBHex);
      } catch (e) {
         console.log("EyeDropper closed", e);
      }
   };

   // -- RENDER HELPERS --

   const rgb = hexToRgb(baseColor);
   const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
   const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
   const hslString = `hsl(${Math.round(hsl.h)}, ${Math.round(
      hsl.s
   )}%, ${Math.round(hsl.l)}%)`;

   return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6">
         <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 border-b pb-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                     <Pipette size={28} />
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-gray-800">
                        Color Studio
                     </h1>
                     <p className="text-sm text-gray-500">
                        Generate palettes, convert formats, and extract colors.
                     </p>
                  </div>
               </div>

               <button
                  onClick={() => {
                     const r = Math.floor(Math.random() * 255);
                     const g = Math.floor(Math.random() * 255);
                     const b = Math.floor(Math.random() * 255);
                     setBaseColor(rgbToHex(r, g, b));
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition">
                  <RefreshCcw size={16} /> Random Color
               </button>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* ------------------- LEFT SIDE (Controls) ------------------- */}
               <div className="lg:col-span-2 space-y-8">
                  {/* 1. Color Input Box */}
                  <div className="p-6 bg-gray-50 border rounded-xl shadow-sm">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                        Choose Source
                     </h2>

                     <div className="flex flex-wrap items-center gap-6">
                        {/* HTML Color Picker */}
                        <div className="flex flex-col items-start gap-2">
                           <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">
                              Manual Picker
                           </span>
                           <div className="relative group cursor-pointer">
                              <div
                                 className="w-14 h-14 rounded-full border-4 border-white shadow-md overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400 transition"
                                 style={{backgroundColor: baseColor}}>
                                 <input
                                    type="color"
                                    value={baseColor}
                                    onChange={(e) =>
                                       setBaseColor(e.target.value)
                                    }
                                    className="opacity-0 w-full h-full cursor-pointer absolute top-0 left-0"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Pick From Screen */}
                        {isEyeDropperSupported && (
                           <div className="flex flex-col items-start gap-2">
                              <span className="text-gray-700 font-medium text-xs uppercase tracking-wide">
                                 System
                              </span>
                              <button
                                 onClick={openSystemEyeDropper}
                                 className="flex items-center gap-2 px-5 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition shadow-sm font-medium">
                                 <Crosshair
                                    size={20}
                                    className="text-blue-500"
                                 />
                                 Eye Dropper
                              </button>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* 2. Shade Controls */}
                  <div className="p-6 bg-gray-50 border rounded-xl shadow-sm">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                        Palette Settings
                     </h2>

                     <div className="grid sm:grid-cols-3 gap-6">
                        <div>
                           <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                              Shades Count: {settings.count}
                           </label>
                           <input
                              type="range"
                              min="3"
                              max="20"
                              value={settings.count}
                              onChange={(e) =>
                                 setSettings({
                                    ...settings,
                                    count: parseInt(e.target.value),
                                 })
                              }
                              className="w-full mt-2 accent-blue-600"
                           />
                        </div>

                        <div>
                           <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                              Lightness range
                           </label>
                           <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">0%</span>
                              <input
                                 type="range"
                                 min="0"
                                 max="100"
                                 value={settings.lighten}
                                 onChange={(e) =>
                                    setSettings({
                                       ...settings,
                                       lighten: parseInt(e.target.value),
                                    })
                                 }
                                 className="w-full accent-blue-400"
                              />
                              <span className="text-xs text-gray-400">
                                 {settings.lighten}%
                              </span>
                           </div>
                        </div>

                        <div>
                           <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                              Darkness range
                           </label>
                           <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">0%</span>
                              <input
                                 type="range"
                                 min="0"
                                 max="100"
                                 value={settings.darken}
                                 onChange={(e) =>
                                    setSettings({
                                       ...settings,
                                       darken: parseInt(e.target.value),
                                    })
                                 }
                                 className="w-full accent-gray-800"
                              />
                              <span className="text-xs text-gray-400">
                                 {settings.darken}%
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* 3. Color Formats */}
                  <div className="p-6 bg-gray-50 border rounded-xl shadow-sm">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                        Formats
                     </h2>

                     <div className="grid grid--3 gap-6">
                        {[
                           {label: "HEX", val: baseColor},
                           {label: "RGB", val: rgbString},
                           {label: "HSL", val: hslString},
                        ].map((fmt, idx) => (
                           <div key={idx} className="relative">
                              <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1 block">
                                 {fmt.label}
                              </label>
                              <div
                                 onClick={() => copyToClipboard(fmt.val)}
                                 className="group flex items-center justify-between bg-white border border-gray-200 hover:border-blue-400 rounded-lg px-3 py-3 cursor-pointer transition shadow-sm">
                                 <span className="font-mono text-gray-800 truncate text-sm">
                                    {fmt.val}
                                 </span>
                                 {copied === fmt.val ? (
                                    <Check
                                       size={16}
                                       className="text-green-500"
                                    />
                                 ) : (
                                    <Copy
                                       size={16}
                                       className="text-gray-400 group-hover:text-blue-500 transition"
                                    />
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* 4. Selected Color Preview + Shade Boxes */}
                  <div className="p-6 bg-white border rounded-xl shadow-sm ring-1 ring-gray-100">
                     <h2 className="text-lg font-bold text-gray-800 mb-6">
                        Generated Palette
                     </h2>

                     <div className="flex flex-col gap-4">
                        {/* Horizontal Palette Bar */}
                        <div className="flex w-full h-24 rounded-2xl overflow-hidden shadow-md">
                           {shades.map((shade, i) => (
                              <div
                                 key={i}
                                 style={{backgroundColor: shade, flex: 1}}
                                 className="group relative flex items-center justify-center cursor-pointer"
                                 onClick={() => copyToClipboard(shade)}>
                                 <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white text-[10px] px-1 py-0.5 rounded backdrop-blur-sm transition font-mono">
                                    {copied === shade ? (
                                       <Check size={12} />
                                    ) : (
                                       shade
                                    )}
                                 </span>
                              </div>
                           ))}
                        </div>

                        {/* Detailed Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
                           {shades.map((shade, i) => (
                              <div
                                 key={i}
                                 onClick={() => copyToClipboard(shade)}
                                 className="flex flex-col gap-2 cursor-pointer group">
                                 <div
                                    className="w-full h-12 rounded-lg border shadow-sm transition transform group-hover:scale-105"
                                    style={{backgroundColor: shade}}
                                 />
                                 <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                                    <span className="font-mono">{shade}</span>
                                    {copied === shade && (
                                       <Check
                                          size={12}
                                          className="text-green-600"
                                       />
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               {/* ------------------- RIGHT SIDE (Image & Export) ------------------- */}
               <div className="space-y-8 lg:sticky lg:top-8 h-fit">
                  {/* 1. Image Upload + Preview */}
                  <div className="p-6 bg-gray-50 border rounded-xl shadow-sm">
                     <div className="flex items-left md:items-center flex-col md:flex-row justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                           <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                           From Image
                        </h2>
                        {imageSrc && (
                           <div className="flex w-full items-center gap-4">
                              <button
                                 onClick={() => {
                                    setImageSrc(null);
                                    setBaseColor("#ffffff");
                                 }}
                                 className="text-xs text-red-500 hover:underline flex items-center gap-1">
                                 <Trash2 size={12} /> Clear
                              </button>
                              <div className="flex gap-3 flex-col">
                                                              <input
                                 type="color"
                                 value={baseColor}
                                 onChange={(e) => setBaseColor(e.target.value)}
                                 className="w-1/2 h-10 cursor-pointer block md:hidden mt-3 border rounded-lg"
                              />
                              <p className="text-[7px] text-gray-300 block md:hidden">Click on color box then click on Color Picker icon to pick color from image.</p>
                              </div>

                           </div>
                        )}
                     </div>

                     {!imageSrc ? (
                        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition group bg-white/50">
                           <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-500 mb-3 transition">
                              <Upload size={24} />
                           </div>
                           <span className="text-gray-700 font-medium text-sm">
                              Upload Image
                           </span>
                           <span className="text-gray-400 text-xs mt-1">
                              Click to browse
                           </span>
                           <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              className="hidden"
                           />
                        </label>
                     ) : (
                        <div className="relative rounded-lg overflow-hidden border bg-gray-200 cursor-crosshair group">
                           <canvas
                              ref={imageCanvasRef}
                              className="w-full h-auto object-contain block"
                              onClick={handleCanvasClick}
                           />
                           <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur pointer-events-none opacity-0 group-hover:opacity-100 transition">
                              Click to pick color
                           </div>
                        </div>
                     )}
                  </div>

                  {/* 2. Vertical Palette Preview (Canvas) */}
                  <div className="p-6 bg-gray-50 border rounded-xl shadow-sm">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                        Export
                     </h2>

                     <div className="flex justify-center bg-white p-4 rounded-xl border shadow-inner mb-4">
                        <canvas
                           ref={paletteCanvasRef}
                           width={100}
                           height={300}
                           className="border rounded-lg shadow-sm"
                        />
                     </div>

                     <button
                        onClick={handleDownloadPalette}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition font-medium shadow-lg hover:shadow-xl transform active:scale-95">
                        <Download size={18} />
                        Download PNG
                     </button>
                     <p className="text-center text-xs text-gray-400 mt-3">
                        Downloads the vertical strip above
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
