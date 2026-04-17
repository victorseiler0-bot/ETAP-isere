"use client";
import React, { Suspense, lazy, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { InfiniteGrid } from "./components/ui/the-infinite-grid";

const useIsClient = () => {
  const [isClient, setIsClient] = React.useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Spline Component
const Spline = lazy(() => import("@splinetool/react-spline"));

function SplineScene({
  scene,
  className,
}: {
  scene: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const lastPointer = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  useEffect(() => {
    const dispatchToCanvas = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const canvas = containerRef.current.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      const clonedEvent = new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        clientX: clientX,
        clientY: clientY,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      });

      Object.defineProperty(clonedEvent, "offsetX", {
        get: () => clientX - rect.left,
      });
      Object.defineProperty(clonedEvent, "offsetY", {
        get: () => clientY - rect.top,
      });
      Object.defineProperty(clonedEvent, "pageX", {
        get: () => clientX + window.scrollX,
      });
      Object.defineProperty(clonedEvent, "pageY", {
        get: () => clientY + window.scrollY,
      });

      canvas.dispatchEvent(clonedEvent);
    };

    const handleGlobalPointerMove = (e: PointerEvent) => {
      lastPointer.current = { x: e.clientX, y: e.clientY };
      dispatchToCanvas(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      dispatchToCanvas(lastPointer.current.x, lastPointer.current.y);
    };

    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-textSecondary/50 animate-pulse font-light">
            Chargement de la scène 3D...
          </span>
        </div>
      }
    >
      <div ref={containerRef} className={className}>
        <Spline scene={scene} className="w-full h-full" />
      </div>
    </Suspense>
  );
}

// Logo Component
const Logo = ({ className }: { className?: string }) => (
  <img
    src="https://static.wixstatic.com/media/6c836c_7847ce0df2334cdaaa5a47c2ae6f7ddc~mv2.png/v1/fill/w_578,h_720,al_c,lg_1,q_90,enc_avif,quality_auto/6c836c_7847ce0df2334cdaaa5a47c2ae6f7ddc~mv2.png"
    alt="Logo ETAP"
    className={cn("object-contain", className)}
  />
);

// Icon Components (from HTML)
const IconBulb = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path d="M12 21v-3m0 0a3 3 0 01-3-3m3 3a3 3 0 003-3" />
  </svg>
);

const IconNetwork = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M16.1 11.1l-1.4 1.4M9.9 8.9l-1.4-1.4m11 11l-1.4 1.4m-11 0l1.4-1.4" />
  </svg>
);

export default function App() {
  const isClient = useIsClient();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.98, 1], [1, 1, 0]);

  // Triple precision blur transition: 181 data points for ultra-smooth parabolic progression
  const blurPoints = Array.from({ length: 181 }, (_, i) => i / 180);
  const blurValues = blurPoints.map((p) => {
    // Parabolic curve: starts at 6px, ends at 560px
    // Formula: start + (end - start) * p^2.5 (sharper curve for "disappearing" effect)
    return 6 + (560 - 6) * Math.pow(p, 2.5);
  });

  const blurValue = useTransform(scrollYProgress, blurPoints, blurValues);
  const dynamicBlur = useMotionTemplate`blur(${blurValue}px)`;

  return (
    <div id="top" className="min-h-screen">
      {/* HEADER - Glassmorphism ultra-accentué */}
      <header className="sticky top-0 bg-white/20 backdrop-blur-[40px] z-[1000] border-b border-white/40 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        <div className="w-[90%] max-w-[1100px] mx-auto flex justify-between items-center">
          <a
            href="#top"
            className="flex items-center gap-3.5 text-accentPrimary group"
          >
            <Logo className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />
            <span className="font-semibold text-lg tracking-[2px] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              E.T.A.P
            </span>
          </a>
          <nav className="hidden md:flex gap-10 text-[0.85rem] uppercase tracking-[1px]">
            <a
              href="#top"
              className="text-textPrimary hover:text-accentHover transition-colors duration-400"
            >
              Accueil
            </a>
            <a
              href="#approche"
              className="text-textPrimary hover:text-accentHover transition-colors duration-400"
            >
              Approche
            </a>
            <a
              href="#espaces"
              className="text-textPrimary hover:text-accentHover transition-colors duration-400"
            >
              Espaces
            </a>
            <a
              href="#equipe"
              className="text-textPrimary hover:text-accentHover transition-colors duration-400"
            >
              Équipe
            </a>
            <a
              href="#contact"
              className="text-textPrimary hover:text-accentHover transition-colors duration-400"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-0 bg-white">
        {/* LOGO BACKGROUND - FIXED IN CENTER WITH DYNAMIC BLUR */}
        <div className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center">
          <motion.div
            style={{ opacity }}
            className="w-full h-full flex items-center justify-center"
          >
            {isClient && (
              <motion.img
                src="https://static.wixstatic.com/media/6c836c_7847ce0df2334cdaaa5a47c2ae6f7ddc~mv2.png/v1/fill/w_578,h_720,al_c,lg_1,q_90,enc_avif,quality_auto/6c836c_7847ce0df2334cdaaa5a47c2ae6f7ddc~mv2.png"
                alt=""
                style={{ filter: dynamicBlur }}
                className="w-[30%] max-w-[300px] h-auto object-contain opacity-80 drop-shadow-2xl"
              />
            )}
          </motion.div>
        </div>

        {/* HERO SECTION */}
        <section ref={heroRef} className="relative w-full min-h-screen">
          <div className="absolute inset-0 z-50 flex flex-col justify-center items-center pointer-events-none">
            <div
              id="hero"
              className="w-[90%] max-w-[1100px] mx-auto flex flex-col items-center text-center pointer-events-auto"
            >
              <span className="text-[0.95rem] uppercase tracking-[3px] text-accentPrimary mb-6 block font-medium shadow-white drop-shadow-lg flex items-center justify-center">
                <span className="bg-white/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/50">
                  Prenons soin.
                </span>
              </span>
              <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] mb-8 font-light text-slate-900 tracking-tight text-balance">
                Un espace de confiance
              </h1>
              <p className="text-xl text-slate-800 max-w-[800px] font-normal drop-shadow-md bg-white/40 backdrop-blur-xl px-10 py-6 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                Au cabinet ETAP, nous créons un environnement serein et
                rassurant pour accompagner petits et grands vers le mieux-être.
              </p>
            </div>
          </div>
        </section>

        {/* CITATION & ROBOT 3D */}
        <section
          id="citation"
          className="relative py-[40vh] flex items-center overflow-visible bg-white"
        >
          {/* Spline 3D Scene - Fixe et sans aucune animation pour stabilité maximale */}
          <div className="absolute top-0 bottom-0 -right-[20%] w-[120%] lg:w-[100%] z-0 pointer-events-none">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full opacity-100"
            />
          </div>

          <div className="w-[90%] max-w-[1100px] mx-auto relative z-10 flex flex-col md:flex-row items-center pointer-events-none">
            <div className="w-full lg:w-3/5 relative z-20 pointer-events-auto">
              <div className="relative p-10 md:p-16 rounded-[40px] bg-white/40 backdrop-blur-[12px] border border-white/40 shadow-2xl overflow-hidden group">
                {/* Éléments de design : guillemets géants et ligne élégante */}
                <div className="absolute -top-10 -left-6 text-[15rem] font-serif text-accentPrimary/10 select-none pointer-events-none transition-transform duration-700 group-hover:-translate-y-2">
                  “
                </div>

                <div className="relative z-10">
                  <div className="w-20 h-[2px] bg-gradient-to-r from-accentPrimary to-transparent mb-12" />

                  <p className="text-2xl md:text-4xl text-slate-800 font-light leading-[1.4] text-balance italic">
                    « Se donner les moyens de faire en sorte que{" "}
                    <span className="text-accentPrimary font-normal not-italic">
                      l'intérêt de l'enfant
                    </span>{" "}
                    soit au cœur des réflexions des adultes, même dans les
                    situations les plus complexes. »
                  </p>

                  <div className="mt-12 flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-slate-300" />
                    <span className="text-sm uppercase tracking-[3px] text-slate-400 font-medium">
                      Engagement & Éthique
                    </span>
                  </div>
                </div>

                {/* Reflet lumineux subtil */}
                <div className="absolute -bottom-[50%] -right-[50%] w-full h-full bg-gradient-to-br from-accentPrimary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS APPROCHE */}
        <section
          id="approche"
          className="relative min-h-[80vh] flex items-center py-20 overflow-visible"
        >
          {/* Background Decorative Logo - Positionné pour ne pas être coupé */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-[100px] md:-right-[150px] z-0 pointer-events-none">
            <img
              src="https://static.wixstatic.com/media/6c836c_7847ce0df2334cdaaa5a47c2ae6f7ddc~mv2.png/v1/fill/w_578,h_720,al_c,lg_1,q_90,enc_avif,quality_auto/6c836c_7847ce0df2334cdaaa5a47c2ae6f7ddc~mv2.png"
              alt="Logo décoratif ETAP"
              className="w-[350px] h-[350px] md:w-[500px] md:h-[500px] opacity-[0.08] saturate-[1.2] object-contain transform rotate-12 drop-shadow-2xl"
            />
          </div>
          <div className="w-[90%] max-w-[1100px] mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative pointer-events-auto">
              <div className="bg-white p-12 border border-borderColor rounded shadow-[0_4px_10px_rgba(30,58,138,0.05)]">
                <h3 className="mb-6 text-2xl text-accentPrimary flex items-center gap-4 font-normal tracking-tight">
                  <IconBulb />
                  Un dispositif innovant
                </h3>
                <p className="text-base text-[#555] font-light">
                  Articuler les savoir-faire des professionnels libéraux pour
                  une approche multimodale et respectueuse de la singularité du
                  patient. Mutualiser des compétences pour promouvoir une vision
                  intégrative du soin.
                </p>
              </div>
              <div className="bg-white p-12 border border-borderColor rounded shadow-[0_4px_10px_rgba(30,58,138,0.05)]">
                <h3 className="mb-6 text-2xl text-accentPrimary flex items-center gap-4 font-normal tracking-tight">
                  <IconNetwork />
                  Travail en réseau
                </h3>
                <p className="text-base text-[#555] font-light">
                  Mobiliser et collaborer avec les partenaires du secteur :
                  écoles, professionnels libéraux, hôpitaux, équipes mobiles,
                  services ambulatoires, services de soins spécialisés, services
                  sociaux, tribunal...
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ESPACES & EQUIPE ENVELOPED IN INFINITE GRID */}
        <div className="relative">
          {/* Transition symétrique et unifiée (suppression de la coupure) */}
          <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_100px_100px_-50px_#fff,inset_0_-100px_100px_-50px_#fff]" />

          <InfiniteGrid className="items-stretch justify-start py-0 min-h-0">
            {/* ESPACES */}
            <section
              id="espaces"
              className="w-full min-h-screen py-[30vh] flex flex-col justify-center relative z-10 pointer-events-auto"
            >
              <div className="w-[90%] max-w-[1100px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-10 border-2 border-slate-100 rounded-2xl transition-all duration-500 hover:border-blue-500 hover:-translate-y-2 shadow-[0_4px_20px_rgba(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] group cursor-default">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full border-[3px] border-blue-500" />
                      </div>
                      <h3 className="text-2xl text-slate-900 font-medium">
                        Espace Soin
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Thérapies individuelles
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Thérapies de groupe
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Bilans & Orientations
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Thérapie Reconsolidation
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Accompagnement parentalité
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 border-2 border-slate-100 rounded-2xl transition-all duration-500 hover:border-indigo-500 hover:-translate-y-2 shadow-[0_4px_20px_rgba(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] group cursor-default">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full border-[3px] border-indigo-500" />
                      </div>
                      <h3 className="text-2xl text-slate-900 font-medium">
                        Espace Expertises
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Expertise judiciaire
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Expertise familiale (IPEF)
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Élaboration clinique
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Situations complexes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 border-2 border-slate-100 rounded-2xl transition-all duration-500 hover:border-emerald-500 hover:-translate-y-2 shadow-[0_4px_20px_rgba(30,58,138,0.04)] hover:shadow-[0_20px_40px_rgba(30,58,138,0.08)] group cursor-default">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full border-[3px] border-emerald-500" />
                      </div>
                      <h3 className="text-2xl text-slate-900 font-medium">
                        Espace Formation
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Analyses des Pratiques
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Podcasts & Publications
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                        <span className="text-slate-600 font-normal text-[0.95rem]">
                          Actions de recherche
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* EQUIPE */}
            <section
              id="equipe"
              className="w-full min-h-screen py-[30vh] flex flex-col justify-center relative z-10 pointer-events-auto"
            >
              <div className="w-[90%] max-w-[1100px] mx-auto">
                <h2 className="mb-16 text-center text-textSecondary text-3xl font-light tracking-tight">
                  L'Équipe
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-12 max-w-[800px] mx-auto">
                  <div className="flex flex-col items-center justify-center p-10 border border-transparent shadow-[0_4px_20px_rgba(30,58,138,0.04)] rounded-2xl bg-white hover:border-accentPrimary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center border-4 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
                      <span className="text-2xl font-bold text-accentPrimary">
                        CM
                      </span>
                    </div>
                    <p className="font-semibold text-[1.1rem] text-slate-800">
                      Clarisse MONNET
                    </p>
                    <p className="text-[0.75rem] text-orange-600 font-bold uppercase tracking-widest mt-3 bg-orange-50 px-4 py-1.5 rounded-full">
                      Psychologue clinicienne
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-10 border border-transparent shadow-[0_4px_20px_rgba(30,58,138,0.04)] rounded-2xl bg-white hover:border-accentPrimary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
                      <span className="text-2xl font-bold text-accentAlt">
                        DC
                      </span>
                    </div>
                    <p className="font-semibold text-[1.1rem] text-slate-800">
                      Delphine COMBIER
                    </p>
                    <p className="text-[0.75rem] text-purple-600 font-bold uppercase tracking-widest mt-3 bg-purple-50 px-4 py-1.5 rounded-full">
                      Psychologue clinicienne
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-10 border border-transparent shadow-[0_4px_20px_rgba(30,58,138,0.04)] rounded-2xl bg-white hover:border-accentPrimary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-4 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
                      <span className="text-2xl font-bold text-teal-700">
                        YP
                      </span>
                    </div>
                    <p className="font-semibold text-[1.1rem] text-slate-800">
                      Yann PICUT
                    </p>
                    <p className="text-[0.75rem] text-teal-600 font-bold uppercase tracking-widest mt-3 bg-teal-50 px-4 py-1.5 rounded-full">
                      Éducateur
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-10 border border-transparent shadow-[0_4px_20px_rgba(30,58,138,0.04)] rounded-2xl bg-white hover:border-accentPrimary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center border-4 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
                      <span className="text-2xl font-bold text-rose-700">
                        JG
                      </span>
                    </div>
                    <p className="font-semibold text-[1.1rem] text-slate-800 text-center">
                      Juliette GAUTHERON
                    </p>
                    <p className="text-[0.75rem] text-rose-600 font-bold uppercase tracking-widest mt-3 bg-rose-50 px-4 py-1.5 rounded-full text-center">
                      Psychologue clinicienne pour adolescent
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </InfiniteGrid>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        id="contact"
        className="bg-slate-900 text-slate-400 py-20 text-[0.85rem] border-t border-white/5 relative z-10"
      >
        <div className="w-[90%] max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col">
              <div className="text-white mb-6 flex items-center gap-3">
                <Logo className="w-6 h-6 text-accentAlt" />
                <span className="text-[1.1rem] tracking-[1px] font-medium text-white">
                  E.T.A.P
                </span>
              </div>
              <p className="mb-2 max-w-[200px] text-slate-300">
                Espace de Thérapies et d'Accompagnements Pluridisciplinaire
              </p>
              <p className="text-slate-400">Isère, France</p>
            </div>

            <div className="flex flex-col">
              <h4 className="text-white mb-6 font-normal text-base uppercase tracking-[1px]">
                Adresse
              </h4>
              <p className="mb-2 text-slate-300">211 rue de l'Eyrard</p>
              <p className="mb-2 text-slate-300">38360 Noyarey</p>
              <p className="text-slate-400">France</p>
            </div>

            <div className="flex flex-col">
              <h4 className="text-white mb-6 font-normal text-base uppercase tracking-[1px]">
                Contact
              </h4>
              <p className="mb-2 text-slate-300">06 87 02 96 97</p>
              <p className="mb-2 text-slate-300 hover:text-white transition-colors cursor-pointer">
                cmonnet.etap@gmail.com
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center opacity-50 text-[0.75rem]">
            <p className="mt-8 text-slate-500">
              N°RNA : W381029338 | © 2026 ETAP
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
