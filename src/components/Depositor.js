import { YieldFarmingContext } from "../context/YieldFarmingContext"
import { useContext, useState } from "react"

// This component is used to deposit and withdraw SIKKA tokens and also to run the airdrop timer
const Depositor = () => {
    // This state is used to track the input in the input element
    const [depositedAmount, setDepositedAmount] = useState("")
    // importing the required states and methods from YieldFarmingContext
    const {
        depositedBalance,
        rewardTokenBalance,
        accountBalance,
        timeRemaining,
        isTimeRunning,
        depositTokens,
        withdrawTokens } = useContext(YieldFarmingContext)

    return (
        <div className="depositor">
            <table className="depositor--balanceBoard">
                <thead>
                    <tr className="depositor-balanceBoard--header">
                        <th>Deposited Balance</th>
                        <th>Reward Balance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="depositor-balanceBoard--amounts">
                        <td style={{ marginLeft: "130px" }}>{depositedBalance} SIKKA</td>
                        <td style={{ marginRight: "115px" }}>{rewardTokenBalance} RWD</td>
                    </tr>
                </tbody>
            </table>
            <div className="depositor--depositBoard" >
                <form onSubmit={(event) => {
                    event.preventDefault()
                    let amount = Number(depositedAmount)
                    if (isNaN(amount))
                        window.alert("Please enter amount in numbers")
                    else
                        depositTokens(depositedAmount)
                }}>
                    <div style={{ display: "flex", flexDirection: "column", opacity: ".9" }}>
                        <div>
                            <h4 style={{ float: "left", marginLeft: "15px", padding: "5px" }}>Stake Tokens</h4>
                            <h4 style={{ float: "right", marginRight: "8px", fontWeight: "lighter", padding: "5px" }}>Account Balance: {accountBalance}</h4>
                        </div>
                        <div className="depositor--depositBoard--enterAmount" >
                            <input type="text"
                                id="depositor--depositBoard--enterAmount--input"
                                name="tokenAmount"
                                placeholder="0"
                                value={depositedAmount}
                                onChange={(event) => setDepositedAmount(event.target.value)}
                                required
                            />
                            <label htmlFor="tokenAmount" id="depositor--depositBoard--enterAmount--label">SIKKA</label>
                        </div>
                        <button type="submit" className="depositor--depositBoard--Button" disabled={isTimeRunning}>DEPOSIT</button>
                    </div>
                </form>
                <button className="depositor--depositBoard--Button" type="button" onClick={withdrawTokens} disabled={isTimeRunning}>WITHDRAW</button>
                <div id="depositor--depositorBoard--airdrop">
                    <h4 style={{ color: "#8080ff" }}>AIRDROP</h4>
                    <p>0:{timeRemaining}</p>
                </div>
            </div>
        </div>
    )
}

export default Depositor