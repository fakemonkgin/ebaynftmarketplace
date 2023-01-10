import React, { useState }from 'react'
import Header from "../components/Header"
import { useAddress, useContract } from "@thirdweb-dev/react"
import { useRouter } from 'next/router'

type Props = {}

function addItem({}: Props) {

const address = useAddress()
const router = useRouter()
const [preview, setPreview] = useState<string>()
const [image, setImage] = useState<File>()

const { contract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection")

const mintNft = async (e: any) => {
        e.preventDefault()
        if(!contract || !address) return;
  
        if(!image) {
            alert('please select an image');
            return;
        }
  
       const target = e.target as typeof e.target & {
          name: { value: string };
          description: { value: string};
       }
  
       const metadata = {
           name: target.name.value,
           description: target.description.value,
           image: image,
       }
  
       try {
           const tx = await contract.mintTo(address, metadata);
           const receipt = tx.receipt;
           const tokenId = tx.id;
           const nft = await tx.data();
  
           console.log(receipt, tokenId, nft);
           router.push("/");
          
       } catch (error) {
           console.error(error)
       }
     };

return (
    <div>
        <Header />
        <main className='max-w-6xl p-10 mx-auto border'>
            <h1 className="text-4xl font-bold">Add an Item to the Marketplace</h1>
            <h2 className='pt-5 text-xl font-semibold'>Item Details</h2>
            <p className='pb-5'>By adding an item to the marketplace, you're essentially Minting an NFT of the item into your wallet which we can then list for sale!</p>
        
        <div className='flex flex-col items-center justify-center pt-5 md:flex-row md:space-x-5'>
          <img 
            className="object-contain border h-80 w-80"
            src={preview || "https://links.papareact.com/ucj"}
            alt="logo"
            />
          
          <form onSubmit={mintNft} className='flex flex-col flex-1 p-2 space-y-2'>
            <label className='font-light'>Name of Item</label>
            <input className='formField' placeholder="Name of item..." type="text" name="name" id="name"/>
                
            <label className='font-light'>Description</label>
            <input className='formField' placeholder="Enter Description..." type="text" name="description" id="description"/>

            <label className='font-light'>Image of the Item</label>
            <input type="file" onChange={(e) => {
                 if(e.target.files?.[0]) {
                    setPreview(URL.createObjectURL(e.target.files[0]));
                    setImage(e.target.files[0]);
                    }
                }}/>
            
            <button type="submit" className='w-56 px-10 py-4 mx-auto font-bold text-white bg-blue-600 rounded-full md:mt-auto md:ml-auto'>Add/Mint Item</button>
          </form>          
        </div>
        </main>
    </div>
  )
}

export default addItem