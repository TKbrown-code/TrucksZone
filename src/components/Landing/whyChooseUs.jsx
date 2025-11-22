import { Shield, Wrench, DollarSign, Clock } from "lucide-react";
import "./styles/whyChooseUs.css";

export default function WhyChooseUs() {
    const features = [
  {
    icon: Shield,
    titleKey: "Quality Assured",
    descriptionKey: "Every truck undergoes rigorous inspection to ensure top-tier quality and reliability.",
  },
  {
    icon: Wrench,
    titleKey: "Expert Service",
    descriptionKey: "Our certified technicians provide comprehensive maintenance and repair services.",
  },
  {
    icon: DollarSign,
    titleKey: "Best Prices",
    descriptionKey: "Competitive pricing with flexible financing options to fit your budget.",
  },
  {
    icon: Clock,
    titleKey: "Fast Delivery",
    descriptionKey: "Quick turnaround times to get you on the road and working as soon as possible.",
  },
];

return(
<section id="features" className="why-choose-us">
      <div className="why-choose-us__container">
        <div className="why-choose-us__header">
          <h2 className="why-choose-us__title">Why Choose TrucksZone</h2>
          <p className="why-choose-us__subtitle">Excellence in every aspect of truck sales and service</p>
        </div>

        <div className="why-choose-us__grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="why-choose-us__feature-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="why-choose-us__icon-container">
                <feature.icon className="why-choose-us__icon" />
              </div>
              <h3 className="why-choose-us__feature-title">{feature.titleKey}</h3>
              <p className="why-choose-us__feature-description">{feature.descriptionKey}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
);

}