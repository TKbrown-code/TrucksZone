import Testimage from "../../assets/chatbg.jpg"
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./styles/header.css"
import rightimg from "../../assets/—Pngtree—3d illustration of a gear_20828871.png"
import aos from "aos";
import "aos/dist/aos.css";
import Headerimg from "../../assets/header.jpg"

function Header() {
   const navigate = useNavigate();
   const images = [
    "https://images.pexels.com/photos/1233363/pexels-photo-1233363.jpeg",
    "https://images.pexels.com/photos/1015555/pexels-photo-1015555.jpeg",
    "https://images.pexels.com/photos/937668/pexels-photo-937668.jpeg"

   ]
   const [randomImage, setRandomImage] = useState(images[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            setRandomImage(randomImage);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header>
        <div className="headercontainer">
          <div className="headeroverlay">
            <div className="headercontent">
                <div className="headercontentleft" data-aos="fade-right" data-aos-duration="1500">
                  <h2>TrucksZone</h2>
                  <h1>Need a Truck? Search no more!, <span style={{color:"red"}}>You are</span> at the right <span style={{color:"red"}}>spot</span>.</h1>                
                    <p>Browse premium trucks with verified details, transparent pricing, <br /> and full mechanical reports. Get the performance you need with confidence.</p>
                    <p></p>
                    <button title="Get Started" onClick={() => navigate("/allTrucks")} type="button" data-aos="fade-up" data-aos-duration="2000">Get Started</button>
                </div>
                <div className="headercontentright" data-aos="fade-left" data-aos-duration="1500">
                    
                </div>
            </div>
          </div>
          <div className="headerimage">
            <img src={Headerimg} alt="headerimage" />
          </div>
        </div>
      </header>
    );
}

export default Header;
