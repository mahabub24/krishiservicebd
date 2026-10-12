"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      await apiFetch("/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) });
      setState("ok");
      setMsg("সাবস্ক্রিপশনের জন্য ধন্যবাদ!");
      setEmail("");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "সাবস্ক্রাইব করা যায়নি");
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="nl-email" className="sr-only">ইমেইল</label>
      <input
        id="nl-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="আপনার ইমেইল"
        className="input flex-1 !border-transparent"
      />
      <button type="submit" disabled={state === "loading"} className="btn-accent">
        {state === "loading" ? "অপেক্ষা করুন..." : "সাবস্ক্রাইব"}
      </button>
      {state !== "idle" && state !== "loading" && (
        <p role="status" className={`w-full text-sm sm:col-span-2 ${state === "ok" ? "text-green-50" : "text-yellow-200"}`}>{msg}</p>
      )}
    </form>
  );
}
