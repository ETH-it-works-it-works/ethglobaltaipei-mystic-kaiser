"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TestGenerateCreature() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleGenerateCreature = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/generate-creature", {
        method: "POST",
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate creature");
      }

      setImages(
        data.imageUris.map(
          (hash: string) => `https://gateway.pinata.cloud/ipfs/${hash}`
        )
      );
      toast.success("Successfully generated creatures!");
    } catch (error) {
      console.error("Error generating creature:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate creature"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Generate Creature</h1>

      <Button
        onClick={handleGenerateCreature}
        disabled={loading}
        className="mb-8"
      >
        {loading ? "Generating..." : "Generate Creature"}
      </Button>

      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={imageUrl}
                alt={`Generated Creature ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
