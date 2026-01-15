"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  type Variants,
} from "framer-motion";
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
  Languages,
} from "lucide-react";

type Lang = "en" | "az";

type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
  status?: "Live" | "In progress" | "Coming soon";
  features?: string[];
};

/** ---------- UI small components ---------- */

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
    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
      {title}
    </h2>
    {subtitle ? (
      <p
        className={`mt-3 text-sm md:text-base max-w-2xl mx-auto ${subtitleClass ?? "text-white/60"
          }`}
      >
        {subtitle}
      </p>
    ) : null}
  </div>
);

const Pill = ({
  children,
  tone = "dark",
  hoverInvert = false,
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  hoverInvert?: boolean;
}) => {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs transition will-change-transform";
  const darkStyle = "border-white/10 bg-white/5 text-white/80";
  const lightStyle = "border-black/10 bg-black/5 text-black/70";

  const invertDark = "hover:bg-white hover:text-black hover:border-white/30";
  const invertLight = "hover:bg-black hover:text-white hover:border-black/30";

  return (
    <span
      className={
        base +
        " " +
        (tone === "dark" ? darkStyle : lightStyle) +
        (hoverInvert ? " " + (tone === "dark" ? invertDark : invertLight) : "")
      }
    >
      {children}
    </span>
  );
};

const Card = ({
  children,
  className = "",
  enableLayout = false,
  hoverLift = false,
  reduceMotion = false,
}: {
  children: React.ReactNode;
  className?: string;
  enableLayout?: boolean;
  hoverLift?: boolean;
  reduceMotion?: boolean;
}) => {
  const base =
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,.35)] " +
    "max-md:backdrop-blur-0 max-md:shadow-none " +
    className;

  return (
    <motion.div
      layout={enableLayout ? true : undefined}
      className={base}
      whileHover={hoverLift && !reduceMotion ? { y: -4 } : undefined}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
};

const Button = ({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  tone = "dark",
  hoverLift = false,
  reduceMotion = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  className?: string;
  tone?: "dark" | "light";
  hoverLift?: boolean;
  reduceMotion?: boolean;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] will-change-transform";

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
  const MotionComp: any = motion(Comp);

  return (
    <MotionComp
      href={href}
      onClick={(e: any) => {
        if (isHashLink) e.preventDefault();
        onClick?.();
      }}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className={`${base} ${styles} ${className}`}
      whileHover={hoverLift && !reduceMotion ? { y: -3 } : undefined}
      transition={{ duration: 0.18 }}
    >
      {children}
    </MotionComp>
  );
};

/** ---------- Active section observer ---------- */
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
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          );
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -60% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/** ---------- Motion helpers (performans-friendly) ---------- */
const makeReveal = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: reduce
      ? { duration: 0.01 }
      : { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
});

const makeStagger = (reduce: boolean, stagger = 0.085): Variants => ({
  hidden: {},
  show: {
    transition: reduce
      ? { duration: 0.01 }
      : { staggerChildren: stagger, delayChildren: 0.08 },
  },
});

/** ---------- Skill Row (bar soldan-sağa dolur) ---------- */
function SkillRow({
  name,
  level,
  dark,
  muted,
  reduceMotion,
}: {
  name: string;
  level: number;
  dark: boolean;
  muted: string;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  const track = dark ? "bg-white/10" : "bg-black/10";
  const fill = dark ? "bg-white" : "bg-black";
  const scaleX = Math.max(0, Math.min(1, level / 100));

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between text-sm">
        <span className={dark ? "text-white" : "text-black"}>{name}</span>
        <span className={muted}>{level}%</span>
      </div>

      <div className={"mt-2 h-2 rounded-full overflow-hidden " + track}>
        <motion.div
          className={"h-full rounded-full " + fill}
          style={{ transformOrigin: "left center" }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX } : { scaleX: 0 }}
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </div>
    </div>
  );
}

export default function Portfolio() {
  const reduceMotion = useReducedMotion();

  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>("en");

  const [cvOpen, setCvOpen] = useState(false);
  const cvRef = useRef<HTMLDivElement | null>(null);

  /** ✅ Refresh olanda həmişə Home-dan başlasın */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!cvRef.current) return;
      if (!cvRef.current.contains(e.target as Node)) setCvOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const t = useMemo(() => {
    const en = {
      nav: { home: "Home", about: "About", skills: "Skills", projects: "Projects", contact: "Contact" },
      hero: {
        title: "Junior Android Developer",
        headline:
          "I build user-friendly, performant, and reliable Android apps using modern Android technologies.",
        viewWork: "View My Work",
        projects: "Projects",
        contact: "Contact",
        downloadCV: "Download CV",
        scrollTip: "Scroll to projects",
      },
      about: {
        title: "About Me",
        subtitle: "I focus on clean code, solid architecture, and a great UX.",
        journeyTitle: "My Journey",
        journeyText:
          "I strengthen my skills by building real projects and continuously learning new technologies in Android development.",
        cards: {
          clean: "Readable, maintainable code structure.",
          ui: "Clean layouts and smooth UI animations with a modern approach.",
          user: "Simple, clear, user-friendly experiences.",
          perf: "Optimized behavior and fast screens.",
        },
      },
      skills: {
        title: "Skills & Technologies",
        subtitle: "Main technologies I use to build Android applications.",
        core: "Core Expertise",
        stack: "Technology Stack",
        tools: "Tools I use", // ✅ ƏLAVƏ ETDİM
        stat1: "Level",
        stat2: "Projects",
        stat3: "Learning",
      },
      projects: {
        title: "Featured Projects",
        subtitle: "Selected projects where I applied what I learned in practice.",
        viewGithub: "View on GitHub",
        askDetails: "Ask for details",
        features: "Key features",
      },
      contact: {
        title: "Let's Work Together",
        subtitle: "Have a project idea? Let's talk and create value together.",
        getInTouch: "Get in Touch",
        sendMsg: "Send a Message",
        phoneLabel: "Phone",
        form: {
          name: "Your Name",
          email: "Your Email",
          message: "Your Message",
          send: "Send Message",
          note:
            "* This form is a demo. Later we can add real sending via EmailJS or a backend.",
          alert: "Message sent (demo). You can also contact me via email.",
        },
      },
      footer: (name: string) =>
        `© ${new Date().getFullYear()} ${name}. Built with Next.js, Tailwind CSS & Framer Motion.`,
    };

    const az = {
      nav: { home: "Home", about: "Haqqımda", skills: "Bacarıqlar", projects: "Layihələr", contact: "Əlaqə" },
      hero: {
        title: "Junior Android Developer",
        headline:
          "Müasir Android texnologiyalarından istifadə edərək istifadəçi dostu, performanslı və etibarlı mobil tətbiqlər hazırlayıram.",
        viewWork: "İşlərimə bax",
        projects: "Layihələr",
        contact: "Əlaqə",
        downloadCV: "CV Yüklə",
        scrollTip: "Layihələrə keç",
      },
      about: {
        title: "Haqqımda",
        subtitle: "Səliqəli kod, stabil arxitektura və yaxşı UX üzərində fokuslanıram.",
        journeyTitle: "Yolum",
        journeyText:
          "Android sahəsində real layihələr üzərində işləyərək biliklərimi praktikada möhkəmləndirirəm və daim yeni texnologiyalar öyrənirəm.",
        cards: {
          clean: "Oxunaqlı və maintainable kod strukturu.",
          ui: "Material yanaşma, səliqəli layout və animasiyalar.",
          user: "İstifadəçiyə rahat, sadə və aydın təcrübə.",
          perf: "Optimallaşdırılmış iş prinsipi və sürətli ekranlar.",
        },
      },
      skills: {
        title: "Bacarıqlar və Texnologiyalar",
        subtitle: "Android tətbiqləri hazırlamaq üçün istifadə etdiyim əsas texnologiyalar.",
        core: "Əsas Bacarıqlar",
        stack: "Texnologiya Stack",
        tools: "İstifadə etdiyim alətlər", // ✅ AZ tərcümə
        stat1: "Səviyyə",
        stat2: "Layihə",
        stat3: "Öyrənmə",
      },
      projects: {
        title: "Layihələr",
        subtitle: "Öyrəndiklərimi praktikada tətbiq etdiyim seçilmiş layihələr.",
        viewGithub: "GitHub-da bax",
        askDetails: "Detallar üçün yaz",
        features: "Əsas xüsusiyyətlər",
      },
      contact: {
        title: "Birlikdə işləyək",
        subtitle: "Layihə ideyan var? Gəlin danışaq və birlikdə dəyər yaradaq.",
        getInTouch: "Əlaqə",
        sendMsg: "Mesaj göndər",
        phoneLabel: "Telefon",
        form: {
          name: "Adınız",
          email: "Email",
          message: "Mesajınız",
          send: "Göndər",
          note:
            "* Bu form demo kimidir. Sonradan EmailJS və ya backend ilə real göndərmə əlavə edərik.",
          alert: "Mesaj göndərildi (demo). Email ilə də yaza bilərsiniz.",
        },
      },
      footer: (name: string) =>
        `© ${new Date().getFullYear()} ${name}. Next.js, Tailwind CSS & Framer Motion ilə hazırlanıb.`,
    };

    return lang === "en" ? en : az;
  }, [lang]);

  const profile = useMemo(
    () => ({
      name: "Baxtiyar Alizada",
      title: t.hero.title,
      headline: t.hero.headline,
      about:
        lang === "en"
          ? "I’m a junior Android developer who’s curious, eager to learn, and effective in teamwork. I keep improving by applying my skills in real projects. My goal is to build reliable, high-quality apps that are comfortable to use and create value."
          : "Yeni texnologiyalara açıq, öyrənməyə maraqlı və komandada effektiv işləyən Junior Android Developerəm. Bilik və bacarıqlarımı real layihələrdə tətbiq edərək daim inkişaf etməyə çalışıram. Məqsədim istifadəsi rahat, etibarlı və keyfiyyətli mobil tətbiqlər hazırlayaraq dəyər yaratmaqdır.",
      focus:
        lang === "en"
          ? [
            "MVVM & Clean Architecture",
            "Async programming (Coroutines, Flow)",
            "REST API integration",
            "Working with new technologies",
          ]
          : [
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
    [lang, t.hero.title, t.hero.headline, t]
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

  const tools = useMemo(
    () => [
      "Android Studio",
      "Git & GitHub",
      "Figma",
      "Postman",
      "Firebase Console",
      "Gradle",
      "Jira / Trello",
    ],
    []
  );


  const projects = useMemo<Project[]>(
    () => [
      {
        title: "Mova",
        status: "Live",
        description:
          lang === "en"
            ? "ATL Academy final project — an Android app for movie enthusiasts. Browse trending/top-rated titles, explore details, and deliver a smooth, responsive experience with MVVM and Retrofit-based API integration."
            : "ATL Academy final layihəsi — film həvəskarları üçün Android tətbiqi. Trend/Top Rated siyahılarını izləmək, film detallarına baxmaq və rahat istifadə təcrübəsi üçün MVVM + Retrofit ilə API inteqrasiyası tətbiq olunub.",
        tech: ["Kotlin", "MVVM", "Retrofit", "Coroutines", "Flow"],
        link: "https://github.com/Baxtiyar09/moviesApp",
        features:
          lang === "en"
            ? ["Search + quick filtering", "Favorites / watchlist flow", "Detail screen with cast info"]
            : ["Axtarış + sürətli filter", "Seçilmişlər / izləmə siyahısı", "Detallar + aktyorlar bölməsi"],
      },
      {
        title: "HeyatYolu",
        status: "In progress",
        description:
          lang === "en"
            ? "A digital memory platform for preserving stories and memories of loved ones. Built with real backend integration, structured content management, onboarding flow, and stable UI states such as loading and empty screens."
            : "Yaxınlarını itirmiş insanlar üçün xatirələrin rəqəmsal formada saxlanması üçün hazırlanmış platforma. Real backend inteqrasiyası, strukturlaşdırılmış kontent idarəetməsi, onboarding axını və loading/empty state kimi stabil UI həlləri mövcuddur.",
        tech: ["Kotlin", "MVVM", "Backend API", "Authentication"],
        features:
          lang === "en"
            ? ["Secure sign-in & sessions", "Media upload + preview", "Role-based content access"]
            : ["Giriş (auth) + sessiya idarəsi", "Media əlavə etmə + preview", "İcazələrə görə kontent erişimi"],
      },
      {
        title: "Herrac",
        status: "Coming soon",
        description:
          lang === "en"
            ? "An upcoming e-commerce style project planned for Google Play after the next phase. Focused on clean architecture, scalable structure, and performance-friendly UI with modern Android practices."
            : "Növbəti mərhələdən sonra Google Play üçün planlaşdırılan e-commerce tipli layihə. Clean Architecture, genişlənə bilən struktur və performans yönümlü modern UI yanaşması üzərində qurulur.",
        tech: ["Clean Architecture", "Performance", "Modern UI"],
        features:
          lang === "en"
            ? ["Product listing + categories", "Cart & checkout concept", "Offline-friendly caching plan"]
            : ["Məhsul siyahısı + kateqoriyalar", "Səbət + checkout konsepti", "Offline cache planı"],
      },
      {
        title: "Astrology App",
        status: "Coming soon",
        description:
          lang === "en"
            ? "A zodiac-focused app with daily/weekly insights and clean content presentation. Planned features include API-driven predictions, smooth navigation, and a modern UI built for readability."
            : "Bürclər üçün gündəlik/həftəlik proqnozlar və səliqəli kontent təqdimatı edən tətbiq. API ilə proqnoz məlumatları, rahat naviqasiya və oxunaqlı modern UI üzərində planlaşdırılır.",
        tech: ["REST API", "Kotlin", "Modern UI"],
        features:
          lang === "en"
            ? ["Daily / weekly cards", "Shareable insight snippets", "Saved sign preferences"]
            : ["Gündəlik / həftəlik kartlar", "Paylaşılabilən qısa mətnlər", "Seçilmiş bürclər yadda saxlanır"],
      },
    ],
    [lang]
  );

  const sections = useMemo(
    () => [
      { id: "home", label: t.nav.home },
      { id: "about", label: t.nav.about },
      { id: "skills", label: t.nav.skills },
      { id: "projects", label: t.nav.projects },
      { id: "contact", label: t.nav.contact },
    ],
    [t]
  );

  const active = useActiveSection(sections.map((s) => s.id));

  const bg = dark ? "bg-[#07080a] text-white" : "bg-white text-[#0b0d12]";
  const muted = dark ? "text-white/60" : "text-black/55";
  const navBg = dark ? "bg-black/50" : "bg-white/70";
  const border = dark ? "border-white/10" : "border-black/10";

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // motion variants
  const reveal = makeReveal(!!reduceMotion);
  const stagger = makeStagger(!!reduceMotion, 0.085);
  const heroStagger = makeStagger(!!reduceMotion, 0.14);

  const enableLayout = true;

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Ambient (MOBIL-də söndürülüb) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden max-md:hidden">
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

      {/* Navbar (MOBIL-də blur söndürülüb) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 ${navBg} border-b ${border} backdrop-blur-md max-md:backdrop-blur-0`}
      >
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
            {/* Language toggle */}
            <button
              onClick={() => setLang((v) => (v === "en" ? "az" : "en"))}
              className={
                "h-9 w-9 grid place-items-center rounded-xl border transition " +
                (dark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-black/10 bg-black/5 hover:bg-black/10")
              }
              aria-label="Toggle language"
              title={lang === "en" ? "Switch to Azerbaijani" : "İngiliscəyə keç"}
            >
              <Languages size={16} />
            </button>

            {/* Theme toggle */}
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
            variants={heroStagger}
            initial="hidden"
            animate="show"
            className="text-center max-w-3xl"
          >
            <motion.p
              variants={reveal}
              className={"text-xs uppercase tracking-[0.25em] " + muted}
            >
              {profile.title}
            </motion.p>

            <motion.h1
              variants={reveal}
              className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight"
            >
              {profile.name}
            </motion.h1>

            <motion.p
              variants={reveal}
              className={"mt-5 text-sm md:text-base leading-relaxed " + muted}
            >
              {profile.headline}
            </motion.p>

            <motion.div
              variants={reveal}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              {/* Desktop / Tablet CTAs */}
              <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
                <div className="relative group">
                  <Button
                    variant="primary"
                    tone={dark ? "dark" : "light"}
                    onClick={() => scrollTo("projects")}
                    className="min-w-[160px]"
                    hoverLift
                    reduceMotion={!!reduceMotion}
                  >
                    {t.hero.viewWork}
                    <motion.span
                      aria-hidden
                      animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                      transition={
                        reduceMotion
                          ? undefined
                          : { duration: 1.1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
                      }
                      className="inline-flex"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </Button>

                  <div
                    className={
                      "pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg border px-3 py-1 text-[11px] opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 " +
                      (dark
                        ? "border-white/10 bg-black/70 text-white/80"
                        : "border-black/10 bg-white/90 text-black/70")
                    }
                  >
                    {t.hero.scrollTip}
                  </div>
                </div>

                <Button
                  href={profile.contact.github}
                  variant="outline"
                  tone={dark ? "dark" : "light"}
                  className="min-w-[140px]"
                  hoverLift
                  reduceMotion={!!reduceMotion}
                >
                  <Github size={16} /> GitHub
                </Button>

                <Button
                  href={profile.contact.linkedin}
                  variant="outline"
                  tone={dark ? "dark" : "light"}
                  className="min-w-[140px]"
                  hoverLift
                  reduceMotion={!!reduceMotion}
                >
                  <Linkedin size={16} /> LinkedIn
                </Button>

                <Button
                  href={`mailto:${profile.contact.email}`}
                  variant="outline"
                  tone={dark ? "dark" : "light"}
                  className="min-w-[140px]"
                  hoverLift
                  reduceMotion={!!reduceMotion}
                >
                  <Mail size={16} /> {t.hero.contact}
                </Button>
              </div>

              {/* Mobile CTAs */}
              <div className="flex sm:hidden w-full max-w-sm mx-auto gap-3">
                <Button
                  variant="primary"
                  tone={dark ? "dark" : "light"}
                  onClick={() => scrollTo("projects")}
                  className="flex-1"
                  hoverLift
                  reduceMotion={!!reduceMotion}
                >
                  {t.hero.projects}
                  <motion.span
                    aria-hidden
                    animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                    transition={
                      reduceMotion
                        ? undefined
                        : { duration: 1.1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
                    }
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
                  hoverLift
                  reduceMotion={!!reduceMotion}
                >
                  <Mail size={16} /> {t.hero.contact}
                </Button>
              </div>
            </motion.div>

            {/* Download CV (dropdown) */}
            <motion.div
              variants={reveal}
              className="relative mt-4 flex justify-center"
              ref={cvRef}
            >
              <Button
                variant="outline"
                tone={dark ? "dark" : "light"}
                onClick={() => setCvOpen((v) => !v)}
                className="min-w-[160px]"
                hoverLift
                reduceMotion={!!reduceMotion}
              >
                {t.hero.downloadCV}
                <motion.span
                  aria-hidden
                  animate={
                    reduceMotion
                      ? undefined
                      : { rotate: cvOpen ? 180 : 0, y: cvOpen ? 0 : [0, 4, 0] }
                  }
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                        rotate: { duration: 0.18 },
                        y: {
                          duration: 1.2,
                          repeat: cvOpen ? 0 : Infinity,
                          ease: [0.4, 0, 0.2, 1],
                        },
                      }
                  }
                  className="inline-flex"
                >
                  <ChevronDown size={16} />
                </motion.span>
              </Button>

              <motion.div
                initial={false}
                animate={cvOpen ? "open" : "closed"}
                variants={{
                  open: { opacity: 1, y: 8, pointerEvents: "auto" },
                  closed: { opacity: 0, y: 0, pointerEvents: "none" },
                }}
                transition={{ duration: 0.18, ease: [0.2, 0.9, 0.2, 1] }}
                className={
                  "absolute left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl border overflow-hidden " +
                  "shadow-[0_18px_60px_rgba(0,0,0,.55)] backdrop-blur-md " +
                  "max-md:shadow-none max-md:backdrop-blur-0 " +
                  (dark ? "border-white/10 bg-black/70" : "border-black/10 bg-white/90")
                }
              >
                <a
                  href="/Baxtiyar_Alizada_CV_EN.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className={
                    "flex items-center justify-between px-4 py-3 text-sm transition " +
                    (dark ? "text-white/90 hover:bg-white/10" : "text-black/80 hover:bg-black/5")
                  }
                  onClick={() => setCvOpen(false)}
                >
                  <span>CV (EN)</span>
                  <ArrowRight size={16} className={dark ? "text-white/60" : "text-black/50"} />
                </a>

                <div className={dark ? "h-px bg-white/10" : "h-px bg-black/10"} />

                <a
                  href="/Baxtiyar_Alizada_CV_AZ.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className={
                    "flex items-center justify-between px-4 py-3 text-sm transition " +
                    (dark ? "text-white/90 hover:bg-white/10" : "text-black/80 hover:bg-black/5")
                  }
                  onClick={() => setCvOpen(false)}
                >
                  <span>CV (AZ)</span>
                  <ArrowRight size={16} className={dark ? "text-white/60" : "text-black/50"} />
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ABOUT */}
        <motion.section
          id="about"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="py-20"
        >
          <motion.div variants={reveal}>
            <SectionTitle title={t.about.title} subtitle={t.about.subtitle} subtitleClass={muted} />
          </motion.div>

          {/* ✅ About pills: hover invert */}
          <motion.div
            variants={reveal}
            className="mt-6 mb-10 flex flex-wrap items-center justify-center gap-2"
          >
            {profile.focus.map((f) => (
              <Pill
                tone={dark ? "dark" : "light"}
                hoverInvert
                key={f}
              >
                {f}
              </Pill>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div variants={reveal} className="lg:col-span-2">
              <Card reduceMotion={!!reduceMotion} hoverLift className="p-6">
                <p className={"text-sm leading-relaxed " + muted}>{profile.about}</p>

                <motion.div variants={stagger} className="mt-6 grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Clean Code", text: t.about.cards.clean },
                    { title: "Modern UI/UX", text: t.about.cards.ui },
                    { title: "User-Centered", text: t.about.cards.user },
                    { title: "Performance", text: t.about.cards.perf },
                  ].map((item) => (
                    <motion.div
                      key={item.title}
                      variants={reveal}
                      whileHover={!reduceMotion ? { y: -3 } : undefined}
                      transition={{ duration: 0.18 }}
                      className={
                        "rounded-xl border p-4 " +
                        (dark ? "border-white/10 bg-black/30" : "border-black/10 bg-white")
                      }
                    >
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className={"mt-1 text-xs " + muted}>{item.text}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </motion.div>

            <motion.div variants={reveal}>
              <Card reduceMotion={!!reduceMotion} hoverLift className="p-6">
                <div className="text-sm font-medium">{t.about.journeyTitle}</div>
                <p className={"mt-2 text-sm leading-relaxed " + muted}>{t.about.journeyText}</p>
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
            </motion.div>
          </div>
        </motion.section>

        {/* SKILLS */}
        <motion.section
          id="skills"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="py-20"
        >
          <motion.div variants={reveal}>
            <SectionTitle title={t.skills.title} subtitle={t.skills.subtitle} subtitleClass={muted} />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div variants={reveal} className="lg:col-span-2">
              <Card className="p-6" reduceMotion={!!reduceMotion}>
                <div className="text-sm font-medium mb-4">{t.skills.core}</div>
                <div className="grid gap-4">
                  {skills.map((s) => (
                    <SkillRow
                      key={s.name}
                      name={s.name}
                      level={s.level}
                      dark={dark}
                      muted={muted}
                      reduceMotion={!!reduceMotion}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={reveal}>
              <Card className="p-6" reduceMotion={!!reduceMotion}>
                <div className="text-sm font-medium mb-4">{t.skills.stack}</div>

                <div className="flex flex-wrap gap-2">
                  {techTags.map((tag) => (
                    <Pill key={tag} tone={dark ? "dark" : "light"} hoverInvert>
                      {tag}
                    </Pill>
                  ))}
                </div>

                {/* Tools I use */}
                <div className="mt-6">
                  <div className="text-sm font-medium mt-4">
                    {t.skills.tools}
                  </div>


                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <Pill
                        key={tool}
                        tone={dark ? "dark" : "light"}
                        hoverInvert
                      >
                        {tool}
                      </Pill>
                    ))}
                  </div>

                </div>
              </Card>
            </motion.div>

          </div>



          {/* ✅ Stats card: iki kartın altına ayrıca */}
          <motion.div variants={reveal} className="mt-6">
            <Card className="p-5" reduceMotion={!!reduceMotion}>
              <div
                className={
                  "rounded-2xl border p-5 text-center " +
                  (dark ? "border-white/10 bg-black/30" : "border-black/10 bg-white")
                }
              >
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { big: "Junior", small: t.skills.stat1 },
                    { big: "4+", small: t.skills.stat2 },
                    { big: "100%", small: t.skills.stat3 },
                  ].map((s) => (
                    <motion.div
                      key={s.big}
                      whileHover={!reduceMotion ? { scale: 1.06 } : undefined}
                      transition={{ duration: 0.18 }}
                      className="cursor-default"
                    >
                      <div className="text-2xl font-semibold">{s.big}</div>
                      <div className={"text-xs mt-1 " + muted}>{s.small}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.section>

        {/* PROJECTS */}
        <motion.section
          id="projects"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="py-20"
        >
          <motion.div variants={reveal}>
            <SectionTitle title={t.projects.title} subtitle={t.projects.subtitle} subtitleClass={muted} />
          </motion.div>

          <motion.div variants={stagger} className="grid md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <motion.div
                key={p.title}
                variants={reveal}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card enableLayout={enableLayout} reduceMotion={!!reduceMotion} className="p-6 h-full">
                  <motion.div layout="position" className="flex items-center justify-between gap-3">
                    <motion.h3 layout="position" className="text-lg font-semibold tracking-tight">
                      {p.title}
                    </motion.h3>

                    {p.status ? (
                      <motion.span
                        layout="position"
                        className={
                          "text-[11px] rounded-full px-2.5 py-1 border " +
                          (dark
                            ? "border-white/10 bg-white/5 text-white/80"
                            : "border-black/10 bg-black/5 text-black/70")
                        }
                      >
                        {p.status}
                      </motion.span>
                    ) : null}
                  </motion.div>

                  <motion.p layout="position" className={"mt-2 text-sm leading-relaxed " + muted}>
                    {p.description}
                  </motion.p>

                  {p.features?.length ? (
                    <motion.div layout="position" className="mt-4">
                      <div className={"text-[11px] uppercase tracking-[0.18em] " + muted}>
                        {t.projects.features}
                      </div>
                      <ul className={"mt-2 text-sm " + muted}>
                        {p.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <span className={dark ? "text-white/60" : "text-black/50"}>•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}

                  {/* ✅ Project tech pills: hover invert */}
                  <motion.div layout="position" className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((tech) => (
                      <Pill
                        tone={dark ? "dark" : "light"}
                        hoverInvert
                        key={tech}
                      >
                        {tech}
                      </Pill>
                    ))}
                  </motion.div>

                  <motion.div layout="position" className="mt-6">
                    {p.link ? (
                      <Button
                        href={p.link}
                        variant="outline"
                        tone={dark ? "dark" : "light"}
                        hoverLift
                        reduceMotion={!!reduceMotion}
                      >
                        <Github size={16} /> {t.projects.viewGithub}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        tone={dark ? "dark" : "light"}
                        onClick={() => scrollTo("contact")}
                        hoverLift
                        reduceMotion={!!reduceMotion}
                      >
                        <Mail size={16} /> {t.projects.askDetails}
                      </Button>
                    )}
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* CONTACT */}
        <motion.section
          id="contact"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          className="py-20"
        >
          <motion.div variants={reveal}>
            <SectionTitle title={t.contact.title} subtitle={t.contact.subtitle} subtitleClass={muted} />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div variants={reveal}>
              <Card className="p-6" reduceMotion={!!reduceMotion} hoverLift>
                <div className="text-sm font-medium">{t.contact.getInTouch}</div>

                <div className="mt-5 grid gap-3">
                  {[
                    {
                      label: profile.contact.email,
                      href: `mailto:${profile.contact.email}`,
                      icon: <Mail size={16} />,
                    },
                    {
                      label: "GitHub",
                      href: profile.contact.github,
                      icon: <Github size={16} />,
                      external: true,
                    },
                    {
                      label: "LinkedIn",
                      href: profile.contact.linkedin,
                      icon: <Linkedin size={16} />,
                      external: true,
                    },
                  ].map((item, idx) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      className={
                        "flex items-center justify-between rounded-xl border p-4 transition " +
                        (dark
                          ? "border-white/10 bg-black/30 hover:bg-white/5"
                          : "border-black/10 bg-white hover:bg-black/5")
                      }
                    >
                      <span className={"flex items-center gap-2 text-sm " + muted}>
                        {item.icon} {item.label}
                      </span>

                      <motion.span
                        className={muted}
                        animate={reduceMotion ? { x: 0 } : { x: [0, 6, 0] }}
                        transition={
                          reduceMotion
                            ? { duration: 0.01 }
                            : {
                              duration: 0.9,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: idx * 0.18,
                              repeatDelay: 0.35,
                            }
                        }
                      >
                        <ArrowRight size={16} />
                      </motion.span>
                    </a>
                  ))}

                </div>

                <div className={"mt-6 text-xs " + muted}>
                  {t.contact.phoneLabel}: {profile.contact.phone}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={reveal}>
              <Card className="p-6" reduceMotion={!!reduceMotion} hoverLift>
                <div className="text-sm font-medium">{t.contact.sendMsg}</div>

                <form
                  className="mt-5 grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(t.contact.form.alert);
                  }}
                >
                  <input
                    className={
                      "w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
                      (dark
                        ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                        : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                    }
                    placeholder={t.contact.form.name}
                  />

                  <input
                    type="email"
                    className={
                      "w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
                      (dark
                        ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                        : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                    }
                    placeholder={t.contact.form.email}
                  />

                  <textarea
                    rows={4}
                    className={
                      "w-full rounded-xl border px-4 py-3 text-sm outline-none transition resize-none " +
                      (dark
                        ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                        : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                    }
                    placeholder={t.contact.form.message}
                  />
                  <Button
                    variant="primary"
                    tone={dark ? "dark" : "light"}
                    className="justify-center"
                    hoverLift
                    reduceMotion={!!reduceMotion}
                  >
                    {t.contact.form.send}
                    <motion.span
                      aria-hidden
                      className="inline-flex"
                      animate={reduceMotion ? { x: 0 } : { x: [0, 6, 0] }}
                      transition={
                        reduceMotion
                          ? { duration: 0.01 }
                          : { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                      }
                    >
                      <ArrowRight size={16} />
                    </motion.span>
                  </Button>


                  <p className={"text-[11px] leading-relaxed " + muted}>
                    {t.contact.form.note}
                  </p>
                </form>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className={"pt-10 text-center text-xs " + muted}>
          {t.footer(profile.name)}
        </footer>
      </div>
    </div>
  );
}
