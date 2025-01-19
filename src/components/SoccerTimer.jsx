import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pause, Play, RotateCcw, Plus, Minus } from 'lucide-react';

const SoccerTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [period, setPeriod] = useState(1);
  const [stoppageTime, setStoppageTime] = useState(0);
  const [showStoppageTime, setShowStoppageTime] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Keep screen awake
  useEffect(() => {
    if (isRunning) {
      try {
        // Request wake lock
        navigator.wakeLock?.request('screen').catch(err => console.log('Wake Lock error:', err));
      } catch (err) {
        console.log('Wake Lock API not supported');
      }
    }
  }, [isRunning]);

  // Prevent accidental back navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (time > 0 || homeScore > 0 || awayScore > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [time, homeScore, awayScore]);

  // Default period length in seconds (25 minutes)
  const periodLength = 25 * 60;

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime >= periodLength && !showStoppageTime) {
            setIsRunning(false);
            return periodLength;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, showStoppageTime]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (time > 0 || homeScore > 0 || awayScore > 0) {
      if (window.confirm('Are you sure you want to reset the game?')) {
        setTime(0);
        setIsRunning(false);
        setStoppageTime(0);
        setShowStoppageTime(false);
        setHomeScore(0);
        setAwayScore(0);
      }
    }
  };

  const handlePeriodChange = () => {
    if (window.confirm(`Switch to Period ${period === 1 ? '2' : '1'}?`)) {
      if (period === 2) {
        setPeriod(1);
        handleReset();
      } else {
        setPeriod(2);
        handleReset();
      }
    }
  };

  const handleStoppageTime = () => {
    setShowStoppageTime(!showStoppageTime);
    if (!showStoppageTime) {
      setStoppageTime(0);
    }
  };

  const adjustScore = (team, amount) => {
    if (team === 'home') {
      setHomeScore(Math.max(0, homeScore + amount));
    } else {
      setAwayScore(Math.max(0, awayScore + amount));
    }
  };

  return (
    <Card className="w-full min-h-screen max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-3xl">Soccer Timer</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-8">
          {/* Score Display */}
          <div className="flex justify-between items-center px-4">
            <div className="text-center space-y-4">
              <div className="text-xl font-semibold">Home</div>
              <div className="text-5xl font-bold">{homeScore}</div>
              <div className="flex space-x-4">
                <Button 
                  className="w-12 h-12"
                  variant="outline"
                  onClick={() => adjustScore('home', -1)}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Button 
                  className="w-12 h-12"
                  variant="outline"
                  onClick={() => adjustScore('home', 1)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <div className="text-5xl font-bold">-</div>
            
            <div className="text-center space-y-4">
              <div className="text-xl font-semibold">Away</div>
              <div className="text-5xl font-bold">{awayScore}</div>
              <div className="flex space-x-4">
                <Button 
                  className="w-12 h-12"
                  variant="outline"
                  onClick={() => adjustScore('away', -1)}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Button 
                  className="w-12 h-12"
                  variant="outline"
                  onClick={() => adjustScore('away', 1)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-6xl font-bold font-mono">
              {showStoppageTime ? `+${formatTime(stoppageTime)}` : formatTime(time)}
            </div>
            <div className="text-2xl font-semibold">
              Period {period}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleStartStop}
              className={`h-16 text-xl ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-6 w-6" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-6 w-6" /> Start
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="destructive"
              className="h-16 text-xl"
            >
              <RotateCcw className="mr-2 h-6 w-6" /> Reset
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handlePeriodChange}
              variant="outline"
              className="h-16 text-xl"
            >
              Period {period === 1 ? 2 : 1}
            </Button>

            <Button
              onClick={handleStoppageTime}
              variant="outline"
              className={`h-16 text-xl ${showStoppageTime ? 'bg-purple-100' : ''}`}
            >
              <Clock className="mr-2 h-6 w-6" />
              +Time
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoccerTimer;
