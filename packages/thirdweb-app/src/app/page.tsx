'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CreatureMetadata {
  rarity: string;
  species: string;
  element?: string;
  form?: string;
  anomalies?: string[];
  prompt: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<CreatureMetadata | null>(null);

  const runFluxAI = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      setMetadata(null);
      
      const response = await fetch('/api/generate-creature', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate creature');
      }
      
      const data = await response.json();
      setResult(data.imagePath);
      setMetadata(data.metadata);
    } catch (error) {
      console.error('Error generating creature:', error);
      setResult('Error generating creature. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-4xl font-bold text-black mb-8">Fantasy Creature Generator</div>
      
      <button
        onClick={runFluxAI}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate Fantasy Creature'}
      </button>
      
      {isLoading && (
        <div className="mt-6 text-gray-700">
          Generating your creature... This may take a minute.
        </div>
      )}
      
      {result && !result.startsWith('Error') && metadata && (
        <div className="mt-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-full max-w-md h-[400px]">
            <Image 
              src={result} 
              alt="Generated Fantasy Creature" 
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              priority
              className="rounded-lg shadow-lg object-contain"
            />
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {metadata.rarity} {metadata.species}
            </h2>
            
            <div className="space-y-2 text-gray-700">
              {metadata.element && (
                <p><span className="font-semibold">Element:</span> {metadata.element}</p>
              )}
              {metadata.form && (
                <p><span className="font-semibold">Form:</span> {metadata.form}</p>
              )}
              {metadata.anomalies && metadata.anomalies.length > 0 && (
                <p><span className="font-semibold">Anomalies:</span> {metadata.anomalies.join(', ')}</p>
              )}
              <p className="mt-4 pt-4 border-t border-gray-300">
                <span className="font-semibold">Prompt:</span> <span className="text-sm italic">{metadata.prompt}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {result && result.startsWith('Error') && (
        <div className="mt-6 text-red-600">
          {result}
        </div>
      )}
    </div>
  );
}
