import { useState, useEffect } from 'react';

const API_BASE = "https://interview-tracker-api-kn5y.onrender.com";
const FILTER_DAYS = { today: 0, "2days": 2, "7days": 7 };

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [problems, setProblems] = useState([]);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState("");
  const [filter, setFilter] = useState("today"); // "today" | "2days" | "7days" | "all"
  const [link, setLink] = useState("");

  useEffect(() => {
    if (token) loadProblems();
  }, [token]);

  async function register() {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Registered! Now log in." : data.detail);
  }

  async function login() {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } else {
      setMessage(data.detail);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setProblems([]);
  }

  async function loadProblems(currentFilter = filter) {
    const days = FILTER_DAYS[currentFilter]; // undefined for "all"
    const url = days !== undefined
      ? `${API_BASE}/problems?due_within=${days}`
      : `${API_BASE}/problems`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProblems(await res.json());
  }

  function changeFilter(newFilter) {
    setFilter(newFilter);
    loadProblems(newFilter);
  }

  async function reviewProblem(id, level) {
    await fetch(`${API_BASE}/problems/${id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ level }),
    });
    loadProblems();
  }

  async function addProblem() {
  await fetch(`${API_BASE}/problems`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, company, topic, link }),
  });
  setName("");
  setCompany("");
  setTopic("");
  setLink("");
  loadProblems();
}

  // ----- Logged-in view -----
  if (token) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Problems</h2>
            <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-200">
              Logout
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {[
              { key: "today", label: "Due today" },
              { key: "2days", label: "Due in 2 days" },
              { key: "7days", label: "Due in 7 days" },
              { key: "all", label: "All" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => changeFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  filter === f.key
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
            <input
              placeholder="Problem name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
            <input
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-32 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
            <input
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-32 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
            <input
              placeholder="Link (Prachub/1point3acres URL)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
            <button
  onClick={addProblem}
  className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-md px-6 py-2 text-sm font-medium ml-1"
>
  Add
</button>
          </div>

          <div className="space-y-2">
            {problems.length === 0 && (
              <p className="text-slate-500 text-sm">Nothing here for this filter.</p>
            )}
            {problems.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {p.link ? (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-blue-400 underline decoration-slate-600">
                          {p.name}
                        </a>
                      ) : (
                        <span className="font-medium">{p.name}</span>
                      )}
                    {p.company && (
                      <span className="text-xs bg-slate-800 text-blue-400 px-2 py-0.5 rounded-full">
                        {p.company}
                      </span>
                    )}
                    {p.topic && (
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                        {p.topic}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    next review {p.next_review} · reviewed {p.review_count}x
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => reviewProblem(p.id, "again")} className="w-9 h-8 text-xs rounded-md bg-slate-800 border border-slate-700 hover:border-red-500">1d</button>
                  <button onClick={() => reviewProblem(p.id, "hard")} className="w-9 h-8 text-xs rounded-md bg-slate-800 border border-slate-700 hover:border-amber-500">3d</button>
                  <button onClick={() => reviewProblem(p.id, "good")} className="w-9 h-8 text-xs rounded-md bg-slate-800 border border-slate-700 hover:border-blue-500">7d</button>
                  <button onClick={() => reviewProblem(p.id, "easy")} className="w-9 h-8 text-xs rounded-md bg-slate-800 border border-slate-700 hover:border-green-500">14d</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----- Logged-out view (login/register) -----
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-1">Interview Tracker</h2>
        <p className="text-slate-400 text-sm mb-5">Log in or create an account</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 mb-3 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 mb-4 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-2 mb-3">
          <button
            onClick={register}
            className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors rounded-md py-2 text-sm font-medium"
          >
            Register
          </button>
          <button
            onClick={login}
            className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors rounded-md py-2 text-sm font-medium"
          >
            Login
          </button>
        </div>
        {message && <p className="text-sm text-slate-400">{message}</p>}
      </div>
    </div>
  );
}

export default App;