import { NextRequest, NextResponse } from 'next/server';
import { InferenceClient } from "@huggingface/inference";
import fs from 'fs/promises';
import path from 'path';

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
    // Use the Hugging Face Inference API
    const apiKey = process.env.NEXT_PUBLIC_FLUX_AI;
    if (!apiKey) {
      throw new Error("API key not configured");
    }
    
    const client = new InferenceClient(apiKey);
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
    
    const response = await client.textToImage({
      inputs: fullPrompt,
      model: "black-forest-labs/FLUX.1-dev",
      parameters: {
        num_inference_steps: 50,
        guidance_scale: 7.5
      }
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create directory for saving images
    const outputDir = path.join(process.cwd(), "public", "generated_images");
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save the image
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${rarity}_${timestamp}.jpg`;
    const outputPath = path.join(outputDir, filename);
    
    await fs.writeFile(outputPath, buffer);
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      imagePath: `/generated_images/${filename}`,
      metadata: {
        rarity,
        species: components.species,
        element: components.element,
        form: components.form,
        anomalies: components.anomalies,
        prompt: fullPrompt
      }
    });
    
  } catch (error) {
    console.error("Error generating creature:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate creature" },
      { status: 500 }
    );
  }
} 