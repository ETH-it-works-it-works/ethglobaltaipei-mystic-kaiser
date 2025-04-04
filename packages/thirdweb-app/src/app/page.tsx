import Navigation from "../components/landing-page/Navigation";
import Hero from "../components/landing-page/Hero";
import About from "../components/landing-page/About";
import Story from "../components/landing-page/Story";
import Rarity from "../components/landing-page/Rarity";
import Collections from "../components/landing-page/Collection";
import Roadmap from "../components/landing-page/Roadmap";
import Footer from "../components/landing-page/Footer";
export default function Home() {
  return <div>
    <Navigation />
    <Hero />
    <About />
    <Story />
    <Collections />
    <Rarity />
    <Roadmap />
    <Footer /> 
  </div>;
}
