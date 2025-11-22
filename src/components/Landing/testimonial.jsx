import { useState, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import "./styles/testimonial.css";

const testimonials = [
  {
    name: "John Martinez",
    company: "Martinez Construction",
    rating: 5,
    text: "TrucksZone helped us build our entire fleet. The quality of trucks and the level of service we received was exceptional. Our business has grown significantly thanks to their reliable vehicles.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  },
  {
    name: "Sarah Johnson",
    company: "Johnson Logistics",
    rating: 5,
    text: "I've purchased over 20 trucks from TrucksZone for my logistics company. Every single one has been worth the investment. Their team goes above and beyond to ensure satisfaction.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
  {
    name: "Mike Thompson",
    company: "Thompson Hauling",
    rating: 5,
    text: "Best truck dealer I've ever worked with. They found the perfect truck for my needs and budget. The financing options made it easy to get started. Highly recommend!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  },
  {
    name: "Lisa Chen",
    company: "Chen Delivery Services",
    rating: 5,
    text: "Outstanding customer service and quality trucks. The team at TrucksZone made the entire buying process smooth and stress-free. Will definitely return for our next purchase.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    name: "Robert Williams",
    company: "Williams Transport",
    rating: 5,
    text: "TrucksZone has been our trusted partner for years. Their maintenance service is top-notch and keeps our fleet running smoothly. Professional and reliable!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScroll =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });

      // Update index for indicator
      const newIndex =
        direction === "left"
          ? Math.max(0, currentIndex - 1)
          : Math.min(testimonials.length - 1, currentIndex + 1);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">Testimonials</h2>
          <p className="testimonials-subtitle">What our customers say about us</p>
        </div>

        <div className="testimonials-carousel">
          {/* Carousel Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="testimonial-nav-button prev"
            disabled={currentIndex === 0}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="testimonial-nav-button next"
            disabled={currentIndex === testimonials.length - 1}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="testimonial-scroll-container"
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card"
              >
                <Quote className="testimonial-quote" />

                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>

                <p className="testimonial-text">
                  {testimonial.text}
                </p>

                <div className="testimonial-author">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author-info">
                    <div className="testimonial-author-name">{testimonial.name}</div>
                    <div className="testimonial-company">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicator Dots */}
          <div className="testimonial-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                      left: index * 400,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`testimonial-indicator ${index === currentIndex ? 'active' : ''}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
