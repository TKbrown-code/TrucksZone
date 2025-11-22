import { useState, useEffect } from "react";
import { Truck, Gauge, Cog, Filter, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/allTrucks.css";

export function AllTrucksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [trucks, setTrucks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trucks and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trucks with their primary images
        const { data: trucksData, error: trucksError } = await supabase
          .from('trucks')
          .select(`
            *,
            truck_images!inner(
              image_url
            )
          `);

        if (trucksError) throw trucksError;

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        setTrucks(trucksData || []);
        setCategories(['All', ...categoriesData.map(cat => cat.name)]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load trucks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTrucks = trucks
    .filter((truck) => {
      const matchesSearch = 
        truck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || 
        truck.categories?.some(cat => cat.name === selectedCategory);
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.final_price - b.final_price;
      if (sortBy === "price-high") return b.final_price - a.final_price;
      if (sortBy === "year") return b.year - a.year;
      return 0;
    });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return <div className="loading">Loading trucks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    // Update class names in the JSX
<div className="trucks-page">
  {/* Hero Section */}
  <section className="trucks-hero-section">
    <div className="trucks-hero-content">
      <h1>Our Truck Inventory</h1>
      <p>{trucks.length} Trucks Available</p>
    </div>
  </section>

  {/* Filters and Search */}
  <section className="trucks-filters-section">
    <div className="trucks-container">
      <div className="trucks-filters-container">
        {/* Search */}
        <div className="trucks-search-container">
          <Search className="trucks-search-icon" />
          <input
            type="text"
            placeholder="Search trucks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="trucks-search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="trucks-category-filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`trucks-category-btn ${
                selectedCategory === category ? 'trucks-category-btn-active' : ''
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="trucks-sort-container">
          <Filter className="trucks-filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="trucks-sort-select"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="year">Newest First</option>
          </select>
        </div>
      </div>
    </div>
  </section>

  {/* Trucks Grid */}
  <section className="trucks-grid-section">
    <div className="trucks-container">
      {filteredTrucks.length === 0 ? (
        <div className="trucks-no-results">
          <p>No trucks found matching your criteria.</p>
        </div>
      ) : (
        <div className="trucks-grid">
          {filteredTrucks.map((truck) => (
            <div key={truck.id} className="trucks-card">
              <div className="trucks-card-image-container">
                <img
                  src={truck.truck_images?.[0]?.image_url || '/truck-placeholder.jpg'}
                  alt={truck.title}
                  className="trucks-card-image"
                />
                <div className="trucks-card-year">{truck.year}</div>
                {truck.discount_percent > 0 && (
                  <div className="trucks-discount-badge">
                    -{truck.discount_percent}%
                  </div>
                )}
              </div>

              <div className="trucks-card-details">
                <h3 className="trucks-card-title">{truck.brand} {truck.model}</h3>
                <div className="trucks-card-price">
                  {truck.discount_percent > 0 ? (
                    <>
                      <span className="trucks-original-price">{formatPrice(truck.price)}</span>
                      <span className="trucks-final-price">{formatPrice(truck.final_price)}</span>
                    </>
                  ) : (
                    <span className="trucks-final-price">{formatPrice(truck.price)}</span>
                  )}
                </div>

                <div className="trucks-specs">
                  <div className="trucks-spec-item">
                    <Gauge className="trucks-spec-icon" />
                    <span>{truck.horsepower} HP</span>
                  </div>
                  <div className="trucks-spec-item">
                    <Truck className="trucks-spec-icon" />
                    <span>{truck.towing_capacity} kg towing</span>
                  </div>
                  <div className="trucks-spec-item">
                    <Cog className="trucks-spec-icon" />
                    <span>{truck.transmission}</span>
                  </div>
                </div>

                <div className="trucks-mileage">
                  {truck.mileage?.toLocaleString()} km
                </div>

                <button 
                  className="trucks-view-details-btn"
                  onClick={() => window.location.href = `/trucks/${truck.id}`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
</div>
  );
}

export default AllTrucksPage;