import { useEffect, useState } from "react";

export default function HotelList() {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/hotels') // URL do backend
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Hotéis Disponíveis</h2>
      {hotels.map(hotel => (
        <div key={hotel.id} className="card">
          <img src={hotel.image} alt={hotel.name} className="hotel-image" />
          <h3>{hotel.name}</h3>
          <p>{hotel.address} - {hotel.city}</p>
          <p>⭐ {hotel.rating}</p>
        </div>
      ))}
    </div>
  );
}
