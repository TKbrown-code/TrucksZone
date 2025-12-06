import Header from "../components/Landing/header"
import Rating from "../components/Landing/Rating"
import FeaturedProduct from "../components/Landing/FeaturedProduct"
import WhyChooseUs from "../components/Landing/whyChooseUs"
import ImageSlide from "../components/Landing/imageslide"
import CTA from "../components/Landing/CTA"
import Testimonials from "../components/Landing/testimonial"
import About from "../components/Landing/about"
import Partners from "../components/Landing/partners"
import Footer from "../components/footer"

function Home() {
  return (
    <>
        <Header />
        <WhyChooseUs />
        <ImageSlide/>
        <FeaturedProduct /> 
        <CTA />
        <Testimonials />
        <About />
        <Partners />
        <Footer />
    </>
  );
}

export default Home;