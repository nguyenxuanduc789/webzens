import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [jokes, setJokes] = useState([]);
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);

  useEffect(() => {
    fetchJokes();
    const storedIndex = getCookie('currentJokeIndex');
    if (storedIndex) {
      setCurrentJokeIndex(parseInt(storedIndex));
    }
  }, []);

  const fetchJokes = async () => {
    try {
      const response = await fetch(`http://localhost:3000/jokes/getallcontent`);
      const data = await response.json();
      setJokes(data);
    } catch (error) {
      console.error('Error fetching jokes:', error);
    }
  };

  const handleShowNextJoke = () => {
    const nextIndex = currentJokeIndex + 1;
    if (nextIndex >= jokes.length) {
      alert("That's all the jokes for today! Come back another day!")
      return;
    }
    setCurrentJokeIndex(nextIndex);
    setCookie('currentJokeIndex', nextIndex, 30);
  };

  const handleClearCookie = () => {
    setCookie('currentJokeIndex', '', -1);
    setCurrentJokeIndex(0);
  };

  const currentJoke = jokes[currentJokeIndex] || {};

  return (
    <div className="joke-page">
      <header className="joke-header">
        <div className="logo">HLS</div>
        <div className="smiley">😊</div>
      </header>
      <main className="joke-content">
        <h1>A joke a day keeps the doctor away</h1>
        <p className="joke-warning">If you joke wrong way, your teeth have to pay. (Serious)</p>
      </main>
      <div className="joke">
        <p>{currentJoke.content}</p>
      </div>
      <div className="buttons">
        <button onClick={handleShowNextJoke}>This is Funny!</button>
        <button onClick={handleShowNextJoke}>This is not funny.</button>
        <button onClick={handleClearCookie}>Clear Cookie</button>
      </div>
      <footer className="joke-footer">
        <p>This website is created as part of Hlsolutions program. The materials contained on this website are provided for general information only and do not constitute any form of advice. HLS assumes no responsibility for the accuracy of any particular statement and accepts no liability for any loss or damage which may arise from reliance on the information contained on this site.</p>
      </footer>
    </div>
  );
}

export default App;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}
