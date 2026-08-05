"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  CheckCircle2, 
  WashingMachine, 
  Shirt, 
  Sparkles, 
  Clock, 
  Leaf, 
  Headset, 
  ShieldCheck, 
  Tag, 
  Truck,
  Droplets,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* HEADER */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50">
            <img src="/logo.png" alt="Wash N Press" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">About</Link>
            <Link href="#services" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Services</Link>
            <Link href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button asChild className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              <Link href="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden z-50 p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden flex flex-col gap-6"
          >
            <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground py-2 border-b">Home</Link>
            <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground py-2 border-b">About</Link>
            <Link href="#services" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground py-2 border-b">Services</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground py-2 border-b">Pricing</Link>
            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground py-2 border-b">Contact</Link>
            <Button asChild className="mt-4 rounded-full w-full py-6 text-lg">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-2xl"
              >
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                  <Sparkles size={16} />
                  <span>Premium Laundry Service</span>
                </motion.div>
                <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  Fresh Clothes,<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Better Living.</span>
                </motion.h1>
                <motion.p variants={fadeIn} className="text-lg text-muted-foreground mb-8 max-w-lg">
                  Professional laundry with pickup & delivery at your convenience. Give your clothes the care they deserve.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                    <Link href="/login">Schedule Pickup</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-base bg-white/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="#services">Explore Services</Link>
                  </Button>
                </motion.div>

                <motion.div variants={fadeIn} className="grid grid-cols-2 gap-4 text-sm font-medium text-foreground/80">
                  <div className="flex items-center gap-2"><CheckCircle2 className="text-accent" size={18} /> Free Pickup & Delivery</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="text-accent" size={18} /> Quality Cleaning</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="text-accent" size={18} /> On-Time Delivery</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="text-accent" size={18} /> Affordable Pricing</div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative lg:h-[600px] flex items-center justify-center"
              >
                {/* Abstract Premium Washing Machine Illustration area */}
                <div className="relative w-full max-w-md aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative z-10 glass rounded-[2.5rem] p-8 shadow-2xl border-white/40 h-full flex flex-col items-center justify-center bg-white/40">
                    <div className="w-48 h-48 rounded-full border-[16px] border-white/80 shadow-inner flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                       <div className="absolute bottom-0 w-full h-1/2 bg-primary/20 backdrop-blur-sm"></div>
                       <WashingMachine size={64} className="text-primary z-10" />
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full"
                       />
                    </div>
                    <div className="mt-8 flex gap-3">
                      <div className="w-16 h-12 bg-white/60 rounded-xl shadow-sm border border-white/50 flex items-center justify-center"><Shirt className="text-secondary" size={24}/></div>
                      <div className="w-16 h-12 bg-white/60 rounded-xl shadow-sm border border-white/50 flex items-center justify-center"><Droplets className="text-primary" size={24}/></div>
                      <div className="w-16 h-12 bg-white/60 rounded-xl shadow-sm border border-white/50 flex items-center justify-center"><Sparkles className="text-accent" size={24}/></div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <motion.div 
                    animate={{ y: [-10, 10, -10] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-lg border-white/50 bg-white/60 flex items-center gap-3"
                  >
                    <div className="bg-accent/20 p-2 rounded-full"><CheckCircle2 className="text-accent" size={20}/></div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Status</div>
                      <div className="text-sm font-bold text-foreground">Sparkling Clean</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* OUR SERVICES */}
        <section id="services" className="py-24 bg-white relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Care for Every Fabric</h2>
              <p className="text-muted-foreground text-lg">We offer a wide range of services to keep your wardrobe fresh, clean, and looking like new.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[
                { icon: <WashingMachine size={32}/>, title: "Laundry", desc: "Everyday wash & fold" },
                { icon: <Shirt size={32}/>, title: "Dry Cleaning", desc: "For delicate fabrics" },
                { icon: <Droplets size={32}/>, title: "Steam Ironing", desc: "Crisp and wrinkle-free" },
                { icon: <Briefcase size={32}/>, title: "Bag Cleaning", desc: "Restore your accessories" },
                { icon: <Sparkles size={32}/>, title: "Shoe Cleaning", desc: "Make them shine again" },
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-background rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.desc}</p>
                  <Link href="/login" className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <span>→</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Wash N Press</h2>
              <p className="text-muted-foreground text-lg">We deliver excellence through our state-of-art facility and dedicated team.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Sparkles className="text-primary" size={28}/>, title: "Premium Cleaning", desc: "We use top-tier detergents and careful processes." },
                { icon: <Tag className="text-primary" size={28}/>, title: "Affordable Pricing", desc: "High quality service that doesn't break the bank." },
                { icon: <Truck className="text-primary" size={28}/>, title: "Fast Delivery", desc: "Get your clothes back exactly when you need them." },
                { icon: <Leaf className="text-primary" size={28}/>, title: "Eco Friendly", desc: "Water-conscious and environmentally safe chemicals." },
                { icon: <ShieldCheck className="text-primary" size={28}/>, title: "Quality Check", desc: "Every item is inspected before delivery." },
                { icon: <Headset className="text-primary" size={28}/>, title: "Customer Support", desc: "Always here to help with your requests." },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-8 rounded-3xl"
                >
                  <div className="mb-4 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg">Your laundry done in 5 simple steps.</p>
            </div>

            <div className="max-w-4xl mx-auto relative">
              {/* Connector line for Desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 -translate-x-1/2" />
              
              <div className="space-y-12">
                {[
                  { step: "1", title: "Schedule Pickup", desc: "Book a slot via our platform.", align: "left" },
                  { step: "2", title: "Pickup by Operator", desc: "Our operator collects your items.", align: "right" },
                  { step: "3", title: "Cleaning Process", desc: "Washing, drying & ironing.", align: "left" },
                  { step: "4", title: "Quality Check", desc: "Ensuring everything is perfect.", align: "right" },
                  { step: "5", title: "Delivery", desc: "Fresh clothes delivered to your door.", align: "left" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: item.align === "left" ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`relative flex flex-col md:flex-row items-center ${item.align === "left" ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    {/* Number Node */}
                    <div className="md:absolute left-1/2 md:-translate-x-1/2 w-12 h-12 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-primary/30 z-10 mb-4 md:mb-0">
                      {item.step}
                    </div>
                    
                    <div className={`md:w-1/2 ${item.align === "left" ? "md:pr-16 md:text-right text-center" : "md:pl-16 md:text-left text-center"}`}>
                      <div className="bg-background md:bg-transparent p-6 md:p-0 rounded-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-foreground">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SPECIAL OFFER */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-secondary to-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-semibold mb-6">
                  Limited Time Offer
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6">Get 20% OFF</h2>
                <p className="text-xl text-white/90 mb-10 max-w-xl mx-auto">
                  On your first laundry or dry cleaning order. Give your clothes the premium treatment they deserve.
                </p>
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 py-6 text-lg font-bold shadow-xl transition-transform hover:scale-105">
                  <Link href="/login">Book Now</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white pt-20 pb-10 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <img src="/logo.png" alt="Wash N Press" className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" />
              </Link>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Community-focused premium laundry service with automated operations and quality assurance.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Services</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Dry Cleaning</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Laundry</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Steam Iron</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Support</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Wash N Press. All rights reserved.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                {/* FB Icon placeholder */}
                <span className="font-bold text-xs">FB</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                {/* IG Icon placeholder */}
                <span className="font-bold text-xs">IG</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                {/* X Icon placeholder */}
                <span className="font-bold text-xs">X</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
