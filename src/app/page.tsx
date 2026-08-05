"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  Briefcase,
  ArrowRight
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
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* HEADER */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[rgba(255,255,255,0.35)] backdrop-blur-[18px] border-b border-[rgba(255,255,255,0.2)] shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50">
            <Image src="/logo.png" alt="Wash N Press" width={160} height={40} className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-[15px] font-[600] px-[18px] py-[10px] rounded-[10px] transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:shadow-sm ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? "bg-[linear-gradient(90deg,#11B8B8,#0E8BA8)] text-white shadow-sm"
                    : "text-[#0E8BA8] hover:bg-[linear-gradient(90deg,#11B8B8,#0E8BA8)] hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button asChild className="rounded-[10px] px-6 py-[10px] h-auto bg-[linear-gradient(90deg,#11B8B8,#0E8BA8)] text-white font-[600] hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(17,184,184,0.4)] transition-all duration-300 border-0">
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
            className="fixed inset-0 z-40 bg-[rgba(255,255,255,0.95)] backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)} 
                className={`text-lg font-semibold py-3 px-4 rounded-[10px] transition-all ${
                  pathname === link.href ? "bg-[linear-gradient(90deg,#11B8B8,#0E8BA8)] text-white" : "text-[#0E8BA8]"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Button asChild className="mt-4 rounded-[10px] w-full py-6 text-lg font-semibold bg-[linear-gradient(90deg,#11B8B8,#0E8BA8)] text-white border-0">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 overflow-hidden bg-white">
          {/* Animated Continuous Gradient Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base soft colors */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] via-[#F8FFFE] to-[#DDF8F7] opacity-80" />
            
            {/* Moving blurred circular gradients */}
            <motion.div 
              animate={{ 
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[20%] -right-[10%] w-[60%] h-[70%] rounded-full bg-gradient-to-b from-[#EAF9F8] to-[#DDF8F7] blur-[100px] mix-blend-multiply opacity-60"
            />
            <motion.div 
              animate={{ 
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-[30%] -left-[10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-[#DDF8F7] to-[#D9F7FF] blur-[100px] mix-blend-multiply opacity-50"
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-4 items-center text-center lg:text-left">
              
              {/* Left Column (45%) */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="lg:col-span-5 flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0 z-20"
              >
                <motion.h1 variants={fadeIn} className="font-extrabold tracking-tight text-slate-900 mb-4 leading-[1.05]" style={{ fontSize: 'clamp(3.5rem, 5vw, 5rem)' }}>
                  Fresh Clothes,<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#0F2B5B]">Better Living.</span>
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-lg lg:text-xl text-slate-600 mb-6 max-w-[520px] font-medium leading-relaxed">
                  Professional laundry with pickup & delivery at your convenience. Give your clothes the care they deserve.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto">
                  <Button asChild size="lg" className="rounded-full px-8 h-14 text-base font-bold bg-[linear-gradient(90deg,#11B8B8,#0E8BA8)] text-white hover:text-white border-0 hover:-translate-y-[2px] shadow-[0_4px_14px_0_rgba(17,184,184,0.39)] hover:shadow-[0_6px_20px_rgba(17,184,184,0.6)] transition-all duration-300 w-full sm:w-auto flex items-center gap-2 group">
                    <Link href="/login?redirect=/resident/order">
                      Book Pickup
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-base font-bold bg-white border-2 border-[#0EA5A4] text-[#0EA5A4] hover:bg-[#0EA5A4] hover:border-[#0EA5A4] hover:text-white shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto">
                    <Link href="#services">Explore Services</Link>
                  </Button>
                </motion.div>

                <motion.div variants={fadeIn} className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:text-base font-bold text-slate-700 w-full max-w-[520px]">
                  <div className="flex items-center justify-center lg:justify-start gap-2"><CheckCircle2 className="text-[#0EA5A4] shrink-0" size={18} /> Free Pickup & Delivery</div>
                  <div className="flex items-center justify-center lg:justify-start gap-2"><CheckCircle2 className="text-[#0EA5A4] shrink-0" size={18} /> Quality Cleaning</div>
                  <div className="flex items-center justify-center lg:justify-start gap-2"><CheckCircle2 className="text-[#0EA5A4] shrink-0" size={18} /> On-Time Delivery</div>
                  <div className="flex items-center justify-center lg:justify-start gap-2"><CheckCircle2 className="text-[#0EA5A4] shrink-0" size={18} /> Affordable Pricing</div>
                </motion.div>
              </motion.div>

              {/* Right Column (55%) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-7 relative flex items-center justify-center z-10 mt-8 lg:mt-0"
              >
                {/* Soft ambient lighting and bloom behind the machine */}
                <div className="absolute inset-0 bg-white/60 rounded-full blur-[80px] -z-10 transform scale-110" />
                <div className="absolute inset-0 bg-[#EAF9F8] rounded-full blur-[120px] -z-20 opacity-50" />
                
                {/* Floating Particles */}
                <motion.div animate={{ y: [-10, 20, -10], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-white blur-[2px]" />
                <motion.div animate={{ y: [15, -15, 15], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full bg-primary/40 blur-[3px]" />
                <motion.div animate={{ y: [-20, 10, -20], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-blue-300 blur-[1px]" />

                {/* Floating Image Container */}
                <motion.div 
                  animate={{ y: [-8, 8, -8] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full flex items-center justify-center lg:justify-end py-6 lg:py-0"
                >
                  <Image 
                    src="/hero.png" 
                    alt="Premium Washing Machine" 
                    width={540}
                    height={540}
                    className="w-[70%] lg:w-[65%] max-w-[540px] object-contain drop-shadow-[0_20px_30px_rgba(14,165,164,0.15)] pointer-events-none lg:translate-x-4" 
                    style={{
                      WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 50%, transparent 100%)',
                      maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 50%, transparent 100%)'
                    }}
                  />
                </motion.div>
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

            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
              
              {/* Left Side - Steps */}
              <div className="w-full lg:w-1/2 space-y-8 relative">
                {/* Connector line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 -z-10" />
                
                {[
                  { step: "1", title: "Schedule Pickup", desc: "Choose a date and time that suits you." },
                  { step: "2", title: "We Collect", desc: "Our executive will pick up your clothes." },
                  { step: "3", title: "We Clean", desc: "Expert cleaning with quality products." },
                  { step: "4", title: "We Deliver", desc: "Fresh & clean clothes delivered to you." },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-6"
                  >
                    {/* Number Node */}
                    <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/30">
                      {item.step}
                    </div>
                    
                    <div className="pt-1">
                      <h3 className="text-xl font-bold mb-1 text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="pt-4"
                >
                  <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                    <Link href="/login">Schedule Pickup Now <span className="ml-2">→</span></Link>
                  </Button>
                </motion.div>
              </div>

              {/* Right Side - Image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2 relative"
              >
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10" />
                <img src="/basket.png" alt="Laundry Basket" className="w-full h-auto object-contain drop-shadow-xl" />
                
                {/* 100% Satisfaction Badge */}
                <motion.div 
                   animate={{ y: [-5, 5, -5] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute bottom-10 -right-4 md:right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center w-32"
                >
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-wider leading-tight">Satisfaction<br/>Guaranteed</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SPECIAL OFFER */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl shadow-primary/20 gap-8"
            >
              <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto">
                <img src="/towels.png" alt="Towels" className="w-24 md:w-32 h-auto object-cover rounded-xl shadow-md hidden sm:block bg-white/20 p-2 backdrop-blur-sm" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Get 20% OFF on Your First Order!</h2>
                  <p className="text-white/90 text-sm md:text-base">
                    Experience premium laundry service with our special welcome offer.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-auto flex-shrink-0">
                <Button asChild size="lg" className="w-full md:w-auto bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-bold shadow-md transition-transform hover:scale-105">
                  <Link href="/login">Book Now & Save <span className="ml-2">→</span></Link>
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
