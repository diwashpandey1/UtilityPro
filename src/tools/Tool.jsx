import React, { Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Routes, Route } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ImageCompressor from "./ImageCompressor"
import PasswordGenerator from "./PasswordGenerator"
import ColorPicker from "./ColorPicker"
import QRCodeScanner from "./QRCodeScanner"
import QrCodeGenerator from "./QrCodeGenerator";

function Tool() {
   return (
      <section className="relative">
         <Header />
         <div className="h-30"></div>
         <div className="max-w-7xl mx-auto px-5">
            <Link
               to="/tools"
               className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
               <ArrowLeft size={20} />
               <span>Back to Tools</span>
            </Link>
         </div>

         <Routes>
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/password-generator" element={<PasswordGenerator />} />
            <Route path="/color-picker" element={<ColorPicker />} />
            <Route path="/qr-code-generator" element={<QrCodeGenerator />} />
            <Route path="/qr-code-scanner" element={<QRCodeScanner />} />
         </Routes>
         <Footer />
      </section>
   );
}

export default Tool;
