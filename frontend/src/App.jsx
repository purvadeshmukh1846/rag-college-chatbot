import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const [documents, setDocuments] = useState([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await axios.post(`${API_URL}${endpoint}`, form);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      setAuthError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", uploadTitle || file.name);

    try {
      await axios.post(`${API_URL}/api/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadTitle("");
      setFile(null);
      fetchDocuments();
      alert("Document uploaded successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/chat`,
        { question: userMsg.text },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: res.data.answer, sources: res.data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error: could not get answer." },
      ]);
    } finally {
      setAsking(false);
    }
  };

  if (!token) {
    return (
      <div
        style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif" }}
      >
        <h2>{isLogin ? "Login" : "Register"} — College RAG Chatbot</h2>
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                display: "block",
                width: "100%",
                marginBottom: 10,
                padding: 8,
              }}
            />
          )}
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 8,
            }}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 10,
              padding: 8,
            }}
          />
          <button type="submit" style={{ width: "100%", padding: 10 }}>
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        {authError && <p style={{ color: "red" }}>{authError}</p>}
        <p
          onClick={() => setIsLogin(!isLogin)}
          style={{ cursor: "pointer", color: "blue" }}
        >
          {isLogin
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ maxWidth: 700, margin: "30px auto", fontFamily: "sans-serif" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>College RAG Chatbot</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <h3>Upload Document</h3>
        <form onSubmit={handleUpload}>
          <input
            placeholder="Title (optional)"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            style={{
              display: "block",
              marginBottom: 10,
              padding: 8,
              width: "100%",
            }}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: 10 }}
          />
          <button type="submit" disabled={uploading}>
            {uploading ? "Processing..." : "Upload PDF"}
          </button>
        </form>
        <div style={{ marginTop: 10 }}>
          <strong>Uploaded documents:</strong>
          <ul>
            {documents.map((doc) => (
              <li key={doc._id}>{doc.title}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ border: "1px solid #ccc", padding: 15, borderRadius: 8 }}>
        <h3>Ask a Question</h3>
        <div
          style={{
            minHeight: 200,
            maxHeight: 300,
            overflowY: "auto",
            marginBottom: 10,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                margin: "10px 0",
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: msg.role === "user" ? "#0084ff" : "#e5e5ea",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "80%",
                }}
              >
                {msg.text}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  Sources:{" "}
                  {msg.sources.map((s, idx) => (
                    <div key={idx}>• {s.text}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAsk} style={{ display: "flex", gap: 8 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about college documents..."
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit" disabled={asking}>
            {asking ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
