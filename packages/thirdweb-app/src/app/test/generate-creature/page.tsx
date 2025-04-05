"use client";

import { useState } from "react";
import Image from "next/image";

interface CreatureResponse {
  success: boolean;
  imagePath?: string;
  metadata?: {
    rarity: string;
    species: string;
    element?: string;
    form?: string;
    anomalies?: string[];
    prompt: string;
  };
  ipfs?: {
    image: string;
    imageUrl: string;
    metadata: string;
    metadataUrl: string;
  };
  error?: string;
}

export default function GenerateCreatureTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreatureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateCreature = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-creature", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);

      if (!data.success) {
        throw new Error(data.error || "Failed to generate creature");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Generate Creature Test</h1>

        <button
          onClick={generateCreature}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating..." : "Generate Creature"}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-900/50 rounded-lg border border-red-500">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {result?.success && (
          <div className="mt-8 space-y-6">
            <div className="relative aspect-square w-full max-w-lg mx-auto overflow-hidden rounded-xl border-2 border-blue-500">
              <Image
                src={result.imagePath!}
                alt="Generated Creature"
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Creature Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-400">Rarity</dt>
                  <dd className="font-medium">{result.metadata?.rarity}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Species</dt>
                  <dd className="font-medium">{result.metadata?.species}</dd>
                </div>
                {result.metadata?.element && (
                  <div>
                    <dt className="text-gray-400">Element</dt>
                    <dd className="font-medium">{result.metadata.element}</dd>
                  </div>
                )}
                {result.metadata?.form && (
                  <div>
                    <dt className="text-gray-400">Form</dt>
                    <dd className="font-medium">{result.metadata.form}</dd>
                  </div>
                )}
                {result.metadata?.anomalies &&
                  result.metadata.anomalies.length > 0 && (
                    <div className="col-span-2">
                      <dt className="text-gray-400">Anomalies</dt>
                      <dd className="font-medium">
                        {result.metadata.anomalies.join(", ")}
                      </dd>
                    </div>
                  )}
              </dl>

              {result.ipfs && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold mb-3">IPFS Links</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-400">Image: </span>
                      <a
                        href={result.ipfs.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View on IPFS
                      </a>
                    </p>
                    <p>
                      <span className="text-gray-400">Metadata: </span>
                      <a
                        href={result.ipfs.metadataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View on IPFS
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
