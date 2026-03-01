"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Script from "next/script";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Step = "form" | "otp";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (cfg: Record<string, unknown>) => void;
                    renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void;
                };
            };
        };
    }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [step, setStep] = useState<Step>("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        name: "", email: "", password: "", college: "", branch: "", gradYear: "",
    });
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const googleBtnRef = useRef<HTMLDivElement | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    /* ---------- cooldown timer ---------- */
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    /* ---------- Google Identity Services ---------- */
    const GOOGLE_CID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
    const [gsiReady, setGsiReady] = useState(false);

    const onGsiLoad = useCallback(() => {
        if (!window.google || !GOOGLE_CID) return;
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CID,
            callback: (resp: { credential: string }) => handleGoogleResponse(resp),
        });
        setGsiReady(true);
    }, [GOOGLE_CID]);

    /* Re-render the Google button whenever the ref div mounts */
    useEffect(() => {
        if (!gsiReady || !window.google || !googleBtnRef.current) return;
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            width: 360,
            text: "continue_with",
            shape: "pill",
        });
    }, [gsiReady, step, mode]);

    async function handleGoogleResponse(response: { credential: string }) {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setLoading(false); return; }
            window.location.href = "/dashboard";
        } catch {
            setError("Google sign-in failed. Try again.");
            setLoading(false);
        }
    }

    /* ---------- Email / Password submit ---------- */
    const handleSubmit = async () => {
        setError("");
        setSuccess("");
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
                /* login → email not verified → go to OTP step */
                if (data.needsVerification) {
                    await sendOtp(data.email ?? form.email);
                    setStep("otp");
                    setLoading(false);
                    return;
                }
                setError(data.error);
                setLoading(false);
                return;
            }

            if (mode === "register") {
                /* registration succeeded → send OTP → show OTP step */
                await sendOtp(form.email);
                setStep("otp");
                setLoading(false);
                return;
            }

            /* login success */
            window.location.href = "/dashboard";
        } catch {
            setError("Something went wrong. Try again.");
            setLoading(false);
        }
    };

    /* ---------- OTP helpers ---------- */
    const sendOtp = async (email: string) => {
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setSuccess("OTP sent to your email.");
            setCooldown(60);
        } catch {
            setError("Failed to send OTP.");
        }
    };

    const verifyOtp = async () => {
        const code = otp.join("");
        if (code.length !== 6) { setError("Enter all 6 digits."); return; }
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, code }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setLoading(false); return; }
            window.location.href = "/dashboard";
        } catch {
            setError("Verification failed. Try again.");
            setLoading(false);
        }
    };

    const handleOtpChange = (idx: number, val: string) => {
        if (val && !/^\d$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
        if (e.key === "Enter" && otp.join("").length === 6) verifyOtp();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!text) return;
        e.preventDefault();
        const next = [...otp];
        for (let i = 0; i < 6; i++) next[i] = text[i] ?? "";
        setOtp(next);
        otpRefs.current[Math.min(text.length, 5)]?.focus();
    };

    /* ---------- Reset when switching modes ---------- */
    const switchMode = (m: "login" | "register") => {
        setMode(m);
        setStep("form");
        setError("");
        setSuccess("");
        setOtp(["", "", "", "", "", ""]);
    };

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
        <>
            {/* Google Identity Services script */}
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={onGsiLoad}
            />

            <div className="min-h-screen flex items-center justify-center bg-background-dark px-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 font-display font-extrabold text-2xl mb-2">
                            <span
                                className="w-2 h-2 rounded-full bg-primary"
                                style={{ boxShadow: "0 0 10px #6366f1" }}
                            />
                            PlaceIQ
                        </div>
                        <p className="text-slate-400 text-sm">
                            Campus placement intelligence for Indian BTech students
                        </p>
                    </div>

                    {/* Card */}
                    <div className="card p-8">
                        {/* Mode toggle (hidden during OTP step) */}
                        {step === "form" && (
                            <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
                                <button
                                    onClick={() => switchMode("login")}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                        mode === "login"
                                            ? "bg-card-dark text-slate-100 shadow-sm"
                                            : "text-slate-400"
                                    }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => switchMode("register")}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                        mode === "register"
                                            ? "bg-card-dark text-slate-100 shadow-sm"
                                            : "text-slate-400"
                                    }`}
                                >
                                    Create Account
                                </button>
                            </div>
                        )}

                        {/* -------- STEP: FORM -------- */}
                        {step === "form" && (
                            <div className="flex flex-col gap-3">
                                {/* Google sign-in */}
                                <div
                                    ref={googleBtnRef}
                                    className="w-full flex items-center justify-center [&>div]:w-full min-h-[44px]"
                                />
                                {!gsiReady && (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-full bg-white/5 border border-white/10
                                                   text-slate-400 text-sm flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.01 24.01 0 000 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                                        Loading Google…
                                    </button>
                                )}

                                {/* Divider */}
                                <div className="flex items-center gap-3 my-1">
                                    <span className="flex-1 h-px bg-white/10" />
                                    <span className="text-xs text-slate-500">or continue with email</span>
                                    <span className="flex-1 h-px bg-white/10" />
                                </div>

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

                                {error && (
                                    <p className="text-xs text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded-lg px-3 py-2">
                                        {error}
                                    </p>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="btn-primary w-full py-3 mt-1 disabled:opacity-60"
                                >
                                    {loading
                                        ? "Please wait..."
                                        : mode === "login"
                                            ? "Login →"
                                            : "Create Account →"}
                                </button>
                            </div>
                        )}

                        {/* -------- STEP: OTP -------- */}
                        {step === "otp" && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-lg font-semibold text-slate-100">
                                        Check your email
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        We sent a 6-digit code to{" "}
                                        <span className="text-slate-200">{form.email}</span>
                                    </p>
                                </div>

                                {/* OTP inputs */}
                                <div className="flex gap-2 mt-2" onPaste={handleOtpPaste}>
                                    {otp.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={d}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-11 h-12 text-center text-lg font-semibold rounded-xl
                                                       bg-white/5 border border-white/10 text-slate-100
                                                       focus:border-primary focus:ring-1 focus:ring-primary/40
                                                       outline-none transition-all"
                                        />
                                    ))}
                                </div>

                                {success && (
                                    <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 w-full text-center">
                                        {success}
                                    </p>
                                )}
                                {error && (
                                    <p className="text-xs text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded-lg px-3 py-2 w-full text-center">
                                        {error}
                                    </p>
                                )}

                                <button
                                    onClick={verifyOtp}
                                    disabled={loading || otp.join("").length !== 6}
                                    className="btn-primary w-full py-3 disabled:opacity-60"
                                >
                                    {loading ? "Verifying..." : "Verify & Continue →"}
                                </button>

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Didn't receive it?</span>
                                    <button
                                        disabled={cooldown > 0}
                                        onClick={() => sendOtp(form.email)}
                                        className="text-primary hover:underline disabled:text-slate-600 disabled:no-underline"
                                    >
                                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                    </button>
                                </div>

                                <button
                                    onClick={() => { setStep("form"); setError(""); setSuccess(""); setOtp(["","","","","",""]); }}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    ← Back to {mode === "register" ? "sign up" : "login"}
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        No spam. Your data stays private.
                    </p>
                </div>
            </div>
        </>
    );
}