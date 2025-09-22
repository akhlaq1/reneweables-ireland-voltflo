
"use client";

import { useState, useEffect } from "react";
import type React from "react";
import {
  CheckCircle2,
  Star,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";

export default function FinalPage() {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStage(1);
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationStage(2);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);



  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-50 to-white">
      <AppHeader showBackButton={true} />

      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Hero Section */}
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              animationStage >= 1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative mx-auto mb-6 w-24 h-24">
              <div className="absolute inset-0 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                <Star className="h-4 w-4 text-yellow-800" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thank You for Booking Your{" "}
              <span className="text-green-600">Solar Consultation</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              We've received your appointment request and will contact you at your scheduled time.
              Your personalised solar proposal has been sent to your email.
            </p>
          </div>

          {/* Email Sent Notification */}
          <div
            className={`mb-8 transition-all duration-1000 delay-300 ${
              animationStage >= 1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="py-6 px-4 sm:px-6">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    📧 Proposal Sent to Your Email
                  </h3>
                  {/* <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                    We've emailed you a copy of your personalised solar proposal
                    and financing details for your records.
                    <br />
                    <strong>Make sure to check Spam and Promotions just in case.</strong>
                  </p> */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What Happens Next Section */}
          <div
            className={`mb-12 transition-all duration-1000 delay-500 ${
              animationStage >= 2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
                <Calendar className="h-10 w-10 text-green-600" />
                What Happens Next
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We'll be in touch at your scheduled time to discuss your solar journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Step 1: We'll Contact You */}
              <Card className="border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg aspect-square shrink-0">
                      1
                    </div>
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                      <Phone className="flex-shrink-0 h-7 w-7 text-green-600" />
                      We'll Contact You
                    </CardTitle>
                  </div>
                  {/* <p className="text-gray-700 text-base">
                    Our team will call you at your scheduled appointment time
                  </p> */}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">
                        We'll call at your booked time slot
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">
                        Quick 5-10 minute consultation
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">
                        Review your solar plan together
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">
                        Answer any questions you have
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Can't wait for your scheduled call?
                        </p>
                        <p className="text-sm text-blue-700">
                          Feel free to contact us directly.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Contact Information */}
              <Card className="border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg aspect-square shrink-0">
                      2
                    </div>
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                      <Phone className="flex-shrink-0 h-7 w-7 text-blue-600" />
                      Contact Us Directly
                    </CardTitle>
                  </div>
                  <p className="text-gray-700 text-base">
                    Get in touch with our team anytime
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href="tel:+353858349461" className="text-gray-900 font-medium hover:text-blue-600">
                          (085) 834-9461
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href="mailto:solarpotential@voltflo.com" className="text-gray-900 font-medium hover:text-blue-600">
                          solarpotential@voltflo.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Office Hours</p>
                        <p className="text-gray-900 font-medium">
                          Monday to Friday, 9:00am – 6:00pm
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-gray-900 font-medium">
                          Based in Galway, serving homes and businesses across the West of Ireland
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={() => window.open('tel:+353858349461')}
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Us Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center text-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 justify-center">
                <p className="text-base font-bold text-green-600">Powered by Voltflo</p>
              </div>
              <p className="text-xs text-gray-500">2025 Voltflo. All rights reserved.</p>
            </div>
            <nav className="flex flex-wrap gap-4 text-sm justify-center">
              <a 
                href="https://voltflo.com/PrivacyPolicy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:underline"
              >
                Privacy Policy
              </a>
              <a 
                href="https://voltflo.com/TermsOfUse"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:underline"
              >
                Terms of use
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
