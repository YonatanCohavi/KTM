import { createContext, useContext, useState } from "react"

type UserContextProps = {
    id: string
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
    const [user] = useState<UserContextProps>({
        id: getPersistentBrowserUUID()
    });
    return <UserContext.Provider value={user}>
        {children}
    </UserContext.Provider>
}

export function useUser() {
    const user = useContext(UserContext);
    if (user === undefined)
        throw new Error("useUser must be used under UserContextProvider");
    return user;
}