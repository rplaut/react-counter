# 🧮 React Counter – Multi-User Cloud Synced App

A responsive, single-page React application that allows users to log in using their username, view and increment their personal counter, and see all users and their counters in an admin-style dashboard. All data is stored and synced via [Supabase](https://supabase.com).

---

## 📋 Product Overview

| Key Feature              | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| 🔐 **User Login**        | Users select their name from an avatar card-style login page          |
| ➕ **New User Creation** | New users can be added using a unique username form                   |
| 📊 **Per-User Counter**  | Each user has their own independent counter saved to the cloud        |
| 🌩 **Cloud Sync**         | All data is stored in Supabase (PostgreSQL) and reflects in real time |
| 👁️ **User Dashboard**    | A table displays all usernames and their counters for admin view      |
| 🧍 **Avatar-Based UI**   | Login uses DiceBear-generated avatar cards for intuitive UX           |
| 🎨 **Styled UI**         | CSS hover effects, card grid, and transitions for clean design        |

---

## 🛠 Tech Stack

| Layer            | Tool                                             |
| ---------------- | ------------------------------------------------ |
| Frontend         | React (CRA)                                      |
| Styling          | Plain CSS via `App.css`                          |
| Cloud Storage    | Supabase (PostgreSQL + REST API)                 |
| Avatar Generator | DiceBear Avatars (URL-based API)                 |
| State Management | React `useState`, `useEffect`                    |
| Data Sync        | Manual Supabase fetch/update with async triggers |

---

## 🔧 Setup Instructions

1. **Clone this repo**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/react-counter.git
   cd react-counter
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Supabase**:

   - Create a free project at [https://supabase.com](https://supabase.com)
   - Create a `users` table with:
     - `id` (uuid, primary key, default: `uuid_generate_v4()`)
     - `username` (text, unique)
     - `counter` (int4, default: 0)
   - Disable Row-Level Security for development

4. **Configure API**:
   Create a file `src/supabaseClient.js`:

   ```js
   import { createClient } from "@supabase/supabase-js";

   const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
   const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

   const supabase = createClient(supabaseUrl, supabaseAnonKey);
   export default supabase;
   ```

5. **Start the app**:
   ```bash
   npm start
   ```

---

## 🧪 Feature Walkthrough

### 🧍 Login Screen

- Users are shown as avatar cards
- Clicking a card logs in that user
- New usernames can be created below via an input form
- Prevents duplicates using Supabase query

### 🧮 Counter UI

- Shows counter for the logged-in user
- `+1` and `Reset` buttons update the counter
- Changes are written to Supabase and immediately reflected in the admin table

### 📋 User Dashboard (Admin View)

- Below the main UI is a table of all users and their counter values
- Dynamically updated using a `refreshKey` pattern to sync post-update
- Sorted alphabetically by username

---

## 📦 Folder Structure

```
react-counter/
├── public/
├── src/
│   ├── App.js               # Main app logic
│   ├── App.css              # Styling
│   ├── supabaseClient.js    # Supabase config
│   └── UserManager.js       # Component for admin user dashboard
├── package.json
└── README.md
```

---

## 🚀 Possible Future Features

- 🔑 Password-based login
- 🗑 Delete user from dashboard
- 🧠 Login history or session storage
- ☁️ Offline fallback using localStorage
- 🧱 Component split into `<LoginScreen />`, `<Counter />`, `<UserCard />`
- 🌍 Deploy to GitHub Pages or Vercel

---

## 👨‍💻 Contributing

This is an open learning project. Feel free to fork, refactor, or extend it.

---

## 📄 License

MIT — free to use, learn, and remix.
