"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  User,
  Download,
  MessageSquare,
  Phone,
  ArrowLeft,
  Lock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import api from "@/app/api/api";

// Error types for better error handling
type ErrorType = 
  | 'validation'
  | 'duplicate_user'
  | 'server_error'
  | 'network_error'
  | 'unknown';

interface ErrorState {
  show: boolean;
  type: ErrorType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function GetPlanPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreeToEmailReport, setAgreeToEmailReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailReportTooltip, setShowEmailReportTooltip] = useState(false);
  const [error, setError] = useState<ErrorState>({
    show: false,
    type: 'unknown',
    title: '',
    message: ''
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("getPlan_email");
      const savedFirstName = localStorage.getItem("getPlan_firstName");
      const savedPhoneNumber = localStorage.getItem("getPlan_phoneNumber");

      if (savedEmail) setEmail(savedEmail);
      if (savedFirstName) setFirstName(savedFirstName);
      if (savedPhoneNumber) setPhoneNumber(savedPhoneNumber);
    }
  }, []);

  // Save email to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("getPlan_email", email);
    }
  }, [email]);

  // Save firstName to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("getPlan_firstName", firstName);
    }
  }, [firstName]);

  // Save phoneNumber to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("getPlan_phoneNumber", phoneNumber);
    }
  }, [phoneNumber]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error.show) {
      setError(prev => ({ ...prev, show: false }));
    }
  }, [email, firstName]);

  const handleError = (apiError: any) => {
    console.error("API Error:", apiError);
    
    // Check if it's a network error
    if (!apiError.response) {
      setError({
        show: true,
        type: 'network_error',
        title: 'Connection Problem',
        message: 'Unable to connect to our servers. Please check your internet connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => {
            setError(prev => ({ ...prev, show: false }));
            // Could retry the submission here
          }
        }
      });
      return;
    }

    const status = apiError.response?.status;
    const errorMessage = apiError.response?.data?.message || 'An unexpected error occurred';

    switch (status) {
      case 400:
        // Validation errors
        if (errorMessage.includes('Name is required')) {
          setError({
            show: true,
            type: 'validation',
            title: 'Name Required',
            message: 'Please enter your full name to continue.',
          });
        } else if (errorMessage.includes('Email is required')) {
          setError({
            show: true,
            type: 'validation',
            title: 'Email Required',
            message: 'Please enter a valid email address to receive your plan.',
          });
        } else if (errorMessage.includes('Consent is required') || errorMessage.includes('Consent must be a boolean')) {
          setError({
            show: true,
            type: 'validation',
            title: 'Agreement Required',
            message: 'Please agree to receive your personalised report by email to continue.',
          });
        } else {
          setError({
            show: true,
            type: 'validation',
            title: 'Information Missing',
            message: 'Please check that all required fields are filled out correctly.',
          });
        }
        break;

      case 409:
        // Duplicate user error
        setError({
          show: true,
          type: 'duplicate_user',
          title: 'Account Already Exists',
          message: `An account with the email "${email}" already exists. If this is your email, your plan has already been sent to you.`,
          action: {
            label: 'Check Email',
            onClick: () => {
              setError(prev => ({ ...prev, show: false }));
              // Could navigate to a different page or show instructions
            }
          }
        });
        break;

      case 500:
        // Server errors
        if (errorMessage.includes('Failed to create user')) {
          setError({
            show: true,
            type: 'server_error',
            title: 'Unable to Save Plan',
            message: 'We encountered a problem saving your information. Please try again in a few moments.',
            action: {
              label: 'Try Again',
              onClick: () => {
                setError(prev => ({ ...prev, show: false }));
              }
            }
          });
        } else {
          setError({
            show: true,
            type: 'server_error',
            title: 'Server Error',
            message: 'Our servers are experiencing issues. Please try again in a few minutes.',
            action: {
              label: 'Retry',
              onClick: () => {
                setError(prev => ({ ...prev, show: false }));
              }
            }
          });
        }
        break;

      default:
        setError({
          show: true,
          type: 'unknown',
          title: 'Unexpected Error',
          message: 'Something unexpected happened. Please try again or contact support if the problem persists.',
          action: {
            label: 'Try Again',
            onClick: () => {
              setError(prev => ({ ...prev, show: false }));
            }
          }
        });
    }
  };

  const ErrorDisplay = () => {
    if (!error.show) return null;

    const getErrorIcon = () => {
      switch (error.type) {
        case 'network_error':
          return <WifiOff className="h-6 w-6 text-red-500" />;
        case 'duplicate_user':
          return <CheckCircle className="h-6 w-6 text-blue-500" />;
        case 'validation':
          return <AlertTriangle className="h-6 w-6 text-amber-500" />;
        default:
          return <AlertTriangle className="h-6 w-6 text-red-500" />;
      }
    };

    const getErrorColors = () => {
      switch (error.type) {
        case 'network_error':
          return 'from-red-50 to-pink-50 border-red-200';
        case 'duplicate_user':
          return 'from-blue-50 to-indigo-50 border-blue-200';
        case 'validation':
          return 'from-amber-50 to-yellow-50 border-amber-200';
        default:
          return 'from-red-50 to-pink-50 border-red-200';
      }
    };

    return (
      <div className={`mb-6 p-4 rounded-lg bg-gradient-to-r ${getErrorColors()} border shadow-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getErrorIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {error.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {error.message}
            </p>
            {error.action && (
              <Button
                onClick={error.action.onClick}
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
              >
                {error.action.label}
              </Button>
            )}
          </div>
          <Button
            onClick={() => setError(prev => ({ ...prev, show: false }))}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 p-1 h-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName) {
      setError({
        show: true,
        type: 'validation',
        title: 'Required Information Missing',
        message: 'Please enter both your full name and email address to continue.',
      });
      return;
    }

    // Check if email report agreement is checked (mandatory)
    if (!agreeToEmailReport) {
      setShowEmailReportTooltip(true);
      // Hide tooltip after 4 seconds
      setTimeout(() => {
        setShowEmailReportTooltip(false);
      }, 4000);
      return;
    }

    // Clear any existing errors
    setError(prev => ({ ...prev, show: false }));
    setIsLoading(true);

    try {
      // Get data from localStorage
      const businessProposal = localStorage.getItem("business_proposal");
      const personaliseAnswers = localStorage.getItem("personalise_answers");
      const selectedLocation = localStorage.getItem("selectedLocation");
      const roofArea = localStorage.getItem("roof_area");
      const financeInfo = localStorage.getItem("financeInfo");

      // Get energy_independence from nested object
      const energyIndependenceData = localStorage.getItem(
        "energy_independence_data"
      );
      let energyIndependence = null;
      if (energyIndependenceData) {
        try {
          const parsedData = JSON.parse(energyIndependenceData);
          energyIndependence = parsedData.practicalIndependence;
        } catch (error) {
          console.error("Error parsing energy_independence_data:", error);
        }
      }

      // Get the credit union based on subdomain
      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const creditUnion = hostname.includes("synergy") ? "synergy" : "loughrea";

      // Prepare the data for the API request
      const requestData = {
        name: firstName,
        email: email,
        phone_number: phoneNumber || null,
        business_proposal: businessProposal,
        personalise_answers: personaliseAnswers,
        selectedLocation: selectedLocation,
        roof_area: roofArea,
        energy_independence: energyIndependence,
        financeInfo: financeInfo,
        consent: false,
        credit_union: creditUnion,
      };

      // Make the POST request
      const response = await api.post(
        "public_users/new-journey-user",
        requestData
      );

      // Handle successful response
      console.log("User journey data saved successfully:", response.data);

      // Send user flow email asynchronously (fire and forget)
      api.get(`public_users/send-userflow-email?email=${encodeURIComponent(email)}`)
        .then(() => {
          console.log("User flow email sent successfully");
        })
        .catch((error) => {
          console.error("Error sending user flow email:", error);
        });

      // Store signup status in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userSignedUp", "true");
        localStorage.setItem("userEmail", email);
      }

      // Navigate to final page
      router.push("/final-page");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-green-200/20 to-transparent rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-200/15 to-transparent rounded-full translate-y-40 -translate-x-40" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-teal-200/10 to-green-200/10 rounded-full -translate-x-32 -translate-y-32" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 pt-2">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-gray-600 hover:text-green-800 hover:bg-green-100 rounded-full hover:px-3 hover:py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Financing
          </Button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Save Your Plan
              </h2>
              <p className="text-gray-600 mt-2">
                Enter your details to receive your personalised plan and get
                connected with financing options.
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {/* Error Display */}
              <ErrorDisplay />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        required
                        type="text"
                        placeholder="Your Full Name"
                        className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="(353) 123-4567"
                        className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div> */}
                    {/* Phone number explanation */}
                    {/* <div className="flex items-start gap-2 mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-sm text-green-800">
                        <p className="text-green-700">
                          Adding your phone number helps your Credit Union
                          support you faster if you choose to book a call - but
                          it's optional.
                        </p>
                      </div>
                    </div> */}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Email Report Agreement Checkbox - Mandatory */}
                  <div className="relative flex items-start space-x-3">
                    <Checkbox
                      id="agreeToEmailReport"
                      checked={agreeToEmailReport}
                      onCheckedChange={(checked) => {
                        setAgreeToEmailReport(checked as boolean);
                        if (checked) {
                          setShowEmailReportTooltip(false);
                        }
                      }}
                      className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="agreeToEmailReport"
                        className="text-sm font-normal text-gray-700 leading-relaxed"
                      >
                        I agree to receive my personalised energy upgrade report by email from Voltflo. No spam, no follow-ups.
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                    </div>

                    {/* Tooltip for mandatory email report checkbox */}
                    {showEmailReportTooltip && (
                      <div className="absolute -top-20 -left-4 z-20 w-64 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 p-3 shadow-xl">
                        <div className="absolute bottom-[-10px] left-6 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-red-300"></div>
                        <div className="text-center">
                          <div className="text-xs text-red-700 mt-2">
                            ⚠️ To receive your plan, you need to agree to
                            receive it by email.
                          </div>
                        </div>
                        <button
                          onClick={() => setShowEmailReportTooltip(false)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Saving Your Plan...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5" />
                        Get My Personalised Plan
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-500">
                    By clicking 'Get My Personalised Plan', you agree to
                    Voltflo's{" "}
                                            <a 
                          href="https://voltflo.com/PrivacyPolicy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 underline"
                        >
                          Privacy Policy
                        </a>{" "}
                    and{" "}
                    <a
                      href="https://voltflo.com/TermsOfUse"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 underline"
                    >
                      Terms of Use
                    </a>
                    . If you book a call or apply for a green loan online, you consent to Voltflo sharing your details
                    with your Credit Union to support your application.
                  </p>

                  {false && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span>
                        A Credit Union representative may contact you to discuss
                        financing options
                      </span>
                    </div>
                  )}
                </div>
              </form>

              {/* Security Message */}
              {/* <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <Lock className="h-3 w-3" />
                    <span>We'll never share your information with third parties or send marketing emails without permission.</span>
                  </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
