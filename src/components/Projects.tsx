"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface Project {
  title: string;
  description: string;
  tags: string[];
  category: string;
  gradient: string;
}

const projects: Project[] = [
  {
    title: "Facto Brand Identity",
    description:
      "Complete brand identity and website redesign for a digital agency. Focused on bold typography, dark aesthetics, and conversion-optimized layouts.",
    tags: ["Branding", "UI Design", "Web Design"],
    category: "Design",
    gradient: "from-indigo-500/20 to-purple-500/20",
  },
  {
    title: "AtomAI Platform",
    description:
      "Modern SaaS dashboard design for an AI-powered automation platform. Clean interfaces with data visualization and intuitive user flows.",
    tags: ["UI/UX", "SaaS", "Dashboard"],
    category: "Design",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    title: "Premium Domain Portfolio",
    description:
      "Strategic acquisition and branding of high-value domain names. Building digital asset portfolios with strong market positioning.",
    tags: ["Domain Investing", "Strategy", "Branding"],
    category: "Digital Strategy",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    title: "E-Commerce Experience",
    description:
      "End-to-end design for a luxury fashion e-commerce platform with immersive product showcases and seamless checkout flows.",
    tags: ["E-Commerce", "UI/UX", "Responsive"],
    category: "Design",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    title: "Growth Marketing System",
    description:
      "Comprehensive digital marketing strategy and visual assets for a tech startup, resulting in 200% conversion improvement.",
    tags: ["Marketing", "Strategy", "Growth"],
    category: "Digital Strategy",
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    title: "Creative Studio Website",
    description:
      "Award-worthy portfolio website for a creative studio. Featuring smooth animations, micro-interactions, and premium aesthetics.",
    tags: ["Web Design", "Animation", "Framer"],
    category: "Design",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },
];

const categories = ["All", "Design", "Digital Strategy"];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-sm text-muted">Selected Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Featured{" "}
              <span className="text-gradient italic font-light">Projects</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-sm rounded-full transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "glass-card text-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group glass-card rounded-2xl overflow-hidden hover:border-accent/20 transition-all duration-500 h-full flex flex-col">
                  <div
                    className={`h-48 bg-gradient-to-br ${project.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15), transparent 70%)",
                      }}
                    />
                    <span className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                      {project.category === "Design" ? "🎨" : "📊"}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold group-hover:text-accent transition-colors duration-300">
                        {project.title}
                      </h3>
                      <svg
                        className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M17 7H7M17 7v10"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 rounded-full glass-card text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
