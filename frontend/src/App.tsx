import { useEffect, useState } from "react";
import "./App.css";
import { useAuth0 } from "@auth0/auth0-react";

interface Image {
  id: string;
  title: string;
  user: string;
  url: string;
  created_at: string;
}

const API_URL = "http://localhost:8000/images/";

interface QuotaInfo {
  user_quota: {
    used: number;
    limit: number;
    remaining: number;
  };
  global_quota: {
    used: number;
    limit: number;
    remaining: number;
  };
}

function App() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    error: authError,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [form, setForm] = useState({ title: "", url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  const fetchQuota = async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:8000/quota/${userId}`, {
        headers: {
          "X-User-Email": userId,
        },
      });
      const data = await response.json();
      setQuotaInfo(data);
    } catch (err) {
      console.error("Failed to fetch quota:", err);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: {
          "X-User-Email": user?.sub || "",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      fetchImages();
      fetchQuota(user.sub);
    }
  }, [isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.sub) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": user.sub,
        },
        body: JSON.stringify({ ...form, user: user.sub }),
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Failed to add image" }));
        throw new Error(errorData.detail || "Failed to add image");
      }
      setForm({ title: "", url: "" });
      fetchImages();
      fetchQuota(user.sub);
    } catch (err: any) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(API_URL + id, {
        method: "DELETE",
        headers: {
          "X-User-Email": user?.sub || "",
        },
      });
      if (!res.ok) throw new Error("Failed to delete image");
      fetchImages();
    } catch (err: any) {
      setError(err);
    }
  };

  if (authLoading) {
    return (
      <div
        style={{ textAlign: "center", marginTop: "3rem", fontSize: "1.5rem" }}
      >
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: 500,
          margin: "4rem auto",
          padding: "3rem",
          textAlign: "center",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px #0002",
        }}
      >
        <h1 style={{ marginBottom: "2rem", color: "#222" }}>Image Gallery</h1>
        <p style={{ marginBottom: "2rem", color: "#666" }}>
          Please log in to access the gallery
        </p>
        {authError && (
          <p style={{ color: "red", marginBottom: "1rem" }}>
            Error: {authError.message}
          </p>
        )}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={signup}
            style={{
              padding: "12px 32px",
              borderRadius: 8,
              background: "#0077cc",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Sign Up
          </button>
          <button
            onClick={login}
            style={{
              padding: "12px 32px",
              borderRadius: 8,
              background: "#222",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "2rem auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: 8,
        }}
      >
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: "#222" }}>
            {user?.name || user?.email}
          </p>
          {quotaInfo && (
            <p style={{ margin: "0.25rem 0 0 0", fontSize: 14, color: "#666" }}>
              Quota: {quotaInfo.user_quota.remaining}/
              {quotaInfo.user_quota.limit} remaining
            </p>
          )}
        </div>
        <button
          onClick={logout}
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            background: "#e74c3c",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Logout
        </button>
      </div>

      <h1
        style={{
          textAlign: "center",
          fontSize: "3rem",
          fontWeight: 700,
          marginBottom: 40,
          letterSpacing: "-2px",
          color: "#222",
        }}
      >
        Image Gallery
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: 40,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <div>
          <label style={{ fontWeight: 500, color: "#333" }}>
            Title
            <br />
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #bbb",
                minWidth: 200,
              }}
            />
          </label>
        </div>
        <div>
          <label style={{ fontWeight: 500, color: "#333" }}>
            Image URL
            <br />
            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              required
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #bbb",
                minWidth: 300,
              }}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 22px",
            borderRadius: 6,
            background: "#222",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            boxShadow: "0 2px 8px #0001",
            transition: "background 0.2s",
          }}
        >
          Add Image{" "}
          {quotaInfo &&
            `(${quotaInfo.user_quota.remaining}/${quotaInfo.user_quota.limit})`}
        </button>
      </form>
      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>
          Error: {error.message}
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2rem",
          alignItems: "stretch",
        }}
      >
        {images.length === 0 && !loading && (
          <p style={{ textAlign: "center", gridColumn: "1/-1" }}>
            No images found.
          </p>
        )}
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              boxShadow: "0 4px 24px #0002",
              borderRadius: 16,
              padding: 0,
              background: "#fff",
              overflow: "hidden",
              border: "1px solid #eee",
              maxWidth: 500,
              margin: "0 auto",
              transition: "box-shadow 0.2s",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <img
              src={img.url}
              alt={img.title}
              style={{
                width: "100%",
                display: "block",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                objectFit: "cover",
                maxHeight: 350,
                minHeight: 200,
                background: "#eee",
              }}
            />
            <div
              style={{
                padding: 24,
                paddingTop: 18,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#222",
                    textAlign: "center",
                  }}
                >
                  {img.title}
                </h2>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    color: "#555",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  By: <span style={{ color: "#0077cc" }}>{img.user}</span>
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: 13,
                    color: "#888",
                    textAlign: "center",
                  }}
                >
                  Created: {new Date(img.created_at).toLocaleString()}
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: 13,
                    color: "#888",
                    textAlign: "center",
                  }}
                >
                  ID: {img.id}
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: 13,
                    color: "#888",
                    textAlign: "center",
                  }}
                >
                  URL:{" "}
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0077cc", wordBreak: "break-all" }}
                  >
                    {img.url}
                  </a>
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 18,
                }}
              >
                <button
                  onClick={() => handleDelete(img.id)}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 24px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: "0 2px 8px #e74c3c22",
                    transition: "background 0.2s",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
