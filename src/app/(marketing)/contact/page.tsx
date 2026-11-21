"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Shield,
  Clock,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Support");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setError("Please complete all required fields.");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  };

  const contactChannels = [
    {
      icon: <HelpCircle className="h-6 w-6 text-cyan-400" />,
      title: "Technical Support",
      detail: "Assistance with simulation, circuits, or editor questions",
      email: "support@circuitverse-ai.pro",
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-violet-400" />,
      title: "Academic & University Labs",
      detail: "Classroom bulk licenses, curriculum plans, and LMS integrations",
      email: "education@circuitverse-ai.pro",
    },
    {
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      title: "Security & Vulnerability",
      detail: "Responsible disclosure and security vulnerability reports",
      email: "security@circuitverse-ai.pro",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* Ambient Cybernetic Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent" />
        <div className="absolute left-1/4 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute right-1/4 top-48 h-[450px] w-[450px] translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
      </div>

      {/* Hero Header */}
      <section className="relative px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="group mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-zinc-900/80 px-4 py-1.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300">
              GET IN TOUCH
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            We&apos;d Love to{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Hear From You
            </span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions about classroom licenses, enterprise deployments, bug reports, or feature requests? Reach out to our engineering and academic support team.
          </p>
        </div>
      </section>

      {/* Content Split Grid */}
      <section className="relative px-6 py-8 lg:px-8 max-w-6xl mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Inquiries & Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6">Direct Channels</h2>

              <div className="space-y-6">
                {contactChannels.map((channel, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shrink-0 mt-0.5">
                      {channel.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{channel.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{channel.detail}</p>
                      <a
                        href={`mailto:${channel.email}`}
                        className="mt-1.5 inline-block text-xs font-mono text-cyan-400 hover:underline"
                      >
                        {channel.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-zinc-800/80 pt-6 flex items-center gap-3 text-xs text-zinc-400">
                <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Average response time: &lt; 24 business hours</span>
              </div>
            </div>

            {/* Quick Community Card */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white mb-2">Community & Open Source</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect with digital logic students and makers worldwide on GitHub and community forums.
              </p>
              <div className="mt-4 flex gap-4 text-xs font-medium">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition"
                >
                  GitHub Repository →
                </a>
                <Link href="/about" className="text-zinc-400 hover:text-white transition">
                  About Our Mission →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-10 backdrop-blur-xl shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Fill out the form below and our team will get back to you shortly.
              </p>

              {isSubmitted ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Message Received!</h3>
                  <p className="mt-2 text-sm text-zinc-300">
                    Thank you for reaching out. A confirmation has been logged, and an engineer will reply to your email address soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-medium text-zinc-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Ada Lovelace"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-medium text-zinc-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="ada@cambridge.edu"
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-category" className="block text-xs font-medium text-zinc-300 mb-2">
                      Inquiry Category
                    </label>
                    <select
                      id="contact-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="General Support">General Support &amp; Questions</option>
                      <option value="Academic Licensing">Academic &amp; University Licensing</option>
                      <option value="Bug Report">Bug Report &amp; Issue Submission</option>
                      <option value="Feature Request">Feature Request &amp; Suggestions</option>
                      <option value="Enterprise / Sponsorship">Enterprise Deployment</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-medium text-zinc-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Tell us about your digital logic project or inquiry..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}