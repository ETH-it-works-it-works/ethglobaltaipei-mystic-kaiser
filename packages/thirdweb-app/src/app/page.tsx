'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CreatureMetadata {
  rarity: string;
  species: string;
  element?: string;
  form?: string;
  anomalies?: string[];
  prompt: string;
}

interface IpfsData {
  image: string;
  imageUrl: string;
  metadata: string;
  metadataUrl: string;
}

interface Creature {
  imagePath: string;
  metadata: CreatureMetadata;
  ipfs: IpfsData | null;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runFluxAI = async () => {
    try {
      setIsLoading(true);
      setCreatures([]);
      setError(null);
      
      console.log("Making API request...");
      const response = await fetch('/api/generate-creature', {
        method: 'POST',
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to generate creatures: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      
      if (data.success && data.creatures) {
        setCreatures(data.creatures);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error generating creatures:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log("Current state:", { creatures, error });
  }, [creatures, error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-4xl font-bold text-black mb-8">Fantasy Creature Generator</div>
      
      <button
        onClick={runFluxAI}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate Fantasy Creatures'}
      </button>
      
      {isLoading && (
        <div className="mt-6 text-gray-700">
          Generating your creatures... This may take a minute.
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {creatures.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creatures.map((creature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  {creature.metadata.rarity} {creature.metadata.species}
                </h2>
                
                <div className="relative w-full h-[300px] border border-gray-200 rounded-lg mb-4">
                  <img 
                    src={creature.imagePath}
                    alt={`${creature.metadata.rarity} ${creature.metadata.species}`}
                    className="rounded-lg shadow-lg object-contain w-full h-full"
                    onError={(e) => {
                      console.error("Image failed to load:", creature.imagePath);
                      e.currentTarget.src = "/sample_dragon.svg";
                    }}
                  />
                </div>
                
                <div className="space-y-2 text-gray-700">
                  {creature.metadata.element && (
                    <p><span className="font-semibold">Element:</span> {creature.metadata.element}</p>
                  )}
                  {creature.metadata.form && (
                    <p><span className="font-semibold">Form:</span> {creature.metadata.form}</p>
                  )}
                  {creature.metadata.anomalies && creature.metadata.anomalies.length > 0 && (
                    <p><span className="font-semibold">Anomalies:</span> {creature.metadata.anomalies.join(', ')}</p>
                  )}
                  <p className="mt-4 pt-4 border-t border-gray-300 text-sm">
                    <span className="font-semibold">Prompt:</span> <span className="italic">{creature.metadata.prompt}</span>
                  </p>
                </div>
                
                {creature.ipfs && (
                  <div className="mt-4 w-full">
                    <h3 className="text-lg font-semibold mb-2">IPFS Links:</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <div className="mb-2">
                        <span className="font-semibold">Image: </span>
                        <a 
                          href={creature.ipfs.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {creature.ipfs.image}
                        </a>
                      </div>
                      <div>
                        <span className="font-semibold">Metadata: </span>
                        <a 
                          href={creature.ipfs.metadataUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {creature.ipfs.metadata}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
