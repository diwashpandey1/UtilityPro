import React, { useContext, useState, useRef, useEffect } from "react";
import {
   User,
   Mail,
   Phone,
   Calendar,
   Clock,
   LogOut,
   Trash2,
   Edit3,
   Lock,
   ShieldCheck,
   Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Popup from "../helper/Popup";
import ConfirmLogin from "../helper/ConfirmLogin";
import { toast } from "react-toastify";

// Firebase & ImageKit
import { fireDb } from "../backend/Firebase";
import { deleteImageKitFile, uploadProfilePictureToImageKit } from "../backend/ImageKit";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile as updateAuthProfile } from "firebase/auth";

const Profile = () => {
   const { user, logout, deleteAccount } = useContext(AuthContext);
   const navigate = useNavigate();

   // 🔹 Firestore profile data
   const [profile, setProfile] = useState(null);
   const [profileLoading, setProfileLoading] = useState(true);

   // 🔹 Form state for editing
   const [editMode, setEditMode] = useState(false);
   const [savingProfile, setSavingProfile] = useState(false);
   const [form, setForm] = useState({
      displayName: "",
      dob: "",
      phoneNumber: "",
   });

   // 🔹 Profile picture state
   const [photoURL, setPhotoURL] = useState(
      user?.photoURL || "https://www.pngmart.com/files/23/Profile-PNG-Photo.png"
   );
   const [uploading, setUploading] = useState(false);
   const fileInputRef = useRef(null);

   // Popup state
   const [modal, setModal] = useState({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
      action: null,
   });

   const [showConfirmReAuth, setShowConfirmReAuth] = useState(false);

   // ⏳ If auth not ready
   if (!user) {
      return (
         <div className="min-h-screen flex items-center justify-center text-gray-500">
            Loading Profile...
         </div>
      );
   }

   const uid = user.uid;

   // 🔄 Load Firestore user profile on mount
   useEffect(() => {
      const fetchProfile = async () => {
         try {
            const ref = doc(fireDb, "user", uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
               const data = snap.data();
               setProfile(data);

               setForm({
                  displayName: data.displayName || user.displayName || "",
                  dob: data.dob || "",
                  phoneNumber: data.phoneNumber || "",
               });

               const storedProfilePictureUrl =
                  data.profilePicture?.url || data.photoURL || user.photoURL;

               if (storedProfilePictureUrl) {
                  setPhotoURL(storedProfilePictureUrl);
               }
            } else {
               // If doc doesn't exist, create a basic one
               const base = {
                  uid,
                  email: user.email || "",
                  displayName: user.displayName || "",
                  dob: "",
                  phoneNumber: "",
                  photoURL: user.photoURL || "",
                  profilePicture: user.photoURL
                     ? { url: user.photoURL, fileId: "", filePath: "" }
                     : null,
                  fileId: "",
                  filePath: "",
                  providerId: user.providerData?.[0]?.providerId || "password",
                  createdAt: new Date().toISOString(),
               };

               await setDoc(ref, base, { merge: true });
               setProfile(base);
               setForm({
                  displayName: base.displayName,
                  dob: "",
                  phoneNumber: "",
               });
               if (base.photoURL) setPhotoURL(base.photoURL);
            }
         } catch (err) {
            console.error("Error fetching profile:", err);
         } finally {
            setProfileLoading(false);
         }
      };

      fetchProfile();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [uid]);

   // Helpers

   const calculateAge = (dobString) => {
      if (!dobString) return "N/A";
      const birthDate = new Date(dobString);
      const difference = Date.now() - birthDate.getTime();
      const ageDate = new Date(difference);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
   };

   const calculateDaysJoined = (dateString) => {
      if (!dateString) return 0;
      const joinDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today - joinDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
   };

   const formatDate = (dateString) => {
      if (!dateString) return "Not set";
      return new Date(dateString).toLocaleDateString("en-US", {
         year: "numeric",
         month: "long",
         day: "numeric",
      });
   };

   const isPasswordProvider = user.providerData?.some(
      (p) => p.providerId === "password"
   );

   // 🖼 Avatar upload

   const handleAvatarClick = () => {
      if (fileInputRef.current) fileInputRef.current.click();
   };
   const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
         toast.error("Please select a valid image file.");
         e.target.value = "";
         return;
      }

      let uploadedFile = null;
      const oldFileId = profile?.profilePicture?.fileId || profile?.fileId || null;

      try {
         setUploading(true);

         const uid = user.uid;
         uploadedFile = await uploadProfilePictureToImageKit(file, uid);

         const newPhotoURL = uploadedFile.url;
         const fileId = uploadedFile.fileId;
         const filePath = uploadedFile.filePath;
         const payload = {
            photoURL: newPhotoURL,
            profilePicture: {
               url: newPhotoURL,
               fileId,
               filePath,
            },
            fileId,
            filePath,
            updatedAt: new Date().toISOString(),
         };

         if (oldFileId && oldFileId !== fileId) {
            await deleteImageKitFile(oldFileId);
         }

         await setDoc(doc(fireDb, "user", uid), payload, { merge: true });

         try {
            await updateAuthProfile(user, { photoURL: newPhotoURL });
         } catch (updateErr) {
            console.warn(
               "⚠️ Couldn't update Firebase Auth photo:",
               updateErr?.message || updateErr
            );
         }

         setPhotoURL(newPhotoURL);
         setProfile((prev) => ({ ...(prev || {}), ...payload }));

         toast.success("New image uploaded successfully.");
      } catch (err) {
         if (uploadedFile?.fileId) {
            try {
               await deleteImageKitFile(uploadedFile.fileId);
            } catch (cleanupErr) {
               console.warn("⚠️ Failed to clean up newly uploaded ImageKit file:", cleanupErr);
            }
         }

         console.error("ImageKit upload error:", err);
         toast.error("Upload failed. Your previous image was kept.");
      } finally {
         setUploading(false);
         e.target.value = "";
      }
   };

   // ✏️ Update profile form submit

   const handleUpdateProfile = async (e) => {
      e.preventDefault();
      try {
         setSavingProfile(true);

         const payload = {
            displayName: form.displayName.trim(),
            dob: form.dob || "",
            phoneNumber: form.phoneNumber || "",
            updatedAt: new Date().toISOString(),
         };

         // 1️⃣ Save to Firestore
         await setDoc(doc(fireDb, "user", uid), payload, { merge: true });

         // 2️⃣ Update Firebase Auth displayName
         try {
            if (payload.displayName) {
               await updateAuthProfile(user, {
                  displayName: payload.displayName,
               });
            }
         } catch (authErr) {
            console.error("Error updating Firebase Auth displayName:", authErr);
         }

         // 3️⃣ Update local state so UI changes instantly
         setProfile((prev) => ({ ...(prev || {}), ...payload }));
         setEditMode(false);
      } catch (err) {
         console.error("Error updating profile:", err);
         toast.error("Failed to update profile. Please try again.");
      } finally {
         setSavingProfile(false);
      }
   };

   // Logout / delete

   const handleLogout = () => {
      setModal({
         isOpen: true,
         type: "info",
         title: "Sign Out",
         message: "Are you sure you want to sign out of your account?",
         action: async () => {
            await logout();
            navigate("/login");
         },
      });
   };

   const handleDeleteAccount = () => {
      setModal({
         isOpen: true,
         type: "danger",
         title: "Delete Account",
         message:
            "This will permanently delete your account and stored data. This cannot be undone.",
         action: async () => {
            try {
               const result = await deleteAccount();

               // 🔥 Delete success
               toast.success("Account deleted successfully 👋");
               navigate("/");
            } catch (error) {
               console.error("Error deleting account:", error);

               if (error.code === "auth/requires-recent-login") {
                  // ❗ Instead of logging them out, show your ConfirmLogin UI
                  setModal({ ...modal, isOpen: false }); // close delete popup
                  setShowConfirmReAuth(true); // <-- triggers ConfirmLogin modal component
                  toast.info("Please verify your identity to continue.");
               } else {
                  toast.error("Something went wrong. Try again later.");
               }
            }
         },
      });
   };

   const displayName =
      profile?.displayName || user.displayName || "Utility Pro User";
   const phoneNumber = profile?.phoneNumber || user.phoneNumber || "";
   const dob = profile?.dob || "";

   return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
         {/* POPUP */}
         <Popup
            isOpen={modal.isOpen}
            onClose={() => setModal({ ...modal, isOpen: false })}
            onConfirm={() => {
               modal.action && modal.action();
               setModal({ ...modal, isOpen: false });
            }}
            title={modal.title}
            message={modal.message}
            type={modal.type}
         />

         <div className="max-w-4xl mx-auto space-y-6">
            <Link
               to="/"
               className="absolute z-50 top-10 right-4 sm:right-8 text-gray-400 hover:text-gray-600 transition">
               <Home size={24} />
            </Link>

            {/* HEADER CARD */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 z-0" />

               <div className="relative z-10">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-blue-50 shadow-md overflow-hidden bg-gray-200 relative">
                     <img
                        src={photoURL}
                        alt={displayName}
                        className="w-full h-full object-cover"
                     />

                     {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs text-white">
                           Uploading...
                        </div>
                     )}
                  </div>

                  <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={handleFileChange}
                  />

                  <button
                     onClick={handleAvatarClick}
                     disabled={uploading}
                     className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-sm border-2 border-white disabled:opacity-60 disabled:cursor-not-allowed">
                     <Edit3 size={16} />
                  </button>
               </div>

               <div className="flex-1 text-center sm:text-left z-10 mt-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                     {displayName}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 mt-1">
                     <Mail size={16} />
                     <span>{user.email}</span>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                     <div className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full flex items-center gap-1 border border-green-100">
                        <ShieldCheck size={14} />
                        {user.emailVerified ? "Verified Member" : "Unverified"}
                     </div>
                     <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1 border border-blue-100">
                        <Clock size={14} />
                        Member for{" "}
                        {calculateDaysJoined(user.metadata?.creationTime)} days
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* LEFT COLUMN */}
               <div className="md:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                           Personal Information
                        </h2>
                        <button
                           onClick={() => setEditMode((prev) => !prev)}
                           className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                           {editMode ? "Cancel" : "Edit Details"}
                        </button>
                     </div>

                     {profileLoading ? (
                        <p className="text-gray-400 text-sm">
                           Loading profile...
                        </p>
                     ) : editMode ? (
                        <form
                           onSubmit={handleUpdateProfile}
                           className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                           <div className="flex flex-col gap-1">
                              <label className="text-sm text-gray-500 font-medium">
                                 Full Name
                              </label>
                              <input
                                 type="text"
                                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 value={form.displayName}
                                 onChange={(e) =>
                                    setForm((f) => ({
                                       ...f,
                                       displayName: e.target.value,
                                    }))
                                 }
                              />
                           </div>

                           <div className="flex flex-col gap-1">
                              <label className="text-sm text-gray-500 font-medium">
                                 Date of Birth
                              </label>
                              <input
                                 type="date"
                                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 value={form.dob}
                                 onChange={(e) =>
                                    setForm((f) => ({
                                       ...f,
                                       dob: e.target.value,
                                    }))
                                 }
                              />
                           </div>

                           <div className="flex flex-col gap-1">
                              <label className="text-sm text-gray-500 font-medium">
                                 Phone Number
                              </label>
                              <input
                                 type="tel"
                                 className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 value={form.phoneNumber}
                                 onChange={(e) =>
                                    setForm((f) => ({
                                       ...f,
                                       phoneNumber: e.target.value,
                                    }))
                                 }
                              />
                           </div>

                           <div className="sm:col-span-2 flex justify-end">
                              <button
                                 type="submit"
                                 disabled={savingProfile}
                                 className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                                 {savingProfile ? "Saving..." : "Save Changes"}
                              </button>
                           </div>
                        </form>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                           <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                 <Calendar size={20} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-500 font-medium">
                                    Date of Birth
                                 </p>
                                 <p className="text-gray-900 font-medium">
                                    {formatDate(dob)}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                 <User size={20} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-500 font-medium">
                                    Age
                                 </p>
                                 <p className="text-gray-900 font-medium">
                                    {calculateAge(dob)}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                 <Phone size={20} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-500 font-medium">
                                    Phone Number
                                 </p>
                                 <p className="text-gray-900 font-medium">
                                    {phoneNumber || "Not provided"}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                 <Clock size={20} />
                              </div>
                              <div>
                                 <p className="text-sm text-gray-500 font-medium">
                                    Member Since
                                 </p>
                                 <p className="text-gray-900 font-medium">
                                    {formatDate(user.metadata?.creationTime)}
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* SECURITY SECTION */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                     <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Security & Login
                     </h2>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                 <Mail size={20} />
                              </div>
                              <div>
                                 <p className="font-semibold text-gray-900">
                                    Email Address
                                 </p>
                                 <p className="text-sm text-gray-500">
                                    {user.email}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {isPasswordProvider && (
                           <button className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition group text-left">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Lock size={20} />
                                 </div>
                                 <div>
                                    <p className="font-semibold text-gray-900">
                                       Change Password
                                    </p>
                                    <p className="text-sm text-gray-500">
                                       Update your password securely
                                    </p>
                                 </div>
                              </div>
                              <span className="text-gray-400 group-hover:text-gray-600">
                                 Edit
                              </span>
                           </button>
                        )}
                     </div>
                  </div>
               </div>

               {/* RIGHT COLUMN */}
               <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                     <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Account Actions
                     </h3>
                     <div className="space-y-3">
                        <button
                           onClick={() => setEditMode(true)}
                           className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium">
                           <Edit3 size={18} />
                           Update Profile
                        </button>

                        <button
                           onClick={handleLogout}
                           className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium">
                           <LogOut size={18} />
                           Logout
                        </button>
                     </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                     <h3 className="text-red-800 font-bold mb-2">
                        Danger Zone
                     </h3>
                     <p className="text-red-600/80 text-sm mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                     </p>
                     <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition font-medium">
                        <Trash2 size={18} />
                        Delete Account
                     </button>
                  </div>
               </div>
            </div>
         </div>
         {showConfirmReAuth && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
               <ConfirmLogin
                  onSuccess={async () => {
                     setShowConfirmReAuth(false);
                     toast.success("Verified! Deleting account...");

                     try {
                        await deleteAccount();
                        toast.success("Account deleted 💀");
                        navigate("/");
                     } catch (err) {
                        toast.error("Delete failed. Try again.");
                     }
                  }}
               />
            </div>
         )}
      </div>
   );
};

export default Profile;
