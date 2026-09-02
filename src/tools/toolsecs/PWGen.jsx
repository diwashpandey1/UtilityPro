import {useState, useMemo, useCallback} from "react";
import {Lock, Recycle, Clipboard, Check, Eye, Zap} from "lucide-react";

// --- Character Sets ---
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>/?~";

// Characters easily confused (l, 1, I, O, 0, |)
const AMBIGUOUS = "l1Io0|";

/**
 * Generates a secure random integer in [0, max) using the Crypto API.
 */
const randInt = (max) => {
   try {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] % max;
   } catch {
      return Math.floor(Math.random() * max);
   }
};

// --- Password Strength Calculation ---

/**
 * Calculates a simple complexity score (0-4) for the password.
 */
function getPasswordStrength(pw) {
   if (!pw || pw.length === 0)
      return {label: "None", score: 0, color: "bg-gray-300", width: 0};

   let score = 0;
   if (pw.length >= 8) score += 1;
   if (pw.length >= 12) score += 1;

   const hasLower = /[a-z]/.test(pw);
   const hasUpper = /[A-Z]/.test(pw);
   const hasNum = /\d/.test(pw);
   const hasSym = /[!@#$%^&*()_\-+\[\]{}|;:,.<>/?~]/.test(pw);

   const variety = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;
   score += Math.min(2, variety);

   let label, color;
   let width = (score / 4) * 100;

   if (score <= 1) {
      label = "Very Weak";
      color = "bg-red-500";
   } else if (score === 2) {
      label = "Weak";
      color = "bg-orange-500";
   } else if (score === 3) {
      label = "Good";
      color = "bg-yellow-500";
   } else {
      label = "Excellent";
      color = "bg-green-500";
      width = 100;
   }

   return {label, score, color, width};
}

// --- Main Component ---

function PWGen() {
   const [length, setLength] = useState(16);
   const [useUpper, setUseUpper] = useState(true);
   const [useLower, setUseLower] = useState(true);
   const [useNumbers, setUseNumbers] = useState(true);
   const [useSymbols, setUseSymbols] = useState(true);
   const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

   const [customWord, setCustomWord] = useState("");
   const [generated, setGenerated] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [copied, setCopied] = useState(false);

   // State for the password checker section
   const [checkPassword, setCheckPassword] = useState("");
   const [showCheckPassword, setShowCheckPassword] = useState(false);

   // 1. Build character set
   const charset = useMemo(() => {
      let set = "";
      if (useLower) set += LOWER;
      if (useUpper) set += UPPER;
      if (useNumbers) set += NUMBERS;
      if (useSymbols) set += SYMBOLS;

      if (excludeAmbiguous) {
         set = set
            .split("")
            .filter((char) => !AMBIGUOUS.includes(char))
            .join("");
      }
      return set;
   }, [useLower, useUpper, useNumbers, useSymbols, excludeAmbiguous]);

   // 2. Determine required character sets (for mandatory inclusion)
   const requiredSets = useMemo(() => {
      const sets = [];
      if (useLower) sets.push({chars: LOWER, name: "lower"});
      if (useUpper) sets.push({chars: UPPER, name: "upper"});
      if (useNumbers) sets.push({chars: NUMBERS, name: "numbers"});
      if (useSymbols) sets.push({chars: SYMBOLS, name: "symbols"});

      // Filter out required chars that were excluded due to ambiguity settings
      return sets
         .map((set) => ({
            ...set,
            chars: set.chars
               .split("")
               .filter((char) => charset.includes(char))
               .join(""),
         }))
         .filter((set) => set.chars.length > 0);
   }, [charset, useLower, useUpper, useNumbers, useSymbols]);

   const atLeastOneSelected = useMemo(
      () => requiredSets.length > 0 || customWord.trim().length > 0,
      [requiredSets, customWord]
   );

   // 3. Ensure required character variety is met
   const ensureRequiredChars = useCallback(
      (parts) => {
         const required = requiredSets.map(
            (set) => set.chars[randInt(set.chars.length)]
         );

         // Distribute required characters randomly within the generated parts
         for (let i = 0; i < required.length && i < parts.length; i++) {
            const swapIndex = randInt(parts.length);
            parts[swapIndex] = required[i];
         }
         return parts;
      },
      [requiredSets]
   );

   // 4. Core generation logic
   const generatePassword = useCallback(() => {
      if (!atLeastOneSelected) {
         setGenerated("");
         setShowPassword(false);
         return;
      }

      const cw = customWord.trim();
      let password = "";

      const randomSlots = Math.max(0, length - cw.length);

      let resultParts = new Array(randomSlots);

      if (charset.length > 0) {
         for (let i = 0; i < randomSlots; i++) {
            resultParts[i] = charset[randInt(charset.length)];
         }

         if (randomSlots >= requiredSets.length) {
            resultParts = ensureRequiredChars(resultParts);
         }

         password = resultParts.join("");
      }

      // Combine with custom word
      if (cw) {
         if (password.length === 0) {
            password = cw;
         } else {
            const insertPos = randInt(password.length + 1);
            password =
               password.slice(0, insertPos) + cw + password.slice(insertPos);
         }
      }

      // Final safety checks: Truncate or Pad
      if (password.length > length) {
         password = password.slice(0, length);
      } else if (password.length < length && charset.length > 0) {
         while (password.length < length) {
            password += charset[randInt(charset.length)];
         }
      }
      if (password.length > length) {
         password = password.slice(0, length);
      }

      setGenerated(password);
      setShowPassword(true);
      setCopied(false);
   }, [
      atLeastOneSelected,
      customWord,
      length,
      charset,
      requiredSets.length,
      ensureRequiredChars,
   ]);

   const copyToClipboard = async () => {
      if (!generated) return;
      try {
         await navigator.clipboard.writeText(generated);
         setCopied(true);
         setTimeout(() => setCopied(false), 1800);
      } catch (e) {
         // Fallback
         const el = document.createElement("textarea");
         el.value = generated;
         el.setAttribute("readonly", "");
         el.style.position = "absolute";
         el.style.left = "-9999px";
         document.body.appendChild(el);
         el.select();
         document.execCommand("copy");
         document.body.removeChild(el);
         setCopied(true);
         setTimeout(() => setCopied(false), 1800);
      }
   };

   const strength = getPasswordStrength(generated);
   const checkStrength = getPasswordStrength(checkPassword);

   // Logic to prevent unchecking the last character set
   const handleCheckboxChange = (setter, value) => {
      const currentCount = [useLower, useUpper, useNumbers, useSymbols].filter(
         Boolean
      ).length;
      if (!value && currentCount === 1) {
         if (customWord.trim().length === 0) return;
      }
      setter(value);
   };

   return (
      <div className="min-h-screen bg-gray-50 p-1 md:p-4">
         <div className="max-w-xl mx-auto p-2 md:p-8 bg-white rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-start gap-3 mb-8 pb-4 border-b border-gray-200">
               <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 flex-shrink-0">
                  <Lock size={30} />
               </div>
               <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                     Advanced Password Generator
                  </h1>
                  <p className="text-sm text-gray-500">
                     Create and test highly secure passwords on the fly.
                  </p>
               </div>
            </div>
             {/* --- Password Checker Section --- */}
            <div className="mt-8 pt-6 border-t border-gray-100 mb-5">
               <div className="flex items-center gap-3 mb-4">
                  <Zap size={24} className="text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                     Check Your Password Strength
                  </h2>
               </div>

               <div className="mb-4">
                  <label
                     htmlFor="password-checker"
                     className="text-sm font-medium text-gray-700 block mb-1">
                     Enter your password to check:
                  </label>
                  <div className="flex items-stretch gap-2">
                     <input
                        id="password-checker"
                        type={showCheckPassword ? "text" : "password"}
                        value={checkPassword}
                        onChange={(e) => setCheckPassword(e.target.value)}
                        placeholder="Type a password here"
                        className="flex-1 px-3 py-3 text-base font-mono rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-500 transition"
                     />
                     <button
                        onClick={() => setShowCheckPassword(!showCheckPassword)}
                        className="px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition shrink-0"
                        title={
                           showCheckPassword ? "Hide Password" : "Show Password"
                        }>
                        <Eye size={20} />
                     </button>
                  </div>
               </div>

               {/* Checker Strength Indicator */}
               {checkPassword.length > 0 && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                     <span className="text-base font-semibold text-gray-700">
                        Strength:
                     </span>
                     <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                           className={`${checkStrength.color} h-2 rounded-full transition-all duration-500 ease-out`}
                           style={{
                              width: `${checkStrength.width}%`,
                              minWidth: "4px",
                           }}></div>
                     </div>
                     <span
                        className={`text-base font-bold w-24 text-right ${checkStrength.color.replace(
                           "bg",
                           "text"
                        )}`}>
                        {checkStrength.label}
                     </span>
                  </div>
               )}
            </div>

         
            {/* --- Generation Controls --- */}
            <div className="space-y-6 mt-8 pt-6 border-t border-gray-200">
               <h2 className="text-xl font-bold text-gray-800">
                  Generation Settings
               </h2>

               {/* 1. Length Slider */}
               <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                     <label className="text-base font-medium text-gray-700">
                        Password Length:
                     </label>
                     <span className="text-xl font-bold text-indigo-600 w-10 text-right">
                        {length}
                     </span>
                  </div>
                  <input
                     type="range"
                     min="4"
                     max="64"
                     value={length}
                     onChange={(e) => setLength(Number(e.target.value))}
                     className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>

               {/* 2. Character Options (Grid) */}
               <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-base font-medium text-gray-700 mb-3 border-b pb-2">
                     Character Inclusion
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <label className="flex items-center gap-2 sm:gap-3">
                        <input
                           type="checkbox"
                           checked={useUpper}
                           onChange={(e) =>
                              handleCheckboxChange(
                                 setUseUpper,
                                 e.target.checked
                              )
                           }
                           className="form-checkbox text-indigo-600 h-4 w-4 rounded"
                        />
                        <span className="text-sm">Uppercase</span>
                     </label>

                     <label className="flex items-center gap-2 sm:gap-3">
                        <input
                           type="checkbox"
                           checked={useLower}
                           onChange={(e) =>
                              handleCheckboxChange(
                                 setUseLower,
                                 e.target.checked
                              )
                           }
                           className="form-checkbox text-indigo-600 h-4 w-4 rounded"
                        />
                        <span className="text-sm">Lowercase</span>
                     </label>

                     <label className="flex items-center gap-2 sm:gap-3">
                        <input
                           type="checkbox"
                           checked={useNumbers}
                           onChange={(e) =>
                              handleCheckboxChange(
                                 setUseNumbers,
                                 e.target.checked
                              )
                           }
                           className="form-checkbox text-indigo-600 h-4 w-4 rounded"
                        />
                        <span className="text-sm">Numbers</span>
                     </label>

                     <label className="flex items-center gap-2 sm:gap-3">
                        <input
                           type="checkbox"
                           checked={useSymbols}
                           onChange={(e) =>
                              handleCheckboxChange(
                                 setUseSymbols,
                                 e.target.checked
                              )
                           }
                           className="form-checkbox text-indigo-600 h-4 w-4 rounded"
                        />
                        <span className="text-sm">Symbols</span>
                     </label>

                     <label className="flex items-center gap-2 sm:gap-3 col-span-2 text-red-600">
                        <input
                           type="checkbox"
                           checked={excludeAmbiguous}
                           onChange={(e) =>
                              setExcludeAmbiguous(e.target.checked)
                           }
                           className="form-checkbox text-red-500 h-4 w-4 rounded"
                        />
                        <span className="text-sm">
                           Exclude Ambiguous (l, 1, I, O, 0)
                        </span>
                     </label>
                  </div>
               </div>

               {/* 3. Custom Word */}
               <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <label className="text-base font-medium text-gray-700">
                     Custom Phrase (optional)
                  </label>
                  <input
                     type="text"
                     value={customWord}
                     onChange={(e) => setCustomWord(e.target.value)}
                     placeholder="e.g. MyFavoritePet or a short memorable phrase"
                     className="w-full mt-2 px-3 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                     This will be securely embedded at a random position.
                  </p>
               </div>
                  {/* Generated Password Result */}
            <div className="mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="text-base font-semibold text-gray-700 mb-2">
                  Generated Password:
               </h3>

               <div className="flex flex-col md:flex-row items-stretch gap-2">
                  {/* Output Field */}
                  <input
                     type={showPassword ? "text" : "password"}
                     readOnly
                     value={generated}
                     placeholder="Click GENERATE to start"
                     className={`flex-1 px-3 py-3 text-base sm:text-lg font-mono rounded-lg border focus:outline-none ${
                        generated
                           ? "bg-white text-gray-800 border-indigo-300"
                           : "bg-gray-100 text-gray-400 border-gray-200"
                     }`}
                  />
                  <div className="flex items-center gap-2">
                     {/* Show/Hide Toggle */}
                     <button
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={!generated}
                        className="px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                        title={
                           showPassword ? "Hide Password" : "Show Password"
                        }>
                        <Eye size={20} />
                     </button>

                     {/* Copy Button */}
                     <button
                        onClick={copyToClipboard}
                        disabled={!generated}
                        className={`px-3 py-3 rounded-lg transition-colors font-medium text-white shadow-md shrink-0 ${
                           copied
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-indigo-600 hover:bg-indigo-700"
                        } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        title="Copy to clipboard">
                        {copied ? <Check size={20} /> : <Clipboard size={20} />}
                     </button>
                  </div>
               </div>

               {/* Strength Indicator */}
               <div className="mt-3 flex items-center gap-3">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                     <div
                        className={`${strength.color} h-2 rounded-full transition-all duration-500 ease-out`}
                        style={{width: `${strength.width}%`}}></div>
                  </div>
                  <span
                     className={`text-sm font-semibold w-24 text-right ${strength.color.replace(
                        "bg",
                        "text"
                     )}`}>
                     {strength.label}
                  </span>
               </div>
            </div>


               {/* 4. Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                     onClick={generatePassword}
                     className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition shadow-lg ${
                        atLeastOneSelected
                           ? "bg-indigo-600 hover:bg-indigo-700"
                           : "bg-gray-400 cursor-not-allowed"
                     }`}
                     disabled={!atLeastOneSelected}>
                     <Recycle size={20} />
                     Generate New Password
                  </button>

                  <button
                     onClick={() => {
                        setGenerated("");
                        setShowPassword(false);
                     }}
                     className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition shadow-sm">
                     Clear Output
                  </button>
               </div>

               {!atLeastOneSelected && (
                  <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                     **Error:** You must select at least one character type or
                     provide a Custom Phrase.
                  </div>
               )}
            </div>
            
         </div>
      </div>
   );
}

export default PWGen;
