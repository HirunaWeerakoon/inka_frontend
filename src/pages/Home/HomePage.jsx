import HeroSection from './sections/HeroSection';
import CategorySection from './sections/CategorySection';
import CustomDesignSection from './sections/CustomDesignSection';
import BestSellingSection from './sections/BestSellingSection';
import './HomePage.css';

function HomePage() {
  return (
    <main className="home-page">
      <HeroSection />
      <CategorySection />
      <CustomDesignSection />
      <BestSellingSection />
    </main>
  );
}

export default HomePage;
