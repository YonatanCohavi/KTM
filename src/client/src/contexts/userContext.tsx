import { userQueries, useUserMutation } from "@/services/user-api"
import { useQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo } from "react"

type UserContextProps = {
    id: string
    name: string
    setName: (name: string) => Promise<void>
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


export const UserContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data: userData } = useQuery(userQueries.stats(getPersistentBrowserUUID()));
    const { mutateAsync: updateUserAsync } = useUserMutation(getPersistentBrowserUUID());
    const setName = async (name: string) => await updateUserAsync({ name });
    var userDetails = useMemo(() => {
        return {
            id: getPersistentBrowserUUID(),
            name: userData?.name || "",
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