import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CurrentPortfolioState = {
    username: string;
    setUsername: (username: string) => void;
};


export const useCurrentPortfolio = create<CurrentPortfolioState>()(
    persist(
        (set) => ({
            username: "notstark",
            setUsername: (username) => set({ username })
        }),
        {
            name: 'current-portfolio',
        }
    )
);