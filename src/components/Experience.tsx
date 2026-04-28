"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

const experiences: ExperienceItem[] = [
  {
    role: "Senior UI/UX Designer",
    company: "Freelance",
    period: "2021 - Present",
    description:
      "Leading design projects for international clients. Specializing in premium brand identities, web design, and digital experiences that drive measurable results.",
  },
  {
    role: "Digital Strategist & Domain Investor",
    company: "Independent",
    period: "2020 - Present",
    description:
      "Building a strategic portfolio of premium domain names. Combining market analysis with branding expertise to identify and develop high-value digital assets.",
  },
  {
    role: "UI/UX Designer",
    company: "Creative Studio",
    period: "2019 - 2021",
    description:
      "Designed user interfaces and experiences for web and mobile applications. Collaborated with development teams to deliver pixel-perfect, accessible designs.",
  },
  {
    role: "Graphic Designer",
    company: "Design Agency",
    period: "2017 - 2019",
    description:
      "Created visual identities, marketing materials, and digital assets for diverse clients. Developed strong foundations in typography, color theory, and brand design.",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-sm text-muted">Career Journey</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Work{" "}
              <span className="text-gradient italic font-light">
                Experience
              </span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-card-border md:-translate-x-px" />

          {experiences.map((exp, i) => (
            <ScrollReveal
              key={exp.period}
              delay={i * 0.15}
              direction={i % 2 === 0 ? "right" : "left"}
            >
              <div
                className={`relative flex flex-col md:flex-row gap-8 mb-12 last:mb-0 ${
                  i % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="absolute left-0 md:left-1/2 top-8 w-3 h-3 rounded-full bg-accent -translate-x-[6px] md:-translate-x-[6px] z-10">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-accent"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                <div className="flex-1 md:w-1/2" />

                <div className="flex-1 md:w-1/2 pl-8 md:pl-0">
                  <div
                    className={`glass-card rounded-2xl p-6 hover:border-accent/20 transition-all duration-300 ${
                      i % 2 === 0 ? "md:mr-8" : "md:ml-8"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                        {exp.period}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{exp.role}</h3>
                    <p className="text-sm text-accent mb-3">{exp.company}</p>
                    <p className="text-sm text-muted leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
