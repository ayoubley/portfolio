"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    title: "UI/UX Design",
    icon: "🎨",
    skills: [
      "User Interface Design",
      "User Experience",
      "Wireframing",
      "Prototyping",
      "Design Systems",
      "Responsive Design",
    ],
  },
  {
    title: "Branding & Identity",
    icon: "💎",
    skills: [
      "Logo Design",
      "Brand Strategy",
      "Visual Identity",
      "Typography",
      "Color Theory",
      "Brand Guidelines",
    ],
  },
  {
    title: "Digital Marketing",
    icon: "📈",
    skills: [
      "Growth Strategy",
      "SEO Optimization",
      "Content Strategy",
      "Social Media",
      "Analytics",
      "Conversion Optimization",
    ],
  },
  {
    title: "Tools & Platforms",
    icon: "⚡",
    skills: [
      "Figma",
      "Adobe Creative Suite",
      "Framer",
      "Webflow",
      "Domain Investing",
      "WordPress",
    ],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
              <span className="text-sm text-muted">Skills & Expertise</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              What I <span className="text-gradient italic font-light">Bring</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {skillCategories.map((category, categoryIndex) => (
            <ScrollReveal key={category.title} delay={categoryIndex * 0.1}>
              <div className="glass-card rounded-2xl p-8 hover:border-white/15 transition-all duration-300 group h-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: categoryIndex * 0.1 + skillIndex * 0.05 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                      className="px-3 py-1.5 text-sm rounded-full glass-card text-muted hover:text-foreground transition-colors cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
