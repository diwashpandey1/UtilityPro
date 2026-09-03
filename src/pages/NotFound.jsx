import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";

function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
            <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/10 sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <Compass size={32} aria-hidden="true" />
                </div>
                <p className="mt-8 text-sm font-bold uppercase tracking-[0.22em] text-blue-600">Error 404</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Page not found</h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
                    Sorry, the page you're looking for doesn't exist or may have been moved.
                </p>
                <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20">
                    <ArrowLeft size={18} aria-hidden="true" /> Back to Home
                </Link>
            </section>
        </main>
    );
}

export default NotFound;
