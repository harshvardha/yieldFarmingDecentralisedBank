import { YieldFarmingContext } from "../context/YieldFarmingContext"
import { useContext } from "react"

const Depositor = () => {
    return (
        <div className="depositor">
            <table className="depositor--balanceBoard">
                <thead className="depositor-balanceBoard--header">
                    <tr style={{ color: "#ffffff" }}>
                        <th>Deposited Balance</th>
                    </tr>
                </thead>
            </table>
        </div>
    )
}