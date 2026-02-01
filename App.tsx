import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HexGrid from './components/HexGrid';
import { LevelData, Coordinate, GameStatus, GameLogEntry } from './types';
import { INITIAL_LEVELS, DEFAULT_START, DEFAULT_END } from './constants';
import { isSameCoord } from './utils/hexUtils';
import { findMinPathCost } from './utils/pathfinding';
import { generateLevel } from './services/geminiService';
import { RotateCcw, Flame, Trophy, AlertCircle, Play, Wand2, Mountain, ScrollText, History, Star, Eye, Undo2, ArrowRight, Zap } from 'lucide-react';

const BUFFER_COST = 2; 
const STORAGE_KEY_SCORE = 'hexpath_total_score';
const STORAGE_KEY_LOG = 'hexpath_game_log';
const STORAGE_KEY_ACTIVE_SESSION = 'hexpath_active_session';

interface ActiveSession {
  level: LevelData;
  path: Coordinate[];
  budget: number;
  initialBudget: number;
  index: number;
}

const App: React.FC = () => {
  // --- EAGER INITIALIZATION ---
  // We read from localStorage inside the initializers to prevent "0-state" race conditions.
  
  const [activeSession, setActiveSession] = useState<ActiveSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (saved) return JSON.parse(saved);
    
    // Default to Level 1
    const lvl = INITIAL_LEVELS[0];
    const sPos = lvl.start || DEFAULT_START(lvl.grid.length);
    const minCost = findMinPathCost(lvl.grid, sPos, lvl.end || DEFAULT_END(lvl.grid[0].length));
    const budget = lvl.budget || (minCost === -1 ? 20 : minCost + BUFFER_COST);
    
    return {
      level: lvl,
      path: [sPos],
      budget: budget,
      initialBudget: budget,
      index: 0
    };
  });

  const [currentLevel, setCurrentLevel] = useState<LevelData>(activeSession.level);
  const [path, setPath] = useState<Coordinate[]>(activeSession.path);
  const [currentBudget, setCurrentBudget] = useState(activeSession.budget);
  const [initialBudget, setInitialBudget] = useState(activeSession.initialBudget);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(activeSession.index);
  
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [viewMode, setViewMode] = useState<'none' | 'heat' | 'topo'>('none');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [totalScore, setTotalScore] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCORE);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [gameLog, setGameLog] = useState<GameLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOG);
    return saved ? JSON.parse(saved) : [];
  });

  const startPos = useMemo(() => currentLevel.start || DEFAULT_START(currentLevel.grid.length), [currentLevel]);
  const endPos = useMemo(() => currentLevel.end || DEFAULT_END(Math.max(...currentLevel.grid.map(r => r.length))), [currentLevel]);

  // Sync basic scores/logs
  useEffect(() => localStorage.setItem(STORAGE_KEY_SCORE, totalScore.toString()), [totalScore]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(gameLog)), [gameLog]);

  // Sync Active Session whenever it changes (only when in PLAYING or WON/LOST states)
  useEffect(() => {
    if (status !== GameStatus.HISTORY && status !== GameStatus.LOADING) {
      const session: ActiveSession = {
        level: currentLevel,
        path,
        budget: currentBudget,
        initialBudget,
        index: currentLevelIndex
      };
      localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
    }
  }, [currentLevel, path, currentBudget, initialBudget, currentLevelIndex, status]);

  const initNewLevel = useCallback((level: LevelData, index: number) => {
    const sPos = level.start || DEFAULT_START(level.grid.length);
    const ePos = level.end || DEFAULT_END(Math.max(...level.grid.map(r => r.length)));
    
    // Use defined budget if possible
    let budget = level.budget;
    if (!budget || budget <= 0) {
      const minCost = findMinPathCost(level.grid, sPos, ePos);
      budget = minCost === -1 ? 20 : minCost + BUFFER_COST;
    }
    
    setCurrentLevel(level);
    setCurrentLevelIndex(index);
    setPath([sPos]);
    setInitialBudget(budget);
    setCurrentBudget(budget);
    setStatus(GameStatus.PLAYING);
    setErrorMsg(null);
  }, []);

  const handleCellClick = (coord: Coordinate, cost: number) => {
    if (status === GameStatus.HISTORY) {
       setErrorMsg("Memory Mode! Click 'Resume' to play.");
       setTimeout(() => setErrorMsg(null), 2000);
       return;
    }
    if (status !== GameStatus.PLAYING) return;

    const existingIndex = path.findIndex(p => isSameCoord(p, coord));
    if (existingIndex !== -1) {
      if (existingIndex === 0) return;
      const newPath = path.slice(0, existingIndex);
      setPath(newPath);
      const costUsed = newPath.slice(1).reduce((acc, curr) => acc + currentLevel.grid[curr.row][curr.col], 0);
      setCurrentBudget(initialBudget - costUsed);
      return;
    }

    if (currentBudget - cost < 0) {
      shakeScreen();
      setErrorMsg("Not enough stars!");
      setTimeout(() => setErrorMsg(null), 1500);
      return;
    }

    const newBudget = currentBudget - cost;
    const newPath = [...path, coord];
    setPath(newPath);
    setCurrentBudget(newBudget);

    if (isSameCoord(coord, endPos)) {
      setStatus(GameStatus.WON);
      setTotalScore(prev => prev + newBudget);
      
      const newEntry: GameLogEntry = {
        levelId: currentLevel.id,
        levelName: currentLevel.description || "Mystery Map",
        remainingBudget: newBudget,
        timestamp: Date.now(),
        path: newPath,
        levelData: { ...currentLevel } 
      };
      setGameLog(prev => [newEntry, ...prev]);
    } else if (newBudget === 0) {
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
    if (nextIdx < INITIAL_LEVELS.length && currentLevelIndex !== -1) {
      initNewLevel(INITIAL_LEVELS[nextIdx], nextIdx);
    } else {
      generateAILevel();
    }
  };

  const resetLevel = () => {
    setPath([startPos]);
    setCurrentBudget(initialBudget);
    setStatus(GameStatus.PLAYING);
    setErrorMsg(null);
  };

  const resumeActiveAdventure = () => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (saved) {
      const session: ActiveSession = JSON.parse(saved);
      setCurrentLevel(session.level);
      setPath(session.path);
      setCurrentBudget(session.budget);
      setInitialBudget(session.initialBudget);
      setCurrentLevelIndex(session.index);
      setStatus(GameStatus.PLAYING);
    } else {
      initNewLevel(INITIAL_LEVELS[0], 0);
    }
  };

  const startOver = () => {
    if (window.confirm("Delete everything and start Level 1 again?")) {
      setTotalScore(0);
      setGameLog([]);
      localStorage.removeItem(STORAGE_KEY_SCORE);
      localStorage.removeItem(STORAGE_KEY_LOG);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
      initNewLevel(INITIAL_LEVELS[0], 0);
    }
  };

  const generateAILevel = async () => {
    try {
      setIsGenerating(true);
      const newLevel = await generateLevel(2); 
      initNewLevel(newLevel, -1);
      setIsGenerating(false);
    } catch (e) {
      console.error(e);
      setErrorMsg("The stars are cloudy. Try again!");
      setIsGenerating(false);
    }
  };

  const toggleViewMode = (mode: 'heat' | 'topo') => {
    setViewMode(prev => prev === mode ? 'none' : mode);
  };

  const handleLogEntryClick = (log: GameLogEntry) => {
    setStatus(GameStatus.HISTORY);
    setCurrentLevel(log.levelData);
    setPath(log.path);
    setCurrentBudget(log.remainingBudget);
    // Note: initialBudget for a history item is effectively its starting budget, 
    // but in history mode we just show the final path.
  };

  const isCurrentGameStarted = path.length > 1;

  return (
    <div className="h-screen w-screen bg-black flex overflow-hidden font-sans text-white">
      
      {/* Main Game Section */}
      <div className="flex-1 flex flex-col relative border-r border-zinc-800">
        
        {/* Background Budget Number */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0" aria-hidden="true">
          <span className={`text-[40vh] font-bold leading-none transition-colors duration-500 ${currentBudget < 3 ? 'text-red-900' : 'text-zinc-800'}`} style={{ opacity: 0.8 }}>
            {currentBudget}
          </span>
        </div>

        {/* Header */}
        <header className="w-full flex justify-between items-center p-4 z-20 shrink-0">
          <button onClick={startOver} className="bg-zinc-900/80 backdrop-blur-sm p-3 rounded-2xl border border-zinc-700 text-left hover:bg-zinc-800 transition-all group active:scale-95 shadow-xl">
            <h1 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">HexPath Explorer</h1>
            <p className="text-sm text-zinc-400 group-hover:text-zinc-300">{currentLevel.description}</p>
          </button>
          
          <div className="flex flex-col items-end gap-1">
            <div className="bg-zinc-900/90 border border-zinc-700 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
              <Star className="text-yellow-400" size={20} fill="currentColor" />
              <span className="text-2xl font-bold">{totalScore}</span>
              <span className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Total Stars</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleViewMode('heat')} className={`p-2 rounded-lg border border-zinc-700 transition-all ${viewMode === 'heat' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-zinc-900 text-zinc-400'}`} title="Heatmap"><Flame size={20} /></button>
              <button onClick={() => toggleViewMode('topo')} className={`p-2 rounded-lg border border-zinc-700 transition-all ${viewMode === 'topo' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-zinc-900 text-zinc-400'}`} title="Topography"><Mountain size={20} /></button>
            </div>
          </div>
        </header>

        {/* History Mode Banner */}
        {status === GameStatus.HISTORY && (
          <div className="z-30 bg-blue-600 text-white py-2 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-lg">
            <Eye size={20} /> <span className="uppercase tracking-widest">You are viewing a memory</span>
          </div>
        )}

        {/* Game Map Area */}
        <main className="flex-1 w-full flex justify-center items-center z-10 relative p-8">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 text-zinc-500 animate-pulse">
              <Wand2 className="w-16 h-16 text-purple-500" />
              <p className="text-2xl font-bold text-white">Summoning a new map...</p>
            </div>
          ) : (
            <HexGrid 
              levelData={currentLevel}
              currentPath={path}
              onCellClick={handleCellClick}
              viewMode={viewMode}
              gameStatus={status}
            />
          )}

          {errorMsg && (
            <div className="absolute top-10 bg-red-900/90 border-l-4 border-red-500 text-white p-4 rounded shadow-2xl animate-bounce z-50 flex items-center gap-2">
              <AlertCircle size={20} /><p className="font-bold">{errorMsg}</p>
            </div>
          )}

          {status === GameStatus.WON && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40">
              <div className="bg-zinc-900 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-700 flex flex-col items-center text-center animate-in zoom-in duration-300">
                <div className="relative">
                  <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce" />
                  <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center font-bold">+{currentBudget}</div>
                </div>
                <h2 className="text-5xl font-bold text-white mb-2">Great Job!</h2>
                <p className="text-zinc-400 mb-8 text-xl">You reached the star with {currentBudget} stars to spare!</p>
                <button onClick={nextLevel} className="bg-green-500 hover:bg-green-400 text-white text-2xl font-bold py-5 px-10 rounded-3xl shadow-xl transform transition active:scale-95 flex items-center gap-3">
                  Next Adventure <Play fill="currentColor" size={28} />
                </button>
              </div>
            </div>
          )}

          {status === GameStatus.LOST && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40">
              <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-700 flex flex-col items-center text-center animate-in zoom-in duration-300">
                <div className="text-8xl mb-4">😿</div>
                <h2 className="text-4xl font-bold text-white mb-2">No More Stars!</h2>
                <p className="text-zinc-400 mb-8 text-xl">The path was too difficult. Try a different way!</p>
                <button onClick={resetLevel} className="bg-blue-600 hover:bg-blue-500 text-white text-2xl font-bold py-5 px-10 rounded-3xl shadow-xl transform transition active:scale-95 flex items-center gap-3">
                  Restart Map <RotateCcw size={28} />
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="w-full p-6 flex justify-center gap-4 z-20">
          {status === GameStatus.HISTORY ? (
            <div className="flex gap-4 animate-in slide-in-from-bottom-4">
              <button 
                onClick={resumeActiveAdventure} 
                className="bg-green-600 hover:bg-green-500 text-white font-black py-4 px-10 rounded-2xl shadow-lg flex items-center gap-3 transition-all active:scale-95 uppercase tracking-wide group"
              >
                <Zap size={24} className="fill-current text-yellow-300" />
                {isCurrentGameStarted ? "Resume My Adventure" : "Start My Adventure"}
              </button>
              <button onClick={resetLevel} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg flex items-center gap-3 transition-all active:scale-95">
                <RotateCcw size={24} /> Replay This Map
              </button>
            </div>
          ) : (
            <>
              <button onClick={resetLevel} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-2xl border border-zinc-700 flex items-center gap-2 transition-all active:scale-95">
                <RotateCcw size={20} /> Reset Path
              </button>
              {process.env.API_KEY && (
                <button onClick={generateAILevel} disabled={isGenerating} className="bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 font-bold py-3 px-8 rounded-2xl border border-purple-800 flex items-center gap-2 disabled:opacity-30 transition-all active:scale-95">
                  <Wand2 size={20} /> Surprise Me!
                </button>
              )}
            </>
          )}
        </footer>
      </div>

      {/* Game Log Sidebar */}
      <aside className="w-80 bg-zinc-950 flex flex-col shrink-0 border-l border-zinc-800 z-30 shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/50">
          <History className="text-zinc-400" size={24} />
          <h2 className="text-xl font-bold tracking-tight uppercase text-zinc-300">Adventure Log</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {gameLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center px-4">
              <ScrollText size={48} className="mb-4 opacity-20" />
              <p>Your journey is just beginning. Win a map to see your history!</p>
            </div>
          ) : (
            gameLog.map((log, idx) => {
              const isActiveViewing = status === GameStatus.HISTORY && currentLevel.id === log.levelData.id;
              return (
                <button 
                  key={idx} 
                  onClick={() => handleLogEntryClick(log)}
                  className={`w-full text-left p-4 rounded-2xl flex flex-col gap-1 border transition-all active:scale-95 group relative overflow-hidden ${
                    isActiveViewing 
                      ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-blue-500 hover:bg-zinc-800'
                  }`}
                >
                  {isActiveViewing && (
                    <div className="absolute right-0 top-0 bg-blue-500 text-[8px] px-2 py-0.5 font-black uppercase text-white tracking-widest">Viewing</div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className={`font-bold line-clamp-1 transition-colors ${isActiveViewing ? 'text-blue-300' : 'text-zinc-200 group-hover:text-blue-400'}`}>
                      {log.levelName}
                    </span>
                    <span className="text-[10px] text-zinc-600 uppercase font-black">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                    <Star size={14} fill="currentColor" />
                    <span>{log.remainingBudget} Stars</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
        <div className="p-6 bg-zinc-950 border-t border-zinc-800 text-center">
          <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest mb-1">Lifetime Score</div>
          <div className="text-3xl font-black text-white">{totalScore}</div>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
};

export default App;