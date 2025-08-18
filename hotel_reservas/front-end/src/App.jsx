import { useState } from "react";
import Login from "./components/Login.jsx";
import HotelList from "./components/HotelList.jsx";
import RoomList from "./components/RoomList.jsx";
import ReservationPopup from "./components/ReservationPopup.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="container">
      <h1>Bem-vindo, {user.name}!</h1>
      <button onClick={() => setUser(null)} style={{marginBottom:"20px"}}>Sair</button>

      <HotelList onSelectHotel={hotel => {
        setSelectedHotel(hotel);
        setSelectedRoom(null);
      }} />

      {selectedHotel && (
        <RoomList hotel={selectedHotel} onSelectRoom={room => {
          setSelectedRoom(room);
          setShowPopup(true);
        }} />
      )}

      {selectedRoom && showPopup && (
        <ReservationPopup 
          room={selectedRoom} 
          user={user} 
          onClose={() => setShowPopup(false)} 
        />
      )}
    </div>
  );
}
