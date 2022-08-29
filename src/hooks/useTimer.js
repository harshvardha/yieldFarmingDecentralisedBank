import { useState, useEffect } from "react"

const useTimer = () => {
    const [timeRemaining, setTimeRemaining] = useState(20)
    const [isTimeRunning, setIsTimeRunning] = useState(false)
    const [callback, setCallback] = useState(null)

    const startTimer = (callbackFunction) => {
        setIsTimeRunning(true)
        setCallback(callbackFunction)
    }

    const resetTimer = () => {
        setIsTimeRunning(false)
        setTimeRemaining(20)
    }

    useEffect(() => {
        if (timeRemaining > 0 && isTimeRunning) {
            setTimeout(() => {
                setTimeRemaining(prevTime => prevTime - 1)
            }, 1000)
        }
        else if (timeRemaining === 0) {
            setIsTimeRunning(false)
            callback()
        }
    }, timeRemaining, isTimeRunning)

    return { timeRemaining, isTimeRunning, startTimer, resetTimer }
}

export default useTimer