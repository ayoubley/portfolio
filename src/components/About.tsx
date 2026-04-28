"use client";

import ScrollReveal from "./ScrollReveal";

const highlights = [
  { label: "Years Experience", value: "7+" },
  { label: "Projects Completed", value: "150+" },
  { label: "Happy Clients", value: "80+" },
];

export default function About() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
            <span className="text-sm text-muted">About Me</span>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <ScrollReveal delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                Crafting Digital{" "}
                <span className="text-gradient italic font-light">
                  Experiences
                </span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-muted text-lg leading-relaxed mb-6">
                I&apos;m Ayoub Bensadek, a professional designer with over 7 years
                of experience in digital design and visual identity. I specialize
                in crafting modern UI/UX experiences that combine simplicity,
                elegance, and usability.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-muted text-lg leading-relaxed mb-6">
                Beyond design, I work in domain investing (domaining) with deep
                understanding of the digital names market and building value
                around them. I also bring expertise in digital marketing and
                growth strategies.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p className="text-muted text-lg leading-relaxed">
                I combine design, marketing, and digital market understanding to
                create powerful solutions that help projects grow and stand out in
                competitive environments. My goal is to transform ideas into
                professional digital experiences that merge creativity with real
                results.
              </p>
            </ScrollReveal>
          </div>

          <div className="space-y-6">
            {highlights.map((item, i) => (
              <ScrollReveal key={item.label} delay={0.2 + i * 0.1} direction="left">
                <div className="glass-card rounded-2xl p-8 hover:border-white/20 transition-colors duration-300">
                  <div className="text-4xl font-bold mb-2">
                    {item.value}
                  </div>
                  <div className="text-muted text-sm">{item.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
