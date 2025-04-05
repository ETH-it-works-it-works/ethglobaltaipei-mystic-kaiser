"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { FaFistRaised } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { RoomService } from "@/services/roomService";
import { BattleApiService } from "@/services/battleApiService";
import { createClient } from '@supabase/supabase-js';
import { Room } from "@/types/battle";
import { toast } from "sonner";
import Image from "next/image";

interface PageParams {
  roomCode: string;
}

export default function BattleRoomPage({ params }: { params: PageParams }) {
  const { roomCode } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const [room, setRoom] = useState<any>(null);
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'playing' | 'finished'>('waiting');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastAttacker, setLastAttacker] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);

  // Get current user's address from URL parameters
  const currentUserAddress = searchParams.get('username') || 'Anonymous';

  // Calculate if it's the current player's turn
  const isMyTurn = useMemo(() => {
    if (!room || !lastAttacker) {
      // If no one has attacked yet, player1 goes first
      return currentUserAddress === room?.player1_address;
    }
    // It's my turn if the last attacker was NOT me
    return lastAttacker !== currentUserAddress;
  }, [currentUserAddress, lastAttacker, room]);

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setGameState('playing');
      setIsCountdownActive(false);
      // Start the game by updating status to playing
      RoomService.updateRoomStatus(roomCode, 'playing');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCountdownActive, countdown, roomCode]);

  // Fetch initial battle logs
  useEffect(() => {
    const fetchBattleLogs = async () => {
      if (!room) return;
      
      try {
        const { logs, lastAttacker: lastAttackerFromLogs } = await BattleApiService.getBattleLogs(roomCode);
        
        if (lastAttackerFromLogs) {
          setLastAttacker(lastAttackerFromLogs);
          console.log('Last attacker:', lastAttackerFromLogs);
        }
        
        // Format logs for display
        if (logs && logs.length > 0) {
          const formattedLogs = logs.map(log => 
            `${log.attacker} attacked for ${log.damage} damage!`
          );
          setBattleLog(formattedLogs.reverse()); // Reverse to show oldest first
        }
      } catch (error) {
        console.error('Error fetching battle logs:', error);
      }
    };

    fetchBattleLogs();
  }, [room, roomCode]);

  // Set up subscription for all game updates
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        console.log('Fetching room data...');
        // Get current battle status from API
        const battleStatus = await BattleApiService.getBattleStatus(roomCode);
        
        if (!battleStatus) {
          console.error('Room not found');
          router.push('/dapp/battle');
          return;
        }

        // Convert API response to room structure
        const roomData = {
          code: roomCode,
          status: battleStatus.status,
          player1_address: battleStatus.player1.address,
          player1_health: battleStatus.player1.health,
          player1_atk_min: battleStatus.player1.attack.min,
          player1_atk_max: battleStatus.player1.attack.max,
          player2_address: battleStatus.player2?.address || null,
          player2_health: battleStatus.player2?.health || null,
          player2_atk_min: battleStatus.player2?.attack.min || null,
          player2_atk_max: battleStatus.player2?.attack.max || null,
          current_turn: battleStatus.currentTurn
        };
        
        setRoom(roomData);
        console.log('Room data:', roomData);
        
        // If room is already full, initialize game state
        if (roomData.status === 'ready' && roomData.player2_address) {
          console.log('Room is now full, starting countdown');
          setGameState('ready');
          setIsCountdownActive(true);
          setCountdown(3);
        }

        // Set up subscription for all game updates
        const sub = BattleApiService.subscribeToBattle(roomCode, (payload) => {
          console.log('Update received:', payload);
          
          // Handle game lobby updates
          if (payload.table === 'gameLobbies') {
            const newRoom = payload.new;
            console.log('New room state:', newRoom);
            setRoom((prev: Room | null) => {
              const updatedRoom = prev ? { ...prev, ...newRoom } : newRoom;
              console.log('Updated room state:', updatedRoom);
              
              // Check for game completion
              if (updatedRoom.status === 'completed') {
                console.log('Game completed, checking winner...');
                const isPlayer1 = currentUserAddress === updatedRoom.player1_address;
                if ((isPlayer1 && updatedRoom.player2_health <= 0) || (!isPlayer1 && updatedRoom.player1_health <= 0)) {
                  console.log('Player won by reducing health to 0!');
                  setBattleResult('victory');
                  setShowResultModal(true);
                } else {
                  console.log('Player lost by health reaching 0!');
                  setBattleResult('defeat');
                  setShowResultModal(true);
                }
              }
              
              return updatedRoom;
            });
            
            if (newRoom.status === 'ready' && newRoom.player2_address) {
              console.log('Room is now full, starting countdown');
              setGameState('ready');
              setIsCountdownActive(true);
              setCountdown(3);
              
              // Call the start-battle API when both players have joined
              if (currentUserAddress === newRoom.player1_address) {
                try {
                  (async () => {
                    console.log('Calling start-battle API...');
                    const response = await fetch("/api/start-battle", {
                      method: "POST",
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        address: newRoom.player1_address,
                        opponent: newRoom.player2_address,
                        player1MinDmg: newRoom.player1_atk_min,
                        player1MaxDmg: newRoom.player1_atk_max,
                        player2MinDmg: newRoom.player2_atk_min,
                        player2MaxDmg: newRoom.player2_atk_max,
                      }),
                    });
                    
                    const res = await response.json();
                    if (res.success) {
                      console.log('Battle started successfully:', res);
                      toast("Battle Started", {
                        description: "Both players have joined. The battle is beginning!",
                        action: {
                          label: "Close",
                          onClick: () => console.log("Closed"),
                        },
                      });
                    } else {
                      console.error('Error starting battle:', res);
                      toast("Error Starting Battle", {
                        description: "There was an issue starting the battle. Gameplay will continue normally.",
                        action: {
                          label: "Close",
                          onClick: () => console.log("Closed"),
                        },
                      });
                    }
                  })();
                } catch (error) {
                  console.error('Error calling start-battle API:', error);
                }
              }
            }

            if (newRoom.status === 'completed') {
              setGameState('finished');
            }
          }
          
          // Handle battle log updates
          if (payload.table === 'battleLogs' && payload.eventType === 'INSERT') {
            const newLog = payload.new;
            setLastAttacker(newLog.attacker);
            setBattleLog(prev => [...prev, `${newLog.attacker} attacked for ${newLog.damage} damage!`]);
          }
        });
        setSubscription(sub);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing room:', error);
        setError('Failed to initialize battle room');
      }
    };

    initializeRoom();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [roomCode, router, currentUserAddress]);

  const handleReturnHome = () => {
    if (subscription) {
      subscription.unsubscribe();
    }
    router.push('/dapp');
  };

  const handleAttack = async (damage: number) => {
    if (!room || !isMyTurn) return;

    try {
      // Call the attack API
      const result = await BattleApiService.performAttack(roomCode, currentUserAddress, damage);
      
      console.log('Attack result:', result);
      
      // Toast notification for successful attack
      toast(`You attacked for ${damage} damage!`, {
        description: `You dealt ${damage} damage to your opponent.`,
      });
      
      // Update UI immediately based on the attack result
      if (result.gameOver) {
        // Set result based on who won immediately
        setBattleResult('victory');
        setShowResultModal(true);
        toast("Victory!", {
          description: "You have defeated your opponent!",
        });
      }
    } catch (error) {
      console.error('Error making move:', error);
      setError('Failed to make move');
      toast("Attack Failed", {
        description: "There was an error processing your attack.",
      });
    }
  };

  const handleAttackClick = async () => {
    if (!room || !isMyTurn) return;
    
    // Get attack range for current player
    const isPlayer1 = currentUserAddress === room.player1_address;
    const minDamage = isPlayer1 ? room.player1_atk_min : room.player2_atk_min;
    const maxDamage = isPlayer1 ? room.player1_atk_max : room.player2_atk_max;
    
    // Generate random damage between min-max
    const damage = BattleApiService.generateRandomDamage(minDamage, maxDamage);
    await handleAttack(damage);
  };

  // Calculate if current player is player1
  const isPlayer1 = useMemo(() => {
    return currentUserAddress === room?.player1_address;
  }, [currentUserAddress, room?.player1_address]);

  // Get health values from correct perspective
  const myHealth = useMemo(() => {
    if (!room) return 1000; // default health
    return isPlayer1 ? room.player1_health : room.player2_health;
  }, [isPlayer1, room]);

  const opponentHealth = useMemo(() => {
    if (!room) return 1000; // default health
    return isPlayer1 ? room.player2_health : room.player1_health;
  }, [isPlayer1, room]);

  // Get player names from correct perspective
  const myName = currentUserAddress;
  const opponentName = useMemo(() => {
    if (!room) return 'Waiting...';
    return isPlayer1 ? room.player2_address : room.player1_address;
  }, [isPlayer1, room]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading battle...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-500">{error || 'Battle not found'}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center md:py-10">
      <div className="flex flex-col justify-between bg-white/90 w-screen h-screen md:w-[650px] md:h-auto rounded-lg px-6 relative py-6">
        {/* Room Code Display */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-600 px-4 py-2 rounded-lg text-white font-bold">
          Room: {roomCode}
        </div>

        {/* Status Display */}
        {gameState === 'ready' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-black/80 backdrop-blur-md p-8 rounded-xl text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Both Players Ready!</h2>
              <div className="text-6xl font-bold text-blue-500 animate-pulse">
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Player Names and Health Bars */}
        <div className="flex justify-between items-center w-full mt-16 mb-8">
          {/* My Info */}
          <div className="w-1/2 pr-2">
            <div className="flex flex-col text-xl font-bold mb-2">
              <Image src="/landing-page/common-2.png" alt="Player NFT" width={300} height={300} className="rounded-md border-2 border-yellow-500" />
              <span>You:</span> <span className="text-gray-500">{myName.substring(0, 6)}...{myName.substring(myName.length - 4)}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(myHealth / 1000) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm mt-1">
              HP: {myHealth}/1000
            </div>
          </div>

          <span className="text-5xl font-bold text-red-600">VS</span>

          {/* Opponent Info */}
          <div className="w-1/2 pl-2">
            <div className="flex flex-col text-xl font-bold mb-2">
              <Image src="/landing-page/common-2.png" alt="Player NFT" width={300} height={300} className="rounded-md border-2 border-yellow-500" />
              <span>Opponent:</span> <span className="text-gray-500">{opponentName.substring(0, 6)}...{opponentName.substring(opponentName.length - 4)}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(opponentHealth / 1000) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm mt-1">
              HP: {opponentHealth}/1000
            </div>
          </div>
        </div>

        {/* Turn Indicator */}
        {gameState === 'playing' && (
          <div className="text-xl font-bold text-center">
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </div>
        )}

        {/* Attack Button */}
        {gameState === 'playing' && isMyTurn && (
          <div className=" bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <button
              onClick={handleAttackClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaFistRaised className="text-xl" />
              <span>Attack!</span>
              <span className="text-sm">
                ({isPlayer1 ? room.player1_atk_min : room.player2_atk_min}-
                {isPlayer1 ? room.player1_atk_max : room.player2_atk_max} damage)
              </span>
            </button>
          </div>
        )}

        {/* Battle Log */}
        <div className="mt-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
          <h3 className="text-lg font-bold mb-2 text-white">Battle Log</h3>
          {battleLog.map((log, index) => (
            <div key={index} className="text-white mb-1">{log}</div>
          )).reverse()}
        </div>

        {/* Result Modal */}
        {battleResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {battleResult === 'victory' ? 'Victory!' : 'Defeat!'}
              </h2>
              <p className="text-xl mb-6">
                {battleResult === 'victory' 
                  ? 'You have defeated your opponent!'
                  : 'You have been defeated!'}
              </p>
              <button
                onClick={handleReturnHome}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 