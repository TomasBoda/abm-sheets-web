import { useSearchParams } from "next/navigation";

export const useSessionId = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId") ?? undefined;
    return { sessionId };
};
