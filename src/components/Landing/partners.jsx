
import "./styles/partners.css";

const partners = [
  { name: "Ford", logo: "https://logo.clearbit.com/ford.com" },
  { name: "Chevrolet", logo: "https://logo.clearbit.com/chevrolet.com" },
  { name: "RAM", logo: "https://logo.clearbit.com/ramtrucks.com" },
  { name: "GMC", logo: "https://logo.clearbit.com/gmc.com" },
  { name: "Freightliner", logo: "https://logo.clearbit.com/freightliner.com" },
  { name: "Peterbilt", logo: "https://logo.clearbit.com/peterbilt.com" },
];

export default function Partners() {

  return (
    <section className="partners-section">
      <div className="partners-container">
        <div className="partners-header">
          <h2 className="partners-title">
            Trusted Partners
          </h2>
          <p className="partners-subtitle">
            Working with the world's leading truck manufacturers
          </p>
        </div>

        <div className="partners-grid">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="partner-item"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 100}ms forwards` }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="partner-logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.style.fontSize = '1.5rem';
                    fallback.style.fontWeight = 'bold';
                    fallback.style.color = '#4b5563';
                    fallback.textContent = partner.name;
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
