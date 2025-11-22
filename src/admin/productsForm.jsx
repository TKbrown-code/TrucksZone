// src/components/TruckUpload.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { UploadTruckData } from "../hooks/useFunctions";
import { useModal } from "../../contexts/ModalContext";
import Swal from "sweetalert2";

export default function TruckUpload() {
  const [truck, setTruck] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    engine_size: "",
    engine_type: "",
    horsepower: "",
    torque: "",
    transmission: "",
    mileage: "",
    previous_owners: "",
    accident_history: "",
    maintenance_history: "",
    towing_capacity: "",
    payload_capacity: "",
    exterior_condition: "",
    interior_condition: "",
    tire_condition: "",
    price: "",
    discount_percent: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { showModal, hideModal } = useModal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTruck((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {

        Swal.fire({
            title: "Please wait...",
            text: "Uploading truck details...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

     const response = await UploadTruckData(truck);

     if(response.error){
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: response.error || "An error occurred during upload. Please try again.",
        confirmButtonText: "Try Again"
      });
     }

     if(response.success){
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.message || "Truck Details uploaded successfully!",
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        hideModal();
      });
     }

      setTruck({
        title: "",
        brand: "",
        model: "",
        year: "",
        engine_size: "",
        engine_type: "",
        horsepower: "",
        torque: "",
        transmission: "",
        mileage: "",
        previous_owners: "",
        accident_history: "",
        maintenance_history: "",
        towing_capacity: "",
        payload_capacity: "",
        exterior_condition: "",
        interior_condition: "",
        tire_condition: "",
        price: "",
        discount_percent: ""
      });
    } catch (err) {
        
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "An error occurred during upload. Please try again.",
        confirmButtonText: "Try Again"
      });
    } finally {
        Swal.fire({
            title: "Please wait...",
            text: " Uploading truck details...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
      setLoading(false);
    }
  };

  return (
    <div className="">
      <h2 className="">Upload Truck Details</h2>
      <form onSubmit={handleSubmit} className="">
        {Object.keys(truck).map((field) => (
          <div key={field} className="">
            <label className="">{field.replace(/_/g, " ")}</label>
            <input
              type={["year","horsepower","torque","mileage","previous_owners","towing_capacity","payload_capacity","price","discount_percent"].includes(field) ? "number" : "text"}
              name={field}
              value={truck[field]}
              onChange={handleChange}
              required={["title","brand","model","year","price"].includes(field)}
              className=""
            />
          </div>
        ))}
        <div className="">
          <button
            type="submit"
            disabled={loading}
            className=""
          >
            {loading ? "Uploading..." : "Upload Truck"}
          </button>
        </div>
      </form>
      {message && <p className="">{message}</p>}
    </div>
    
  );
}
