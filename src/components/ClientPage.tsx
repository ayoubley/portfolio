"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Skills from "./Skills";
import Projects from "./Projects";
import Experience from "./Experience";
import Contact from "./Contact";
import Footer from "./Footer";
import CursorFollower from "./CursorFollower";
import FluidSimulation from "./FluidSimulation";

export default function ClientPage() {
  return (
    <>
      <div className="noise-bg" />
      <FluidSimulation />
      <CursorFollower />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
