import { QrCode, FileImage, Palette, LockKeyhole, ScanQrCode } from "lucide-react";

// Tool data
export const tools = [
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description: "Create custom QR Codes in various formats.",
    icon: QrCode,
    category: "Generation",
    dateAdded: "2025-11-19",
    isNew: false,
    isTrending: true,
    tags: ["qrcode", "generator", "custom", "qr", "code"],
    slug: "qr-code-generator",
    link: "/tools/qr-code-generator",
    componentName: "QrCodeGenerator",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Reduce image file sizes without losing quality.",
    icon: FileImage,
    category: "Processing",
    dateAdded: "2025-11-15",
    isNew: false,
    isTrending: true,
    tags: ["image", "compressor", "optimization"],
    slug: "image-compressor",
    link: "/tools/image-compressor",
    componentName: "ImageCompressor",
  },
  {
    id: "Password-Generator",
    name: "Password Generator",
    description: "Generate strong and secure passwords.",
    icon: LockKeyhole,
    category: "Generation",
    dateAdded: "2025-11-10",
    isNew: false,
    isTrending: true,
    tags: ["password", "security", "generator"],
    slug: "password-generator",
    link: "/tools/password-generator",
    componentName: "PasswordGenerator",
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Select and identify colors from images or palettes.",
    icon: Palette,
    category: "Utilities",
    dateAdded: "2025-11-05",
    isNew: false,
    isTrending: true,
    tags: ["color", "picker", "design"],
    slug: "color-picker",
    link: "/tools/color-picker",
    componentName: "ColorPicker",
  },
  {
    id: "qr-code-scanner",
    name: "QR Code Scanner",
    description: "Scan and decode QR Codes from images or camera.",
    icon: ScanQrCode,
    category: "Scanning",
    dateAdded: "2025-11-29",
    isNew: false,
    isTrending: true,
    tags: ["scan", "decode", "qr", "code", "scanner"],
    slug: "qr-code-scanner",
    link: "/tools/qr-code-scanner",
    componentName: "QrCodeScanner",
  }
];

function markNewTools(tools) {
  // Sort latest → oldest by dateAdded
  const sorted = [...tools].sort(
    (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
  );

  // Top 5 are new
  const recentFive = new Set(sorted.slice(0, 5).map((t) => t.id));

  // Assign isNew = true/false
  tools.forEach((tool) => {
    tool.isNew = recentFive.has(tool.id);
  });
}

// Run the function once
markNewTools(tools);

// Categories
export const categories = [
  "Generation",
  "Scanning",
  "Conversion",
  "Processing",
  "Analysis",
  "Utilities",
  "Calculation",
];

export const toolsCount = tools.length;

// Filtered tool lists
export const trendingTools = tools.filter((tool) => tool.isTrending);
export const newTools = tools.filter((tool) => tool.isNew);


// Unique tags
export const allTags = Array.from(
  new Set(tools.flatMap((tool) => tool.tags || []))
);

// Tools grouped by category
export const toolsByCategory = categories.reduce((acc, category) => {
  acc[category] = tools.filter((tool) => tool.category === category);
  return acc;
}, {});
