import { useRef, useState, useCallback, useMemo } from "react";
import { FileImage, Upload, X, ArrowDownCircle, Loader2 } from "lucide-react";

/**
 * Helper function to format bytes into readable strings (KB, MB).
 * @param {number} bytes - The file size in bytes.
 */
function formatBytes(bytes) {
  if (bytes === undefined || bytes === null || bytes < 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Helper: create image element from dataURL
function loadImage(dataUrl) {
  // Corrected function: only one 'new' before Promise
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

// Helper: dataURL -> Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeString });
}

// Helper: canvas.toBlob wrapper supporting promise & fallback
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        type,
        quality
      );
    } else {
      // fallback using dataURL -> blob
      try {
        const dataUrl = canvas.toDataURL(type, quality);
        const b = dataURItoBlob(dataUrl);
        resolve(b);
      } catch (e) {
        resolve(null);
      }
    }
  });
}


function ImgCompress() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [originalSrc, setOriginalSrc] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);

  const [quality, setQuality] = useState(80); // 1 - 100
  const [compressedSrc, setCompressedSrc] = useState(null);
  const [compressedSize, setCompressedSize] = useState(0);

  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");

  const samplePath = "https://th.bing.com/th/id/R.31173e9f43f2193e1dae463014836323?rik=9YIoCz1YmgH%2f6A&riu=http%3a%2f%2fwww.cartoonbucket.com%2fwp-content%2fuploads%2f2015%2f03%2fImage-Of-Doraemon-With-Open-Mouth.jpg&ehk=gsbF0y9hwjhvUUjxYpophlOQlRb4AarhIP6x4kDlTz0%3d&risl=&pid=ImgRaw&r=0";

  /**
   * Cleans up compressed image resources and resets state.
   */
  const removeCompressed = useCallback(() => {
    if (compressedSrc) {
      URL.revokeObjectURL(compressedSrc);
    }
    setCompressedSrc(null);
    setCompressedSize(0);
  }, [compressedSrc]);

  /**
   * Handles file selection (from drop, click, or sample).
   * @param {File} selectedFile - The file object to process.
   */
  const handleFiles = useCallback((selectedFile) => {
    setError("");
    if (!selectedFile) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(selectedFile.type)) {
      setError("Unsupported file type. Use JPG, PNG or WebP.");
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalSrc(e.target.result);
      removeCompressed(); // reset previous compressed result
    };
    reader.readAsDataURL(selectedFile);
  }, [removeCompressed]);

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
    if (dropped) handleFiles(dropped);
  }

  /**
   * Handles file selection from the native input. Resets input value to fix
   * the 'upload twice' issue.
   * @param {Event} e - The change event from the file input.
   */
  function onSelectFile(e) {
    const f = e.target.files && e.target.files[0];
    if (f) handleFiles(f);
    
    // FIX: Reset the input value so selecting the same file triggers onChange again.
    if (e.target) {
      e.target.value = null; 
    }
  }

  // load sample image from local path (developer-specified)
  function useSampleImage() {
    setError("");
    fetch(samplePath)
      .then((r) => r.blob())
      .then((blob) => {
        const fileLike = new File([blob], "sample.png", { type: blob.type || "image/png" });
        handleFiles(fileLike);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load sample image.");
      });
  }

  function removeFile() {
    setFile(null);
    setOriginalSrc(null);
    setOriginalSize(0);
    removeCompressed();
    setError("");
  }


  // core compress function using canvas
  async function compressImage() {
    setError("");
    if (!originalSrc || !file) {
      setError("Please upload an image first.");
      return;
    }

    setIsCompressing(true);
    removeCompressed();

    try {
      await new Promise((resolve) => setTimeout(resolve, 50)); // small wait so UI updates

      const img = await loadImage(originalSrc);

      let outType = "image/jpeg";
      if (file.type === "image/webp") {
        outType = "image/webp";
      }

      const MAX_DIM = 2500;
      let targetW = img.width;
      let targetH = img.height;
      if (Math.max(img.width, img.height) > MAX_DIM) {
        const ratio = MAX_DIM / Math.max(img.width, img.height);
        targetW = Math.round(img.width * ratio);
        targetH = Math.round(img.height * ratio);
      }

      // Create canvas and draw
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const q = Math.max(0.01, Math.min(1, quality / 100));

      let finalBlob = await canvasToBlob(canvas, outType, q);

      if (!finalBlob || finalBlob.size === 0) {
        const fallback = await canvasToBlob(canvas, "image/jpeg", q);
        finalBlob = fallback;
      }

      if (!finalBlob || finalBlob.size === 0) {
        throw new Error("Compression failed. Browser might not support Canvas.toBlob.");
      }

      const compressedUrl = URL.createObjectURL(finalBlob);
      setCompressedSrc(compressedUrl);
      setCompressedSize(finalBlob.size);
    } catch (err) {
      console.error(err);
      setError("Compression failed: " + (err.message || "An unknown error occurred."));
    } finally {
      setIsCompressing(false);
    }
  }

  function downloadCompressed() {
    if (!compressedSrc || !file) return;
    const a = document.createElement("a");
    a.href = compressedSrc;
    
    // Use the compressed image's MIME type to determine the extension
    const mimeType = file.type || 'image/jpeg';
    let finalExt = 'jpg';
    if (compressedSrc.includes('webp') || mimeType.includes('webp')) {
        finalExt = 'webp';
    } else if (compressedSrc.includes('png') || mimeType.includes('png')) {
        finalExt = 'png';
    }
    
    a.download = `compressed_${Date.now()}.${finalExt}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const savedPercent = useMemo(() => {
    if (!originalSize || !compressedSize) return null;
    const percent = ((1 - compressedSize / originalSize) * 100);
    return percent >= 0 ? percent.toFixed(1) : '0.0';
  }, [originalSize, compressedSize]);


  return (
    <div className="min-h-screen bg-gray-50 p-0 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-4 md:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 border-b pb-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shadow-inner">
            <FileImage size={36} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Image Compressor</h1>
            <p className="text-sm text-gray-500">Fast, client-side compression using HTML Canvas.</p>
          </div>
        </div>

        {/* Upload area - Enhanced responsiveness */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          className="relative border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:border-indigo-500 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center"
        >
          {/* Input covers the entire area for reliable clicks/touch on any screen size. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onSelectFile}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10" 
            aria-label="Upload image file"
          />

          <Upload className="w-10 h-10 text-indigo-400 mb-3" />

          <div className="text-gray-700 font-medium text-lg z-20 pointer-events-none">Click or **Drag & Drop** to upload</div>
          <div className="text-sm text-gray-500 mt-1 z-20 pointer-events-none">JPG, PNG, WebP supported</div>

          {/* Buttons need higher z-index to be clickable */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 z-20 w-full sm:w-auto"> 
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors w-full sm:w-auto"
            >
              Choose File
            </button>

            <button
              type="button"
              onClick={useSampleImage}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
              Use Sample
            </button>

            {originalSrc && (
              <button
                type="button"
                onClick={removeFile}
                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1 w-full sm:w-auto"
              >
                <X size={18} /> Remove
              </button>
            )}
          </div>
        </div>

        {/* Controls and Stats Grid */}
        <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-sm font-medium text-gray-700">Output Quality: <span className="font-bold text-indigo-600">{quality}%</span></label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-600"
                  disabled={!originalSrc || isCompressing}
                />
                <p className="text-xs text-gray-500">Note: Lower quality leads to smaller files, but more noticeable artifacts.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={compressImage}
                disabled={!originalSrc || isCompressing}
                className={`px-6 py-3 rounded-xl text-white font-semibold transition-colors shadow-lg ${
                  originalSrc && !isCompressing ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } flex items-center justify-center gap-2`}
              >
                {isCompressing ? <><Loader2 size={20} className="animate-spin" /> Compressing...</> : 'Run Compression'}
              </button>

              <button
                onClick={removeCompressed}
                disabled={!compressedSrc || isCompressing}
                className={`px-6 py-3 rounded-xl border transition-colors font-medium ${
                  compressedSrc ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "opacity-40 text-gray-500 cursor-not-allowed"
                }`}
              >
                Clear Result
              </button>
            </div>

            {error && <div className="text-sm text-red-500 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          </div>

          {/* Stats Column */}
          <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-xl text-center shadow-lg">
            <h3 className="text-lg font-bold text-indigo-700 mb-4">Compression Summary</h3>
            
            <div className="grid grid-rows-2 gap-4 text-sm mb-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-600">Original Size</div>
                    <div className="font-extrabold text-base text-gray-900">{originalSrc ? formatBytes(originalSize) : "-"}</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-600">Compressed Size</div>
                    <div className="font-extrabold text-base text-green-700">{compressedSrc ? formatBytes(compressedSize) : "-"}</div>
                </div>
            </div>
            
            <div className="p-3 rounded-lg bg-indigo-200">
                <div className="text-lg font-bold text-indigo-800">Space Saved</div>
                <div className="text-3xl font-extrabold text-green-700 mt-1">
                    {savedPercent ? `${savedPercent}%` : "-"}
                </div>
            </div>

            <button
              onClick={downloadCompressed}
              disabled={!compressedSrc}
              className={`mt-6 px-4 py-3 rounded-xl w-full font-semibold transition-colors shadow-lg flex items-center justify-center gap-2 text-lg ${
                compressedSrc ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ArrowDownCircle size={24} /> Download
            </button>
          </div>
        </div>

        {/* Previews Grid - Responsive Stacked/Side-by-Side */}
        <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Original Preview */}
          <div className="space-y-3">
            <div className="text-lg font-semibold text-gray-700">Original Image</div>
            <div className="h-64 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden shadow-inner">
              {originalSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={originalSrc} alt="original" className="object-contain w-full h-full" />
              ) : (
                <div className="text-gray-400">Upload an image to see the original preview.</div>
              )}
            </div>
            <div className="text-xs text-gray-500 break-all">{originalSrc ? file.name : ""}</div>
          </div>

          {/* Compressed Preview */}
          <div className="space-y-3">
            <div className="text-lg font-semibold text-gray-700">Compressed Image</div>
            <div className="h-64 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden shadow-inner">
              {compressedSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={compressedSrc} alt="compressed" className="object-contain w-full h-full" />
              ) : (
                <div className="text-gray-400 p-4 text-center">
                  {isCompressing 
                    ? <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" /> 
                    : "Run compression to see the result here."}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
                {compressedSrc 
                    ? `Compressed size: ${formatBytes(compressedSize)}. Output Type: ${compressedSrc.includes('.webp') ? 'WebP' : 'JPEG'}` 
                    : "Compression details will appear here."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImgCompress;