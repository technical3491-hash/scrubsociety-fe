'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import ImageCarousel from "@/components/ImageCarousel";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import type { RegisterData, UserType } from "@/lib/api/auth";

const carouselImages = [
  '/images/img_one.jpg',
  '/images/img_two.jpg',
  '/images/img_three.jpg',
];

export default function Register() {
  const { register, isRegistering } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    userType: "" as "" | "student" | "doctor" | "pharmacist" | "nurse" | "therapist" | "researcher" | "other",
    specialization: "",
    degree: "",
    licenseNo: "",
    institution: "",
    yearOfStudy: "",
    pharmacyName: "",
    experience: "",
  });

  const userTypes = [
    { value: "student", label: "Student" },
    { value: "doctor", label: "Doctor" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "nurse", label: "Nurse" },
    { value: "therapist", label: "Therapist" },
    { value: "researcher", label: "Researcher" },
    { value: "other", label: "Other Medical Professional" },
  ];

  const specializations = [
    "Cardiology",
    "Neurology",
    "Pulmonology",
    "Gastroenterology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "Psychiatry",
    "General Medicine",
    "Ayurveda",
    "Homeopathy",
    "Pharmacy",
    "Academic/Research",
    "Nursing",
    "Physiotherapy",
    "Occupational Therapy",
    "Radiology",
    "Pathology",
    "Anesthesiology",
    "Emergency Medicine",
  ];

  const yearsOfStudy = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
    "6th Year",
    "Internship",
    "Post Graduate",
  ];

  // Validate step 1 (email, mobile, password)
  const validateStep1 = () => {
    return formData.email && formData.mobileNumber && formData.password;
  };

  // Type guard to check if userType is valid
  const isValidUserType = (userType: string): userType is UserType => {
    return userType !== '' && ['student', 'doctor', 'pharmacist', 'nurse', 'therapist', 'researcher', 'other'].includes(userType);
  };

  // Validate step 2 (profile information)
  const validateStep2 = () => {
    if (!formData.name || !formData.userType || !formData.degree) {
      return false;
    }
    
    // Conditional validation based on user type
    if (formData.userType === 'student') {
      return !!formData.institution;
    } else if (['doctor', 'pharmacist', 'nurse', 'therapist'].includes(formData.userType)) {
      return !!formData.licenseNo;
    }
    
    return true;
  };

  const requiresLicense = () => {
    return ['doctor', 'pharmacist', 'nurse', 'therapist'].includes(formData.userType);
  };

  const requiresSpecialization = () => {
    return ['doctor', 'nurse', 'therapist', 'researcher'].includes(formData.userType);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2() && isValidUserType(formData.userType)) {
      // Extract userType to a local variable so TypeScript can properly narrow the type
      const userType: UserType = formData.userType;
      const registerData: RegisterData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        userType: userType,
        specialization: formData.specialization,
        degree: formData.degree,
        licenseNo: formData.licenseNo,
        institution: formData.institution,
        yearOfStudy: formData.yearOfStudy,
        pharmacyName: formData.pharmacyName,
        experience: formData.experience,
      };
      register(registerData);
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden bg-animated">
      {/* Image Carousel Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 relative shadow-lg items-center justify-center p-6 tilt-animate">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-0" />
        <div className="relative z-10 w-full max-w-lg aspect-[8/5] border rounded-lg border-glow">
          <ImageCarousel images={carouselImages} alt="Healthcare professionals" />
        </div>
      </div>

      {/* Register Form Section */}
      <div className="w-full lg:w-3/5 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="w-full max-w-2xl">
        <div className="text-center mb-3 sm:mb-4 lg:mb-5">
          <Link href="/">
            <Image
              src="/ScrubSocietyAI.png"
              alt="Logo"
              width={50}
              height={50}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary text-primary-foreground rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 cursor-pointer object-contain"
            />
          </Link>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1" data-testid="text-page-title">Join ScrubSocietyAI</h1>
          <p className="text-xs sm:text-sm text-foreground/70 hidden sm:block">Create your verified medical professional account</p>
        </div>

        <Card className="p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-none lg:rounded-r-2xl border shadow-lg bg-background border-glow">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`w-12 sm:w-16 h-0.5 ${
                currentStep >= 2 ? 'bg-primary' : 'bg-muted'
              }`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-xs sm:text-sm text-foreground/70">
              Step {currentStep} of 2: {currentStep === 1 ? 'Account Information' : 'Profile Information'}
            </p>
          </div>

          <form onSubmit={currentStep === 1 ? handleNext : handleSubmit} className="space-y-2.5 sm:space-y-3">
            {/* Step 1: Email, Mobile Number, Password */}
            {currentStep === 1 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mobileNumber" className="text-sm sm:text-base">Mobile Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    required
                    data-testid="input-mobile"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm sm:text-base">Password <span className="text-destructive">*</span></Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="input-password"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 text-sm sm:text-base mt-2.5" 
                  data-testid="button-next"
                  disabled={!validateStep1()}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {/* Step 2: Profile Information */}
            {currentStep === 2 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="userType" className="text-sm sm:text-base">I am a <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.userType}
                    onValueChange={(value) => setFormData({ ...formData, userType: value as typeof formData.userType })}
                    required
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base" data-testid="select-user-type">
                      <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-sm sm:text-base">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm sm:text-base">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={formData.userType === 'student' ? "John Doe" : formData.userType === 'doctor' ? "Dr. John Doe" : "John Doe"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="degree" className="text-sm sm:text-base">
                    {formData.userType === 'student' ? 'Course/Degree' : 'Degree/Qualification'} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="degree"
                    type="text"
                    placeholder={formData.userType === 'student' ? "MBBS, B.Pharm, BAMS, etc." : "MBBS, MD, B.Pharm, BAMS, etc."}
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    required
                    data-testid="input-degree"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                {/* Student-specific fields */}
                {formData.userType === 'student' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="institution" className="text-sm sm:text-base">Institution/College Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="institution"
                        type="text"
                        placeholder="Enter your college or institution name"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        required
                        data-testid="input-institution"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="yearOfStudy" className="text-sm sm:text-base">Year of Study</Label>
                      <Select
                        value={formData.yearOfStudy}
                        onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}
                      >
                        <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base" data-testid="select-year">
                          <SelectValue placeholder="Select year of study" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearsOfStudy.map((year) => (
                            <SelectItem key={year} value={year} className="text-sm sm:text-base">
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Specialization for doctors, nurses, therapists, researchers */}
                {requiresSpecialization() && (
                  <div className="space-y-1.5">
                    <Label htmlFor="specialization" className="text-sm sm:text-base">Specialization</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base" data-testid="select-specialization">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec} className="text-sm sm:text-base">
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* License Number for doctors, pharmacists, nurses, therapists */}
                {requiresLicense() && (
                  <div className="space-y-1.5">
                    <Label htmlFor="licenseNo" className="text-sm sm:text-base">
                      {formData.userType === 'pharmacist' ? 'Pharmacy License Number' : 'Medical License Number'} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="licenseNo"
                      type="text"
                      placeholder="Enter your license number"
                      value={formData.licenseNo}
                      onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                      required
                      data-testid="input-license"
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                    <p className="text-xs text-foreground/70 hidden sm:block">
                      Your license will be verified before account activation
                    </p>
                  </div>
                )}

                {/* Pharmacy Name for pharmacists */}
                {formData.userType === 'pharmacist' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="pharmacyName" className="text-sm sm:text-base">Pharmacy Name (Optional)</Label>
                    <Input
                      id="pharmacyName"
                      type="text"
                      placeholder="Enter your pharmacy name"
                      value={formData.pharmacyName}
                      onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                      data-testid="input-pharmacy-name"
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                )}

                {/* Experience for professionals (optional) */}
                {formData.userType && !['student'].includes(formData.userType) && (
                  <div className="space-y-1.5">
                    <Label htmlFor="experience" className="text-sm sm:text-base">Years of Experience (Optional)</Label>
                    <Input
                      id="experience"
                      type="text"
                      placeholder="e.g., 5 years"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      data-testid="input-experience"
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                )}

                <div className="flex gap-2.5 sm:gap-3 mt-2.5">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                    data-testid="button-previous"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-10 sm:h-11 text-sm sm:text-base" 
                    data-testid="button-submit"
                    disabled={isRegistering || !validateStep2()}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs sm:text-sm text-foreground/70">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                  Sign in
                </span>
              </Link>
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

