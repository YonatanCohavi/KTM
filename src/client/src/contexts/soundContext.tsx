import { createContext, useContext, useMemo, useState } from "react"

type SoundContextProps = {
    isMuted: boolean
    toggleMute: () => void
}

const SoundContext = createContext<SoundContextProps | undefined>(undefined);

function getMutedState() {
    return localStorage.getItem("soundMuted") === "true";
}

function setMutedState(muted: boolean) {
    localStorage.setItem("soundMuted", muted ? "true" : "false");
}

export const SoundContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(getMutedState());

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            setMutedState(newState);
            return newState;
        });
    };

    const value = useMemo(() => ({
        isMuted,
        toggleMute
    }), [isMuted]);

    return <SoundContext.Provider value={value}>
        {children}
    </SoundContext.Provider>
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined)
        throw new Error("useSound must be used under SoundContextProvider");
    return context;
}
