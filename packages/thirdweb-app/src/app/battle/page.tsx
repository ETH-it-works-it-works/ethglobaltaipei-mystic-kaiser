"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BattlePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [battleStatus, setBattleStatus] = useState("");

  const handleAttack = async (battleId: number, damage: number) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/battle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _battleId: battleId,
          attacker_damage: damage,
        }),
      });

      const data = await response.json();
      console.log("Attack response:", data);
      if (data.success) {
        setBattleStatus("Attack successful!");
      } else {
        setBattleStatus("Attack failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during attack:", error);
      setBattleStatus("Error occurred during attack.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl bg-card rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Battle Arena</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Character</h2>
            {/* Add character stats here */}
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Opponent</h2>
            {/* Add opponent stats here */}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={() => handleAttack(1, 50)} // Example values
            disabled={isLoading}
            className="w-48"
          >
            {isLoading ? "Attacking..." : "Attack!"}
          </Button>

          {battleStatus && (
            <p
              className={`text-center ${
                battleStatus.includes("failed") ||
                battleStatus.includes("Error")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {battleStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
