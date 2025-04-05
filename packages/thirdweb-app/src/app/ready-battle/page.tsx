"use client";

import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { useEffect, useState } from "react";
import { NFT } from "thirdweb";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { useNFTContext } from "@/contexts/NFTContext";
import Image from "next/image";
import Link from "next/link";

export default function UserNFTs() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useThirdWeb();
  const { selectedNFT, setSelectedNFT } = useNFTContext();

  // useEffect(() => {
  //   console.log("selectedNFT:", selectedNFT);
  //   const fetchNFTs = async () => {
  //     if (!eventImplementationContract) return;
  //     if (!account) return;
  //     try {
  //       const ownedNFTs = await getOwnedNFTs({
  //         contract: eventImplementationContract,
  //         owner: account.address,
  //       });

  //       // Convert IPFS URI
  //       const updatedNFTs = ownedNFTs.map((nft) => ({
  //         ...nft,
  //         metadata: {
  //           ...nft.metadata,
  //           image: nft.metadata.image?.replace(
  //             "ipfs://",
  //             "https://ipfs.io/ipfs/"
  //           ),
  //         },
  //       }));

  //       console.log("Owned NFTs:", updatedNFTs);
  //       setNfts(updatedNFTs);
  //     } catch (error) {
  //       console.error("Error fetching NFTs:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchNFTs();
  // }, [account, eventImplementationContract]);

  if (loading)
    return (
      <p className="text-black text-center mt-52">Loading Battle Cards...</p>
    );

  return (
    <div className="min-h-screen flex items-center flex-col justify-center mt-32">
      <h1 className="text-3xl font-bold mb-4 text-white">Your Battle Cards</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {nfts.map((nft) => (
          <div
            className={`relative bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedNFT?.metadata.id === nft.metadata.id
                ? "animate-glow border-2 border-yellow-400"
                : ""
            }`}
            onClick={() =>
              setSelectedNFT(
                selectedNFT?.metadata.id === nft.metadata.id ? null : nft
              )
            }
          >
            {nft.metadata.image && (
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src={nft.metadata.image}
                  alt={nft.metadata.name || "NFT"}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">
              {nft.metadata.name}
            </h3>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.9);
          }
        }
        .animate-glow {
          animation: glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
