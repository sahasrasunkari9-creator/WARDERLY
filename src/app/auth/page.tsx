"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastSystem";
import { TRAVEL_STYLES, type TravelStyle } from "@/lib/travelTypes";

interface Profile {
  name: string;
  email: string;
  homeCity: string;
  style: TravelStyle;
  budgetLevel: string;
  registeredAt: string;
}

const KEY = "tv.profile";

export default function AuthPage() {
  const toast = useToast();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [style, setStyle] = useState<TravelStyle>("Adventure");
  const [budget, setBudget] = useState("mid");
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const validate = (): string | null => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters (demo — stored locally only).";
    if (tab === "register" && !name.trim()) return "Please enter your name.";
    return null;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setErr(problem);
      return;
    }
    const p: Profile = {
      name: tab === "register" ? name.trim() : name.trim() || email.split("@")[0],
      email: email.trim(),
      homeCity: homeCity.trim(),
      style,
      budgetLevel: budget,
      registeredAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* private mode */
    }
    setProfile(p);
    setErr(null);
    toast(`Welcome, ${p.name}! Travel profile saved on this device.`, "success");
  };

  const logout = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
    setProfile(null);
    toast("Signed out.", "info");
  };

  /* hydrate */
  if (typeof window !== "undefined" && profile === null) {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfile(JSON.parse(raw) as Profile);
    } catch {
      /* private mode */
    }
  }

  return (
    <main className="relative z-10 mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <p className="hairline mb-2 text-[11px] font-extrabold text-cyan">Travel Profile</p>
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
        {profile ? `Welcome back, ${profile.name.split(" ")[0]}` : "Create your travel profile"}
      </h1>
      <p className="mt-2 text-sm text-ink-dim">
        Demo authentication — everything is stored in your browser's LocalStorage. No real accounts, nothing transmitted.
      </p>

      {profile ? (
        <div className="glass-card glow-ring mt-8 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/50 bg-cyan/10 font-display text-2xl font-bold text-cyan">
              {profile.name[0]?.toUpperCase()}
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-ink">{profile.name}</p>
              <p className="text-sm text-ink-dim">{profile.email}</p>
              <p className="text-[11px] text-ink-faint">Member since {new Date(profile.registeredAt).toLocaleDateString()}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line/60 bg-bg0/40 p-3">
              <dt className="text-[10px] font-bold text-ink-faint">HOME CITY</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">{profile.homeCity || "—"}</dd>
            </div>
            <div className="rounded-xl border border-line/60 bg-bg0/40 p-3">
              <dt className="text-[10px] font-bold text-ink-faint">TRAVEL STYLE</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">{profile.style}</dd>
            </div>
            <div className="rounded-xl border border-line/60 bg-bg0/40 p-3">
              <dt className="text-[10px] font-bold text-ink-faint">BUDGET LEVEL</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink capitalize">{profile.budgetLevel}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a href="/plan" className="btn-neon rounded-xl px-5 py-2.5 text-sm">Plan a trip</a>
            <a href="/dashboard" className="btn-ghost rounded-xl px-5 py-2.5 text-sm font-bold">My dashboard</a>
            <button onClick={logout} className="btn-danger rounded-xl px-5 py-2.5 text-sm font-bold">Sign out</button>
          </div>
        </div>
      ) : (
        <div className="glass-card glow-ring mt-8 rounded-2xl p-6">
          <div className="mb-5 flex rounded-xl border border-line bg-bg0/50 p-1">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setErr(null);
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-bold capitalize transition-colors ${tab === t ? "bg-gradient-to-r from-cyan/20 to-purple/20 text-cyan" : "text-ink-dim"}`}
                aria-pressed={tab === t}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="a-name">Full name</label>
                <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" className="neon-input w-full rounded-xl px-4 py-2.5 text-sm" />
              </div>
            )}
            <div>
              <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="a-email">Email</label>
              <input id="a-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" className="neon-input w-full rounded-xl px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="a-pass">Password</label>
              <input id="a-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="neon-input w-full rounded-xl px-4 py-2.5 text-sm" />
            </div>
            {tab === "register" && (
              <>
                <div>
                  <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="a-city">Home city (optional)</label>
                  <input id="a-city" value={homeCity} onChange={(e) => setHomeCity(e.target.value)} placeholder="Mumbai" className="neon-input w-full rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim">Preferred travel style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TRAVEL_STYLES.map((s) => (
                      <button key={s} type="button" onClick={() => setStyle(s)} className={`rounded-xl border px-2 py-2 text-xs font-bold ${style === s ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line text-ink-dim"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim">Budget level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["budget", "Budget"], ["mid", "Mid-range"], ["luxury", "Luxury"]].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setBudget(v)} className={`rounded-xl border px-2 py-2 text-xs font-bold ${budget === v ? "border-purple/60 bg-purple/10 text-purple" : "border-line text-ink-dim"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {err && <p className="text-sm text-danger">{err}</p>}
            <button type="submit" className="btn-neon w-full rounded-xl py-3 text-sm">
              {tab === "login" ? "Sign in" : "Create my travel profile"}
            </button>
            <p className="text-center text-[11px] text-ink-faint">
              Demo login — credentials never leave this device.
            </p>
          </form>
        </div>
      )}
    </main>
  );
}
