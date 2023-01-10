import React from 'react'
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react"
import Link from "next/link"
import {
    BellIcon,
    ShoppingCartIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline"
import Image from 'next/image'

type Props = {}

function Header({}: Props) {
    const connectWithMetamask = useMetamask();
    const disconnect = useDisconnect();
    const address = useAddress();
    
    return (  
      <div className='max-w-6xl p-2 mx-auto'>
        <nav className="flex justify-between">
          <div className='flex items-center space-x-2 text-sm' >
            {address ? (
                <button onClick={disconnect} className='connectWalletBtn'>Hi, {address.slice(0,4) + "..." + address.slice(-4)}</button>) :
                (<button onClick={connectWithMetamask} className='connectWalletBtn'>Connect Your Wallet</button>)
            }
            <p className="headerLink">Daily Deals</p>
            <p className="headerLink">Help & Contact</p>
          </div> 

          <div className='flex items-center space-x-4 text-sm'>
              <p className="headerLink">Ship to</p>
              <p className="headerLink">Sell</p>
              <p className="headerLink">Watchlist</p>
             
              <Link href="/addItem" className="flex items-center hover:link">
                Add to inventory
                <ChevronDownIcon className="h-4" />
              </Link>
              
              <BellIcon className='w-6 h-6' />
              <ShoppingCartIcon className='w-6 h-6' />
          </div>     
        </nav> 
        <hr className="mt-2" />

        <section className='flex items-center py-5 space-x-2'>
           <div className='w-16 h-16 cursor-pointer shrink-0 md:w-44'>
            <Link href="/">
                <Image
                  alt="logo"
                  src="https://links.papareact.com/bdb"
                  width={100}
                  height={100}
                  className="object-contain w-full h-full"
                />
            </Link> 
           </div> 

           <button className='items-center hidden w-20 space-x-2 lg:flex'>
               <p className='text-sm text-gray-600'>Shop by Category</p>
               <ChevronDownIcon className='h-4 shrink-0'/>
           </button>

           <div className="flex items-center flex-1 px-2 py-2 space-x-2 border-2 border-black md:px-5">
               <MagnifyingGlassIcon className="w-5 text-gray-400" />
               <input type="text" placeholder="Search for Anything" className="flex-1 outline-none" />
           </div>

           <button className='hidden px-5 py-2 text-white bg-blue-600 border-2 border-blue-600 sm:inline md:px-10'>
              Search
           </button>
           
           <Link href="/create">
              <button className='px-5 py-2 text-blue-600 border-2 border-blue-600 cursor-pointer md:px-10 hover:bg-blue-600/50 hover:text-white'>
                  List Item
              </button>
           </Link>
        </section>
        
        <hr />

        <section className="flex justify-center px-6 py-3 space-x-6 text-xs md:text-sm whitespace-nowrap">
        <p className='link'>Home</p>
         <p className='link'>Electronics</p>
         <p className='link'>Computers</p>
         <p className='hidden sm:inline link'>Video Games</p>
         <p className='hidden sm:inline link'>Home & Garden</p>
         <p className='hidden md:inline link'>Health & Beauty</p>
         <p className='hidden lg:inline link'>Collectibles and Art</p>
         <p className='hidden lg:inline link'>Books</p>
         <p className='hidden lg:inline link'>Music</p>
         <p className='hidden xl:inline link'>Deals</p>
         <p className='hidden xl:inline link'>Other</p>
         <p className='link'>More</p>
        </section>
      </div>
  )
}

export default Header