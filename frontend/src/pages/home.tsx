import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Target, Megaphone, Presentation, TrendingUp, Briefcase, GraduationCap, Users, Lightbulb, BadgeCheck, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white" />
        <div className="container relative mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              Next Cohort Starting Soon
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6">
              Aimstorm Internship <br />
              <span className="text-primary">15 Days Business Bootcamp</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Learn real business skills, build your own idea, and get certified. Join an intensive program designed for ambitious students and future entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 font-semibold">
                  Apply Now
                </Button>
              </Link>
              <a href="#timeline">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary">
                  View Program
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-slate-50" id="about">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/images/about-image.png" 
                alt="Business Bootcamp" 
                className="rounded-2xl shadow-xl border border-border"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-foreground">More Than Just Theory</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Aimstorm is a practical internship designed to teach real-world business skills like marketing, sales, finance, and entrepreneurship.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                You will not just learn—you will build and present a real business idea. From validation to execution, experience what it takes to run a successful startup.
              </p>
              <ul className="space-y-4">
                {[
                  "Hands-on practical approach",
                  "Expert mentorship and guidance",
                  "Real-world business case studies",
                  "Networking with like-minded peers"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-24 bg-white" id="learn">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">What You Will Learn</h2>
            <p className="text-lg text-muted-foreground">Master the core pillars of business and entrepreneurship through our intensive curriculum.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Business Fundamentals", desc: "Core concepts of running a successful enterprise." },
              { icon: Lightbulb, title: "Startup Idea Validation", desc: "Test and prove your concepts before building." },
              { icon: Megaphone, title: "Marketing & Branding", desc: "Position your brand and reach your target audience." },
              { icon: Users, title: "Sales & Psychology", desc: "Understand customer behavior and close deals." },
              { icon: TrendingUp, title: "Finance & Pricing", desc: "Manage cash flow and develop pricing strategies." },
              { icon: Briefcase, title: "Tools & Operations", desc: "Streamline operations with modern business tools." },
            ].map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <module.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{module.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Timeline */}
      <section className="py-24 bg-slate-900 text-white" id="timeline">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">15 Days to Transform Your Mindset</h2>
            <p className="text-lg text-slate-400">A structured path from basics to presenting your own business idea.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative border-l border-slate-700 ml-4 md:ml-0">
              {[
                { days: "Day 1–3", title: "Business Basics", desc: "Introduction to business models, structures, and fundamentals." },
                { days: "Day 4–6", title: "Marketing & Sales", desc: "Customer acquisition, branding, and conversion strategies." },
                { days: "Day 7–10", title: "Operations & HR", desc: "Building teams, managing resources, and daily operations." },
                { days: "Day 11–13", title: "Tools & Branding", desc: "Digital presence, automation, and modern tech stack." },
                { days: "Day 14", title: "Project Work", desc: "Intensive work on your personal business idea." },
                { days: "Day 15", title: "Presentation + Certificate", desc: "Pitch your idea, receive feedback, and graduate." },
              ].map((phase, i) => (
                <div key={i} className="mb-10 ml-8 md:ml-12 relative">
                  <span className="absolute -left-[41px] md:-left-[57px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-8 ring-slate-900">
                    <Target className="h-3 w-3 text-white" />
                  </span>
                  <div className="inline-block rounded-md bg-slate-800 px-3 py-1 text-sm font-medium text-primary-foreground mb-2">
                    {phase.days}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{phase.title}</h3>
                  <p className="text-slate-400">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Why Join Aimstorm?</h2>
            <p className="text-lg text-muted-foreground">The benefits extend far beyond the 15 days.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BadgeCheck, title: "Internship Certificate", desc: "Official certification of your bootcamp completion." },
              { icon: Presentation, title: "Real Project Experience", desc: "Build a portfolio piece you can show employers." },
              { icon: Lightbulb, title: "Startup Mindset", desc: "Learn how founders think and solve problems." },
              { icon: GraduationCap, title: "Practical Knowledge", desc: "Skills you can apply immediately in the real world." },
            ].map((benefit, i) => (
              <div key={i} className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-primary-foreground/90">
            Seats are limited. Apply now and take the first step towards building your business acumen.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-primary font-bold text-lg h-14 px-10 hover:bg-white/90">
              Apply Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-white mb-4">Aimstorm</div>
          <p className="mb-6">15 Days Business Bootcamp</p>
          <div className="text-sm">
            © {new Date().getFullYear()} Aimstorm. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}