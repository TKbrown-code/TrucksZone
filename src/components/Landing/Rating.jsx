import { useEffect, useRef, useState } from "react";
import "./styles/Rating.css";

function Rating() {
    const items = [
        { value: 500000, label: "Trucks Available" },
        { value: 150000, label: "Satisfied Customers" },
        { value: 20, label: "Years of Experience" },
        { value: 35, label: "Trusted Partners" },
        { value: 170000, label: "Trucks Sold" },
    ];

    return (
        <div className="ratingcontainer">
            <div className="rating">
                {items.map((item, index) => (
                    <CounterBox key={index} value={item.value} label={item.label} />
                ))}
            </div>
        </div>
    );
}

function CounterBox({ value, label }) {
    const [count, setCount] = useState(0);
    const ref = useRef();
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    startCounting();
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    const startCounting = () => {
        const duration = 2000; // 2 seconds
        const start = performance.now();

        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * value));

            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    };

    return (
        <div className="ratingitem" ref={ref}>
            <h3>{formatNumber(count)}</h3>
            <p>{label}</p>
        </div>
    );
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000).toFixed(0) + "K+";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K+";
    return num + "+";
}

export default Rating;
