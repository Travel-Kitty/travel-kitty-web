"use client";
import React from "react";

import { SmoothCursor } from "@/components/ui/smooth-cursor";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import HowWorks from "@/components/home/how-works";
import Demo from "@/components/home/demo";
import Testimonial from "@/components/home/testimonial";
import Architecture from "@/components/home/architecture";
import Faq from "@/components/home/faq";
import Cta from "@/components/home/cta";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

export default function TravelKittyLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground overflow-x-hidden !cursor-none">
      <SmoothCursor />
      <Navbar />
      <Hero />
      <Features />
      <HowWorks />
      <Demo />
      <Testimonial />
      <Architecture />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}
