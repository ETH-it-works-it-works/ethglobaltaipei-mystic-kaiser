import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as fs from 'fs/promises';
import fsSync from 'fs';
import { InferenceClient } from '@huggingface/inference';
import FormData from 'form-data';

// Metadata definitions
const species = [
  'Dragon', 'Phoenix', 'Griffin', 'Unicorn', 'Chimera', 'Kraken', 'Leviathan',
  'Wyvern', 'Basilisk', 'Manticore', 'Hydra', 'Cerberus', 'Sphinx', 'Pegasus',
  'Naga', 'Kitsune', 'Minotaur', 'Mermaid', 'Harpy', 'Wendigo', 'Golem',
  'Djinn', 'Wraith', 'Fae', 'Elemental', 'Thunderbird', 'Qilin', 'Behemoth'
];

const elements = ['Fire', 'Water', 'Earth', 'Air', 'Ice', 'Lightning', 'Shadow', 'Light', 'Arcane', 'Void', 'Nature', 'Poison', 'Metal'];

const forms = ['Guardian', 'Predator', 'Sentinel', 'Celestial', 'Abyssal', 'Ethereal', 'Ancient', 'Primal', 'Corrupted', 'Spectral', 'Royal', 'Elder'];

const anomalies = [
  'Multi-headed', 'Crystal growth', 'Spectral glow', 'Dimensional shift', 'Time warped',
  'Nightmare aura', 'Hybrid form', 'Cosmic markings', 'Elemental fusion', 'Size anomaly',
  'Illusionary aspects', 'Gravitational distortion', 'Hivemind', 'Reality tear', 'Prismatic scales'
];

const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];

// Function to generate creature metadata
function generateCreatureMetadata() {
  // Create random metadata
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const creatureSpecies = species[Math.floor(Math.random() * species.length)];
  
  const metadata: {
    rarity: string;
    species: string;
    element?: string;
    form?: string;
    anomalies?: string[];
    prompt?: string;
  } = {
    rarity,
    species: creatureSpecies
  };
  
  // Add element (70% chance)
  if (Math.random() < 0.7) {
    metadata.element = elements[Math.floor(Math.random() * elements.length)];
  }
  
  // Add form (50% chance)
  if (Math.random() < 0.5) {
    metadata.form = forms[Math.floor(Math.random() * forms.length)];
  }
  
  // Add anomalies (30% chance to have 1-3 anomalies)
  if (Math.random() < 0.3) {
    const numAnomalies = Math.floor(Math.random() * 3) + 1;
    const selectedAnomalies = new Set<string>();
    
    while (selectedAnomalies.size < numAnomalies && selectedAnomalies.size < anomalies.length) {
      selectedAnomalies.add(anomalies[Math.floor(Math.random() * anomalies.length)]);
    }
    
    metadata.anomalies = Array.from(selectedAnomalies);
  }
  
  return metadata;
}

// Function to generate prompt from metadata
function generatePrompt(metadata: any) {
  let prompt = `A fantasy ${metadata.rarity.toLowerCase()} ${metadata.species.toLowerCase()}`;
  
  if (metadata.element) {
    prompt += ` of ${metadata.element.toLowerCase()} element`;
  }
  
  if (metadata.form) {
    prompt += `, a ${metadata.form.toLowerCase()} creature`;
  }
  
  if (metadata.anomalies && metadata.anomalies.length > 0) {
    prompt += ` with ${metadata.anomalies.join(' and ').toLowerCase()}`;
  }
  
  // Add artistic style instructions
  prompt += `. High quality, detailed fantasy art, digital painting, trending on artstation, stunning masterpiece.`;
  
  return prompt;
}

// Function to generate an image with Hugging Face
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FLUX_AI;
    if (!apiKey) {
      throw new Error("Hugging Face API key not configured");
    }
    
    console.log("Generating image with Hugging Face API...");
    const client = new InferenceClient(apiKey);
    
    // Generate the image
    const response = await client.textToImage({
      inputs: prompt,
      model: "black-forest-labs/FLUX.1-dev",
      parameters: {
        num_inference_steps: 50,
        guidance_scale: 7.5
      }
    });
    
    // Convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return base64;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

// Function to upload to IPFS
async function uploadToIPFS(imageData: string, metadata: any, pinataJwt: string) {
  try {
    console.log("Preparing IPFS upload...");
    
    // Convert base64 image to Buffer
    const imageBuffer = Buffer.from(imageData, 'base64');
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `creature_${timestamp}.png`;
    
    // Upload image to IPFS using FormData
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('file', blob, filename);
    
    // Upload image to IPFS using fetch
    console.log("Uploading image to IPFS...");
    const imageUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`
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
    
    // Create metadata for NFT
    const metadataContent = {
      name: `${metadata.rarity} ${metadata.species}`,
      description: `A ${metadata.rarity.toLowerCase()} ${metadata.species.toLowerCase()} fantasy creature`,
      image: `ipfs://${imageCid}`,
      attributes: [
        { trait_type: "Rarity", value: metadata.rarity },
        { trait_type: "Species", value: metadata.species },
        ...(metadata.element ? [{ trait_type: "Element", value: metadata.element }] : []),
        ...(metadata.form ? [{ trait_type: "Form", value: metadata.form }] : []),
        ...(metadata.anomalies ? metadata.anomalies.map((anomaly: string) => ({ trait_type: "Anomaly", value: anomaly })) : [])
      ]
    };
    
    // Upload metadata to IPFS
    console.log("Uploading metadata to IPFS...");
    const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pinataJwt}`
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
    return {
      image: `ipfs://${imageCid}`,
      imageUrl: `https://${gatewayUrl}/ipfs/${imageCid}`,
      metadata: `ipfs://${metadataCid}`,
      metadataUrl: `https://${gatewayUrl}/ipfs/${metadataCid}`
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
    console.log(`Processing request to generate a fantasy creature`);
    
    try {
        // Number of creatures to generate
        const numCreatures = 3;
        console.log(`Generating ${numCreatures} fantasy creatures`);
        
        // Array to store results
        const creatures = [];
        
        // Generate multiple creatures
        for (let i = 0; i < numCreatures; i++) {
            console.log(`Generating creature ${i+1}/${numCreatures}`);
            
            // Generate metadata for the creature
            console.log("Generating metadata...");
            const metadata = generateCreatureMetadata();
            console.log("Generated metadata:", metadata);
            
            // Generate prompt for the image based on the metadata
            console.log("Generating prompt...");
            const prompt = generatePrompt(metadata);
            metadata.prompt = prompt;
            console.log("Generated prompt:", prompt);
            
            // Make sure the directory exists
            const dir = path.join(process.cwd(), 'public/generated_images');
            if (!fsSync.existsSync(dir)) {
                console.log(`Creating directory ${dir}`);
                fsSync.mkdirSync(dir, { recursive: true });
            }
            
            // Generate image using Hugging Face Inference API
            console.log(`Generating image for creature ${i+1}...`);
            const imageData = await generateImage(prompt);
            if (!imageData) {
                throw new Error(`Failed to generate image for creature ${i+1}`);
            }
            
            // Save image to disk
            const timestamp = Date.now();
            const fileName = `creature_${timestamp}_${i}.png`;
            const imagePath = path.join(dir, fileName);
            
            try {
                console.log(`Saving image to ${imagePath}`);
                await fs.writeFile(imagePath, Buffer.from(imageData, 'base64'));
                console.log(`Image saved successfully`);
            } catch (error) {
                console.error(`Error saving image:`, error);
                throw new Error(`Failed to save image for creature ${i+1}`);
            }
            
            // Local path for frontend access
            const localPath = `/generated_images/${fileName}`;
            
            // Upload to IPFS using Pinata if we have credentials
            const pinataJwt = process.env.PINATA_JWT;
            let ipfsData = null;
            
            if (pinataJwt) {
                try {
                    console.log(`Uploading creature ${i+1} to IPFS...`);
                    ipfsData = await uploadToIPFS(imageData, metadata, pinataJwt);
                    console.log("IPFS upload successful:", ipfsData);
                } catch (error) {
                    console.error("Error uploading to IPFS:", error);
                    // Continue without IPFS data, but don't fail the whole request
                }
            } else {
                console.log("Skipping IPFS upload: No Pinata JWT provided");
            }
            
            // Add this creature to our results
            creatures.push({
                imagePath: localPath,
                metadata,
                ipfs: ipfsData
            });
            
            console.log(`Creature ${i+1}/${numCreatures} generation complete`);
        }
        
        // Return success response with all creatures
        return NextResponse.json({
            success: true,
            creatures
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 