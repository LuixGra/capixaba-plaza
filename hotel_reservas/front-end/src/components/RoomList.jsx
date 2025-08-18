export default function RoomList({ hotel, onSelectRoom }) {
  if (!hotel || !hotel.rooms) {
    return <p style={{ marginTop: "20px" }}>Nenhum quarto disponível.</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Quartos de {hotel.name}</h2>
      {hotel.rooms.map(room => (
        <div
          key={room.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
          onClick={() => onSelectRoom(room)}
        >
          <h3>{room.name}</h3>
          <p>Capacidade: {room.capacity} pessoas</p>
          <p>Preço: R$ {room.price}</p>
        </div>
      ))}
    </div>
  );
}
