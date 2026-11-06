import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useSyncExternalStore } from "react"
import { Gamepad2, Users } from "lucide-react"

import { QuestionPage } from "./Pages/QuestionPage"
import { MembersPage } from "./Pages/MembersPage"
import logo from "./assets/logo.png"
import { UserContextProvider } from "./contexts/userContext"
import { cn } from "./lib/utils"
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

function App() {
  const page = useSyncExternalStore(subscribeToNavigation, () => window.location.hash === "#/members" ? "members" : "quiz")
  //  useEffect(() => {
  //   const handleFocus = () => {
  //     window.location.reload();
  //   };

  //   window.addEventListener('focus', handleFocus);

  //   return () => {
  //     window.removeEventListener('focus', handleFocus);
  //   };
  // }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <div className="mx-auto flex h-dvh flex-col overflow-hidden">
          {/* // Toolbar */}
          <div className="flex shrink-0 items-center justify-around gap-2 bg-primary p-2 text-background shadow sm:gap-4 sm:p-4">
            <div className="bg-white px-1 pt-1.5 pb-0.5 rounded flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-8 sm:h-10" />
            </div>
            <div className="text-lg font-semibold sm:text-xl">הכר את החבר</div>
            <div className="bg-white px-1 pt-1.5 pb-0.5 rounded flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-8 sm:h-10" />
            </div>
          </div>
          <nav aria-label="ניווט ראשי" className="flex shrink-0 justify-center gap-1 border-b px-3 py-2">
            <a href="#/" aria-current={page === "quiz" ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring", page === "quiz" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <Gamepad2 className="size-4" />משחק
            </a>
            <a href="#/members" aria-current={page === "members" ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring", page === "members" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <Users className="size-4" />כל החברים
            </a>
          </nav>
          {/* Main content */}
          <div className="container mx-auto min-h-0 flex-1">
            {page === "members" ? <MembersPage /> : <QuestionPage />}
          </div>
        </div>
      </UserContextProvider>
    </QueryClientProvider>
  )
}

export default App