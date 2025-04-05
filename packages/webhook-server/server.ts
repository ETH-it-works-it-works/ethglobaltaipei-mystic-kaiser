import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import config from "./config/config";
import { Database } from "./supabase/database.types";
import {
  AddressesApi,
  ContractsApi,
  Event,
  EventField,
} from "@curvegrid/multibaas-sdk";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurations
const { port, supabaseUrl, supabaseAnonKey, mbConfig } = config;

// Initialize Supabase
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const contractsApi = new ContractsApi(mbConfig);
const addressApi = new AddressesApi(mbConfig);

interface MultiBaasWebHook {
  id: string;
  event: string;
  data: Event;
}

// Webhook Receiver
app.post("/webhook", async (req: Request, res: Response) => {
  try {
    console.log("Received webhook payload:", JSON.stringify(req.body, null, 2));
    const eventList: MultiBaasWebHook[] = req.body;
    for (var i = 0; i < eventList.length; i++) {
      const event: Event = eventList[i].data;

      if (event.event.name === "EventCreated") {
        const inputs = event.event.inputs;

        // Extract necessary fields
        const eventId = inputs.find(
          (input: EventField) => input.name === "eventId"
        )?.value;
        const organizer = inputs.find(
          (input: EventField) => input.name === "organizer"
        )?.value;
        const eventContract = inputs.find(
          (input: EventField) => input.name === "eventContract"
        )?.value;
        const name = inputs.find(
          (input: EventField) => input.name === "name"
        )?.value;
        const description = inputs.find(
          (input: EventField) => input.name === "description"
        )?.value;
        const location = inputs.find(
          (input: EventField) => input.name === "location"
        )?.value;
        const participantLimit = inputs.find(
          (input: EventField) => input.name === "participantLimit"
        )?.value;
        const startDate = inputs.find(
          (input: EventField) => input.name === "startDate"
        )?.value;
        const rewardCount = inputs.find(
          (input: EventField) => input.name === "rewardCount"
        )?.value;

        // Save to Supabase
        const { data, error } = await supabase.from("events").insert([
          {
            event_id: eventId,
            organizer,
            address: eventContract,
            name,
            description,
            location,
            participant_limit: Number(participantLimit),
            reward_count: Number(rewardCount),
            start_date: new Date(startDate * 1000).toISOString(),
          },
        ]);

        if (error) {
          console.error("Error inserting into Supabase:", error);
          throw error;
        } else {
          console.log("Successfully saved event:", data);
        }

        // Create an alias for the new address
        const alias = `eventimplementation${eventId}`;
        await addressApi.setAddress("ethereum", {
          alias,
          address: eventContract,
        });

        // Link to multibaas
        await contractsApi.linkAddressContract("ethereum", alias, {
          label: `eventimplementation1`,
          startingBlock: "latest",
        });
      } else if (event.event.name === "BattleStarted") {
        const inputs = event.event.inputs;

        // Extract necessary fields
        const battleId = inputs.find(
          (input: EventField) => input.name === "battleId"
        )?.value;
        const player1 = inputs.find(
          (input: EventField) => input.name === "player1"
        )?.value;
        const player2 = inputs.find(
          (input: EventField) => input.name === "player2"
        )?.value;

        // Save to Supabase
        const { data, error } = await supabase
          .from("gameLobbies")
          .update({ battle_id: battleId })
          .match({
            player1_address: player1,
            player2_address: player2,
            status: "playing",
          });
        if (error) {
          console.error("Error inserting into Supabase:", error);
          throw error;
        } else {
          console.log("Successfully saved event:", data);
        }
      } else if (event.event.name === "Attack") {
        const inputs = event.event.inputs;

        // Extract necessary fields
        const battleId = inputs.find(
          (input: EventField) => input.name === "battleId"
        )?.value;
        const attacker = inputs.find(
          (input: EventField) => input.name === "attacker"
        )?.value;
        const damage = inputs.find(
          (input: EventField) => input.name === "damage"
        )?.value;

        // Query Supabase for the matching event to get the code
        const { data: lobby, error: lobbyError } = await supabase
          .from("gameLobbies")
          .select("code")
          .eq("battle_id", battleId)
          .single();

        if (lobbyError) {
          console.error(
            "Error retrieving code from gameLobbies table:",
            lobbyError
          );
          throw lobbyError;
        }

        // Save to Supabase
        const { data, error } = await supabase.from("battleLogs").insert([
          {
            code: lobby.code,
            battle_id: battleId,
            attacker,
            damage,
          },
        ]);

        if (error) {
          console.error("Error inserting into Supabase:", error);
          throw error;
        } else {
          console.log("Successfully saved event:", data);
        }
      } else if (event.event.name === "EventStarted") {
        const inputs = event.event.inputs;
        const contractAddress = event.event.contract.address;
        // Extract necessary fields
        const rewardCount = inputs.find(
          (input: EventField) => input.name === "rewardCount"
        )?.value;

        // Update Supabase Record
        const { data, error } = await supabase
          .from("events")
          .update({ is_started: true, reward_count: rewardCount })
          .match({
            address: contractAddress,
          });

        if (error) {
          console.error("Error inserting into Supabase:", error);
          throw error;
        } else {
          console.log("Successfully saved event:", data);
        }
      } else if (event.event.name === "ParticipantRegistered") {
        const contractAddress = event.event.contract.address;

        // Update Supabase Record
        await supabase.rpc("increment_registered_participants", {
          contract_address: contractAddress,
        });
      }
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
