import React, {useState, useEffect} from 'react';
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { ChainId, useContract, useAcceptDirectListingOffer, useNetwork, useNetworkMismatch,useMakeBid, useOffers, useMakeOffer, useBuyNow, useAddress ,MediaRenderer, useListing } from "@thirdweb-dev/react";
import { ListingType, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Countdown from "react-countdown";
import { ethers } from "ethers";

function ListingPage() {
    const router = useRouter();
    const address = useAddress();
    const networkMismatch = useNetworkMismatch();
    const [, switchNetwork] = useNetwork();
    const [bidAmount, setBidAmount] = useState("");
    const { listingId } = router.query as { listingId: string };
    const [minimumNextBid, setMinimumNextBid] = useState<{
        displayValue: string;
        symbol: string;
    }>();

    const { contract } = useContract(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
        "marketplace"
        )
    const { mutate: makeBid } = useMakeBid(contract)
        
    const { data: offers } = useOffers(contract, listingId) 
        
    const {mutate: buyNow} = useBuyNow(contract)

    const {mutate: makeOffer} = useMakeOffer(contract)

    const { data: listing, isLoading, error } = useListing(contract, listingId);
    
    const { mutate: acceptOffer } = useAcceptDirectListingOffer(contract);

    useEffect(() => {
        if (!listingId || !contract || !listing) return;
         
        if (listing.type === ListingType.Auction) {
            fetchMinNextBid();
        }
    }, [listingId, listing, contract])

    const fetchMinNextBid = async () => {
        if (!listingId || !contract) return;
        
        const { displayValue, symbol } = await contract.auction.getMinimumNextBid(listingId);

        setMinimumNextBid({
            displayValue: displayValue,
            symbol: symbol,
        })
    }
    
    const formatPlaceholder = () => {
        if (!listing) return;
        
        if (listing.type === ListingType.Direct) {
            return "Enter Offer Amount";
        }

        if (listing.type === ListingType.Auction) {
            return Number(minimumNextBid?.displayValue) === 0 ? 
            "Enter Bid Amount" : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`;      
        }
    }

    const buyNft = async () => {
        if (networkMismatch) {
            switchNetwork && switchNetwork(ChainId.Goerli);
            return;
        }
        if (!listingId || !contract || !listing) return;
        
        await buyNow({
            id: listingId,
            buyAmount: 1,
            type: listing.type,
        }, {
        onSuccess(data, variables, context) {
            alert("NFT bought successfully");
            console.log("SUCCESS", data, variables, context);
            router.replace("/")
        },
          onError(error, variables, context) {
              alert("ERROR: NFT could not be bought");
              console.log("ERROR", error, variables, context);
          },  
        }
      )       
    }

    const createBidOrOffer = async() => {
        try {
            if (networkMismatch) {
                switchNetwork && switchNetwork(ChainId.Goerli);
                return;
            }

            if (listing?.type === ListingType.Direct) {
                if (listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {         
                    buyNft();
                    return;
                }
                
                await makeOffer(
                    {
                        quantity: 1,
                        listingId,
                        pricePerToken: bidAmount,
                    },
                    {
                        onSuccess(data, variables, context) {
                            alert("Offer made successfully");
                            console.log("SUCCESS", data, variables, context);
                        },
                        onError(error, variables, context) {
                            alert("ERROR: Offer could not be made");
                            console.log("ERROR", error, variables, context);
                        }
                    }
                )
            }

            if (listing?.type === ListingType.Auction) {
                await makeBid({
                    listingId,
                    bid: bidAmount,
                }, {
                    onSuccess(data, variables, context) {
                        alert("Bid made successfully");
                        console.log("SUCCESS", data, variables, context)
                    },
                    onError(error, variables, context) {
                        alert("ERROR: Bid could not be made");
                        console.log("ERROR", error, variables, context);
                        setBidAmount("");
                    }
                }
                
                )
            }
        } catch (error) {
            console.error(error)
        }
    } 

    if (isLoading) 
    return (
     <div>
        <Header />
        <div className='text-center text-blue-500 animate-pulse'>
            <p>Loading Item...</p>
        </div>
     </div>
    )
    
    if (!listing) {
        return <div>Listing is not found</div>  
    }

    return (
        <div>
            <Header />
            <main className='flex flex-col max-w-6xl p-2 pr-10 mx-auto space-x-5 space-y-10 lg:flex-row'>
                <div className='max-w-md p-10 mx-auto border lg:max-w-xl lg:mx-0'>
                    <MediaRenderer src={listing?.asset.image} />
                </div>

                <section className='flex-1 pb-20 space-y-5 lg:pb-0 '>
                <div>
                    <h1 className='text-xl font-bold'>{listing.asset.name}</h1>
                    <p className='text-gray-600'>{listing.asset.description}</p>
                    <p className='flex items-center text-xs sm:text-base'>
                        <UserCircleIcon className='h-5'/>
                        <span className='pr-1 font-bold'>Seller:</span>
                        {listing.sellerAddress}
                    </p>
                </div>

                <div className='grid items-center grid-cols-2 py-2'>
                    <p className='font-bold'>Listing Type:</p>
                    <p>{listing.type === ListingType.Direct ? "Direct Listing" : "Auction Listing"}</p>
                    
                    <p className='font-bold'>Buy it Now Price:</p>
                    <p className='text-4xl font-semibold'>{listing.buyoutCurrencyValuePerToken.displayValue}
                    {listing.buyoutCurrencyValuePerToken.symbol}
                    </p>
                    
                    <button onClick={buyNft} className='col-start-2 px-10 py-4 mt-2 font-bold text-white bg-blue-600 rounded-full w-44'>
                        Buy Now
                    </button>
                </div>

                {listing.type === ListingType.Direct && offers && (
                   <div className="grid grid-cols-2 gap-y-2">
                       <p className='font-bold'>Offers:</p>
                       <p className='font-bold'>
                           {offers.length > 0 ? offers.length : 0}
                       </p>

                       {offers.map((offer) => (
                       <>
                         <p className='flex items-center ml-5 text-sm italic'>
                           <UserCircleIcon className='h-3 mr-2'/>  
                            {offer.offeror.slice(0,5) + "..." + offer.offeror.slice(-5)}
                         </p>
                        
                        <div>
                            <p key={
                                offer.listingId + offer.offeror + offer.totalOfferAmount.toString()
                            } className='text-sm italic'>
                                {ethers.utils.formatEther(offer.totalOfferAmount)}{" "}
                                {NATIVE_TOKENS[ChainId.Goerli].symbol}
                            </p>
                            
                            {listing.sellerAddress === address && (
                                <button onClick={ () => {
                                    acceptOffer({
                                        listingId,
                                        addressOfOfferor: offer.offeror,
                                    },
                                    {
                                    onSuccess(data, variables, context) {
                                        alert("Offer accepted successfully");
                                        console.log("SUCCESS", data, variables, context);
                                        router.replace("/");
                                    },
                                      onError(error, variables, context) {
                                          alert("ERROR: Offer could not be accepted");
                                          console.log("ERROR", error, variables, context);
                                      },  
                                    }
                                  )
                                }
                                } className="w-32 p-2 text-xs font-bold rounded-lg cursor-pointer bg-red-500/50">
                                    Accept Offer
                                </button>
                            )}
                        </div>
                       </>))}
                   </div>
                )}
                <div className='grid items-center justify-end grid-cols-2 space-y-2'>
                    <hr className='col-span-2' />
                    
                    <p className='col-span-2 font-bold'>
                        {listing.type === ListingType.Direct ? "Make an Offer" : "Bid on this Auction"}
                    </p>

                    {listing.type === ListingType.Auction && (
                        <>
                        <p>Current Minimum Bid:</p>
                        <p className='font-bold'>{minimumNextBid?.displayValue}{minimumNextBid?.symbol}</p>

                        <p>Time Remaining:</p>
                        <Countdown date={Number(listing.endTimeInEpochSeconds.toString()) * 1000} />
                        </>
                    )}
                    
                    <input onChange={(e) => setBidAmount(e.target.value)} className='p-2 mr-5 border rounded-lg' type="text" placeholder={formatPlaceholder()} />
                    <button onClick={createBidOrOffer} className='px-10 py-4 font-bold text-white bg-red-600 rounded-full w-44'>
                        {listing.type === ListingType.Direct ? "offer" : "bid"}
                    </button>
                </div>
            </section>
        </main>
    </div>
  )
}

export default ListingPage