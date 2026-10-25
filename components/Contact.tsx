"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { profile } from "@/data/content";
import { useSplitReveal } from "@/lib/useSplitReveal";
import Split from "./Split";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(10, "Write at least 10 characters"), 
  website: z.string().optional(), // honeypot: real visitors never see or fill this
});
type FormData = z.infer<typeof schema>;

const field = "sans mt-1 w-full border-0 border-b border-ink/40 bg-transparent px-0 py-3 text-lg outline-none transition-colors focus:border-accent focus-visible:outline-none";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  useSplitReveal(root);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };

  const onSubmit = async (data: FormData) => {
    setStatus(null);
    if (data.website) { reset(); setStatus({ ok: true, msg: "Message sent. I'll reply soon." }); return; }
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.name, email: data.email, message: data.message }) });
      if (!r.ok) throw new Error();
      reset();
      setStatus({ ok: true, msg: "Message sent. I'll reply soon." });
    } catch {
      setStatus({ ok: false, msg: "Message not sent. Try again or email me directly." });
    }
  };

  return (
    <section id="contact" ref={root} className="section">
      <div className="container-x">
        <Split as="h2" text="Let's work together" className="display display-xl max-w-[10ch]" />

        <div className="mt-16 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <a href={`mailto:${profile.email}`} className="display display-md link-u break-all">{profile.email}</a>
            <div className="mt-4">
              <button type="button" onClick={copy} className="sans link-u text-sm text-muted">{copied ? "Copied" : "Copy email address"}</button>
              <span role="status" className="sr-only">{copied ? "Email address copied" : ""}</span>
            </div>
            <ul className="sans mt-12 space-y-2 text-lg">
              <li><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="link-u">LinkedIn<span className="sr-only"> (opens in a new tab)</span></a></li>
              <li><a href={profile.github} target="_blank" rel="noopener noreferrer" className="link-u">GitHub<span className="sr-only"> (opens in a new tab)</span></a></li>
              <li className="text-muted">{profile.location}</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 lg:col-span-6">
            {([["name", "Name", "text", "name"], ["email", "Email", "email", "email"]] as const).map(([f, label, type, auto]) => (
              <div key={f}>
                <label htmlFor={f} className="sans text-sm text-muted">{label}</label>
                <input id={f} type={type} autoComplete={auto} {...register(f)} aria-invalid={!!errors[f]} aria-describedby={errors[f] ? `${f}-err` : undefined} className={field} />
                {errors[f] && <p id={`${f}-err`} role="alert" className="sans mt-1 text-sm text-red-600 dark:text-red-400">{errors[f]?.message}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="message" className="sans text-sm text-muted">Message</label>
              <textarea id="message" rows={4} {...register("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} className={`${field} resize-y`} />
              {errors.message && <p id="message-err" role="alert" className="sans mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>}
            </div>
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Leave this empty<input type="text" tabIndex={-1} autoComplete="off" {...register("website")} /></label>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <button type="submit" disabled={isSubmitting} className="btn btn-solid disabled:opacity-60">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" />Sending</> : "Send message"}
              </button>
              <p role="status" aria-live="polite" className={`sans text-sm ${status?.ok ? "" : "text-red-600 dark:text-red-400"}`}>{status?.msg}</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
