import { useState } from "react";
import "./ReservationPopup.css";

export default function ReservationPopup({ room, user, onClose }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/reservations", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut
      })
    })
    .then(async res => {
      if (!res.ok) {
        // Pega o detalhe do erro enviado pelo backend
        const errorData = await res.json();
        alert(errorData.detail || "Erro ao criar reserva");
      } else {
        alert("Reserva criada com sucesso!");
        onClose();
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <h3>Reservar {room.name}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Check-in:
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
          </label>
          <br />
          <label>
            Check-out:
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
          </label>
          <br />
          <div style={{marginTop:"10px"}}>
            <button type="submit">Confirmar Reserva</button>
            <button type="button" onClick={onClose} style={{marginLeft:"10px", backgroundColor:"#e74c3c"}}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
