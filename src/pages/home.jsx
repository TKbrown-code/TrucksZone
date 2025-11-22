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
      <div data-aos="fade-down">
        <Header />
      </div>
      <div data-aos="fade-up">
        <Rating />
      </div>
      <div data-aos="fade-right">
        <WhyChooseUs />
      </div>
      <div data-aos="fade-left">
        <ImageSlide/>
      </div>
      <div data-aos="zoom-in">
        <FeaturedProduct /> 
      </div>
      <div data-aos="fade-up">
        <CTA />
      </div>
      <div data-aos="fade-right">
        <Testimonials />
      </div>
      <div data-aos="fade-left">
        <About />
      </div>
      <div data-aos="fade-up">
        <Partners />
      </div>
      <div data-aos="fade-up">
        <Footer />
      </div>
    </>
  );
}

export default Home;