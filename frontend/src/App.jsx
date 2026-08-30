import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

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
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (token) {
      fetchDocuments();
      fetchHistory();
      fetchSuggestions();
    }
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
    setMessages([]);
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

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await axios.delete(`${API_URL}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDocuments();
    } catch (err) {
      alert("Failed to delete document");
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
      fetchSuggestions();
      alert("Document uploaded successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const sendQuestion = async (q) => {
    if (!q.trim()) return;
    const userMsg = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/chat`,
        { question: q },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.data.answer,
          sources: res.data.sources,
          _id: res.data.messageId,
          feedback: null,
        },
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

  const handleAsk = (e) => {
    e.preventDefault();
    sendQuestion(question);
  };

  const handleFeedback = async (messageId, feedback, index) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === index ? { ...m, feedback } : m)),
    );
    try {
      await axios.post(
        `${API_URL}/api/chat/feedback`,
        { messageId, feedback },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? "Login" : "Register"} — College RAG Chatbot</h2>
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        {authError && <p style={{ color: "#f87171" }}>{authError}</p>}
        <p className="switch-link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>College RAG Chatbot</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="card">
        <h3>Upload Document</h3>
        <form onSubmit={handleUpload}>
          <input
            className="upload-input"
            placeholder="Title (optional)"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: 10, color: "#cbd5e1" }}
          />
          <button className="upload-btn" type="submit" disabled={uploading}>
            {uploading ? "Processing..." : "Upload PDF"}
          </button>
        </form>
        <ul className="doc-list">
          {documents.map((doc) => (
            <li
              key={doc._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{doc.title}</span>
              <button
                onClick={() => handleDeleteDoc(doc._id)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Ask a Question</h3>

        {suggestions.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendQuestion(s)}
                style={{
                  background: "#334155",
                  color: "#cbd5e1",
                  border: "1px solid #475569",
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="chat-box">
          {messages.map((msg, i) => (
            <div key={msg._id || i}>
              <div className={`msg-row ${msg.role}`}>
                <div className={`msg-bubble ${msg.role}`}>{msg.text}</div>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="sources-box">
                  {msg.sources.map((s, idx) => (
                    <div key={idx}>• {s.text}</div>
                  ))}
                </div>
              )}
              {msg.role === "ai" && msg._id && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 4,
                    marginLeft: 4,
                  }}
                >
                  <button
                    onClick={() => handleFeedback(msg._id, "up", i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      opacity: msg.feedback === "up" ? 1 : 0.4,
                    }}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleFeedback(msg._id, "down", i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      opacity: msg.feedback === "down" ? 1 : 0.4,
                    }}
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAsk} className="chat-input-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about college documents..."
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
