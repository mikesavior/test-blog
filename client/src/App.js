import React from 'react';
import './App.css';

function App() {
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>My Blog</h1>
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App;
