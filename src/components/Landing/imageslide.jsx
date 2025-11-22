import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./styles/imageslide.css";

export default function ImageSlide() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
  {
    image: "https://images.unsplash.com/photo-1551830820-330a71b99659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWNrdXAlMjB0cnVja3xlbnwxfHx8fDE3NjM2MzY1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Power & Performance",
    description: "Built for the toughest jobs",
  },
  {
    image: "https://images.unsplash.com/photo-1543858671-c460805db8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwdHJ1Y2t8ZW58MXx8fHwxNzYzNjk5MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Commercial Excellence",
    description: "Professional-grade trucks for serious work",
  },
  {
    image: "https://images.unsplash.com/photo-1761917904658-2a9ecb84a169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGRlYWxlcnNoaXB8ZW58MXx8fHwxNzYzNjk5MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Fleet Solutions",
    description: "Scale your business with our fleet packages"
  },
];

 useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

    return (
      <section className="image-slide">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`image-slide__slide ${
              index === currentSlide ? 'image-slide__slide--active' : 'image-slide__slide--inactive'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="image-slide__image"
            />
            <div className="image-slide__overlay">
              <div className="image-slide__content">
                <h2 className="image-slide__title">
                  {slide.title}
                </h2>
                <p className="image-slide__description">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="image-slide__nav-button image-slide__nav-button--prev"
          aria-label="Previous slide"
        >
          <ChevronLeft className="image-slide__nav-icon" />
        </button>

        <button
          onClick={nextSlide}
          className="image-slide__nav-button image-slide__nav-button--next"
          aria-label="Next slide"
        >
          <ChevronRight className="image-slide__nav-icon" />
        </button>

        {/* Slide Indicators */}
        <div className="image-slide__indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`image-slide__indicator ${
                index === currentSlide ? 'image-slide__indicator--active' : ''
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
    );
};