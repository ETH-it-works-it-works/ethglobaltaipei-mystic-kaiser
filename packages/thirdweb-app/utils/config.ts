"use server";

import { PinataSDK } from "pinata";

// Create a proper Pinata SDK instance with JWT authentication
export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL
}); 