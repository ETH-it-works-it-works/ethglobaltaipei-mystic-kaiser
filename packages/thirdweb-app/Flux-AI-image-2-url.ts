//version 2 convert image to url linkn coz its lighter
const { InferenceClient } = require("@huggingface/inference");
const pinata = require("@/common/pinata"); // Your Pinata import
require('dotenv').config();

// Metadata definitions (unchanged)
const species: string[] = ["Lion", "Tiger", "Eagle", "Dragon", "Wolf", "Serpent", "Phoenix", "Fox", "Panther", "Griffin", "Stag", "Kirin", "Owlbear", "Basilisk", "Chimera", "Direwolf"];
const elements: string[] = ["Fire", "Water", "Earth", "Lightning", "Nature"];
const forms: string[] = ["Armored", "Winged", "Celestial", "Ethereal", "Mechanical", "Spirit", "Mystic", "Ancient"];
const anomalies: string[] = ["Golden Halo", "Shiny Aura", "Demon Horns", "Celestial Crest", "Ethereal Scar", "Spirit Flames", "Cosmic Eyes", "Starborn Markings", "Chrono Tail", "Ghostly Wisp", "Dragon Horns", "Radiant (Light) Alignment", "Umbral (Shadow) Alignment", "Primordial (Neutral) Alignment", "Abyssal (Chaos) Alignment", "Celestial (Balance) Alignment", "Crystal Armor", "Bone Spikes", "Spirit Cloak", "Energy Gauntlets", "Void Chains", "Dragon Plate", "War Banner", "Phoenix Plume", "Cosmic Glow", "Ember Eyes", "Frost Gaze", "Void Eyes", "Radiant Sight", "Storm Vision", "Serpent Stare", "Celestial Glow", "Abyssal Shadow", "Prismatic Pulse", "Ethereal Mist", "Starlight Veil", "Infernal Blaze", "Rune Etchings", "Sacred Tattoos", "War Scars", "Star Maps", "Mystic Glyphs", "Chaos Fractures"];
const rarities: string[] = ["Common", "Rare", "Epic", "Mythic"];
const rarityWeights: number[] = [0.6, 0.3, 0.085, 0.015];

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
    const components: PromptComponents = { species: species[Math.floor(Math.random() * species.length)] };

    switch (rarity) {
        case "Common": break;
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
            components.anomalies = [anomalies[Math.floor(Math.random() * anomalies.length)], anomalies[Math.floor(Math.random() * anomalies.length)]];
            break;
    }

    const style = "ancient creature warrior style with dramatic lighting, fantasy art style, detailed armor, and mystical aura";
    const parts = [components.species, components.element ? `${components.element} element` : undefined, components.form ? `${components.form} form` : undefined, components.anomalies?.join(', '), style].filter(Boolean) as string[];
    return [`A ${parts.join(' ')}`, rarity, components];
}

async function uploadImageToIPFS(buffer: Buffer): Promise<string> {
    const file = new File([buffer], "generated_image.jpg", { type: "image/jpeg" });
    const response = await pinata.upload.file(file);
    return `https://ipfs.io/ipfs/${response.IpfsHash}`; // Return IPFS URL
}

async function uploadUrlToIPFS(url: string): Promise<string> {
    const urlFile = new File([url], "image_url.txt", { type: "text/plain" });
    const response = await pinata.upload.file(urlFile);
    return `https://ipfs.io/ipfs/${response.IpfsHash}`; // Return IPFS URL of the text file
}

async function main() {
    const client = new InferenceClient({ accessToken: process.env.FLUX_AI });

    try {
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

        const startTime = Date.now();
        console.log("\n⏳ Generating image...");

        const response = await client.textToImage({
            inputs: fullPrompt,
            model: "black-forest-labs/FLUX.1-dev",
            parameters: { num_inference_steps: 50, guidance_scale: 7.5 }
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Step 1: Upload image to IPFS and get the image URL
        const imageUrl = await uploadImageToIPFS(buffer);
        console.log(`\n📸 Image uploaded to IPFS: ${imageUrl}`);

        // Step 2: Upload the image URL to IPFS as text
        const urlIpfsLink = await uploadUrlToIPFS(imageUrl);
        
        const elapsedTime = (Date.now() - startTime) / 1000;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;

        console.log(`\n✅ Image URL IPFS Link: ${urlIpfsLink}`);
        console.log(`⏱️ Generation time: ${minutes}m ${seconds.toFixed(2)}s`);

    } catch (error) {
        console.error(`\n❌ Error: ${error}`);
    }
}

main();