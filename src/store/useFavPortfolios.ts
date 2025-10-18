import type { Portfolio } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavPortfoliosState = {
    portfolios: Portfolio[];
    addPortfolio: (portfolio: Portfolio) => void;
    removePortfolio: (username: string) => void;
};


export const useFavPortfolios = create<FavPortfoliosState>()(
    persist(
        (set, get) => ({
            portfolios: [],
            addPortfolio: (portfolio) => set({ portfolios: [...get().portfolios, portfolio] }),
            removePortfolio: (username) => set({ portfolios: get().portfolios.filter(p => p.username !== username) }),

        }),
        {
            name: 'fav-portfolios',
        }
    )
);