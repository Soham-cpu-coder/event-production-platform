import Hero from "@/components/onboarding/Hero";
import ProcessSteps from "@/components/onboarding/ProcessSteps";
import ServiceGrid from "@/components/onboarding/ServiceGrid";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export const metadata = {
  title: "Corporate Event Onboarding | EventFlow",
  description:
    "Partner with EventFlow for corporate event production, staging, audio/visual engineering, keynote direction, and hybrid streaming.",
};

export default function OnboardingPage() {
  return (
    <div className="onboarding-page">
      <Hero />
      <ProcessSteps />
      <ServiceGrid />
      <OnboardingForm />
    </div>
  );
}
