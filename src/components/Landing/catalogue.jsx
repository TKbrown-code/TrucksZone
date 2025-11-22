import { useState } from "react";
import "./styles/catalogue.css"
import Intro1 from "../../assets/catalogueintro1.jpg"
import Intro2 from "../../assets/catalogueintro2.jpg"
import Intro3 from "../../assets/testimage.jpg"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight, faBoxes } from "@fortawesome/free-solid-svg-icons";

function Intro() {
    return (
        <div className="CatalogueIntro">
            <div className="CatalogueIntroheader">
                <h1>Our Catalogue<FontAwesomeIcon icon={faBoxes}/></h1>
                <p>Explore our comprehensive truck catalogue, featuring verified details, transparent pricing, and full mechanical reports. Find the performance you need with confidence.</p>
            </div>
            <div className="CatalogueIntrocards">
                <div className={`CatalogueIntrocard `}
                >
                    <img src={Intro1} alt="" />
                    <div className="CatalogueIntrocardcontent">
                        <h3>Truck Type</h3>
                        <p>Discover the perfect truck for your needs with our comprehensive catalogue. From heavy-duty to specialized models, we've got you covered.</p>
                        <button>View Trucks <FontAwesomeIcon icon={faArrowAltCircleRight} /></button>
                    </div>
                </div>
                <div className={`CatalogueIntrocard `}
                >
                    <img src={Intro2} alt="" />
                    <div className="CatalogueIntrocardcontent">
                        <h3>Truck Model</h3>
                        <p>Explore our diverse range of truck models, from classic to modern designs. Find the perfect truck for your needs with our comprehensive catalogue.</p>
                        <button>View Trucks <FontAwesomeIcon icon={faArrowAltCircleRight} /></button>
                    </div>
                </div>
                <div className={`CatalogueIntrocard `}
                >
                    <img src={Intro3} alt="" />
                    <div className="CatalogueIntrocardcontent">
                        <h3>Truck Brand</h3>
                        <p>Discover top truck brands with designs and features that meet your needs.</p>
                        <button>View Trucks<FontAwesomeIcon icon={faArrowAltCircleRight} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CatalogueSlider(){
    
    return(
        <div className="CatalogueSlider">
            <div className="CatalogueSlidercontainer">
                <div className="slideimages">
                    <img src={Intro1} alt="" />
                    <div className="slideimagecontent">
                        <p>Looking for a truck? Our catalogue has got you covered. From heavy-duty to specialized models, we've got you covered.</p>
                        <button>View All Trucks <FontAwesomeIcon icon={faArrowAltCircleRight} /></button>
                    </div>
                </div>
                <div className="slideimages">
                    <img src={Intro2} alt="" />
                    <div className="slideimagecontent">
                        <p>Looking for a truck? Our catalogue has got you covered. From heavy-duty to specialized models, we've got you covered.</p>
                        <button>View All Trucks <FontAwesomeIcon icon={faArrowAltCircleRight} /></button>
                    </div>
                </div>
                <div className="slideimages">
                    <img src={Intro3} alt="" />
                    <div className="slideimagecontent">
                        <p>Looking for a truck? Our catalogue has got you covered. From heavy-duty to specialized models, we've got you covered.</p>
                        <button>View All Trucks <FontAwesomeIcon icon={faArrowAltCircleRight} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Catalogue() {
    return (
        <div className="catalogue">
            <Intro />
            <CatalogueSlider />
        </div>
    );
}

export default Catalogue;
