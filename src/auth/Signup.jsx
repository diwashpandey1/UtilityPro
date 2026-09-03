import { useContext, useEffect, useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { auth, fireDb } from "../backend/Firebase";
import AuthLayout, { AuthInput, AuthSubmitButton } from "../components/auth/AuthLayout";

const errorMessages = {
    "auth/email-already-in-use": "An account already exists for this email address.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/operation-not-allowed": "Email and password sign-up is not enabled.",
    "auth/network-request-failed": "Unable to connect. Please check your internet connection and try again.",
};

const getAuthErrorMessage = (error) => errorMessages[error.code] || "Unable to create your account. Please try again.";

const SignUp = () => {
    const { user, loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    const handleSignUp = async (event) => {
        event.preventDefault();
        if (!fullName.trim() || !email.trim() || !password || !confirmPass) {
            toast.warn("Please complete all fields.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            toast.error("Choose a stronger password with at least 6 characters.");
            return;
        }
        if (password !== confirmPass) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(result.user, { displayName: fullName.trim() });
            await setDoc(doc(fireDb, "user", result.user.uid), {
                uid: result.user.uid,
                displayName: fullName.trim(),
                email: email.trim(),
                photoURL: "",
                dob: "",
                phoneNumber: "",
                createdAt: new Date().toISOString(),
                providerId: "password",
            });
            toast.success("Account created successfully.");
            navigate("/", { replace: true });
        } catch (error) {
            toast.error(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            toast.error(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="Create your account"
            title="Get started with UtilityPro"
            description="Create an account to keep your useful tools close at hand."
            footer={<>Already have an account? <Link to="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link></>}
        >
            <form className="space-y-4" onSubmit={handleSignUp} noValidate>
                <AuthInput icon={User} id="signup-name" label="Full name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Your full name" />
                <AuthInput icon={Mail} id="signup-email" label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" />
                <AuthInput icon={Lock} id="signup-password" label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="At least 6 characters" />
                <AuthInput icon={Lock} id="signup-confirm-password" label="Confirm password" type="password" value={confirmPass} onChange={(event) => setConfirmPass(event.target.value)} autoComplete="new-password" placeholder="Repeat your password" />
                <AuthSubmitButton loading={isSubmitting} loadingText="Creating account...">Create account</AuthSubmitButton>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with<span className="h-px flex-1 bg-slate-200" /></div>
            <button type="button" onClick={handleGoogleSignUp} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                <img src="https://img.icons8.com/?size=28&id=17949&format=png&color=000000" alt="" className="h-5 w-5" /> Continue with Google
            </button>
        </AuthLayout>
    );
};

export default SignUp;
