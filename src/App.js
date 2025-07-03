import React, { useState } from 'react';
import CounterDisplay from './CounterDisplay';
import CounterButton from './CounterButton';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [showCounter, setShowCounter] = useState(true); // NEW
  const increment = () => setCount(count + 1);
  const toggleVisibility = () => setShowCounter(!showCounter);
  const [flash, setFlash] = useState(false);

  const reset = () => {
    setCount(0);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  const [name, setName] = useState("");
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  return (
  <div>
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="name">Enter your name: </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={handleNameChange}
        style={{ padding: '5px', marginLeft: '10px' }}
      />
      {name && <p>Hello, {name}!</p>}
    </div>

    <div className="container">
      <h1 className="heading">🧩 Conditional Rendering + Styling</h1>

      <CounterButton label={showCounter ? "Hide Counter" : "Show Counter"} onClick={toggleVisibility} />

      {showCounter && (
        <>
          <CounterDisplay value={count} flash={flash} />
          <CounterButton label="+1" onClick={increment} />
          <CounterButton label="Reset" onClick={reset} />
        </>
      )}
    </div>
  </div>
);

}



export default App;
