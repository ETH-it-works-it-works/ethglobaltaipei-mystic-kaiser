"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Web3 from "web3";
import * as MultiBaas from "@curvegrid/multibaas-sdk";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

interface ListingItem {
  listingid: number;
  nftaddress: string;
  price: string;
  seller: string;
  tokenid: number;
  metadata?: NFTMetadata;
}

export default function Marketplace() {
  const [items, setItems] = useState<ListingItem[]>([]);
  const hostname = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
  const apiKey = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;
  const config = new MultiBaas.Configuration({
    basePath: hostname + "/api/v0",
    accessToken: apiKey,
  });
  const contractsApi = new MultiBaas.ContractsApi(config);
  const eventQueriesApi = new MultiBaas.EventQueriesApi(config);
  const chain = "ethereum";
  const deployedAddressOrAlias = "marketplace1";
  const contractLabel = "marketplace";
  const contractMethod = "getActiveBeastListings";
  const payload: MultiBaas.PostMethodArgs = {
    args: [],
  };
  const requestBody: MultiBaas.EventQuery = {
    events: [
      {
        select: [
          {
            name: "listingId",
            type: "input",
            alias: "",
            inputIndex: 0,
          },
          {
            name: "tokenId",
            type: "input",
            alias: "",
            inputIndex: 1,
          },
          {
            name: "seller",
            type: "input",
            alias: "",
            inputIndex: 2,
          },
          {
            name: "nftAddress",
            type: "input",
            alias: "",
            inputIndex: 3,
          },
          {
            name: "price",
            type: "input",
            alias: "",
            inputIndex: 4,
          },
        ],
        eventName: "BeastListed(uint256,uint256,address,address,uint256)",
      },
    ],
  };
  const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

  const fetchNFTMetadata = async (nftAddress: string, tokenId: number): Promise<NFTMetadata> => {
    try {
      const contract = new web3.eth.Contract([
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "tokenURI",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ], nftAddress);

      const tokenURI = await contract.methods.tokenURI(tokenId).call() as string;
      const ipfsUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await fetch(ipfsUrl);
      return await response.json();
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
      return {
        name: "Unknown NFT",
        description: "Metadata not available",
        image: "https://via.placeholder.com/400"
      };
    }
  };

  useEffect(() => {
    async function fetchListings() {
      try {
        const response = await contractsApi.callContractFunction(
          chain,
          deployedAddressOrAlias,
          contractLabel,
          contractMethod,
          payload
        );
        const activeListingId: any = response.data.result;
        console.log("Function call result:\n", activeListingId.output);

        const response2 = await eventQueriesApi.executeArbitraryEventQuery(
          requestBody
        );
        const activeListing: any = response2.data.result;
        console.log("Event query result:\n", activeListing.rows);

        const activeIds = activeListingId.output;
        const matchedListings = activeListing.rows.filter(
          (item: any) => activeIds.includes(item.listingid)
        );

        // Fetch metadata for each listing
        const listingsWithMetadata = await Promise.all(
          matchedListings.map(async (item: any) => {
            const metadata = await fetchNFTMetadata(item.nftaddress, item.tokenid);
            return { ...item, metadata };
          })
        );

        console.log("Filtered active listings with metadata:\n", listingsWithMetadata);
        setItems(listingsWithMetadata);
      } catch (e) {
        if (e) {
          console.log(`${e}`);
        } else {
          console.log("An unexpected error occurred:", e);
        }
      }
    }
    fetchListings();
  }, []);

  const handleBuy = (listingId: number) => {
    console.log(`Buying item with listing ID: ${listingId}`);
    // Add logic to handle the purchase
  };

  return (
    <main className="p-6 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-10">
        <h1 className="text-4xl font-extrabold mb-12 text-center text-gray-800">
          Marketplace
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.listingid}
              className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col items-center"
            >
              <img
                src={item.metadata?.image}
                alt={item.metadata?.name}
                className="w-40 h-40 object-contain mb-4 rounded-md"
              />
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                {item.metadata?.name}
              </h2>
              <p className="text-gray-500 text-sm mb-4 text-center">
                {item.metadata?.description}
              </p>
              <p className="text-gray-800 font-semibold text-lg mb-6">
                Price: {item.price} CELO
              </p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                onClick={() => handleBuy(item.listingid)}
              >
                Buy Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
