import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Categories from './Categories';
import Listings from './Listings';
import Footer from './Footer';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';

  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <Listings searchQuery={searchQuery} selectedCategory={selectedCategory} />
      <Footer />
    </>
  );
};

export default HomePage;
