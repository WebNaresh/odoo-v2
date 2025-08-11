"use client";

import { useCallback, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Now you can access all database fields from the session:
  // session?.user.id - Database ObjectId
  // session?.user.googleId - Google's unique identifier
  // session?.user.email - User's email
  // session?.user.name - User's name
  // session?.user.image - Profile image URL
  // session?.user.emailVerified - Email verification date
  // session?.user.createdAt - Account creation timestamp
  // session?.user.updatedAt - Last update timestamp

  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleDownload = useCallback(async () => {
    if (!containerRef.current || generating) return;
    setError(null);
    setGenerating(true);

    try {
      // Import html2canvas-pro and jsPDF separately
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const sourceEl = containerRef.current;
      const width = sourceEl.scrollWidth;
      const height = sourceEl.scrollHeight;

      // Generate canvas with html2canvas-pro (supports modern CSS including oklch)
      const canvas = await html2canvas(sourceEl, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        width: width,
        height: height,
        scrollX: 0,
        scrollY: 0,
      });

      // Create PDF with jsPDF
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate scaling to fit page width
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = 20; // Small top margin

      // If content is taller than one page, we might need multiple pages
      if (scaledHeight > pdfHeight - 40) {
        // Content spans multiple pages
        const pageHeight = pdfHeight - 40;
        let remainingHeight = scaledHeight;
        let currentY = 0;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(pageHeight, remainingHeight);

          pdf.addImage(
            imgData,
            "JPEG",
            x,
            y - currentY,
            scaledWidth,
            scaledHeight
          );

          remainingHeight -= currentPageHeight;
          currentY += currentPageHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      } else {
        // Content fits on one page
        pdf.addImage(imgData, "JPEG", x, y, scaledWidth, scaledHeight);
      }

      // Save the PDF
      pdf.save("Naresh-Bhosale-Portfolio.pdf");
    } catch (e) {
      console.error(e);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [generating]);

  const projects = [
    {
      title: "Odoo Integrations Dashboard",
      description:
        "Unified view to monitor sync jobs, webhooks, and data flows between Odoo and third‑party services.",
      tech: ["Next.js", "TypeScript", "Tailwind", "Node.js"],
      href: "#",
    },
    {
      title: "E‑commerce PWA",
      description:
        "Fast, offline‑ready storefront with server actions, dynamic routing, and optimized images.",
      tech: ["React", "Next.js", "PostgreSQL", "Stripe"],
      href: "#",
    },
    {
      title: "Real‑time Chat App",
      description:
        "Typing indicators, presence, and message receipts with WebSockets and optimistic UI.",
      tech: ["Next.js", "Socket.io", "Prisma", "Vercel"],
      href: "#",
    },
  ];

  const skills = [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "REST / GraphQL",
    "PostgreSQL",
    "Prisma",
    "Docker",
    "CI/CD",
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground/60">
              Developer Portfolio
            </p>
            <h1 className="text-lg sm:text-xl font-semibold">Naresh Bhosale</h1>
            <p className="text-sm text-foreground/70">Full‑Stack Developer</p>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <a className="hover:text-foreground/80" href="#about">
              About
            </a>
            <a className="hover:text-foreground/80" href="#projects">
              Work
            </a>
            <a className="hover:text-foreground/80" href="#contact">
              Contact
            </a>
            {session && (
              <button
                onClick={() => router.push("/dashboard")}
                className="hover:text-foreground/80"
              >
                Dashboard
              </button>
            )}
            {session?.user?.role === "ADMIN" && (
              <button
                onClick={() => router.push("/admin")}
                className="hover:text-foreground/80 text-red-600 dark:text-red-400"
              >
                Admin
              </button>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {/* Authentication Status */}
            {status === "loading" ? (
              <div className="inline-flex items-center gap-2 rounded-md ring-1 ring-black/10 dark:ring-white/10 px-3 py-1.5 text-sm font-medium">
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3v3" />
                  <path d="M12 18v3" />
                  <path d="M3 12h3" />
                  <path d="M18 12h3" />
                  <path d="m5.6 5.6 2.1 2.1" />
                  <path d="m16.3 16.3 2.1 2.1" />
                  <path d="m5.6 18.4 2.1-2.1" />
                  <path d="m16.3 7.7 2.1-2.1" />
                </svg>
                <span>Loading...</span>
              </div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Image
                    src={session.user?.image || "/default-avatar.svg"}
                    alt={session.user?.name || "User"}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                  />
                  <div className="flex flex-col">
                    <span className="text-foreground/80">
                      Hi, {session.user?.name?.split(" ")[0]}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        session.user?.role === "ADMIN"
                          ? "text-red-600 dark:text-red-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {session.user?.role === "ADMIN" ? "Admin" : "User"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-md ring-1 ring-black/10 dark:ring-white/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10,17 15,12 10,7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign in</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-md ring-1 ring-black/10 dark:ring-white/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M12 3v3" />
                  <path d="M12 18v3" />
                  <path d="M3 12h3" />
                  <path d="M18 12h3" />
                  <path d="m5.6 5.6 2.1 2.1" />
                  <path d="m16.3 16.3 2.1 2.1" />
                  <path d="m5.6 18.4 2.1-2.1" />
                  <path d="m16.3 7.7 2.1-2.1" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M12 3v12" />
                  <path d="m7 11 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
              )}
              <span>{generating ? "Generating…" : "Download PDF"}</span>
            </button>
            <a
              href="https://github.com/WebNaresh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.5 1.1 3.1.9.1-.7.3-1.1.6-1.4-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C16 4 17 4.3 17 4.3c.6 1.7.2 3 .1 3.3.8.8 1.2 1.9 1.2 3.2 0 4.6-2.7 5.5-5.3 5.9.4.3.7.9.7 1.9v2.8c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
              </svg>
            </a>
            <a
              href="mailto:naresh.bhosale.dev@gmail.com"
              aria-label="Email"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                <path d="m22 8-10 6L2 8" />
              </svg>
            </a>
          </div>
        </div>
        {error && (
          <div className="mx-auto max-w-6xl px-6">
            <div className="mt-3 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20 px-3 py-2 text-sm">
              {error}
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-24">
        {/* Hero */}
        <section className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-black/10 dark:ring-white/10 text-foreground/80">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Open to opportunities & collaborations
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold leading-tight">
            Building reliable, modern web apps with performance and DX in mind
          </h2>
          <p className="max-w-3xl text-base sm:text-lg text-foreground/70">
            I craft scalable frontends and APIs using Next.js, TypeScript, and a
            clean component architecture. I enjoy shipping polished experiences,
            streamlining developer workflows, and integrating systems
            end‑to‑end.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              View projects
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-md ring-1 ring-black/10 dark:ring-white/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            >
              Get in touch
            </a>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          aria-labelledby="about-title"
          className="scroll-mt-24"
        >
          <h3 id="about-title" className="text-2xl font-semibold mb-6">
            About
          </h3>
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3 space-y-4">
              <p className="text-foreground/80">
                I’m a developer focused on building fast, accessible products.
                My toolkit revolves around React, Next.js, and TypeScript on the
                frontend, paired with Node.js services and SQL databases on the
                backend.
              </p>
              <p className="text-foreground/80">
                I prioritize clear abstractions, strong typing, and thoughtful
                UX. I’ve worked on dashboards, PWAs, and real‑time features,
                with experience integrating payment, auth, and ERP systems.
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="rounded-xl ring-1 ring-black/10 dark:ring-white/10 p-4 sm:p-5 bg-slate-50 dark:bg-zinc-900">
                <p className="text-sm font-medium mb-3 text-foreground/80">
                  Key skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-md bg-white/60 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 px-2.5 py-1 text-xs text-foreground/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          aria-labelledby="projects-title"
          className="scroll-mt-24"
        >
          <h3 id="projects-title" className="text-2xl font-semibold mb-6">
            Selected work
          </h3>
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article
                key={p.title}
                className="group rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/5 p-5 sm:p-6 hover:translate-y-[-2px] transition-transform"
              >
                <header className="mb-3 flex items-start justify-between gap-3">
                  <h4 className="text-lg font-semibold leading-snug">
                    {p.title}
                  </h4>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-black/10 dark:ring-white/10 text-foreground/80 group-hover:text-foreground"
                    aria-label="Open project"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </a>
                </header>
                <p className="text-sm text-foreground/70 mb-4">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-1 text-[11px] font-medium text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          aria-labelledby="contact-title"
          className="scroll-mt-24"
        >
          <h3 id="contact-title" className="text-2xl font-semibold mb-6">
            Contact
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <a
              href="mailto:naresh.bhosale.dev@gmail.com"
              className="rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/5 p-5 sm:p-6 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                    <path d="m22 8-10 6L2 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-foreground/70">
                    naresh.bhosale.dev@gmail.com
                  </p>
                </div>
              </div>
            </a>
            <a
              href="https://www.linkedin.com/in/naresh-bhosale"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/5 p-5 sm:p-6 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.05-1.86-3.05-1.87 0-2.15 1.46-2.15 2.96v5.66H9.34V9h3.41v1.56h.05c.48-.91 1.64-1.86 3.38-1.86 3.61 0 4.28 2.38 4.28 5.47v6.28ZM5.34 7.44a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">LinkedIn</p>
                  <p className="text-sm text-foreground/70">
                    /in/naresh-bhosale
                  </p>
                </div>
              </div>
            </a>
          </div>
          <div className="mt-6">
            <a
              href="https://github.com/WebNaresh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline hover:underline-offset-4"
            >
              <span>GitHub</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-foreground/70 flex items-center justify-between">
          <p>
            © {new Date().getFullYear()} Naresh Bhosale. All rights reserved.
          </p>
          <a href="#top" className="hover:underline hover:underline-offset-4">
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}
