import React from 'react';
import { Game } from './components/game';
import NumberBackground from './components/numberBackground';

function App() {
  return (
    <div className='grid'>
      <NumberBackground />
      <div className="game-container">
        <Game />
      </div>
    </div>
  );
}

export default App;
