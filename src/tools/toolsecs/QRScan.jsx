import React, {useState, useEffect, useRef} from "react";
import {Html5Qrcode} from "html5-qrcode";
import EXIF from "exif-js";
import {
   QrCode,
   Camera,
   Upload,
   Copy,
   ExternalLink,
   RefreshCcw,
   CheckCircle2,
   SwitchCamera,
   Ban,
   Play,
   X,
   ImagePlus,
   AlertCircle,
} from "lucide-react";

export default function QRScan() {
   const [mode, setMode] = useState("camera"); // "camera" | "upload"
   const [scanResult, setScanResult] = useState(null);
   const [isCopied, setIsCopied] = useState(false);
   const [error, setError] = useState("");
   const [uploadedFile, setUploadedFile] = useState(null);

   // Camera State
   const [cameras, setCameras] = useState([]);
   const [activeCameraId, setActiveCameraId] = useState(null);
   const [isScanning, setIsScanning] = useState(false);

   // Refs
   const scannerRef = useRef(null);
   const fileInputRef = useRef(null);

   // 1. INITIALIZE & FETCH CAMERAS
   useEffect(() => {
      Html5Qrcode.getCameras()
         .then((devices) => {
            if (devices && devices.length) {
               setCameras(devices);
               setActiveCameraId(devices[devices.length - 1].id);
            }
         })
         .catch((err) => {
            console.error("Error getting cameras", err);
         });

      return () => {
         if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(console.error);
         }
      };
   }, []);

   // 2. HANDLE CAMERA START/STOP
   useEffect(() => {
      if (mode === "camera" && activeCameraId && !scanResult) {
         startCamera(activeCameraId);
      } else {
         stopCamera();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [mode, activeCameraId, scanResult]);

   const startCamera = async (cameraId) => {
      // Clear any previous errors or file uploads when starting camera
      setError("");

      if (scannerRef.current?.isScanning) {
         await stopCamera();
      }

      if (!scannerRef.current) {
         scannerRef.current = new Html5Qrcode("reader");
      }

      try {
         setIsScanning(true);
         await scannerRef.current.start(
            cameraId,
            {
               fps: 10,
               qrbox: {width: 250, height: 250},
               aspectRatio: 1.0,
            },
            (decodedText) => {
               setScanResult(decodedText);
               stopCamera();
            },
            () => {
               /* ignore frame errors */
            }
         );
      } catch (err) {
         setIsScanning(false);
         // Only show error if we are genuinely in camera mode
         if (mode === "camera")
            setError("Failed to start camera. Please check permissions.");
      }
   };

   const stopCamera = async () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
         try {
            await scannerRef.current.stop();
         } catch (err) {
            console.error(err);
         }
      }
      setIsScanning(false);
   };

   const handleFlipCamera = () => {
      if (cameras.length < 2) return;
      const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setActiveCameraId(cameras[nextIndex].id);
   };

   const toggleScan = () => {
      if (isScanning) {
         stopCamera();
      } else {
         setScanResult(null);
         setError(""); // Clear error on manual retry
         if (activeCameraId) startCamera(activeCameraId);
      }
   };

   const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Reset State
      setUploadedFile(file);
      setError("");
      setScanResult(null);

      // Create a temporary instance just for this scan
      const html5QrCode = new Html5Qrcode("reader-hidden");

      try {
         // Attempt EXIF correction (only if needed)
         let processedFile = file;
         try {
            const orientedFile = await correctImageOrientation(file);
            if (orientedFile) {
               processedFile = orientedFile;
            }
         } catch (exifErr) {
            console.warn(
               "EXIF correction failed, using original file:",
               exifErr
            );
            // Fall back to original file
         }

         // Try scanning the processed file
         const result = await html5QrCode.scanFile(processedFile, true);
         setScanResult(result);
      } catch (err) {
         console.log("Scan with processed file failed:", err);
         try {
            // Fallback: Try scanning the original file without compression
            const result = await html5QrCode.scanFile(file, true);
            setScanResult(result);
         } catch (secondErr) {
            console.log("Fallback scan failed:", secondErr);
            setError(
               "QR code not found. Please try a clearer image, ensure good lighting, or check if the image is rotated."
            );
            setScanResult(null);
         }
      } finally {
         // CRITICAL: Always clear the instance after file scan
         html5QrCode.clear();
      }
   };

   // Updated correctImageOrientation with better handling
   const correctImageOrientation = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
               try {
                  EXIF.getData(img, () => {
                     const orientation = EXIF.getTag(img, "Orientation");
                     console.log("EXIF Orientation:", orientation); // Debug log

                     // If no orientation or it's 1 (normal), resolve with null to skip correction
                     if (!orientation || orientation === 1) {
                        resolve(null); // Skip correction
                        return;
                     }

                     const canvas = document.createElement("canvas");
                     const ctx = canvas.getContext("2d");

                     // Set canvas size based on orientation
                     if (orientation === 6 || orientation === 8) {
                        canvas.width = img.height;
                        canvas.height = img.width;
                     } else {
                        canvas.width = img.width;
                        canvas.height = img.height;
                     }

                     // Apply transformation
                     switch (orientation) {
                        case 2:
                           ctx.transform(-1, 0, 0, 1, canvas.width, 0);
                           break;
                        case 3:
                           ctx.transform(
                              -1,
                              0,
                              0,
                              -1,
                              canvas.width,
                              canvas.height
                           );
                           break;
                        case 4:
                           ctx.transform(1, 0, 0, -1, 0, canvas.height);
                           break;
                        case 5:
                           ctx.transform(0, 1, 1, 0, 0, 0);
                           break;
                        case 6:
                           ctx.transform(0, 1, -1, 0, canvas.height, 0);
                           break;
                        case 7:
                           ctx.transform(
                              0,
                              -1,
                              -1,
                              0,
                              canvas.height,
                              canvas.width
                           );
                           break;
                        case 8:
                           ctx.transform(0, -1, 1, 0, 0, canvas.width);
                           break;
                        default:
                           break; // Should not reach here
                     }

                     ctx.drawImage(img, 0, 0);
                     canvas.toBlob(
                        (blob) => {
                           if (blob) {
                              resolve(blob);
                           } else {
                              reject(new Error("Canvas toBlob failed"));
                           }
                        },
                        file.type,
                        1.0
                     );
                  });
               } catch (err) {
                  reject(err);
               }
            };
            img.src = e.target.result;
         };
         reader.onerror = reject;
         reader.readAsDataURL(file);
      });
   };

   const removeUploadedFile = () => {
      setUploadedFile(null);
      setScanResult(null);
      setError("");
      // Reset the input value so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
   };

   const handleCopy = async () => {
      if (scanResult) {
         await navigator.clipboard.writeText(scanResult);
         setIsCopied(true);
         setTimeout(() => setIsCopied(false), 2000);
      }
   };

   const isUrl = (string) => {
      try {
         return Boolean(new URL(string));
      } catch {
         return false;
      }
   };

   return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
         {/* HEADER */}
         <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-inner">
               <QrCode size={32} />
            </div>
            <div>
               <h1 className="text-2xl font-semibold text-gray-800">
                  QR Scanner
               </h1>
               <p className="text-sm text-gray-500">
                  Scan via camera or upload file.
               </p>
            </div>
         </div>

         {/* MODE TOGGLE */}
         <div className="w-full flex items-center bg-gray-100 rounded-full p-1 shadow-sm mb-6">
            <button
               onClick={() => {
                  setMode("camera");
                  setScanResult(null);
                  setError("");
                  setUploadedFile(null);
               }}
               className={`w-1/2 py-2 flex items-center justify-center gap-2 rounded-full transition text-sm font-medium
            ${
               mode === "camera"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-500 hover:bg-gray-200"
            }`}>
               <Camera size={16} /> Camera
            </button>
            <button
               onClick={() => {
                  setMode("upload");
                  stopCamera();
                  setScanResult(null);
                  setError("");
               }}
               className={`w-1/2 py-2 flex items-center justify-center gap-2 rounded-full transition text-sm font-medium
            ${
               mode === "upload"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-500 hover:bg-gray-200"
            }`}>
               <Upload size={16} /> Upload
            </button>
         </div>

         {/* --- PREVIEW AREA --- */}
         <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-inner aspect-square max-h-[400px]">
            {/* CAMERA VIEW LAYER */}
            {mode === "camera" && (
               <>
                  <div id="reader" className="w-full h-full object-cover"></div>
                  {isScanning && !scanResult && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-64 h-64 border-2 border-blue-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                           <div className="absolute w-full h-1 bg-blue-500/50 shadow-[0_0_10px_#3b82f6] animate-[scan_2s_infinite]"></div>
                        </div>
                     </div>
                  )}
               </>
            )}

            {/* UPLOAD VIEW LAYER */}
            {mode === "upload" && (
               <div className="w-full h-full bg-gray-50 relative">
                  {!uploadedFile ? (
                     <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition p-4 border-2 border-dashed border-gray-300 rounded-xl m-2 box-border h-[calc(100%-16px)] w-[calc(100%-16px)]">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                           <Upload size={28} className="text-blue-500" />
                        </div>
                        <span className="text-gray-600 text-sm font-medium">
                           Click to Upload Image
                        </span>
                        <input
                           ref={fileInputRef}
                           type="file"
                           accept="image/*"
                           className="hidden"
                           onChange={handleFileUpload}
                        />
                     </label>
                  ) : (
                     <div className="w-full h-full flex items-center justify-center relative bg-black">
                        <img
                           src={URL.createObjectURL(uploadedFile)}
                           alt="Upload"
                           className="max-h-full max-w-full object-contain"
                        />
                        {/* Remove Image Button */}
                        <button
                           onClick={removeUploadedFile}
                           className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                           title="Remove image">
                           <X size={20} />
                        </button>
                     </div>
                  )}
               </div>
            )}

            {/* LOADING/OFF STATE (Camera) */}
            {mode === "camera" && !isScanning && !scanResult && (
               <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white/50 z-0">
                  <div className="flex flex-col items-center gap-3">
                     <Ban size={40} />
                     <span>Camera is off</span>
                  </div>
               </div>
            )}
         </div>

         {/* ERROR MESSAGE (Dismissible) */}
         {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start justify-between border border-red-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
               </div>
               <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-700">
                  <X size={16} />
               </button>
            </div>
         )}

         {/* --- CAMERA CONTROLS --- */}
         {mode === "camera" && !scanResult && (
            <div className="flex items-center justify-center gap-4 mt-4">
               <button
                  onClick={handleFlipCamera}
                  disabled={cameras.length <= 1}
                  className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 transition">
                  <SwitchCamera size={20} />
               </button>

               <button
                  onClick={toggleScan}
                  className={`p-4 rounded-full shadow-lg transition transform active:scale-95 flex items-center justify-center
                    ${
                       isScanning
                          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}>
                  {isScanning ? (
                     <Ban size={24} />
                  ) : (
                     <Play size={24} fill="currentColor" />
                  )}
               </button>
               <div className="w-[44px]"></div>
            </div>
         )}

         {/* --- UPLOAD CONTROLS --- */}
         {mode === "upload" && uploadedFile && !scanResult && (
            <div className="flex justify-center mt-4">
               <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                  <ImagePlus size={16} /> Select different image
               </button>
            </div>
         )}

         {/* --- RESULTS AREA --- */}
         <div className="mt-6">
            {/* Hidden div required for library logic */}
            <div id="reader-hidden" className="hidden"></div>

            {scanResult && (
               <div className="bg-white border rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-start justify-between mb-2">
                     <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 size={20} />
                        <span>Code Detected</span>
                     </div>
                     <button
                        onClick={() => {
                           setScanResult(null);
                           setError("");
                           if (mode === "camera") startCamera(activeCameraId);
                           // If upload mode, we just clear result, keeping the file there
                        }}
                        className="text-gray-400 hover:text-blue-600 transition">
                        <RefreshCcw size={18} />
                     </button>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border break-all font-mono text-sm text-gray-700 mb-4">
                     {scanResult}
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition text-sm font-medium">
                        {isCopied ? (
                           <CheckCircle2 size={16} />
                        ) : (
                           <Copy size={16} />
                        )}
                        {isCopied ? "Copied" : "Copy"}
                     </button>
                     {isUrl(scanResult) && (
                        <a
                           href={scanResult}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium">
                           <ExternalLink size={16} /> Open
                        </a>
                     )}
                  </div>
               </div>
            )}
         </div>

         <style jsx global>{`
            @keyframes scan {
               0% {
                  top: 0;
                  opacity: 0;
               }
               10% {
                  opacity: 1;
               }
               90% {
                  opacity: 1;
               }
               100% {
                  top: 100%;
                  opacity: 0;
               }
            }
         `}</style>
      </div>
   );
}
