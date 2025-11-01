import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CollectionSection from "@/components/CollectionSection";
import RulesSection from "@/components/RulesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CollectionSection />
        <RulesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
