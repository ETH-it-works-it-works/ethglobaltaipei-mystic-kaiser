import { NextRequest, NextResponse } from 'next/server';
import { InferenceClient } from "@huggingface/inference";
import fs from 'fs/promises';
import path from 'path';
import { pinata } from '../../../../utils/config';
import FormData from 'form-data';

// Metadata definitions
const species = [
  "Lion", "Tiger", "Eagle", "Dragon", "Wolf", "Serpent", "Phoenix", "Fox",
  "Panther", "Griffin", "Stag", "Kirin", "Owlbear", "Basilisk", "Chimera",
  "Direwolf"
];

const elements = ["Fire", "Water", "Earth", "Lightning", "Nature"];

const forms = [
  "Armored", "Winged", "Celestial", "Ethereal", "Mechanical", "Spirit",
  "Mystic", "Ancient"
];

const anomalies = [
  "Golden Halo", "Shiny Aura", "Demon Horns", "Celestial Crest", "Ethereal Scar",
  "Spirit Flames", "Cosmic Eyes", "Starborn Markings", "Chrono Tail", "Ghostly Wisp",
  "Dragon Horns", "Radiant (Light) Alignment", "Umbral (Shadow) Alignment",
  "Primordial (Neutral) Alignment", "Abyssal (Chaos) Alignment", "Celestial (Balance) Alignment",
  "Crystal Armor", "Bone Spikes", "Spirit Cloak", "Energy Gauntlets", "Void Chains",
  "Dragon Plate", "War Banner", "Phoenix Plume", "Cosmic Glow", "Ember Eyes",
  "Frost Gaze", "Void Eyes", "Radiant Sight", "Storm Vision", "Serpent Stare",
  "Celestial Glow", "Abyssal Shadow", "Prismatic Pulse", "Ethereal Mist",
  "Starlight Veil", "Infernal Blaze", "Rune Etchings", "Sacred Tattoos",
  "War Scars", "Star Maps", "Mystic Glyphs", "Chaos Fractures"
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
    species: species[Math.floor(Math.random() * species.length)]
  };

  // Trait composition based on rarity
  switch(rarity) {
    case "Common":
      break; // Only species
    case "Rare":
      components.element = elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      break;
    case "Epic":
      components.element = elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      components.anomalies = [anomalies[Math.floor(Math.random() * anomalies.length)]];
      break;
    case "Mythic":
      components.element = elements[Math.floor(Math.random() * elements.length)];
      components.form = forms[Math.floor(Math.random() * forms.length)];
      components.anomalies = [
        anomalies[Math.floor(Math.random() * anomalies.length)],
        anomalies[Math.floor(Math.random() * anomalies.length)]
      ];
      break;
  }

  const style = "ancient creature warrior style with dramatic lighting, fantasy art style, detailed armor, and mystical aura";
  
  const parts = [
    components.species,
    components.element ? `${components.element} element` : undefined,
    components.form ? `${components.form} form` : undefined,
    components.anomalies?.join(', '),
    style
  ].filter(Boolean) as string[];

  return [`A ${parts.join(' ')}`, rarity, components];
}

export async function POST(request: NextRequest) {
  try {
    // Check if we should use sample images - should be false in production
    const useSampleImages = process.env.USE_SAMPLE_IMAGES === 'true';

    // Generate metadata and prompt regardless
    const [fullPrompt, rarity, components] = await generatePrompt();
    
    console.log("\n🌟 Generating New Creature 🌟");
    console.log(`Rarity: ${rarity}`);
    console.log("-".repeat(40));
    console.log(`Species: ${components.species}`);
    if (components.element) console.log(`Element: ${components.element}`);
    if (components.form) console.log(`Form: ${components.form}`);
    if (components.anomalies) console.log(`Anomalies: ${components.anomalies.join(', ')}`);
    console.log("-".repeat(40));
    console.log(`Final Prompt: "${fullPrompt}"`);
    
    // Generate image using AI model
    let imageBuffer: Buffer;
    let imagePath: string;
    let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `${rarity}_${timestamp}.jpg`;
    
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
        guidance_scale: 7.5
      }
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
      console.log("Uploading to IPFS...");
      
      // Convert the image buffer to a Blob
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename,
        contentType: 'image/jpeg'
      });
      
      // Get the JWT token
      const jwt = process.env.PINATA_JWT;
      if (!jwt) {
        throw new Error("Pinata JWT not configured");
      }
      
      // Upload image to IPFS using fetch
      console.log("Uploading image to IPFS...");
      const imageUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`
        },
        body: formData as any
      });
      
      if (!imageUploadResponse.ok) {
        const errorText = await imageUploadResponse.text();
        throw new Error(`Image upload failed: ${imageUploadResponse.status} ${imageUploadResponse.statusText} - ${errorText}`);
      }
      
      const imageResult = await imageUploadResponse.json();
      const imageCid = imageResult.IpfsHash;
      console.log(`Image uploaded successfully to IPFS with CID: ${imageCid}`);
      
      // Create metadata
      const metadataContent = {
        name: `${rarity} ${components.species}`,
        description: `A ${rarity.toLowerCase()} ${components.species.toLowerCase()} fantasy creature`,
        image: `ipfs://${imageCid}`,
        attributes: [
          { trait_type: "Rarity", value: rarity },
          { trait_type: "Species", value: components.species },
          ...(components.element ? [{ trait_type: "Element", value: components.element }] : []),
          ...(components.form ? [{ trait_type: "Form", value: components.form }] : []),
          ...(components.anomalies ? components.anomalies.map(anomaly => ({ trait_type: "Anomaly", value: anomaly })) : [])
        ]
      };
      
      // Upload metadata to IPFS
      console.log("Uploading metadata to IPFS...");
      const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(metadataContent)
      });
      
      if (!metadataUploadResponse.ok) {
        const errorText = await metadataUploadResponse.text();
        throw new Error(`Metadata upload failed: ${metadataUploadResponse.status} ${metadataUploadResponse.statusText} - ${errorText}`);
      }
      
      const metadataResult = await metadataUploadResponse.json();
      const metadataCid = metadataResult.IpfsHash;
      console.log(`Metadata uploaded successfully to IPFS with CID: ${metadataCid}`);
      
      // Generate gateway URLs
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'gateway.pinata.cloud';
      
      // Create IPFS data object to return
      ipfsData = {
        image: `ipfs://${imageCid}`,
        imageUrl: `https://${gatewayUrl}/ipfs/${imageCid}`,
        metadata: `ipfs://${metadataCid}`,
        metadataUrl: `https://${gatewayUrl}/ipfs/${metadataCid}`
      };
      
      console.log("IPFS Upload Successful!");
      
    } catch (ipfsError) {
      console.error("IPFS upload failed:", ipfsError);
      // We'll continue with the generated image even if IPFS upload fails
    }
    
    // Return success response with IPFS data if available
    return NextResponse.json({ 
      success: true, 
      imagePath,
      metadata: {
        rarity,
        species: components.species,
        element: components.element,
        form: components.form,
        anomalies: components.anomalies,
        prompt: fullPrompt
      },
      ipfs: ipfsData
    });
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 