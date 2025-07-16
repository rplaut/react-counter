// src/App.js

import React, { useEffect, useReducer } from "react";
import CounterButton from "./CounterButton";
import CounterDisplay from "./CounterDisplay";
import UserManager from "./UserManager";
import supabase from "./supabaseClient";
import { fetchPullRequests } from "./githubApi";
import GitHubPRList from "./GitHubPRList";
import "./App.css";

const GITHUB_OWNER = "rplaut"; // example: 'vercel'
const GITHUB_REPO = "react-counter"; // example: 'next.js'

// 2. Define initial state object
const initialState = {
  user: null,
  userList: [],
  count: 0,
  showCounter: true,
  flash: false,
  refreshKey: 0,
  nameInput: "",
  newTeam: "",
  newRole: "",
  githubUsername: "",
  userPullRequests: [],
  noteDate: new Date().toISOString().split("T")[0],
  noteText: "",
  userNotes: [],
};

// 3. Define a reducer function
function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "CREATE_USER_SUCCESS":
      return {
        ...state,
        nameInput: "",
        newTeam: "",
        newRole: "",
        githubUsername: "",
        userList: [...state.userList, action.payload],
      };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        count: action.payload.counter || 0,
      };

    case "SET_NOTES":
      return {
        ...state,
        userNotes: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        count: 0,
        userNotes: [],
        userPullRequests: [],
      };

    case "SET_COUNT":
      return {
        ...state,
        count: action.payload,
      };

    case "SET_FLASH":
      return {
        ...state,
        flash: action.payload,
      };

    case "INCREMENT_REFRESH_KEY":
      return {
        ...state,
        refreshKey: state.refreshKey + 1,
      };

    case "SET_USER_LIST":
      return {
        ...state,
        userList: action.payload,
      };

    case "SET_PULL_REQUESTS":
      return {
        ...state,
        userPullRequests: action.payload,
      };

    case "TOGGLE_COUNTER":
      return {
        ...state,
        showCounter: !state.showCounter,
      };

    case "SUBMIT_NOTE_SUCCESS":
      return {
        ...state,
        noteText: "", // Clear the textarea
        noteDate: new Date().toISOString().split("T")[0], // Reset date to today
        userNotes: action.payload, // Update the notes list with the fresh data
      };

    default:
      return state;
  }
}

function App() {
  // 4. Initialize state with useReducer
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    user,
    userList,
    count,
    showCounter,
    flash,
    refreshKey,
    nameInput,
    newTeam,
    newRole,
    githubUsername,
    userPullRequests,
    noteDate,
    noteText,
    userNotes,
  } = state;

  // --- REMOVE OLD useState hooks ---
  // const [user, setUser] = useState(null);
  // const [nameInput, setNameInput] = useState("");
  // const [count, setCount] = useState(0);
  // const [showCounter, setShowCounter] = useState(true);
  // const [flash, setFlash] = useState(false);
  // const [refreshKey, setRefreshKey] = useState(0);
  // const [userList, setUserList] = useState([]);
  // const [newTeam, setNewTeam] = useState("");
  // const [newRole, setNewRole] = useState("");
  // const [githubUsername, setGithubUsername] = useState("");
  // const [userPullRequests, setUserPullRequests] = useState([]);
  // const [noteDate, setNoteDate] = useState(() => {
  //   return new Date().toISOString().split("T")[0];
  // });
  // const [noteText, setNoteText] = useState("");
  // const [userNotes, setUserNotes] = useState([]);
  // ------------------------------------

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

    // START of code to UPDATE
    // Dispatch the action to log the user in and set their counter
    dispatch({ type: "LOGIN_SUCCESS", payload: userData });

    // Fetch notes for the logged-in user...
    const notes = await fetchNotesForUser(userData.id);

    // ...and dispatch an action to set them in the state
    dispatch({ type: "SET_NOTES", payload: notes });
    // END of code to UPDATE
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

    const newUser = {
      username: newUsername,
      counter: 0,
      team: newTeam,
      role: newRole,
      github_username: githubUsername || null,
    };

    const { error } = await supabase.from("users").insert([newUser]);

    if (error) {
      alert("Error creating user.");
      console.error("Insert error:", error); // It's good practice to log the error
      return;
    }

    dispatch({ type: "CREATE_USER_SUCCESS", payload: newUser });
  };

  // 🔁 Logout
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  // UI logic
  const increment = async () => {
    const newCount = count + 1;
    dispatch({ type: "SET_COUNT", payload: newCount });

    if (user) {
      // Note: We're not using .eq("username", user) anymore,
      // because our user object from state is the full user record.
      await supabase
        .from("users")
        .update({ counter: newCount })
        .eq("id", user.id); // Use the user's ID for the update

      dispatch({ type: "INCREMENT_REFRESH_KEY" }); // refresh AFTER update
    }
  };

  const reset = async () => {
    dispatch({ type: "SET_COUNT", payload: 0 });
    dispatch({ type: "SET_FLASH", payload: true });

    if (user) {
      await supabase.from("users").update({ counter: 0 }).eq("id", user.id); // Also use user.id here for consistency

      dispatch({ type: "INCREMENT_REFRESH_KEY" });
    }

    setTimeout(() => dispatch({ type: "SET_FLASH", payload: false }), 300);
  };

  const fetchNotesForUser = async (userId) => {
    if (!userId) {
      console.warn("No user ID was provided to fetch notes.");
      return []; // Return an empty array to prevent errors
    }

    const { data, error } = await supabase
      .from("notes")
      .select("id, date, note_text, created_at")
      .eq("user_id", userId) // Use the userId argument
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
      return []; // Return an empty array on error
    }

    // Instead of setting state, we just return the data.
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      // We only fetch the user list when nobody is logged in.
      if (!user) {
        const { data, error } = await supabase
          .from("users")
          .select("username, counter, team, role, github_username")
          .order("username", { ascending: true });

        if (error) {
          console.error("Supabase fetch error:", error.message);
        } else {
          // Dispatch an action to set the user list in our state
          dispatch({ type: "SET_USER_LIST", payload: data });
        }
      }
    };

    fetchUsers();
  }, [user]); // This dependency array is correct.

  useEffect(() => {
    const fetchPRsForUser = async () => {
      // If there's no user, or the user object doesn't have a github_username,
      // we clear the pull requests and exit.
      if (!user || !user.github_username) {
        dispatch({ type: "SET_PULL_REQUESTS", payload: [] });
        return;
      }

      try {
        const allPRs = await fetchPullRequests(GITHUB_OWNER, GITHUB_REPO);

        // Filter PRs created by the user's github_username (case-insensitive)
        const prs = allPRs.filter(
          (pr) =>
            pr.user?.login?.toLowerCase() === user.github_username.toLowerCase()
        );

        // Dispatch the fetched PRs to our state
        dispatch({ type: "SET_PULL_REQUESTS", payload: prs });
      } catch (err) {
        console.error("GitHub PR fetch failed:", err.message);
        // In case of an error, ensure the PR list is empty
        dispatch({ type: "SET_PULL_REQUESTS", payload: [] });
      }
    };

    fetchPRsForUser();
  }, [user]); // The dependency array now only needs `user`

  const toggleVisibility = () => {
    dispatch({ type: "TOGGLE_COUNTER" });
  };

  const groupedUsers = userList.reduce((acc, user) => {
    if (!acc[user.team]) acc[user.team] = [];
    acc[user.team].push(user);
    return acc;
  }, {});

  console.log(userList);

  console.log("👤 user =", user);

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
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "nameInput",
                    value: e.target.value,
                  })
                }
                style={{ padding: "5px", marginRight: "10px" }}
              />
              <select
                value={newTeam}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "newTeam",
                    value: e.target.value,
                  })
                }
                style={{ padding: "5px", marginRight: "10px" }}
              >
                <option value="">Select Team</option>
                <option value="ENGINEERING">ENGINEERING</option>
                <option value="PMO">PMO</option>
                <option value="PRODUCT">PRODUCT</option>
              </select>
              <select
                value={newRole}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "newRole",
                    value: e.target.value,
                  })
                }
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
              <input
                type="text"
                placeholder="GitHub Username (optional)"
                value={githubUsername}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "githubUsername",
                    value: e.target.value,
                  })
                }
                style={{ padding: "5px", marginRight: "10px" }}
              />
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
          <h1 className="heading">Welcome, {user.username}!</h1>
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

          <GitHubPRList pullRequests={userPullRequests} />

          <UserManager refreshTrigger={refreshKey} />

          {user && user.id ? (
            <div
              style={{
                marginTop: "40px",
                padding: "20px",
                backgroundColor: "#f1f1f1",
                borderRadius: "10px",
              }}
            >
              <h2>📝 Add Summary Note</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!noteText.trim()) {
                    alert("Please enter a note before submitting.");
                    return;
                  }

                  const { error } = await supabase.from("notes").insert([
                    {
                      user_id: user.id,
                      date: noteDate,
                      note_text: noteText.trim(),
                    },
                  ]);

                  if (error) {
                    alert("Failed to save note.");
                    console.error("Insert error:", error);
                    return;
                  }

                  // After successful insert, fetch the updated list of notes
                  const updatedNotes = await fetchNotesForUser(user.id);

                  // Dispatch one action to reset the form and update the list
                  dispatch({
                    type: "SUBMIT_NOTE_SUCCESS",
                    payload: updatedNotes,
                  });
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <label>
                    Date:{" "}
                    <input
                      type="date"
                      value={noteDate}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "noteDate",
                          value: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <label>
                    Notes:{" "}
                    <textarea
                      value={noteText}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "noteText",
                          value: e.target.value,
                        })
                      }
                      rows="4"
                      cols="50"
                    />
                  </label>
                </div>
                <button type="submit">Save Note</button>
              </form>

              <hr style={{ marginTop: "30px", marginBottom: "20px" }} />
              <h3>Submitted Notes</h3>

              {Array.isArray(userNotes) && userNotes.length === 0 ? (
                <p>No notes yet.</p>
              ) : (
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {(Array.isArray(userNotes) ? [...userNotes] : [])
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((note) => (
                      <li
                        key={note.id}
                        style={{
                          marginBottom: "20px",
                          padding: "10px",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          backgroundColor: "#fdfdfd",
                        }}
                      >
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {note.date}
                        </div>
                        <div
                          style={{ whiteSpace: "pre-wrap", marginTop: "5px" }}
                        >
                          {note.note_text}
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ) : user ? (
            <p>Unable to load notes (user ID missing)</p>
          ) : (
            <p>Please select a user to begin.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
