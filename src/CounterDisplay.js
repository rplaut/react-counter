import React from 'react';

function CounterDisplay({ value, flash }) {
  const style = {
    padding: '10px',
    border: '2px solid',
    borderColor: flash ? 'red' : '#888',
    display: 'inline-block',
    margin: '10px auto',
    fontSize: '20px',
    transition: 'border-color 0.3s',
  };

  return <p style={style}>You clicked {value} times</p>;
}

export default CounterDisplay;
