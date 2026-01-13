"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import {
  Github,
  Linkedin,
  Mail,
  Moon,
  Sun,
  ArrowRight,
  ChevronDown,
  Phone,
  MapPin,
} from "lucide-react";

type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
  status?: "Live" | "In progress" | "Coming soon";
};

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const SectionTitle = ({
  title,
  subtitle,
  subtitleClass,
}: {
  title: string;
  subtitle?: string;
  subtitleClass?: string;
}) => (
  <div className="text-center mb-10">
    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
    {subtitle ? (
      <p className={`mt-3 text-sm md:text-base max-w-2xl mx-auto ${subtitleClass ?? "text-white/60"}`}>
        {subtitle}
      </p>
    ) : null}
  </div>
);

const Pill = ({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
}) => (
  <span
    className={
      "inline-flex items-center rounded-full border px-3 py-1 text-xs " +
      (tone === "dark"
        ? "border-white/10 bg-white/5 text-white/80"
        : "border-black/10 bg-black/5 text-black/70")
    }
  >
    {children}
  </span>
);

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={
      "rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,.35)] backdrop-blur-md " +
      className
    }
  >
    {children}
  </div>
);

const Button = ({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  tone = "dark",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  className?: string;
  tone?: "dark" | "light";
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]";

  const styles =
    variant === "primary"
      ? tone === "dark"
        ? "bg-white text-black hover:bg-white/90"
        : "bg-black text-white hover:bg-black/90"
      : tone === "dark"
        ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
        : "border border-black/15 bg-black/5 text-black hover:bg-black/10";

  const isHashLink = typeof href === "string" && href.startsWith("#");
  const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
  const Comp: any = href ? "a" : "button";
  return (
    <Comp
      href={href}
      onClick={(e: any) => {
        if (isHashLink) e.preventDefault();
        onClick?.();
      }}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </Comp>
  );
};

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "home");

  React.useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -60% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

export default function Portfolio() {
  const [dark, setDark] = useState(true);

  const profile = useMemo(
    () => ({
      name: "Baxtiyar Alizada",
      title: "Junior Android Developer",
      headline:
        "Müasir Android texnologiyalarından istifadə edərək istifadəçi dostu, performanslı və etibarlı mobil tətbiqlər hazırlayıram.",
      about:
        "Yeni texnologiyalara açıq, öyrənməyə maraqlı və komandada effektiv işləyən Junior Android Developerəm. Bilik və bacarıqlarımı real layihələrdə tətbiq edərək daim inkişaf etməyə çalışıram. Məqsədim istifadəsi rahat, etibarlı və keyfiyyətli mobil tətbiqlər hazırlayaraq dəyər yaratmaqdır.",
      focus: [
        "MVVM & Clean Architecture",
        "Asinxron proqramlaşdırma (Coroutines, Flow)",
        "REST API inteqrasiyası",
        "Yeni texnologiyalarla işləmək",
      ],
      contact: {
        email: "baxtiyaralizada1@gmail.com",
        phone: "077 333 98 31",
        github: "https://github.com/Baxtiyar09",
        linkedin: "https://www.linkedin.com/in/baxtiyaralizada1/",
        location: "Azerbaijan",
      },
    }),
    []
  );

  const skills = useMemo(
    () => [
      { name: "Kotlin", level: 82 },
      { name: "MVVM & Clean Architecture", level: 80 },
      { name: "Room / SQLite", level: 75 },
      { name: "Firebase", level: 72 },
      { name: "Hilt (DI)", level: 70 },
      { name: "Coroutines & Flow", level: 78 },
      { name: "REST API", level: 80 },
      { name: "Material Design", level: 76 },
    ],
    []
  );

  const techTags = useMemo(
    () => [
      "Kotlin",
      "MVVM",
      "Clean Architecture",
      "Compose",
      "XML",
      "Room",
      "SQLite",
      "Retrofit",
      "OkHttp",
      "Coroutines",
      "Flow",
      "Firebase",
      "Hilt",
      "Material Design",
    ],
    []
  );

  const projects = useMemo<Project[]>(
    () => [
      {
        title: "Mova",
        status: "Live",
        description:
          "ATL Academy final layihəsi. Film həvəskarları üçün nəzərdə tutulmuş Android tətbiqi.",
        tech: ["Kotlin", "MVVM", "Retrofit", "Coroutines", "Flow"],
        link: "https://github.com/Baxtiyar09/moviesApp",
      },
      {
        title: "HeyatYolu",
        status: "In progress",
        description:
          "Rəhmətə getmiş insanların xatirələrini rəqəmsal formada saxlayan mobil platforma.",
        tech: ["Kotlin", "MVVM", "Room", "Firebase"],
      },
      {
        title: "Herac",
        status: "Coming soon",
        description:
          "Növbəti mərhələdə tam hazırlandıqdan sonra Google Play Store-da yayımlamaq planlaşdırılır.",
        tech: ["Clean Architecture", "Performance", "Modern UI"],
      },
      {
        title: "Astrology App",
        status: "Coming soon",
        description:
          "Bürclər haqqında məlumat verən və gündəlik/həftəlik proqnozlar təqdim edən platforma.",
        tech: ["REST API", "Kotlin", "Modern UI"],
      },
    ],
    []
  );

  const sections = useMemo(
    () => [
      { id: "home", label: "Home" },
      { id: "about", label: "About" },
      { id: "skills", label: "Skills" },
      { id: "projects", label: "Projects" },
      { id: "contact", label: "Contact" },
    ],
    []
  );

  const active = useActiveSection(sections.map((s) => s.id));

  const bg = dark
    ? "bg-[#07080a] text-white"
    : "bg-white text-[#0b0d12]";

  const muted = dark ? "text-white/60" : "text-black/55";
  const navBg = dark ? "bg-black/50" : "bg-white/70";
  const border = dark ? "border-white/10" : "border-black/10";

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={
            "absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-30 " +
            (dark ? "bg-white" : "bg-black")
          }
        />
        <div
          className={
            "absolute -bottom-48 right-[-120px] h-[560px] w-[560px] rounded-full blur-3xl opacity-20 " +
            (dark ? "bg-white" : "bg-black")
          }
        />
      </div>

      {/* Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${navBg} backdrop-blur-md border-b ${border}`}>
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => scrollTo("home")}
            className="text-sm font-semibold tracking-wide"
          >
            AndroidDev
          </button>

          <nav className="hidden md:flex items-center gap-5 text-sm">
            {sections.map((s) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={
                    "transition " +
                    (isActive
                      ? dark
                        ? "text-white"
                        : "text-black"
                      : dark
                        ? "text-white/60 hover:text-white"
                        : "text-black/55 hover:text-black")
                  }
                >
                  <span
                    className={
                      "px-2 py-1 rounded-lg " +
                      (isActive ? (dark ? "bg-white/10" : "bg-black/5") : "")
                    }
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((v) => !v)}
              className={
                "h-9 w-9 grid place-items-center rounded-xl border transition " +
                (dark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-black/10 bg-black/5 hover:bg-black/10")
              }
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-16">
        {/* HERO */}
        <section id="home" className="min-h-[78vh] grid place-items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl"
          >
            <p className={"text-xs uppercase tracking-[0.25em] " + muted}>
              {profile.title}
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <p className={"mt-5 text-sm md:text-base leading-relaxed " + muted}>
              {profile.headline}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/* Desktop / Tablet CTAs */}
              <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
                {/* View My Work (scroll) + tooltip + animated arrow */}
                <div className="relative group">
                  <Button
                    variant="primary"
                    tone={dark ? "dark" : "light"}
                    onClick={() => scrollTo("projects")}
                    className="min-w-[160px]"
                  >
                    View My Work
                    <motion.span
                      aria-hidden
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                      className="inline-flex"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </Button>

                  {/* Tooltip */}
                  <div
                    className={
                      "pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg border px-3 py-1 text-[11px] opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 " +
                      (dark
                        ? "border-white/10 bg-black/70 text-white/80"
                        : "border-black/10 bg-white/90 text-black/70")
                    }
                  >
                    Scroll to projects
                  </div>
                </div>

                <Button
                  href={profile.contact.github}
                  variant="outline"
                  tone={dark ? "dark" : "light"}
                  className="min-w-[140px]"
                >
                  <Github size={16} /> GitHub
                </Button>
                <Button
                  href={profile.contact.linkedin}
                  variant="outline"
                  tone={dark ? "dark" : "light"}
                  className="min-w-[140px]"
                >
                  <Linkedin size={16} /> LinkedIn
                </Button>
                <Button
                  href={`mailto:${profile.contact.email}`}
                  variant="outline"
                  tone={dark ? "dark" : "light"}
                  className="min-w-[140px]"
                >
                  <Mail size={16} /> Contact
                </Button>
              </div>

              {/* Mobile CTAs (different) */}
              <div className="flex sm:hidden w-full max-w-sm mx-auto gap-3">
                <Button
                  variant="primary"
                  tone={dark ? "dark" : "light"}
                  onClick={() => scrollTo("projects")}
                  className="flex-1"
                >
                  Projects
                  <motion.span
                    aria-hidden
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                    className="inline-flex"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </Button>
                <Button
                  href={`mailto:${profile.contact.email}`}
                  variant="outline"
                  tone={dark ? "dark" : "light"}
                  className="flex-1"
                >
                  <Mail size={16} /> Contact
                </Button>
              </div>
            </div>

            <motion.div
              className="mt-8 flex justify-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            >
              <Button
                href="/Baxtiyar_Alizada_CV_Ing.pdf"
                variant="outline"
                tone={dark ? "dark" : "light"}
                className="min-w-[160px] border-white/25 bg-white/5 hover:bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.35)]"

              >
                Download CV
              </Button>
            </motion.div>


            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {profile.focus.map((f) => (
                <Pill tone={dark ? "dark" : "light"} key={f}>
                  {f}
                </Pill>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ABOUT */}
        <motion.section id="about" {...fadeUp} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="py-20">

          <SectionTitle
            title="About Me"
            subtitle="Səliqəli kod, stabil arxitektura və yaxşı UX üzərində fokuslanıram."
            subtitleClass={muted}
          />

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <p className={"text-sm leading-relaxed " + muted}>{profile.about}</p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {["Clean Code", "Modern UI/UX", "User-Centered", "Performance"].map(
                  (t) => (
                    <div
                      key={t}
                      className={
                        "rounded-xl border p-4 " +
                        (dark
                          ? "border-white/10 bg-black/30"
                          : "border-black/10 bg-white")
                      }
                    >
                      <div className="text-sm font-medium">{t}</div>
                      <div className={"mt-1 text-xs " + muted}>
                        {t === "Clean Code" &&
                          "Oxunaqlı və maintainable kod strukturu."}
                        {t === "Modern UI/UX" &&
                          "Material yanaşma, səliqəli layout və animasiyalar."}
                        {t === "User-Centered" &&
                          "İstifadəçiyə rahat, sadə və aydın təcrübə."}
                        {t === "Performance" &&
                          "Optimallaşdırılmış iş prinsipi və sürətli ekranlar."}
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-medium">My Journey</div>
              <p className={"mt-2 text-sm leading-relaxed " + muted}>
                Android sahəsində real layihələr üzərində işləyərək biliklərimi
                praktikada möhkəmləndirirəm və daim yeni texnologiyalar öyrənirəm.
              </p>
              <div className="mt-5 grid gap-3">
                <div className={"flex items-center gap-2 text-sm " + muted}>
                  <MapPin size={16} /> {profile.contact.location}
                </div>
                <div className={"flex items-center gap-2 text-sm " + muted}>
                  <Mail size={16} /> {profile.contact.email}
                </div>
                <div className={"flex items-center gap-2 text-sm " + muted}>
                  <Phone size={16} /> {profile.contact.phone}
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        {/* SKILLS */}
        <motion.section id="skills" {...fadeUp} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="py-20">
          <SectionTitle
            title="Skills & Technologies"
            subtitle="Android tətbiqləri hazırlamaq üçün istifadə etdiyim əsas texnologiyalar."
            subtitleClass={muted}
          />

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <div className="text-sm font-medium mb-4">Core Expertise</div>
              <div className="grid gap-4">
                {skills.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={dark ? "text-white" : "text-black"}>
                        {s.name}
                      </span>
                      <span className={muted}>{s.level}%</span>
                    </div>
                    <div
                      className={
                        "mt-2 h-2 rounded-full overflow-hidden " +
                        (dark ? "bg-white/10" : "bg-black/10")
                      }
                    >
                      <div
                        className={
                          "h-full rounded-full " +
                          (dark ? "bg-white" : "bg-black")
                        }
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-medium mb-4">Technology Stack</div>
              <div className="flex flex-wrap gap-2">
                {techTags.map((t) => (
                  <span
                    key={t}
                    className={
                      "text-xs rounded-full border px-3 py-1 " +
                      (dark
                        ? "border-white/10 bg-black/30 text-white/80"
                        : "border-black/10 bg-white text-black/70")
                    }
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div
                className={
                  "mt-6 rounded-2xl border p-5 text-center " +
                  (dark
                    ? "border-white/10 bg-black/30"
                    : "border-black/10 bg-white")
                }
              >
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-2xl font-semibold">Junior</div>
                    <div className={"text-xs mt-1 " + muted}>Level</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">4+</div>
                    <div className={"text-xs mt-1 " + muted}>Projects</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">100%</div>
                    <div className={"text-xs mt-1 " + muted}>Learning</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        {/* PROJECTS */}
        <motion.section id="projects" {...fadeUp} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="py-20">
          <SectionTitle
            title="Featured Projects"
            subtitle="Öyrəndiklərimi praktikada tətbiq etdiyim seçilmiş layihələr."
            subtitleClass={muted}
          />

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <motion.div
                key={p.title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    {p.status ? (
                      <span
                        className={
                          "text-[11px] rounded-full px-2.5 py-1 border " +
                          (dark
                            ? "border-white/10 bg-white/5 text-white/80"
                            : "border-black/10 bg-black/5 text-black/70")
                        }
                      >
                        {p.status}
                      </span>
                    ) : null}
                  </div>

                  <p className={"mt-2 text-sm leading-relaxed " + muted}>
                    {p.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <Pill tone={dark ? "dark" : "light"} key={t}>
                        {t}
                      </Pill>
                    ))}
                  </div>

                  <div className="mt-6">
                    {p.link ? (
                      <Button href={p.link} variant="outline" tone={dark ? "dark" : "light"}>
                        <Github size={16} /> View on GitHub
                      </Button>
                    ) : (
                      <Button variant="outline" tone={dark ? "dark" : "light"} onClick={() => scrollTo("contact")}>
                        <Mail size={16} /> Ask for details
                      </Button>
                    )}
                  </div>

                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CONTACT */}
        <motion.section id="contact" {...fadeUp} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="py-20">
          <SectionTitle
            title="Let's Work Together"
            subtitle="Layihə ideyan var? Gəlin danışaq və birlikdə dəyər yaradaq."
            subtitleClass={muted}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="text-sm font-medium">Get in Touch</div>
              <div className="mt-5 grid gap-3">
                <a
                  className={
                    "flex items-center justify-between rounded-xl border p-4 transition " +
                    (dark
                      ? "border-white/10 bg-black/30 hover:bg-white/5"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                  href={`mailto:${profile.contact.email}`}
                >
                  <span className={"flex items-center gap-2 text-sm " + muted}>
                    <Mail size={16} /> {profile.contact.email}
                  </span>
                  <ArrowRight size={16} className={muted} />
                </a>

                <a
                  className={
                    "flex items-center justify-between rounded-xl border p-4 transition " +
                    (dark
                      ? "border-white/10 bg-black/30 hover:bg-white/5"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                  href={profile.contact.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className={"flex items-center gap-2 text-sm " + muted}>
                    <Github size={16} /> GitHub
                  </span>
                  <ArrowRight size={16} className={muted} />
                </a>

                <a
                  className={
                    "flex items-center justify-between rounded-xl border p-4 transition " +
                    (dark
                      ? "border-white/10 bg-black/30 hover:bg-white/5"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                  href={profile.contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className={"flex items-center gap-2 text-sm " + muted}>
                    <Linkedin size={16} /> LinkedIn
                  </span>
                  <ArrowRight size={16} className={muted} />
                </a>
              </div>

              <div className={"mt-6 text-xs " + muted}>
                Telefon: {profile.contact.phone}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-medium">Send a Message</div>
              <form
                className="mt-5 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Mesajınız göndərildi (demo). Email ilə də yaza bilərsiniz.");
                }}
              >
                <input
                  className={
                    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
                    (dark
                      ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                      : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                  }
                  placeholder="Your Name"
                />
                <input
                  type="email"
                  className={
                    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
                    (dark
                      ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                      : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                  }
                  placeholder="Your Email"
                />
                <textarea
                  rows={4}
                  className={
                    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition resize-none " +
                    (dark
                      ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                      : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                  }
                  placeholder="Your Message"
                />
                <Button variant="primary" tone={dark ? "dark" : "light"} className="justify-center">
                  Send Message <ArrowRight size={16} />
                </Button>
                <p className={"text-[11px] leading-relaxed " + muted}>
                  * Bu form demo kimidir. İstəsən sonradan EmailJS və ya backend ilə
                  real göndərmə əlavə edərik.
                </p>
              </form>
            </Card>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className={"pt-10 text-center text-xs " + muted}>
          © {new Date().getFullYear()} {profile.name}. Built with Next.js, Tailwind CSS & Framer Motion.
        </footer>
      </div>
    </div>
  );
}