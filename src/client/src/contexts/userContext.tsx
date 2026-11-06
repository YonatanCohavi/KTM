import { createContext, useContext, useState } from "react"

type UserContextProps = {
    id: string
    name: string
    setName: (name: string) => void
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

const USER_NAME_KEY = "userName";

function getPersistentBrowserUUID() {
    let uuid = localStorage.getItem("browserUUID");
    if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem("browserUUID", uuid);
    }
    return uuid;
}

function getPersistentUserName(): string {
    const name = localStorage.getItem(USER_NAME_KEY);
    return name || "";
}

function savePersistentUserName(name: string): void {
    localStorage.setItem(USER_NAME_KEY, name);
}

export const UserContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [name, setNameState] = useState<string>(getPersistentUserName());
    
    const setName = (newName: string) => {
        setNameState(newName);
        savePersistentUserName(newName);
    };

    const [user] = useState<UserContextProps>({
        id: getPersistentBrowserUUID(),
        name,
        setName
    });

    // Update name in context when state changes
    user.name = name;

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