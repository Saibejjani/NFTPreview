import "./App.css";
import { ethers } from "ethers";
import { useState } from "react";
import contract from "./utils/contract.json";
function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftDesc, setNftDesc] = useState([]);
  const [nftImage, setNftImage] = useState([]);
  const [nftName, setNftName] = useState([]);
  const [totalFetch, setTotalFetch] = useState(1);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  // const CONTRACT_ADDRESS = "0xb3f62F7097ACC89d73eD4A6202aC551C41C30430";
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
        console.log("Connected account :", accounts[0]);
      } else {
        alert("Get Metamsk");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNFT = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          contractAddress,
          contract.abi,
          signer
        );
        const ts = await connectedContract.totalSupply();
        const nm = await connectedContract.name();
        setName(nm);
        const sym = await connectedContract.symbol();
        setSymbol(sym);
        const ls = ts.toNumber();
        for (let i = totalFetch; i <= ls; i++) {
          let uri = await connectedContract.tokenURI(i);
          console.log(uri);
          if (uri.startsWith("data:")) {
            const [, jsonContentEncoded] = uri.split("base64,");
            let { image, name, description } = JSON.parse(
              atob(jsonContentEncoded)
            );
            console.log(image);
            setNftImage((current) => [...current, image]);
            setNftDesc((current) => [...current, description]);
            setNftName((current) => [...current, name]);
            console.log(name);
          } else if (uri.startsWith("ipfs://")) {
            uri = `https://ipfs.io/ipfs/${uri.split("ipfs://")[1]}`;
            const tokenMetadata = await fetch(uri).then((response) =>
              response.json()
            );

            const value = tokenMetadata.image;
            console.log(value);

            let image = `https://ipfs.io/ipfs/${value.split("ipfs://")}`;
            image = image.replace(",", "");
            setNftImage((current) => [...current, image]);
            setNftName((current) => [...current, tokenMetadata.name]);
            setNftDesc((current) => [...current, tokenMetadata.description]);
            console.log(tokenMetadata);
          } else {
            const tokenMetadata = await fetch(uri).then((response) =>
              response.json()
            );

            setNftImage((current) => [...current, tokenMetadata.image]);
            setNftName((current) => [...current, tokenMetadata.name]);
            setNftDesc((current) => [...current, tokenMetadata.description]);
            console.log(tokenMetadata);
          }
        }
        setTotalFetch(ls);
      } else {
        console.log("ethereum object not found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="">
      <div className="App">
        {currentAccount ? (
          <button className="btn btn-primary mt-5" onClick={connectWallet}>
            connectWallet
          </button>
        ) : (
          <>
            <div className="input-group mb-2 mt-5" style={{ width: "40%" }}>
              <input
                type="text"
                className="form-control"
                placeholder="contract address"
                onChange={(e) => {
                  setContractAddress(e.target.value);
                }}
                aria-describedby="basic-addon2"
              />
              <span
                className="btn btn-primary"
                id="basic-addon2"
                onClick={fetchNFT}
              >
                fetch
              </span>
            </div>
          </>
        )}
      </div>

      <div className="">
        <h3>Collection Name: {name}</h3>
        <h3>Symbol : {symbol}</h3>
      </div>
      <br />
      <div className="row row-col-1 row-cols-md-3 mb-3 text-center">
        {nftImage.map((ele, index) => {
          return (
            <div className="col">
              <div className="card mb-4 rounded shadow-sm">
                <img src={ele} key={index} style={{ margin: "20px" }} />
                <div className="header">
                  <h4>{nftName[index]}</h4>
                  <h6>{nftDesc[index]}</h6>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
