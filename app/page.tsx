"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  type Variants,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
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
    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
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

/**
 * ✅ Card (fix):
 * - border YOX (cərçivə görünmür)
 * - light mode mobil də görünür
 * - mobil shadow NONE deyil (az shadow var)
 * - hover zamanı yumşaq glow shadow
 */
const Card = ({
  children,
  className = "",
  enableLayout = false,
  hoverLift = false,
  reduceMotion = false,
  tone = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  enableLayout?: boolean;
  hoverLift?: boolean;
  reduceMotion?: boolean;
  tone?: "dark" | "light";
}) => {
  const themed =
    tone === "dark"
      ? "bg-white/5"
      : "bg-black/[0.04]"; // ✅ white mode: görünən arxa fon

  const base =
    "rounded-2xl backdrop-blur-md transition-shadow duration-300 " +
    // ✅ default shadow + mobile-də də az shadow
    "shadow-[0_10px_40px_rgba(0,0,0,.35)] max-md:backdrop-blur-0 max-md:shadow-[0_8px_24px_rgba(0,0,0,.12)] " +
    themed +
    " " +
    className;

  const hoverShadowDark = "0 18px 60px rgba(255,255,255,0.10)";
  const hoverShadowLight = "0 18px 60px rgba(0,0,0,0.10)";

  return (
    <motion.div
      layout={enableLayout ? true : undefined}
      className={base}
      whileHover={
        reduceMotion
          ? undefined
          : {
            y: hoverLift ? -3 : 0,
            boxShadow: tone === "dark" ? hoverShadowDark : hoverShadowLight,
          }
      }
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
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

/** ---------- Motion helpers ---------- */
const makeReveal = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: reduce
      ? { duration: 0.01 }
      : { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
});

const makeStagger = (reduce: boolean, stagger = 0.085): Variants => ({
  hidden: {},
  show: {
    transition: reduce
      ? { duration: 0.01 }
      : { staggerChildren: stagger, delayChildren: 0.10 },
  },
});

/** ✅ Yumşaq flip (sert deyil) */
const makeFlipY = (reduce: boolean, delay = 0): Variants => ({
  hidden: reduce ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 14, rotateY: 50 },
  show: reduce
    ? { opacity: 1, y: 0, rotateY: 0, transition: { duration: 0.01 } }
    : {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.95,
        ease: [0.12, 1, 0.25, 1],
        delay,
      },
    },
});

const makeFlipX = (reduce: boolean, delay = 0): Variants => ({
  hidden: reduce ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 14, rotateX: 45 },
  show: reduce
    ? { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.01 } }
    : {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.95,
        ease: [0.12, 1, 0.25, 1],
        delay,
      },
    },
});

const makeSlideTilt = (
  reduce: boolean,
  from: "left" | "right",
  delay = 0
): Variants => {
  const x = from === "left" ? -22 : 22;
  const r = from === "left" ? -4 : 4;
  return {
    hidden: reduce ? { opacity: 1, x: 0, rotate: 0 } : { opacity: 0, x, rotate: r },
    show: reduce
      ? { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.01 } }
      : {
        opacity: 1,
        x: 0,
        rotate: 0,
        transition: {
          duration: 0.85,
          ease: [0.12, 1, 0.25, 1],
          delay,
        },
      },
  };
};

/** ---------- Animated number (0 -> target on view) ---------- */
function AnimatedNumber({
  value,
  suffix = "",
  className = "",
  reduceMotion,
  duration = 1.05,
}: {
  value: number;
  suffix?: string;
  className?: string;
  reduceMotion: boolean;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 22, mass: 0.9 }); // ✅ yumşaq
  const rounded = useTransform(spring, (v) => Math.round(v));

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      mv.set(value);
      return;
    }
    // ✅ smooth count-up
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, value, mv, reduceMotion, duration]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{reduceMotion ? value : rounded}</motion.span>
      {suffix}
    </span>
  );
}

/** ---------- Skill Row (bar + % text 0-dan animasiya) ---------- */
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

        <span className={muted}>
          {inView ? (
            <AnimatedNumber value={level} suffix="%" reduceMotion={reduceMotion} duration={1.1} />
          ) : (
            "0%"
          )}
        </span>
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
              : { duration: 1.25, ease: [0.22, 1, 0.36, 1] } // ✅ yumşaq
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

  // ✅ Contact form state
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
    server?: string;
  }>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

  const validateForm = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = lang === "en" ? "Name is required." : "Ad vacibdir.";
    if (!form.email.trim()) e.email = lang === "en" ? "Email is required." : "Email vacibdir.";
    else if (!validateEmail(form.email.trim()))
      e.email = lang === "en" ? "Enter a valid email." : "Düzgün email daxil et.";
    if (!form.message.trim()) e.message = lang === "en" ? "Message is required." : "Mesaj vacibdir.";
    return e;
  };

  /** ✅ Refresh olanda həmişə Home-dan başlasın */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
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
        headline: "I build user-friendly, performant, and reliable Android apps using modern Android technologies.",
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
        journeyText: "I strengthen my skills by building real projects and continuously learning new technologies in Android development.",
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
        tools: "Tools I use",
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
          note: "* This form is a demo. Later we can add real sending via EmailJS or a backend.",
        },
      },
      footer: (name: string) => `© ${new Date().getFullYear()} ${name}. Built with Next.js, Tailwind CSS & Framer Motion.`,
    };

    const az = {
      nav: { home: "Home", about: "Haqqımda", skills: "Bacarıqlar", projects: "Layihələr", contact: "Əlaqə" },
      hero: {
        title: "Junior Android Developer",
        headline: "Müasir Android texnologiyalarından istifadə edərək istifadəçi dostu, performanslı və etibarlı mobil tətbiqlər hazırlayıram.",
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
        journeyText: "Android sahəsində real layihələr üzərində işləyərək biliklərimi praktikada möhkəmləndirirəm və daim yeni texnologiyalar öyrənməyə davam edirəm.",
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
        tools: "İstifadə etdiyim alətlər",
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
        form: { name: "Adınız", email: "Email", message: "Mesajınız", send: "Göndər", note: "* Bu form demo kimidir. Sonradan real göndərmə əlavə edərik." },
      },
      footer: (name: string) => `© ${new Date().getFullYear()} ${name}. Next.js, Tailwind CSS & Framer Motion ilə hazırlanıb.`,
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
          ? "I’m a junior Android developer who’s curious, eager to learn, and effective in teamwork. I keep improving by applying my skills in real projects."
          : "Yeni texnologiyalara açıq, öyrənməyə maraqlı və komandada effektiv işləyən Junior Android Developerəm. Bilik və bacarıqlarımı real layihələrdə tətbiq edərək daim inkişaf etməyə çalışıram.",
      focus:
        lang === "en"
          ? ["MVVM & Clean Architecture", "Async programming (Coroutines, Flow)", "REST API integration", "Working with new technologies"]
          : ["MVVM & Clean Architecture", "Asinxron proqramlaşdırma (Coroutines, Flow)", "REST API inteqrasiyası", "Yeni texnologiyalarla işləmək"],
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
    () => ["Android Studio", "Git & GitHub", "Figma", "Postman", "Firebase Console", "Gradle", "Jira / Trello"],
    []
  );

  const projects = useMemo<Project[]>(
    () => [
      {
        title: "Mova",
        status: "Live",
        description:
          lang === "en"
            ? "ATL Academy final project — an Android app for movie enthusiasts. Browse trending/top-rated titles, explore details, and deliver a smooth experience."
            : "ATL Academy final layihəsi — film həvəskarları üçün Android tətbiqi. Trend/Top Rated siyahılarını izləmək və film detallarına baxmaq üçün hazırlanıb.",
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
            ? "A digital memory platform for preserving stories and memories of loved ones. Built with real backend integration and stable UI states."
            : "Yaxınlarını itirmiş insanlar üçün xatirələrin rəqəmsal formada saxlanması üçün hazırlanmış platforma. Real backend inteqrasiyası və stabil UI state-lər mövcuddur.",
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
            ? "An upcoming e-commerce style project planned for Google Play after the next phase."
            : "Növbəti mərhələdən sonra Google Play üçün planlaşdırılan e-commerce tipli layihə.",
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
            ? "A zodiac-focused app with daily/weekly insights and clean content presentation."
            : "Bürclər üçün gündəlik/həftəlik proqnozlar və səliqəli kontent təqdimatı edən tətbiq.",
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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reveal = makeReveal(!!reduceMotion);
  const stagger = makeStagger(!!reduceMotion, 0.085);
  const heroStagger = makeStagger(!!reduceMotion, 0.14);

  const enableLayout = true;

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Ambient */}
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

      {/* Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${navBg} border-b ${dark ? "border-white/10" : "border-black/10"} backdrop-blur-md max-md:backdrop-blur-0`}>
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <button onClick={() => scrollTo("home")} className="text-sm font-semibold tracking-wide">
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
                  <span className={"px-2 py-1 rounded-lg " + (isActive ? (dark ? "bg-white/10" : "bg-black/5") : "")}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((v) => (v === "en" ? "az" : "en"))}
              className={
                "h-9 w-9 grid place-items-center rounded-xl border transition " +
                (dark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-black/5 hover:bg-black/10")
              }
              aria-label="Toggle language"
            >
              <Languages size={16} />
            </button>

            <button
              onClick={() => setDark((v) => !v)}
              className={
                "h-9 w-9 grid place-items-center rounded-xl border transition " +
                (dark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-black/10 bg-black/5 hover:bg-black/10")
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
          <motion.div variants={heroStagger} initial="hidden" animate="show" className="text-center max-w-3xl">
            <motion.p variants={reveal} className={"text-xs uppercase tracking-[0.25em] " + muted}>
              {profile.title}
            </motion.p>

            <motion.h1 variants={reveal} className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight">
              {profile.name}
            </motion.h1>

            <motion.p variants={reveal} className={"mt-5 text-sm md:text-base leading-relaxed " + muted}>
              {profile.headline}
            </motion.p>

            <motion.div variants={reveal} className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
                      transition={reduceMotion ? undefined : { duration: 1.1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                      className="inline-flex"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </Button>
                </div>

                <Button href={profile.contact.github} variant="outline" tone={dark ? "dark" : "light"} hoverLift reduceMotion={!!reduceMotion}>
                  <Github size={16} /> GitHub
                </Button>

                <Button href={profile.contact.linkedin} variant="outline" tone={dark ? "dark" : "light"} hoverLift reduceMotion={!!reduceMotion}>
                  <Linkedin size={16} /> LinkedIn
                </Button>

                <Button href={`mailto:${profile.contact.email}`} variant="outline" tone={dark ? "dark" : "light"} hoverLift reduceMotion={!!reduceMotion}>
                  <Mail size={16} /> {t.hero.contact}
                </Button>
              </div>

              <div className="flex sm:hidden w-full max-w-sm mx-auto gap-3">
                <Button variant="primary" tone={dark ? "dark" : "light"} onClick={() => scrollTo("projects")} className="flex-1" hoverLift reduceMotion={!!reduceMotion}>
                  {t.hero.projects}
                  <motion.span
                    aria-hidden
                    animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                    transition={reduceMotion ? undefined : { duration: 1.1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                    className="inline-flex"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </Button>

                <Button href={`mailto:${profile.contact.email}`} variant="outline" tone={dark ? "dark" : "light"} className="flex-1" hoverLift reduceMotion={!!reduceMotion}>
                  <Mail size={16} /> {t.hero.contact}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-20">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.22 }}>
            <motion.div variants={reveal}>
              <SectionTitle title={t.about.title} subtitle={t.about.subtitle} subtitleClass={muted} />
            </motion.div>

            <motion.div variants={reveal} className="mt-6 mb-10 flex flex-wrap items-center justify-center gap-2">
              {profile.focus.map((f) => (
                <Pill tone={dark ? "dark" : "light"} hoverInvert key={f}>
                  {f}
                </Pill>
              ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6" style={{ perspective: 1200 }}>
              <motion.div variants={makeFlipX(!!reduceMotion, 0)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="lg:col-span-2">
                <Card tone={dark ? "dark" : "light"} reduceMotion={!!reduceMotion} hoverLift className="p-6">
                  <p className={"text-sm leading-relaxed " + muted}>{profile.about}</p>

                  <motion.div variants={makeStagger(!!reduceMotion, 0.09)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} className="mt-6 grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "Clean Code", text: t.about.cards.clean },
                      { title: "Modern UI/UX", text: t.about.cards.ui },
                      { title: "User-Centered", text: t.about.cards.user },
                      { title: "Performance", text: t.about.cards.perf },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.title}
                        variants={{
                          hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12, rotateZ: -2 },
                          show: reduceMotion
                            ? { opacity: 1, y: 0, rotateZ: 0, transition: { duration: 0.01 } }
                            : {
                              opacity: 1,
                              y: 0,
                              rotateZ: 0,
                              transition: { duration: 0.75, ease: [0.12, 1, 0.25, 1], delay: idx * 0.07 },
                            },
                        }}
                        whileHover={!reduceMotion ? { y: -3 } : undefined}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className={"rounded-xl p-4 " + (dark ? "bg-black/30" : "bg-white")}
                      >
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className={"mt-1 text-xs " + muted}>{item.text}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>

              <motion.div variants={makeFlipY(!!reduceMotion, 0.12)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
                <Card tone={dark ? "dark" : "light"} reduceMotion={!!reduceMotion} hoverLift className="p-6">
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
          </motion.div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="py-20">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.22 }}>
            <motion.div variants={reveal}>
              <SectionTitle title={t.skills.title} subtitle={t.skills.subtitle} subtitleClass={muted} />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div variants={makeSlideTilt(!!reduceMotion, "left", 0)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="lg:col-span-2">
                <Card tone={dark ? "dark" : "light"} className="p-6" reduceMotion={!!reduceMotion} hoverLift>
                  <div className="text-sm font-medium mb-4">{t.skills.core}</div>
                  <div className="grid gap-4">
                    {skills.map((s) => (
                      <SkillRow key={s.name} name={s.name} level={s.level} dark={dark} muted={muted} reduceMotion={!!reduceMotion} />
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={makeSlideTilt(!!reduceMotion, "right", 0.12)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
                <Card tone={dark ? "dark" : "light"} className="p-6" reduceMotion={!!reduceMotion} hoverLift>
                  <div className="text-sm font-medium mb-4">{t.skills.stack}</div>

                  <div className="flex flex-wrap gap-2">
                    {techTags.map((tag) => (
                      <Pill key={tag} tone={dark ? "dark" : "light"} hoverInvert>
                        {tag}
                      </Pill>
                    ))}
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-medium mt-4">{t.skills.tools}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tools.map((tool) => (
                        <Pill key={tool} tone={dark ? "dark" : "light"} hoverInvert>
                          {tool}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* ✅ Stats: wrapper hover YOX, border YOX, yalnız item hover */}
            <motion.div variants={reveal} className="mt-6">
              <Card tone={dark ? "dark" : "light"} className="p-5" reduceMotion={!!reduceMotion} hoverLift={false}>
                <div className={"rounded-2xl p-5 text-center " + (dark ? "bg-black/30" : "bg-white")}>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: "junior" as const, label: t.skills.stat1 },
                      { type: "projects" as const, label: t.skills.stat2 },
                      { type: "learning" as const, label: t.skills.stat3 },
                    ].map((s, idx) => (
                      <motion.div
                        key={s.type}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                              scale: 1.05,
                              boxShadow: dark ? "0 14px 44px rgba(255,255,255,0.10)" : "0 14px 44px rgba(0,0,0,0.12)",
                            }
                        }
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className={"rounded-2xl p-4 " + (dark ? "bg-white/5" : "bg-black/[0.04]")}
                      >
                        <div className="text-2xl font-semibold">
                          {s.type === "junior" ? (
                            <span>Junior</span>
                          ) : s.type === "projects" ? (
                            <AnimatedNumber value={4} suffix="+" reduceMotion={!!reduceMotion} duration={1.15} />
                          ) : (
                            <AnimatedNumber value={100} suffix="%" reduceMotion={!!reduceMotion} duration={1.2} />
                          )}
                        </div>
                        <div className={"text-xs mt-1 " + muted}>{s.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="py-20">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.22 }}>
            <motion.div variants={reveal}>
              <SectionTitle title={t.projects.title} subtitle={t.projects.subtitle} subtitleClass={muted} />
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6" style={{ perspective: 1400 }}>
              {projects.map((p, idx) => (
                <motion.div
                  key={p.title}
                  variants={makeFlipY(!!reduceMotion, idx * 0.12)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  transition={
                    reduceMotion
                      ? { duration: 0.01 }
                      : { duration: 1.05, ease: [0.16, 1, 0.3, 1] }
                  }
                >
                  <Card
                    enableLayout={enableLayout}
                    reduceMotion={!!reduceMotion}
                    className="p-6 h-full"
                    hoverLift
                  >
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

                    <motion.div layout="position" className="mt-4 flex flex-wrap gap-2">
                      {p.tech.map((tech) => (
                        <Pill tone={dark ? "dark" : "light"} hoverInvert key={tech}>
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
            </div>
          </motion.div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.22 }}
          >
            <motion.div variants={reveal}>
              <SectionTitle
                title={t.contact.title}
                subtitle={t.contact.subtitle}
                subtitleClass={muted}
              />
            </motion.div>

            {/* ✅ Contact 2 kart: fərqli animasiyalar */}
            <div className="grid lg:grid-cols-2 gap-6" style={{ perspective: 1200 }}>
              {/* left - slide tilt */}
              <motion.div
                variants={makeSlideTilt(!!reduceMotion, "left", 0)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
              >
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
                    ].map((item, index) => (
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
                                delay: index * 0.12,
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

              {/* right - flipX */}
              <motion.div
                variants={makeFlipX(!!reduceMotion, 0.12)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
              >
                <Card className="p-6" reduceMotion={!!reduceMotion} hoverLift>
                  <div className="text-sm font-medium">{t.contact.sendMsg}</div>

                  <form
                    className="mt-5 grid gap-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSent(false);

                      const eMap = validateForm();
                      if (Object.keys(eMap).length) {
                        setErrors(eMap);
                        return;
                      }

                      setErrors({});
                      setSending(true);

                      try {
                        const res = await fetch("/api/contact", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: form.name.trim(),
                            email: form.email.trim(),
                            message: form.message.trim(),
                          }),
                        });

                        const data = await res.json().catch(() => ({}));

                        if (!res.ok) {
                          setErrors({
                            server:
                              (data?.error as string) ||
                              (lang === "en"
                                ? "Failed to send. Try again."
                                : "Göndərilmədi. Yenidən yoxla."),
                          });
                          return;
                        }

                        setSent(true);
                        setForm({ name: "", email: "", message: "" });
                      } catch {
                        setErrors({
                          server:
                            lang === "en"
                              ? "Network error. Try again."
                              : "Şəbəkə xətası. Yenidən yoxla.",
                        });
                      } finally {
                        setSending(false);
                      }
                    }}
                  >
                    <div>
                      <input
                        value={form.name}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, name: e.target.value }));
                          setErrors((p) => ({ ...p, name: undefined, server: undefined }));
                          setSent(false);
                        }}
                        className={
                          "w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
                          (errors.name
                            ? "border-red-500/70 focus:border-red-500"
                            : dark
                              ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                              : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                        }
                        placeholder={t.contact.form.name}
                      />
                      {errors.name ? (
                        <div className="mt-1 text-[11px] text-red-400">{errors.name}</div>
                      ) : null}
                    </div>

                    <div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, email: e.target.value }));
                          setErrors((p) => ({ ...p, email: undefined, server: undefined }));
                          setSent(false);
                        }}
                        className={
                          "w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
                          (errors.email
                            ? "border-red-500/70 focus:border-red-500"
                            : dark
                              ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                              : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                        }
                        placeholder={t.contact.form.email}
                      />
                      {errors.email ? (
                        <div className="mt-1 text-[11px] text-red-400">{errors.email}</div>
                      ) : null}
                    </div>

                    <div>
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, message: e.target.value }));
                          setErrors((p) => ({ ...p, message: undefined, server: undefined }));
                          setSent(false);
                        }}
                        className={
                          "w-full rounded-xl border px-4 py-3 text-sm outline-none transition resize-none " +
                          (errors.message
                            ? "border-red-500/70 focus:border-red-500"
                            : dark
                              ? "border-white/10 bg-black/30 placeholder:text-white/30 focus:border-white/25"
                              : "border-black/10 bg-white placeholder:text-black/30 focus:border-black/25")
                        }
                        placeholder={t.contact.form.message}
                      />
                      {errors.message ? (
                        <div className="mt-1 text-[11px] text-red-400">{errors.message}</div>
                      ) : null}
                    </div>

                    {errors.server ? (
                      <div
                        className={
                          "rounded-xl border px-4 py-3 text-sm " +
                          (dark
                            ? "border-red-500/20 bg-red-500/10 text-red-200"
                            : "border-red-500/30 bg-red-50 text-red-700")
                        }
                      >
                        {errors.server}
                      </div>
                    ) : null}

                    {sent ? (
                      <div
                        className={
                          "rounded-xl border px-4 py-3 text-sm " +
                          (dark
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                            : "border-emerald-500/30 bg-emerald-50 text-emerald-700")
                        }
                      >
                        {lang === "en" ? "Message sent successfully." : "Mesaj uğurla göndərildi."}
                      </div>
                    ) : null}

                    <Button
                      variant="primary"
                      tone={dark ? "dark" : "light"}
                      className={"justify-center " + (sending ? "opacity-80 pointer-events-none" : "")}
                      hoverLift
                      reduceMotion={!!reduceMotion}
                    >
                      {sending ? (lang === "en" ? "Sending..." : "Göndərilir...") : t.contact.form.send}
                      <motion.span
                        className="ml-2 inline-flex"
                        animate={reduceMotion ? { x: 0 } : { x: [0, 6, 0] }}
                        transition={
                          reduceMotion
                            ? { duration: 0.01 }
                            : { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.36 }
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
          </motion.div>
        </section>

        {/* Footer */}
        <footer className={"pt-10 text-center text-xs " + muted}>
          {t.footer(profile.name)}
        </footer>
      </div>
    </div>
  );
}
// --- End of recent edits