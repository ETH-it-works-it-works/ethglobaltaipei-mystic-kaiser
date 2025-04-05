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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<CreatureMetadata | null>(null);
  const [ipfsData, setIpfsData] = useState<IpfsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runFluxAI = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      setMetadata(null);
      setIpfsData(null);
      setError(null);
      
      console.log("Making API request...");
      const response = await fetch('/api/generate-creature', {
        method: 'POST',
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to generate creature: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      
      if (data.success) {
        setResult(data.imagePath);
        setMetadata(data.metadata);
        
        if (data.ipfs) {
          setIpfsData(data.ipfs);
        }
      } else if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error generating creature:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log("Current state:", { result, metadata, ipfsData, error });
  }, [result, metadata, ipfsData, error]);

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
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && metadata && (
        <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md h-[400px] border border-gray-200 rounded-lg">
              {/* Use standard img tag with absolute URL */}
              <img 
                src={result}
                alt={`${metadata.rarity} ${metadata.species}`}
                className="rounded-lg shadow-lg object-contain w-full h-full"
                onError={(e) => {
                  console.error("Image failed to load:", result);
                  e.currentTarget.src = "/sample_dragon.jpg"; // Fallback image
                }}
              />
            </div>
            
            {/* Display image path for debugging */}
            <div className="mt-2 text-sm text-gray-500">
              Image path: {result}
            </div>
            
            {ipfsData && (
              <div className="mt-4 w-full">
                <h3 className="text-lg font-semibold mb-2">IPFS Links:</h3>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div className="mb-2">
                    <span className="font-medium">Image: </span>
                    <a 
                      href={ipfsData.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {ipfsData.image}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Metadata: </span>
                    <a 
                      href={ipfsData.metadataUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {ipfsData.metadata}
                    </a>
                  </div>
                </div>
              </div>
            )}
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
    </div>
  );
}
