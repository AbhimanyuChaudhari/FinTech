import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Placeholder for real authentication logic
    console.log("Logging in with:", email, password);

    // TODO: Add API call or Firebase auth
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
      </form>
    </div>
  );
};

export default Login;
