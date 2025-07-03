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

  return (
    <div className="container">
      <h1 className="heading">🧩 Conditional Rendering + Styling</h1>

      <CounterButton label={showCounter ? "Hide Counter" : "Show Counter"} onClick={toggleVisibility} />

      {/* Only show counter if showCounter is true */}
      {showCounter && (
        <>
          <CounterDisplay value={count} flash={flash} />
          <CounterButton label="+1" onClick={increment} />
          <CounterButton label="Reset" onClick={reset} />
        </>
      )}
    </div>
  );
}



export default App;
