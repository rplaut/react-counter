import React from 'react';

function CounterButton({ label, onClick }) {
  return <button onClick={onClick} style={{ margin: '0 10px' }}>{label}</button>;
}

export default CounterButton;
