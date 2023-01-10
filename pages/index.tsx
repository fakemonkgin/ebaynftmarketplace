import type { NextPage } from "next";
import { useContract, useActiveListings, MediaRenderer } from "@thirdweb-dev/react";
import Header from "../components/Header";
import { ListingType } from "@thirdweb-dev/sdk"
import { BanknotesIcon, ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link"
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter()
  const  { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, "marketplace"
  );

  const { data: listings, isLoading: loadingListings } = useActiveListings(contract);
  return (
    <div className="">
      <Header />
      
      <main className="max-w-6xl p-2 mx-auto">
        {loadingListings ? (
          <p className="text-center text-blue-500 animate-pulse">loading listings</p>
        ) : (
          <div className="grid gap-5 mx-auto gird-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {listings?.map((listing) => (
              <div onClick={() => router.push(`/listings/${listing.id}`)} key={listing.id} className="flex flex-col transition-all duration-150 ease-out card hover:scale-105">
                  <div className="flex flex-col items-center flex-1 pb-2">
                    <MediaRenderer className="w-44" src={listing.asset.image} />
                  </div>  
                  <div className="pt-2 space-y-4">
                    <div>
                      <h2 className="text-lg truncate">{listing.asset.name}</h2>
                      <hr />
                      <p className="mt-2 text-sm text-gray-600 truncate">{listing.asset.description}</p>
                    </div>
                    
                    <p>
                      <span className="mr-1 font-bold">{listing.buyoutCurrencyValuePerToken.displayValue}</span>{listing.buyoutCurrencyValuePerToken.symbol}
                    </p>

                    <div className={`flex items-center space-x-1 justify-end text-xs border w-fit ml-auto p-2 rounded-lg text-white ${listing.type === ListingType.Direct ? "bg-blue-500" : "bg-red-500"}`}>
                      <p>
                        {listing.type === ListingType.Direct ? "Buy Now" : "Auction"}
                      </p>
                         {listing.type === ListingType.Direct ? (
                           <BanknotesIcon className="h-4"/>
                         ) : (
                           <ClockIcon className="h-4"/>
                         )}
                    </div>
                  </div>
              </div> 
            ))              
            }
          </div>
        )}
      </main>
    </div> 
  );
};

export default Home;