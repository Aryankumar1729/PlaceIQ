"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "", email: "", password: "", college: "", branch: "", gradYear: "",
    });

    const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        setError("");
        setLoading(true);
        const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
        const body = mode === "login"
            ? { email: form.email, password: form.password }
            : form;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                setLoading(false);
                return;
            }

            // Use window.location instead of router.push
            // This forces a full page reload so the cookie is properly read
            window.location.href = "/dashboard";

        } catch (err) {
            setError("Something went wrong. Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 font-display font-extrabold text-2xl mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary"
                            style={{ boxShadow: "0 0 10px #6366f1" }} />
                        PlaceIQ
                    </div>
                    <p className="text-slate-400 text-sm">Campus placement intelligence for Indian BTech students</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    {/* Mode toggle */}
                    <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-card-dark text-slate-100 shadow-sm" : "text-slate-400"
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "bg-card-dark text-slate-100 shadow-sm" : "text-slate-400"
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Register-only fields */}
                        {mode === "register" && (
                            <input
                                className="input-field"
                                placeholder="Full name"
                                value={form.name}
                                onChange={(e) => update("name", e.target.value)}
                            />
                        )}

                        <input
                            className="input-field"
                            placeholder="College email"
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                        />

                        <input
                            className="input-field"
                            placeholder="Password"
                            type="password"
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />

                        {mode === "register" && (
                            <>
                                <input
                                    className="input-field"
                                    placeholder="College name (e.g. AKTU, VIT)"
                                    value={form.college}
                                    onChange={(e) => update("college", e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        className="input-field"
                                        placeholder="Branch (e.g. CSE)"
                                        value={form.branch}
                                        onChange={(e) => update("branch", e.target.value)}
                                    />
                                    <input
                                        className="input-field"
                                        placeholder="Grad year (e.g. 2026)"
                                        value={form.gradYear}
                                        onChange={(e) => update("gradYear", e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary w-full py-3 mt-1 disabled:opacity-60"
                        >
                            {loading
                                ? "Please wait..."
                                : mode === "login" ? "Login →" : "Create Account →"}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    No spam. Your data stays private.
                </p>
            </div>
        </div>
    );
}