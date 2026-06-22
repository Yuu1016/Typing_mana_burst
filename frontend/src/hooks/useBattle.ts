import {useState} from "react";

export function useBattle(limitCost: number){
    const [currentCost, setCurrentCost] = useState(0);

    const playCard = (cardCost: number) => {
        setCurrentCost((prev) => {
            const nextCost = prev + cardCost;

            return nextCost > limitCost ? prev : nextCost;
        })
    };

    const resetCost = () => {
        setCurrentCost(0);
    };

    const isJust = currentCost === limitCost;

    return {currentCost, playCard, resetCost, isJust}

}