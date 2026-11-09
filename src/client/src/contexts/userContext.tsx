import { userQueries, useUserMutation } from "@/services/user-api"
import { useQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo } from "react"

type UserContextProps = {
    id: string
    name: string
    setName: (name: string) => Promise<void>
    // isAuthenticated: boolean
    // loginWithGoogle: (googleId: string, name: string) => void
    // logout: () => void
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

function getPersistentBrowserUUID() {
    let uuid = localStorage.getItem("browserUUID");
    if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem("browserUUID", uuid);
    }
    return uuid;
}

// function getGoogleUserId() {
//     return localStorage.getItem("googleUserId");
// }

// function setGoogleUserId(googleId: string) {
//     localStorage.setItem("googleUserId", googleId);
// }

// function clearGoogleUserId() {
//     localStorage.removeItem("googleUserId");
// }


export const UserContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    // const googleUserId = getGoogleUserId();
    // const currentUserId = googleUserId || getPersistentBrowserUUID();
    const currentUserId = getPersistentBrowserUUID();
    
    const { data: userData } = useQuery(userQueries.stats(currentUserId));
    const { mutateAsync: updateUserAsync } = useUserMutation(currentUserId);
    
    const setName = async (name: string) => {
        await updateUserAsync({ name });
    };
    
    // const loginWithGoogle = async (googleId: string, name: string) => {
    //     setGoogleUserId(googleId);
    //     // Invalidate old browser UUID queries
    //     await queryClient.invalidateQueries({ queryKey: userQueries.stats(getPersistentBrowserUUID()).queryKey });
    //     // Update name on new Google ID
    //     await updateUserAsync({ name });
    //     // Refetch stats with new Google ID
    //     await queryClient.invalidateQueries({ queryKey: userQueries.stats(googleId).queryKey });
    // };
    
    // const logout = () => {
    //     clearGoogleUserId();
    //     // Refetch with browser UUID after logout
    //     queryClient.invalidateQueries({ queryKey: userQueries.stats(getPersistentBrowserUUID()).queryKey });
    // };
    
    var userDetails = useMemo(() => {
        return {
            id: currentUserId,
            name: userData?.name || "",
            // isAuthenticated: !!googleUserId,
        }
    }, [userData]);
    
    return <UserContext.Provider value={{ ...userDetails, setName }}>
        {children}
    </UserContext.Provider>
}

export function useUser() {
    const user = useContext(UserContext);
    if (user === undefined)
        throw new Error("useUser must be used under UserContextProvider");
    return user;
}