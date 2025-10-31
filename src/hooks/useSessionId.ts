import { useSearchParams } from "next/navigation";

// hook that retrieves the session id from the URL search params
export const useSessionId = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId") ?? undefined;
    return { sessionId };
};
