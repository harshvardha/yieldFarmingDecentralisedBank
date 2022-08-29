import { YieldFarmingContext } from "../context/YieldFarmingContext"
import { useContext } from "react"
import bank from "../images/bank.png"

const NavBar = () => {
    const { userAddress, isWalletConnected, connectWallet } = useContext(YieldFarmingContext)
    return (
        <div className="navbar">
            <div className="navbar--logo">
                <img src={bank} alt="logo" className="navbar--logoImage" />
                <h3 className="navbar--logoName" style={{ fontSize: "20px" }}>Decentralized Bank</h3>
            </div>
            {!isWalletConnected ? (
                <button className="navbar--connectWallet" onClick={connectWallet}>connect wallet</button>
            ) : (
                <p className="navbar--accountNumber">Account: {userAddress}</p>
            )}
        </div>
    )
}

export default NavBar