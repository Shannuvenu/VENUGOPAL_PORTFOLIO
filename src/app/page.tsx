import About from "@/components/About";
import CaseStudy from "@/components/CaseStudy";
import Contact from "@/components/Contact";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import GamePulse from "@/components/GamePulse";
import Games from "@/components/Games";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Skills from "@/components/Skills";
import SqlShowcase from "@/components/SqlShowcase";

export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-ink-950">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <div className="border-y border-line bg-ink-900/40">
          <GamePulse />
          <div className="mx-auto -mt-16 max-w-6xl px-4 pb-20 sm:px-6">
            <Dashboard />
          </div>
        </div>
        <CaseStudy />
        <SqlShowcase />
        <div className="border-y border-line bg-ink-900/40">
          <Games />
        </div>
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
