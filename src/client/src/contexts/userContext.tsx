import { useResetUserMutation, userQueries, useUserMutation } from "@/services/user-api"
import { useQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo } from "react"

type UserContextProps = {
    id: string
    name: string
    setName: (name: string) => Promise<void>
    isAuthenticated: boolean
    loginWithGoogle: (googleId: string, name: string) => void
    logout: () => void
    resetUser: () => Promise<void>
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

function getGoogleUserId() {
    return localStorage.getItem("googleUserId");
}

function setGoogleUserId(googleId: string) {
    localStorage.setItem("googleUserId", googleId);
}

function clearGoogleUserId() {
    localStorage.removeItem("googleUserId");
}


export const UserContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const googleUserId = getGoogleUserId();
    const currentUserId = googleUserId || getPersistentBrowserUUID();
    
    const { data: userData } = useQuery(userQueries.stats(currentUserId));
    const { mutateAsync: updateUserAsync } = useUserMutation(currentUserId);
    const { mutateAsync: resetUserAsync } = useResetUserMutation(currentUserId);
    
    const setName = async (name: string) => await updateUserAsync({ name });
    
    const loginWithGoogle = (googleId: string, name: string) => {
        setGoogleUserId(googleId);
        updateUserAsync({ name });
    };
    
    const logout = () => {
        clearGoogleUserId();
    };
    
    var userDetails = useMemo(() => {
        return {
            id: currentUserId,
            name: userData?.name || "",
            isAuthenticated: !!googleUserId,
        }
    }, [userData, googleUserId]);
    
    return <UserContext.Provider value={{ ...userDetails, setName, loginWithGoogle, logout, resetUser: resetUserAsync }}>
        {children}
    </UserContext.Provider>
}

export function useUser() {
    const user = useContext(UserContext);
    if (user === undefined)
        throw new Error("useUser must be used under UserContextProvider");
    return user;
}