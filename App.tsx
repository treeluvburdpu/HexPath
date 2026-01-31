import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import HexGrid from './components/HexGrid';
import { LevelData, Coordinate, GameStatus } from './types';
import { INITIAL_LEVELS, START_POS, END_POS } from './constants';
import { isSameCoord } from './utils/hexUtils';
import { findMinPathCost } from './utils/pathfinding';
import { generateLevel } from './services/geminiService';
import { RotateCcw, Flame, Trophy, AlertCircle, Play, Wand2 } from 'lucide-react';

const BUFFER_COST = 2; // Configurable integer buffer

const App: React.FC = () => {
  const [levels] = useState<LevelData[]>(INITIAL_LEVELS);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<LevelData>(INITIAL_LEVELS[0]);
  
  const [path, setPath] = useState<Coordinate[]>([START_POS]);
  const [currentBudget, setCurrentBudget] = useState(0);
  const [initialBudget, setInitialBudget] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize level state when level object changes
  useEffect(() => {
    // Calculate budget dynamically
    const minCost = findMinPathCost(currentLevel.grid);
    if (minCost === -1) {
      setErrorMsg("Error: Level is unsolvable!");
      // In production, we might auto-skip or regen here
    }
    const safeBudget = minCost === -1 ? 20 : minCost + BUFFER_COST;
    
    setInitialBudget(safeBudget);
    setCurrentBudget(safeBudget);
    setPath([START_POS]);
    setStatus(GameStatus.PLAYING);
    setErrorMsg(null);
  }, [currentLevel]);

  const handleCellClick = (coord: Coordinate, cost: number) => {
    if (status !== GameStatus.PLAYING) return;

    // Check if clicking on an existing path node (Backtracking/Deselecting)
    const existingIndex = path.findIndex(p => isSameCoord(p, coord));

    if (existingIndex !== -1) {
      // Cannot deselect the start node
      if (existingIndex === 0) return;

      // Slice the path to remove the clicked node and everything after it
      // The path becomes [0 ... existingIndex-1]
      // "Deselect IT" -> it is gone.
      const newPath = path.slice(0, existingIndex);
      setPath(newPath);

      // Recalculate budget based on new path
      // Start node (index 0) has 0 cost usually, or is not counted as a 'step cost'
      // Iterate from index 1 to end of newPath
      const costUsed = newPath.slice(1).reduce((acc, curr) => {
        return acc + currentLevel.grid[curr.row][curr.col];
      }, 0);

      setCurrentBudget(initialBudget - costUsed);
      
      // If we were effectively "done" but user clicked back, ensure status is playing
      // though typically you can't click after winning unless we allow it.
      // GameStatus.WON usually stops interactions. But if logic allows, we reset to PLAYING.
      // Current check `if (status !== GameStatus.PLAYING) return;` prevents clicking after win.
      // User must reset to play again. This is fine.
      
      return;
    }

    // Normal Movement Logic (Adding a step)

    // Budget check
    if (currentBudget - cost < 0) {
      shakeScreen();
      setErrorMsg("Not enough budget!");
      setTimeout(() => setErrorMsg(null), 1500);
      return;
    }

    const newBudget = currentBudget - cost;
    const newPath = [...path, coord];
    
    setPath(newPath);
    setCurrentBudget(newBudget);

    // Win Check
    if (isSameCoord(coord, END_POS)) {
      setStatus(GameStatus.WON);
    } 
    // Loss check if stuck (simplified: just rely on reset button if stuck, 
    // or budget 0 but not at end)
    else if (newBudget === 0) {
      setStatus(GameStatus.LOST);
    }
  };

  const shakeScreen = () => {
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-shake');
      setTimeout(() => root.classList.remove('animate-shake'), 500);
    }
  };

  const nextLevel = () => {
    const nextIdx = currentLevelIndex + 1;
    if (nextIdx < levels.length) {
      setCurrentLevelIndex(nextIdx);
      setCurrentLevel(levels[nextIdx]);
    } else {
      generateAILevel();
    }
  };

  const resetLevel = () => {
    setPath([START_POS]);
    setCurrentBudget(initialBudget);
    setStatus(GameStatus.PLAYING);
    setErrorMsg(null);
  };

  const startOver = () => {
    if (window.confirm("Restart game from Level 1?")) {
      // If we are already on level 1, the useEffect won't fire because the level object hasn't changed.
      // We must manually reset the level state.
      if (currentLevelIndex === 0) {
        resetLevel();
      } else {
        setCurrentLevelIndex(0);
        setCurrentLevel(INITIAL_LEVELS[0]);
      }
    }
  };

  const generateAILevel = async () => {
    try {
      setIsGenerating(true);
      const newLevel = await generateLevel(2); 
      setCurrentLevel(newLevel);
      setCurrentLevelIndex(-1);
      setIsGenerating(false);
    } catch (e) {
      console.error(e);
      setErrorMsg("Could not generate level. Check API Key.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col relative overflow-hidden font-sans">
      
      {/* Background Budget Number - Behind everything */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span 
          className={`text-[40vh] font-bold leading-none transition-colors duration-500 ${
            currentBudget < 3 ? 'text-red-900' : 'text-zinc-800'
          }`}
          style={{ opacity: 0.8 }} 
        >
          {currentBudget}
        </span>
      </div>

      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 z-20 shrink-0">
        <button 
          onClick={startOver}
          className="bg-zinc-900/80 backdrop-blur-sm p-3 rounded-2xl border border-zinc-700 text-left hover:bg-zinc-800 hover:border-zinc-500 transition-all group active:scale-95"
          title="Click to restart game"
        >
          <h1 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">HexPath</h1>
          <p className="text-sm text-zinc-400 group-hover:text-zinc-300">{currentLevel.description}</p>
        </button>
        
        <div className="flex gap-2">
           <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-3 rounded-xl shadow-sm transition-all border border-zinc-700 ${
              showHeatmap ? 'bg-orange-900/50 text-orange-400 ring-1 ring-orange-500' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
            title="Toggle Heatmap"
          >
            <Flame size={24} />
          </button>
        </div>
      </header>

      {/* Main Game Area with Borders */}
      <main className="flex-1 w-full flex justify-center items-center z-10 relative p-[10%] md:p-[5%] lg:p-[10%] box-border">
        
        {isGenerating ? (
           <div className="flex flex-col items-center gap-4 text-zinc-500 animate-pulse">
             <Wand2 className="w-16 h-16 text-purple-500" />
             <p className="text-2xl font-bold text-white">Making magic map...</p>
           </div>
        ) : (
          <div className="w-full h-full"> 
            <HexGrid 
              levelData={currentLevel}
              currentPath={path}
              onCellClick={handleCellClick}
              showHeatmap={showHeatmap}
              gameStatus={status}
            />
          </div>
        )}

        {/* Error Feedback Toast */}
        {errorMsg && (
          <div className="absolute top-10 bg-red-900/90 border-l-4 border-red-500 text-white p-4 rounded shadow-lg animate-bounce z-50">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <p className="font-bold">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Game Over / Win Overlays */}
        {status === GameStatus.WON && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40">
            <div className="bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-700 flex flex-col items-center text-center animate-in zoom-in duration-300">
              <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-md" />
              <h2 className="text-4xl font-bold text-white mb-2">You Did It!</h2>
              <p className="text-zinc-400 mb-6 text-xl">Budget left: {currentBudget}</p>
              <button 
                onClick={nextLevel}
                className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-lg transform transition active:scale-95 flex items-center gap-2"
              >
                Next Map <Play fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {status === GameStatus.LOST && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40">
            <div className="bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-700 flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-3xl font-bold text-white mb-2">Out of Budget!</h2>
              <p className="text-zinc-400 mb-6">Try a different path.</p>
              <button 
                onClick={resetLevel}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-lg transform transition active:scale-95 flex items-center gap-2"
              >
                Try Again <RotateCcw />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Controls */}
      <footer className="w-full p-4 flex justify-center flex-wrap gap-4 z-20 shrink-0">
        
        <button 
          onClick={resetLevel}
          disabled={status !== GameStatus.PLAYING}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg border border-zinc-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          <RotateCcw size={20} /> Reset
        </button>
        
        {process.env.API_KEY && (
          <button 
            onClick={generateAILevel}
            disabled={isGenerating}
            className="bg-purple-900/50 hover:bg-purple-800/50 text-purple-200 font-bold py-3 px-6 rounded-xl shadow-lg border border-purple-800 flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Wand2 size={20} /> New AI Map
          </button>
        )}
      </footer>
    </div>
  );
};

export default App;