import React, { useState, useEffect } from "react";
import CounterButton from "./CounterButton";
import CounterDisplay from "./CounterDisplay";
import UserManager from "./UserManager";
import supabase from "./supabaseClient";
import "./App.css";

function App() {
  const [user, setUser] = useState(null); // logged-in username
  const [nameInput, setNameInput] = useState("");
  const [count, setCount] = useState(0);
  const [showCounter, setShowCounter] = useState(true);
  const [flash, setFlash] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userList, setUserList] = useState([]);

  const handleQuickLogin = async (username) => {
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !userData) {
      alert("Error logging in");
      return;
    }

    setUser(username);
    setCount(userData.counter || 0);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const newUsername = nameInput.trim();

    if (!newUsername) return;

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", newUsername)
      .single();

    if (existingUser) {
      alert("Username already exists. Choose another.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .insert([{ username: newUsername, counter: 0 }]);

    if (error) {
      alert("Error creating user.");
      return;
    }

    setNameInput("");
    setUserList((prev) => [...prev, newUsername]); // show new user in list
  };

  // 🔁 Logout
  const handleLogout = () => {
    setUser(null);
    setCount(0);
  };

  // UI logic
  const increment = async () => {
    const newCount = count + 1;
    setCount(newCount);

    if (user) {
      await supabase
        .from("users")
        .update({ counter: newCount })
        .eq("username", user);

      setRefreshKey((prev) => prev + 1); // refresh AFTER update
    }
  };

  const reset = async () => {
    setCount(0);
    setFlash(true);

    if (user) {
      await supabase.from("users").update({ counter: 0 }).eq("username", user);

      setRefreshKey((prev) => prev + 1);
    }

    setTimeout(() => setFlash(false), 300);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        const { data, error } = await supabase
          .from("users")
          .select("username")
          .order("username", { ascending: true });

        if (!error) {
          setUserList(data.map((u) => u.username));
        }
      }
    };

    fetchUsers();
  }, [user]);

  const toggleVisibility = () => setShowCounter(!showCounter);

  return (
    <div className="container">
      {!user ? (
        <div className="mb-20">
          <h1 className="heading">Select a User to Log In</h1>

          {userList.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "20px",
                padding: "20px",
              }}
            >
              {userList.map((username) => (
                <div
                  key={username}
                  onClick={() => handleQuickLogin(username)}
                  className="user-card"
                >
                  <img
                    src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${username}`}
                    alt={username}
                    className="avatar-img"
                  />
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {username}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No users yet. Create one below.</p>
          )}

          <hr style={{ margin: "40px auto", width: "50%" }} />

          <form onSubmit={handleCreateUser}>
            <h2>Create New User</h2>
            <input
              type="text"
              placeholder="New username"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{ padding: "5px", marginRight: "10px" }}
            />
            <button type="submit">Create User</button>
          </form>
        </div>
      ) : (
        <>
          <h1 className="heading">Welcome, {user}!</h1>
          <CounterButton label="Logout" onClick={handleLogout} />
          <CounterButton
            label={showCounter ? "Hide Counter" : "Show Counter"}
            onClick={toggleVisibility}
          />
          {showCounter && (
            <>
              <CounterDisplay value={count} flash={flash} />
              <CounterButton label="+1" onClick={increment} />
              <CounterButton label="Reset" onClick={reset} />
            </>
          )}
          <UserManager refreshTrigger={refreshKey} />
        </>
      )}
    </div>
  );
}

export default App;
