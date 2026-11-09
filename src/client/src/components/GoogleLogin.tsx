import { useEffect } from 'react';
import { useUser } from '@/contexts/userContext';
import { LogOut } from 'lucide-react';

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
                    renderButton: (element: HTMLElement, config: object) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

interface DecodedToken {
    sub: string;
    name: string;
    email: string;
    picture: string;
    aud: string;
    iss: string;
    iat: number;
    exp: number;
}

export function GoogleLogin() {
    const { isAuthenticated, loginWithGoogle, logout, name } = useUser();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleLogin,
            });
        };
        document.body.appendChild(script);
    }, []);

    const handleGoogleLogin = (response: { credential: string }) => {
        try {
            const token = response.credential;
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('Invalid JWT format');
                return;
            }

            // Decode the payload (second part)
            const payload = JSON.parse(atob(parts[1])) as DecodedToken;
            loginWithGoogle(payload.sub, payload.name);
        } catch (error) {
            console.error('Failed to decode Google token:', error);
        }
    };

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{name}</span>
                <button
                    onClick={logout}
                    className="flex items-center gap-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200"
                >
                    <LogOut className="size-3" />
                    התנתקות
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div id="google-login-button" />
            <style>{`
                #google-login-button > div {
                    margin: 0 auto;
                }
            `}</style>
        </div>
    );
}
