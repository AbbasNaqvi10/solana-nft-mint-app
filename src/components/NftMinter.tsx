import { PublicKey } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import Image from "next/image";
import { FC, useCallback, useState } from "react";
import { mintWithMetaplexJs } from "utils/metaplex";
import { notify } from "utils/notifications";

const TOKEN_NAME = "Solana Workshop NFT";
const TOKEN_SYMBOL = "SHOP";
const TOKEN_DESCRIPTION = "NFT minted in the NFT Minter workshop!";
const WORKSHOP_COLLECTION = new PublicKey("CPpyd2Uq1XkCkd9KHswjttdQXTvZ4mmrnif3tXg9i8sk");

export const NftMinter: FC = () => {
  const { connection } = useConnection();
  const { networkConfiguration } = useNetworkConfiguration();
  const wallet = useWallet();

  const [nftDetails, setNftDetails] = useState({
    mintName: TOKEN_NAME,
    mintSymbol: TOKEN_SYMBOL,
    mintDescription: TOKEN_DESCRIPTION,
    mintCollection: WORKSHOP_COLLECTION.toBase58(),
  });

  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);

  const [mintAddress, setMintAddress] = useState(null);
  const [mintSignature, setMintSignature] = useState(null);

  const uploadImage = async (event) => {
    if (event.target.files && event.target.files[0]) {
      setLoading(true);
      const uploadedImage = event.target.files[0];
      setImage(uploadedImage);
      setCreateObjectURL(URL.createObjectURL(uploadedImage));
      const body = new FormData();
      body.append("file", uploadedImage);
      setLoading(false);
      await fetch("/api/upload", {
        method: "POST",
        body,
      }).catch((res) => {
        setLoading(false);
        notify({ type: "error", message: `Upload failed!`, description: res });
        console.log("error", `Upload failed! ${res}`);
      });
    }
  };

  const onChange = (event) => {
    setNftDetails({ ...nftDetails, [event.target.name]: event.target.value });
  };

  const onClickMintNft = useCallback(async () => {
    if (!wallet.publicKey) {
      console.log("error", "Wallet not connected!");
      notify({ type: "error", message: "error", description: "Wallet not connected!" });
      return;
    }
    await mintWithMetaplexJs(
      connection,
      networkConfiguration,
      wallet,
      nftDetails.mintName,
      nftDetails.mintSymbol,
      nftDetails.mintDescription,
      new PublicKey(nftDetails.mintCollection),
      image
    ).then(([mintAddress, signature]) => {
      setMintAddress(mintAddress);
      setMintSignature(signature);
    });
  }, [connection, image, networkConfiguration, nftDetails.mintCollection, nftDetails.mintDescription, nftDetails.mintName, nftDetails.mintSymbol, wallet]);

  return (
    <div>
      <div className="mx-auto flex flex-col">
        {createObjectURL && (
          <Image className="mx-auto mb-4" alt="uploadedImage" width="300" height="300" src={createObjectURL} />
        )}
        {!mintAddress && !mintSignature && !loading && (
          <div className="mx-auto text-center mb-2">
            <input className="mx-auto" type="file" onChange={uploadImage} />
          </div>
        )}
        {loading && <div className="mx-auto text-center mb-2">Loading...</div>}
      </div>
      {createObjectURL && !mintAddress && !mintSignature && (
        <div className="bg-gradient-to-r from-blue-900 to-black rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <label htmlFor="mint-name" className="text-white">
              NFT Name:
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-300 rounded-md py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-white"
              type="text"
              id="mint-name"
              name="mintName"
              value={nftDetails.mintName}
              onChange={onChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="mint-symbol" className="text-white">
              NFT Symbol:
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-300 rounded-md py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-white"
              type="text"
              id="mint-symbol"
              name="mintSymbol"
              value={nftDetails.mintSymbol}
              onChange={onChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="mint-description" className="text-white">
              NFT Description:
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-300 rounded-md py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-white"
              type="text"
              id="mint-description"
              name="mintDescription"
              value={nftDetails.mintDescription}
              onChange={onChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="mint-collection" className="text-white">
              Collection:
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-300 rounded-md py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-white"
              type="text"
              id="mint-collection"
              name="mintCollection"
              value={nftDetails.mintCollection}
              onChange={onChange}
            />
          </div>
        </div>
      )}
      <div className="flex flex-row justify-center">
        <div className="relative group items-center">
          {createObjectURL && !mintAddress && !mintSignature && !loading && (
            <div>
              <div
                className="m-1 absolute -inset-0.5 bg-gradient-to-r from-blue-900 to-black 
                      rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
              ></div>
              <button
                className="px-8 m-2 mt-4 w-40 h-14 btn animate-pulse bg-gradient-to-br from-blue-900 to-black hover:from-white hover:to-blue-300 text-white text-lg"
                onClick={onClickMintNft}
              >
                <span>Mint!</span>
              </button>
            </div>
          )}

          {mintAddress && mintSignature && (
            <div>
              <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
                <p>Mint successful!</p>
                <p className="text-xl mt-4 mb-2">
                  Mint address:{" "}
                  <span className="font-bold text-lime-500">
                    <a
                      className="border-b-2 border-transparent hover:border-lime-500"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://explorer.solana.com/address/${mintAddress}?cluster=${networkConfiguration}`}
                    >
                      {mintAddress}
                    </a>
                  </span>
                </p>
                <p className="text-xl">
                  Tx signature:{" "}
                  <span className="font-bold text-amber-600">
                    <a
                      className="border-b-2 border-transparent hover:border-amber-600"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://explorer.solana.com/tx/${mintSignature}?cluster=${networkConfiguration}`}
                    >
                      {mintSignature}
                    </a>
                  </span>
                </p>
              </h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
