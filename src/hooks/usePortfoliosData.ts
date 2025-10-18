import type { Portfolio } from "@/types";
import { useQuery } from "@tanstack/react-query";


const MAIN_API = "https://github.com/NotStark/Devfolios/raw/refs/heads/main/data/portfolios.json";
const FALLBACK_API = "/data/portfolios.json";



export const usePortfoliosData = () => {
    return useQuery<Portfolio[]>({
        queryKey: ["portfolios"],
        queryFn: async () => {
            try {
                const response = await fetch(MAIN_API);
                return await response.json();
            } catch {
                const response = await fetch(FALLBACK_API);
                return await response.json();
            }
        },
        gcTime: Infinity,
        staleTime: Infinity
    });
}