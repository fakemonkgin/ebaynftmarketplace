import React, {useState} from 'react'
import Header from "../components/Header"
import { useAddress, useContract, MediaRenderer,useNetwork, useNetworkMismatch, useOwnedNFTs, useCreateAuctionListing, useCreateDirectListing} from "@thirdweb-dev/react"
import { NFT, ChainId, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk"
import { useRouter } from "next/router"

type Props = {}

export default function create({}: Props) {
    const address = useAddress()
    const router = useRouter()
    const { contract } = useContract(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
        "marketplace"
    )

    const [selectedNft, setSelectedNft] = useState<NFT>()

    const { contract: collectionContract } = useContract(
        process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
        "nft-collection"
    )

    const ownedNfts = useOwnedNFTs(collectionContract, address)
    const networkMismatch = useNetworkMismatch()
    const [, switchNetwork] = useNetwork()

    const {
        mutate: createDirectListing,
        isLoading: isLoadingDirect,
        error: errorDirect,
    } = useCreateDirectListing(contract);

    const {
        mutate: createAuctionListing,
        isLoading,
        error,
    } = useCreateAuctionListing(contract);
    
    const handleCreateListing = async (e: any) => {
        e.preventDefault()
        if (networkMismatch) {
            switchNetwork && switchNetwork(ChainId.Goerli);
            return
        }

        if (!selectedNft) return

        const { listingType, price } = e.target.elements

        if (listingType.value === "directListing") {
            createDirectListing({
                assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId: selectedNft.metadata.id,
                currencyContractAddress: NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds: 60 * 60 * 24 * 5,
                quantity: 1,
                buyoutPricePerToken: price.value,
                startTimestamp: new Date()
            }, {
                onSuccess(data, variables, context) {
                    console.log("Success:", data, variables, context);
                    router.push("/");
                },
                onError(error, variables, context) {
                    console.log("Error:", error, variables, context);
                }
            });   
        }
        
        if (listingType.value === "auctionListing") {
            createAuctionListing({
                assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId: selectedNft.metadata.id,
                currencyContractAddress: NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds: 60 * 60 * 24 * 5,
                quantity: 1,
                buyoutPricePerToken: price.value,
                startTimestamp: new Date(),
                reservePricePerToken: 0,
            }, {
                onSuccess(data, variables, context) {
                    console.log("Success:", data, variables, context);
                    router.push("/");
                },
                onError(error, variables, context) {
                    console.log("Error:", error, variables, context);
                }
            });   
        }
    };
    
    return (
    <div>
        <Header />

        <main className='max-w-6xl p-10 pt-2 mx-auto'>
            <h1 className='text-4xl font-bold'>List an Item</h1>
            <h2 className='pt-5 text-xl font-semibold'>Select an Item you would like to sell!</h2>

            <hr className='mb-5' />

            <p>Below you will find the NFT's you own in your wallet</p>
            
            <div className='flex p-4 space-x-2 overflow-x-scroll'>
                {ownedNfts?.data?.map(nft => (
                    <div 
                       key={nft.metadata.id}
                       onClick={() => setSelectedNft(nft)}
                       className={`flex flex-col space-y-2 bg-gray-100 border-2 card min-w-fit ${nft.metadata.id === selectedNft?.metadata.id ? "border-black" : "border-transparent"}`}
                    >
                        <MediaRenderer 
                           className='h-48 rounded-lg'
                           src={nft.metadata.image}
                        />
                        <p className='text-lg font-bold truncate'>{nft.metadata.name}</p>
                        <p className='text-xs truncate'>{nft.metadata.description}</p>
                    </div>
                ))}
            </div>

            {selectedNft && (
                <form onSubmit={handleCreateListing}>
                    <div className='flex flex-col p-10'>
                        <div className='grid grid-cols-2 gap-5'>
                            <label className='font-light border-r'>Direct Listing</label>
                            <input type="radio" name="listingType" value="directListing" 
                            className="w-10 h-10 ml-auto"
                            />

                            <label className='font-light border-r'>Auction</label>
                            <input type="radio" name="listingType" value="auctionListing" 
                            className='w-10 h-10 ml-auto'
                            />

                            <label className='font-light border-r'>Price</label>
                            <input type="text" name="price" placeholder='0.05' className='p-5 bg-gray-100'/>
                        </div>

                        <button className='p-4 mt-8 text-white bg-blue-600 rounded-lg' type="submit" >Create Listing</button>
                    </div>
                </form>
            )}
        </main>
    </div>
  )
}