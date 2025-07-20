import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/file.svg" alt="Logo" width={28} height={28} className="dark:invert"/>
                <span className="font-bold text-lg">Smart Inventory</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="relative py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
              Smart Inventory Management for Your Shop
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Take control of your products, sales, and suppliers with an all-in-one solution built for modern shops. Simple, Fast, and Powerful.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started Today – Streamline Your Shop
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose Our Inventory Management System?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Real-Time Inventory Tracking</h3>
                <p className="text-muted-foreground">Say goodbye to stockouts and overstocking. Know exactly what you have and what you need.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Seamless Product Management</h3>
                <p className="text-muted-foreground">Add, edit, and organize products with just a few clicks.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Smart Purchase & Sales Management</h3>
                <p className="text-muted-foreground">Track purchases, monitor sales, and view detailed reports – all in one place.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Supplier & Customer Management</h3>
                <p className="text-muted-foreground">Build better relationships by keeping all your supplier and customer info in one system.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">POS Integration</h3>
                <p className="text-muted-foreground">Sell smarter with a built-in Point of Sale (POS) that updates inventory automatically.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Easy-to-Use Dashboard</h3>
                <p className="text-muted-foreground">No learning curve – just powerful tools with a simple, intuitive interface.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Focus on growth, not paperwork.</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span><span className="font-semibold">Save time</span> with automated stock tracking.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Make <span className="font-semibold">data-driven decisions</span> with insightful reports.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Improve <span className="font-semibold">customer satisfaction</span> by never running out of products.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span><span className="font-semibold">Grow your business</span> with tools designed for efficiency.</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <Image src="/store.jpg" alt="Modern retail store" width={1200} height={800} className="rounded-lg shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your shop deserves better tools.</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
              Try our inventory management system today and focus on growing your business – not chasing stock.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10" asChild>
                <Link href="#">Request a Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Smart Inventory. All rights reserved.</p>
            <p className="text-sm font-semibold mt-4 md:mt-0">
              Inventory made simple – so you can sell more and stress less.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
