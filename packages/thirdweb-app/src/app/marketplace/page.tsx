"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Web3 from "web3";
import { Event as MultibaasEvent } from "@curvegrid/multibaas-sdk/dist/api";
import useMultiBaasWithThirdweb from "@/hooks/useMultiBaas";

export default function Marketplace() {
  const [items, setItems] = useState<String[]>([]);
  const { getActiveListingId } = useMultiBaasWithThirdweb();

  useEffect(() => {
    async function fetchListings() {
      try {
        const activeListings = await getActiveListingId();
        console.log("Active Listings:", activeListings);
        setItems(activeListings || []);
      } catch (error) {
        console.error("Error fetching active listings:", error);
      }
    }

    fetchListings();
  }, []);

  const handleBuy = (itemId: number) => {
    console.log(`Buying item with ID: ${itemId}`);
    // Add logic to handle the purchase
  };

  return (
    <main className="p-6 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-10">
        <h1 className="text-4xl font-extrabold mb-12 text-center text-gray-800">
          Marketplace
        </h1>
        <pre className="bg-gray-100 p-4 rounded-lg shadow-inner text-sm text-gray-700">
          {JSON.stringify(items, null, 2)}
        </pre>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-40 h-40 object-contain mb-4 rounded-md"
              />
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                {item.name}
              </h2>
              <p className="text-gray-500 text-sm mb-4 text-center">
                {item.description}
              </p>
              <p className="text-gray-800 font-semibold text-lg mb-6">
                {item.price}
              </p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                onClick={() => handleBuy(item.id)}
              >
                Buy Now
              </Button>
            </div>
          ))} */}
        </div>
      </div>
    </main>
  );
}
