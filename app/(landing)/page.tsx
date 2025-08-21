"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Feather, DollarSign, Zap, Shield, BarChart, Users, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { JSX, SVGProps, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#", label: "Contact" },
];

interface MountainIconProps extends SVGProps<SVGSVGElement> {}

function MountainIcon(props: MountainIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}

function Header() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      layout
      className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? "p-4" : "pt-6"}`}>
      <div className={`container mx-auto flex items-center ${isScrolled ? "justify-between" : "justify-center"}`}>
        <motion.div layout className="flex items-center gap-2">
          <MountainIcon className={`transition-all duration-500 ${isScrolled ? "h-8 w-8" : "h-10 w-10"}`} />
          <span className={`font-semibold transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>Inventory</span>
        </motion.div>
        <motion.div 
          layout
          className={`flex items-center gap-4 p-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg`}
          style={{ marginLeft: isScrolled ? 0 : 300 }}
        >
          <nav className="hidden md:flex items-center gap-2 relative">
            {navLinks.map((link, i) => (
              <motion.div
                key={i}
                onHoverStart={() => setHoveredLink(i)}
                onHoverEnd={() => setHoveredLink(null)}
              >
                <Link href={link.href} className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors relative" prefetch={false}>
                  {link.label}
                  {hoveredLink === i && (
                    <motion.div 
                      layoutId="highlight"
                      className="absolute inset-0 bg-white/10 rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="transition-transform duration-300 hover:scale-105 text-white/80 hover:text-white">
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild className="transition-transform duration-300 hover:scale-105 bg-white/10 hover:bg-white/20 text-white">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

function HeroSection() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const normalizedMouseX = (mousePosition.x / window.innerWidth) * 2 - 1; // -1 to 1
  const normalizedMouseY = (mousePosition.y / window.innerHeight) * 2 - 1; // -1 to 1

  const blob1X = normalizedMouseX * 100; // Adjust sensitivity
  const blob1Y = normalizedMouseY * 100; // Adjust sensitivity

  const blob2X = -normalizedMouseX * 80; // Adjust sensitivity
  const blob2Y = -normalizedMouseY * 80; // Adjust sensitivity

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-30 animate-gradient-xy" />
      <motion.div 
        className="absolute inset-0 bg-grid-pattern opacity-10"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: "-100% 100%" }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />

      {/* Liquid Animation Elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ filter: "url(#goo)" }}>
        <motion.div
          className="w-64 h-64 rounded-full bg-secondary/70 absolute blur-xl"
          animate={{ x: blob1X, y: blob1Y, scale: 1.4 }}
          transition={{ type: "spring", stiffness: 50, damping: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="w-64 h-64 rounded-full bg-primary/40 absolute blur-xl"
          animate={{ x: blob2X, y: blob2Y, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.1, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* SVG Filter for Goo Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="flex flex-col items-center justify-center text-center z-10 w-full h-full bg-primary/10 backdrop-blur-xl">
        <motion.div 
          className="p-8  "
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Stop Losing Money <br /> to Bad Inventory
          </motion.h1>
          <motion.p 
            className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            A simple, powerful system to track products, stock, sales, and purchases—all in one place.
          </motion.p>
          <div className="flex gap-4 justify-center mt-8">
            <Button size="lg" asChild className="bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 rounded-full px-8 py-3">
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 transform hover:scale-105 rounded-full px-8 py-3">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-black">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Features</h2>
          <p className="max-w-2xl mx-auto text-lg text-white/60">Everything you need to manage your inventory.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[{
            title: "Real-Time Inventory",
            description: "Always up-to-date stock levels at a glance.",
            icon: <CheckCircle className="h-8 w-8 text-primary" />
          }, {
            title: "Smarter Sales & Purchases",
            description: "Drafts, partial payments, and credits made simple.",
            icon: <ShoppingCart className="h-8 w-8 text-primary" />
          }, {
            title: "Complete Audit Trail",
            description: "Track every movement: In, Out, Transfer, or Adjustment.",
            icon: <BarChart className="h-8 w-8 text-primary" />
          }, {
            title: "Organized Products",
            description: "Categories, units, and prices all neatly managed.",
            icon: <Feather className="h-8 w-8 text-primary" />
          }, {
            title: "Barcode Scanning",
            description: "Lightning-fast checkout and POS accuracy.",
            icon: <Zap className="h-8 w-8 text-primary" />
          }, {
            title: "E-Trade Compliance",
            description: "TIN verification built right in.",
            icon: <Shield className="h-8 w-8 text-primary" />
          }].map((feature, i) => (
            <motion.div 
              key={i} 
              className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-black">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Pricing Plans</h2>
          <p className="max-w-2xl mx-auto text-lg text-white/60">Choose the plan that's right for your business.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <motion.div 
            className="flex flex-col p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CardHeader>
              <CardTitle className="text-white">Starter</CardTitle>
              <CardDescription className="text-white/70">Get started free and test the product.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="text-5xl font-bold text-white">Free</div>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />1 month free trial
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  All features available
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white/90 text-black hover:bg-white transition-all duration-300 transform hover:scale-105" asChild>
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
            </CardFooter>
          </motion.div>
          <motion.div 
            className="flex flex-col p-6 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/30 shadow-lg transform scale-105"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CardHeader>
              <CardTitle className="text-white">Pro</CardTitle>
              <CardDescription className="text-white/70">For growing businesses</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="text-5xl font-bold text-white">2000 ETB
                <span className="text-lg font-normal text-white/70">/ month</span>
              </div>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  All features included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Minimum 6 months commitment
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white/90 text-black hover:bg-white transition-all duration-300 transform hover:scale-105" asChild>
                <Link href="/sign-up">Start Pro Plan</Link>
              </Button>
            </CardFooter>
          </motion.div>
          <motion.div 
            className="flex flex-col p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <CardHeader>
              <CardTitle className="text-white">Enterprise</CardTitle>
              <CardDescription className="text-white/70">For businesses with branches</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="text-5xl font-bold text-white">800 ETB
                <span className="text-lg font-normal text-white/70">/ branch / month</span>
              </div>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  All features available
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Branch-to-branch transfers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Branch management tools
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 transform hover:scale-105" asChild>
                <Link href="#">Contact Sales</Link>
              </Button>
            </CardFooter>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-6 border-t border-white/10 bg-black">
      <div className="container px-4 md:px-6 flex items-center justify-between text-sm text-white/60">
        <p>&copy; 2025 Inventory Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-white transition-colors" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-white transition-colors" prefetch={false}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}