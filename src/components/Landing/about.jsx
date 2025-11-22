import { Award, Users, TrendingUp } from "lucide-react";
import "./styles/about.css";

const stats = [
  {
    icon: Award,
    value: "25+",
    label: "Years Experience",
  },
  {
    icon: Users,
    value: "5000+",
    label: "Happy Customers",
  },
  {
    icon: TrendingUp,
    value: "10000+",
    label: "Trucks Sold",
  },
];

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-grid">
          <div className="about-content">
            <h2>Built on Trust and Quality</h2>
            <p>
              For over 25 years, TrucksZone has been the leading provider of commercial and personal trucks. 
              We understand that your truck is more than just a vehicle—it's the backbone of your business.
            </p>
            <p>
              Our commitment to excellence, competitive pricing, and exceptional customer service has made us 
              the trusted choice for businesses and individuals across the nation.
            </p>
            <button className="about-button">
              Learn More About Us
            </button>
          </div>

          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="stat-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="stat-icon">
                  <stat.icon />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
