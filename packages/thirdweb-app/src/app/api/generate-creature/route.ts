import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import fs from "fs/promises";
import path from "path";
import pinata from "@/common/pinata";
import FormData from "form-data";

// Metadata definitions
const species = [
  "Lion",
  "Tiger",
  "Eagle",
  "Dragon",
  "Wolf",
  "Serpent",
  "Phoenix",
  "Fox",
  "Panther",
  "Griffin",
  "Stag",
  "Kirin",
  "Owlbear",
  "Basilisk",
  "Chimera",
  "Direwolf",
];

const elements = ["Fire", "Water", "Earth", "Lightning", "Nature"];

const forms = [
  "Armored",
  "Winged",
  "Celestial",
  "Ethereal",
  "Mechanical",
  "Spirit",
  "Mystic",
  "Ancient",
];

const anomalies = [
  "Golden Halo",
  "Shiny Aura",
  "Demon Horns",
  "Celestial Crest",
  "Ethereal Scar",
  "Spirit Flames",
  "Cosmic Eyes",
  "Starborn Markings",
  "Chrono Tail",
  "Ghostly Wisp",
  "Dragon Horns",
  "Radiant (Light) Alignment",
  "Umbral (Shadow) Alignment",
  "Primordial (Neutral) Alignment",
  "Abyssal (Chaos) Alignment",
  "Celestial (Balance) Alignment",
  "Crystal Armor",
  "Bone Spikes",
  "Spirit Cloak",
  "Energy Gauntlets",
  "Void Chains",
  "Dragon Plate",
  "War Banner",
  "Phoenix Plume",
  "Cosmic Glow",
  "Ember Eyes",
  "Frost Gaze",
  "Void Eyes",
  "Radiant Sight",
  "Storm Vision",
  "Serpent Stare",
  "Celestial Glow",
  "Abyssal Shadow",
  "Prismatic Pulse",
  "Ethereal Mist",
  "Starlight Veil",
  "Infernal Blaze",
  "Rune Etchings",
  "Sacred Tattoos",
  "War Scars",
  "Star Maps",
  "Mystic Glyphs",
  "Chaos Fractures",
];

const rarities = ["Common", "Rare", "Epic", "Mythic"];
const rarityWeights = [0.6, 0.3, 0.085, 0.015];

interface PromptComponents {
  species: string;
  element?: string;
  form?: string;
  anomalies?: string[];
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  const random = Math.random() * totalWeight;
  let current = 0;

  for (let i = 0; i < items.length; i++) {
    current += weights[i];
    if (random <= current) return items[i];
  }
  return items[0];
}

async function generatePrompt(): Promise<[string, string, PromptComponents]> {
  const rarity = weightedRandom(rarities, rarityWeights);

  const components: PromptComponents = {
    species: species[Math.floor(Math.random() * species.length)],
  };

  // Trait composition based on rarity
  switch (rarity) {
    case "Common":
      break; // Only species
    case "Rare":
      components.element =
        elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      break;
    case "Epic":
      components.element =
        elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      components.anomalies = [
        anomalies[Math.floor(Math.random() * anomalies.length)],
      ];
      break;
    case "Mythic":
      components.element =
        elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      components.anomalies = [
        anomalies[Math.floor(Math.random() * anomalies.length)],
        anomalies[Math.floor(Math.random() * anomalies.length)],
      ];
      break;
  }

  const style =
    "ancient creature warrior style with dramatic lighting, fantasy art style, detailed armor, and mystical aura";

  const parts = [
    components.species,
    components.element ? `${components.element} element` : undefined,
    components.form ? `${components.form} form` : undefined,
    components.anomalies?.join(", "),
    style,
  ].filter(Boolean) as string[];

  return [`A ${parts.join(" ")}`, rarity, components];
}

// Add new function to generate battle stats based on rarity
function generateBattleStats(rarity: string): {
  health: number;
  minAttack: number;
  maxAttack: number;
} {
  let health, minAttack, maxAttack;

  // Base stats by rarity
  switch (rarity) {
    case "Common":
      health = Math.floor(Math.random() * 26) + 75; // 75-100
      minAttack = Math.floor(Math.random() * 11) + 10; // 10-20
      maxAttack = Math.floor(Math.random() * 11) + 20; // 20-30
      break;
    case "Rare":
      health = Math.floor(Math.random() * 51) + 100; // 100-150
      minAttack = Math.floor(Math.random() * 11) + 20; // 20-30
      maxAttack = Math.floor(Math.random() * 11) + 30; // 30-40
      break;
    case "Epic":
      health = Math.floor(Math.random() * 51) + 150; // 150-200
      minAttack = Math.floor(Math.random() * 11) + 27; // 27-37
      maxAttack = Math.floor(Math.random() * 13) + 37; // 37-49
      break;
    case "Mythic":
      health = Math.floor(Math.random() * 101) + 200; // 200-300
      minAttack = Math.floor(Math.random() * 16) + 35; // 35-50
      maxAttack = Math.floor(Math.random() * 21) + 50; // 50-70
      break;
    default:
      health = 100;
      minAttack = 15;
      maxAttack = 25;
  }

  // Ensure max attack is at least 5 higher than min attack
  maxAttack = Math.max(maxAttack, minAttack + 5);

  return { health, minAttack, maxAttack };
}

export async function POST(request: NextRequest) {
  console.log("Generating creatures...");
  try {
    // Number of creatures to generate
    const numCreatures = 1;
    console.log(`Generating ${numCreatures} creatures`);

    // Array to store results
    const creatures = [];

    // Generate multiple creatures
    for (let i = 0; i < numCreatures; i++) {
      console.log(`\n🌟 Generating Creature ${i + 1}/${numCreatures} 🌟`);

      // Generate metadata and prompt for each creature
      const [fullPrompt, rarity, components] = await generatePrompt();

      // Generate battle stats early
      const battleStats = generateBattleStats(rarity);

      // Generate image using AI model
      let imageBuffer: Buffer;
      let imagePath: string;
      let timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      let filename = `${rarity}_${timestamp}_${i}.jpg`;

      // Use the Hugging Face Inference API
      const apiKey = process.env.NEXT_PUBLIC_FLUX_AI;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      console.log("Generating image with Hugging Face API...");
      const client = new InferenceClient(apiKey);

      const response = await client.textToImage({
        inputs: fullPrompt,
        model: "black-forest-labs/FLUX.1-dev",
        parameters: {
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      });

      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);

      // Create directory for saving images
      const outputDir = path.join(process.cwd(), "public", "generated_images");
      await fs.mkdir(outputDir, { recursive: true });

      // Save the image
      const outputPath = path.join(outputDir, filename);
      await fs.writeFile(outputPath, imageBuffer);

      imagePath = `/generated_images/${filename}`;
      console.log(`Image saved to ${imagePath}`);

      // IPFS upload data
      let ipfsData = null;

      try {
        console.log("Preparing for IPFS upload...");

        // Get the JWT from environment
        const jwt = process.env.PINATA_JWT;
        if (!jwt) {
          throw new Error("Pinata JWT not configured in environment variables");
        }

        // Update to using FormData from the form-data package
        // First, save the image temporarily to the file system
        const tempDir = path.join(process.cwd(), "public", "generated_images");
        const tempFilePath = path.join(tempDir, filename);

        try {
          // Ensure the directory exists
          await fs.mkdir(tempDir, { recursive: true });
          // Write the image buffer to a file
          await fs.writeFile(tempFilePath, imageBuffer);
          console.log(`Temporary file created at: ${tempFilePath}`);

          // Use a simple fetch with multipart form-data boundary approach
          const formData = new FormData();

          // Read the file content again to ensure it's properly formatted
          const fileContent = await fs.readFile(tempFilePath);

          // Use the server-side fetch API for uploading to Pinata
          console.log("Sending file to Pinata API...");
          const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

          // We need to use a Node.js compatible approach for form data
          // Creating a boundary for multipart form data
          const boundary = `----FormBoundary${Math.random()
            .toString(16)
            .substring(2)}`;

          // Manually create the multipart form data
          const body = Buffer.concat([
            // File field
            Buffer.from(`--${boundary}\r\n`),
            Buffer.from(
              `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`
            ),
            Buffer.from(`Content-Type: image/jpeg\r\n\r\n`),
            fileContent,
            Buffer.from(`\r\n--${boundary}--\r\n`),
          ]);

          const imageUploadResponse = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": `multipart/form-data; boundary=${boundary}`,
              "Content-Length": body.length.toString(),
            },
            body,
          });

          if (!imageUploadResponse.ok) {
            const errorText = await imageUploadResponse.text();
            console.error(
              `IPFS upload failed with status ${imageUploadResponse.status}: ${errorText}`
            );
            throw new Error(
              `IPFS upload failed: ${imageUploadResponse.status}`
            );
          }

          const imageResult = await imageUploadResponse.json();
          const imageCid = imageResult.IpfsHash;

          console.log(
            `Image uploaded successfully to IPFS with CID: ${imageCid}`
          );

          // Generate battle stats
          const battleStats = generateBattleStats(rarity);

          // Update metadata for NFT
          const metadataContent = {
            name: `${rarity} ${components.species}`,
            description: `A ${rarity.toLowerCase()} ${components.species.toLowerCase()} fantasy creature`,
            image: `ipfs://${imageCid}`,
            attributes: [
              { trait_type: "Rarity", value: rarity },
              { trait_type: "Species", value: components.species },
              { trait_type: "Health", value: battleStats.health },
              { trait_type: "Min Attack", value: battleStats.minAttack },
              { trait_type: "Max Attack", value: battleStats.maxAttack },
              ...(components.element
                ? [{ trait_type: "Element", value: components.element }]
                : []),
              ...(components.form
                ? [{ trait_type: "Form", value: components.form }]
                : []),
              ...(components.anomalies
                ? components.anomalies.map((anomaly) => ({
                    trait_type: "Anomaly",
                    value: anomaly,
                  }))
                : []),
            ],
          };

          // Upload metadata to IPFS
          console.log("Uploading metadata to IPFS...");

          const metadataUploadResponse = await fetch(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
              },
              body: JSON.stringify(metadataContent),
            }
          );

          if (!metadataUploadResponse.ok) {
            const errorText = await metadataUploadResponse.text();
            console.error(
              `Metadata upload failed with status ${metadataUploadResponse.status}: ${errorText}`
            );
            throw new Error(
              `Metadata upload failed: ${metadataUploadResponse.status}`
            );
          }

          const metadataResult = await metadataUploadResponse.json();
          const metadataCid = metadataResult.IpfsHash;

          console.log(
            `Metadata uploaded successfully to IPFS with CID: ${metadataCid}`
          );

          // Generate gateway URLs
          const gatewayUrl =
            process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";

          ipfsData = {
            image: `ipfs://${imageCid}`,
            imageUrl: `https://${gatewayUrl}/ipfs/${imageCid}`,
            metadata: `ipfs://${metadataCid}`,
            metadataUrl: `https://${gatewayUrl}/ipfs/${metadataCid}`,
          };

          console.log("IPFS Upload Successful:", ipfsData);
        } catch (fileError) {
          console.error("Error with file operations:", fileError);
          throw new Error("Failed to process image file for upload");
        }

        // Clean up the temp file
        try {
          await fs.unlink(tempFilePath);
          console.log("Temporary file cleaned up");
        } catch (cleanupError) {
          console.error("Error cleaning up temp file:", cleanupError);
          // Non-critical error, continue
        }
      } catch (ipfsError) {
        console.error("IPFS upload failed:", ipfsError);
        console.error(
          "Error details:",
          ipfsError instanceof Error ? ipfsError.message : String(ipfsError)
        );
        // We'll continue with the generated image even if IPFS upload fails
      }

      // Add creature to results with battle stats
      creatures.push({
        imagePath,
        metadata: {
          rarity,
          species: components.species,
          element: components.element,
          form: components.form,
          anomalies: components.anomalies,
          health: battleStats.health,
          minAttack: battleStats.minAttack,
          maxAttack: battleStats.maxAttack,
          prompt: fullPrompt,
        },
        ipfs: ipfsData,
      });

      // Add a small delay between generations to avoid rate limiting
      if (i < numCreatures - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Return success response with all creatures
    return NextResponse.json({
      success: true,
      creatures,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
