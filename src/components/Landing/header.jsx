import Testimage from "../../assets/chatbg.jpg"
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./styles/header.css"


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
                <div className="headercontentleft">
                    <h1><span style={{ textDecorationColor:"crimson", textDecorationThickness:"2px"}}>Trucks</span>Zone</h1>
                    <h2>Discover Powerful Trucks for Every Job</h2>
                    <p>Browse premium trucks with verified details, transparent pricing, <br /> and full mechanical reports. Get the performance you need with confidence.</p>
                    <p></p>
                    <button title="Get Started" onClick={() => navigate("/allTrucks")} type="button">Get Started</button>
                </div>
            </div>
          </div>
          <div className="headerimage">
            <img src="https://images.unsplash.com/photo-1551830820-330a71b99659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWNrdXAlMjB0cnVja3xlbnwxfHx8fDE3NjM2MzY1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="headerimage" />
          </div>
        </div>
      </header>
    );
}

export default Header;
