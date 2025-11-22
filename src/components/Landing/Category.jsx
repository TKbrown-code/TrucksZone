import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./styles/category.css";

function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [trucks, setTrucks] = useState([]);
    const [loadingTrucks, setLoadingTrucks] = useState(false);

    // Fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("id, name")
                .order("name", { ascending: true });

            if (!error) setCategories(data);
            setLoading(false);
        };

        fetchCategories();
    }, []);

    // Fetch trucks by selected category
    const filterTrucks = async (categoryId) => {
        setSelectedCategory(categoryId);
        setLoadingTrucks(true);

        const { data, error } = await supabase
            .from("trucks")
            .select(`
                *,
                truck_categories!inner(
                    category_id
                )
            `)
            .eq("truck_categories.category_id", categoryId);

        if (!error) setTrucks(data);
        setLoadingTrucks(false);
    };

    return (
        <div className="categorycontainer">
            
            {/* CATEGORY LIST */}
            <div className="category">
                {loading ? (
                    <p>Loading categories...</p>
                ) : (
                    categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`categoryitem ${
                                selectedCategory === cat.id ? "active" : ""
                            }`}
                            onClick={() => filterTrucks(cat.id)}
                        >
                            <h3>{cat.name}</h3>
                        </div>
                    ))
                )}
            </div>

            {/* TRUCK RESULTS */}
            <div className="truckresults">
                {selectedCategory && (
                    <h2 className="resulttitle">
                        Showing trucks in: <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
                    </h2>
                )}

                {loadingTrucks && <p>Loading trucks...</p>}

                {!loadingTrucks && trucks.length === 0 && selectedCategory && (
                    <p>No trucks found in this category.</p>
                )}

                <div className="trucklist">
                    {trucks.map((truck) => (
                        <div key={truck.id} className="truckcard">
                            <h4>{truck.name}</h4>
                            <p>{truck.model}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default Category;
