import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRegister) {
      // Tenta logar
      const res = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });

      if (res.status === 200) {
        const user = await res.json();
        onLogin(user);
      } else if (res.status === 404) {
        // Usuário não existe → ativa tela de registro
        setIsRegister(true);
      } else {
        alert("Senha incorreta!");
      }
    } else {
      // Registrar novo usuário
      const res = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, password})
      });

      if (res.status === 200) {
        const user = await res.json();
        alert("Registro concluído!");
        onLogin(user); // loga automaticamente
      } else {
        const data = await res.json();
        alert(data.detail || "Erro ao registrar");
      }
    }
  }

  return (
    <div className="container">
      <h1>{isRegister ? "Registrar" : "Login"}</h1>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            Nome:
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </label>
        )}
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Senha:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <br />
        <button type="submit">{isRegister ? "Registrar" : "Entrar"}</button>
      </form>
    </div>
  );
}
