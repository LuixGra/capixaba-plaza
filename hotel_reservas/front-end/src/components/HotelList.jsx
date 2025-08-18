import { useEffect, useState } from "react";
import "./HotelList.css";

export default function HotelList({ onSelectHotel }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/hotels")
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(err => console.error("Erro ao buscar hotéis:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando hotéis...</p>;
  if (hotels.length === 0) return <p>Nenhum hotel encontrado.</p>;

  return (
    <div className="hotel-list-container">
      <h2>Hotéis Disponíveis</h2>
      <div className="hotel-grid">
        {hotels.map(hotel => (
          <div
            key={hotel.id}
            className="hotel-card"
            onClick={() => onSelectHotel(hotel)}
          >
            <div className="hotel-image-container">
              <img
                src={hotel.image || "https://via.placeholder.com/300x200"} // fallback se não tiver imagem
                alt={hotel.name}
                className="hotel-image"
              />
            </div>
            <div className="hotel-info">
              <h3>{hotel.name}</h3>
              <p>{hotel.address} - {hotel.city}</p>
              <p>⭐ {hotel.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
