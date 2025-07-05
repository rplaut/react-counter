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
  const [newTeam, setNewTeam] = useState("");
  const [newRole, setNewRole] = useState("");

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

    if (!newUsername) {
      alert("Please enter a username.");
      return;
    }

    if (!newTeam) {
      alert("Please select a team.");
      return;
    }

    if (!newRole) {
      alert("Please select a role.");
      return;
    }

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
      .insert([
        { username: newUsername, counter: 0, team: newTeam, role: newRole },
      ]);

    if (error) {
      alert("Error creating user.");
      return;
    }

    setNameInput("");
    setNewTeam("");
    setNewRole("");
    setUserList((prev) => [
      ...prev,
      { username: newUsername, counter: 0, team: newTeam, role: newRole },
    ]);
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
          .select("username, counter, team, role")
          .order("username", { ascending: true });

        if (error) {
          console.error("Supabase fetch error:", error.message);
        } else {
          setUserList(data);
          console.log("Fetched users:", data);
        }
      }
    };

    fetchUsers();
  }, [user]);

  const toggleVisibility = () => setShowCounter(!showCounter);

  const groupedUsers = userList.reduce((acc, user) => {
    if (!acc[user.team]) acc[user.team] = [];
    acc[user.team].push(user);
    return acc;
  }, {});

  console.log(userList);

  return (
    <div className="container">
      {!user ? (
        <div className="mb-20">
          <div className="mb-20">
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="New username"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{ padding: "5px", marginRight: "10px" }}
              />
              <select
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                style={{ padding: "5px", marginRight: "10px" }}
              >
                <option value="">Select Team</option>
                <option value="ENGINEERING">ENGINEERING</option>
                <option value="PMO">PMO</option>
                <option value="PRODUCT">PRODUCT</option>
              </select>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{ padding: "5px", marginRight: "10px" }}
              >
                <option value="">Select Role</option>
                <option value="Engineer">Engineer</option>
                <option value="Senior Director of Engineering">
                  Senior Director of Engineering
                </option>
                <option value="Senior Product Manager">
                  Senior Product Manager
                </option>
                <option value="Program Manager">Program Manager</option>
                <option value="VP of Product">VP of Product</option>
                <option value="VP of PMO">VP of PMO</option>
              </select>
              <button type="submit">Create User</button>
            </form>

            <hr style={{ margin: "40px auto", width: "50%" }} />

            <h1 className="heading">Select a User to Log In</h1>

            {Object.keys(groupedUsers).length > 0 ? (
              <div
                style={{
                  display: "block",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "20px",
                  padding: "20px",
                }}
              >
                {Object.keys(groupedUsers)
                  .sort()
                  .map((team, index) => (
                    <div key={team} style={{ marginBottom: "60px" }}>
                      {index > 0 && (
                        <hr style={{ margin: "40px auto", width: "80%" }} />
                      )}

                      <h2 style={{ textAlign: "left", marginLeft: "20px" }}>
                        {team}
                      </h2>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "20px",
                          padding: "20px",
                        }}
                      >
                        {groupedUsers[team].map((userObj) => (
                          <div
                            key={userObj.username}
                            onClick={() => handleQuickLogin(userObj.username)}
                            className="user-card"
                            style={{
                              border: "1px solid #ddd",
                              borderRadius: "10px",
                              padding: "15px",
                              textAlign: "center",
                              cursor: "pointer",
                              backgroundColor: "#fff",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                              transition: "transform 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.03)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          >
                            <img
                              src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${userObj.username}`}
                              alt={userObj.username}
                              className="avatar-img"
                              style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                marginBottom: "10px",
                              }}
                            />
                            <div
                              style={{ fontWeight: "bold", fontSize: "16px" }}
                            >
                              {userObj.username}
                            </div>
                            <div style={{ fontSize: "14px", color: "#555" }}>
                              {userObj.role}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>No users yet. Create one above.</p>
            )}
          </div>
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
