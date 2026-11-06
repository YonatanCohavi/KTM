import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRef, useState, useSyncExternalStore } from "react"
import { Gamepad2, Menu, Settings, Trophy, Users, X } from "lucide-react"

import { QuestionPage } from "./Pages/QuestionPage"
import { MembersPage } from "./Pages/MembersPage"
import { SettingsPage } from "./Pages/SettingsPage"
import { LeaderboardPage } from "./Pages/LeaderboardPage"
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
  const navigationDrawer = useRef<HTMLDialogElement>(null)
  const [sessionVersion, setSessionVersion] = useState(0)
  const page = useSyncExternalStore(subscribeToNavigation, () => {
    if (window.location.hash === "#/members") return "members"
    if (window.location.hash === "#/leaderboard") return "leaderboard"
    if (window.location.hash === "#/settings") return "settings"
    return "quiz"
  })
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
      <UserContextProvider key={sessionVersion}>
        <div className="mx-auto flex h-dvh flex-col overflow-hidden">
          {/* // Toolbar */}
          <div className="flex shrink-0 items-center justify-around gap-2 bg-primary p-2 text-background shadow sm:gap-4 sm:p-4">
            <button type="button" aria-label="פתיחת תפריט ניווט" title="פתיחת תפריט ניווט" aria-haspopup="dialog" aria-controls="navigation-drawer" onClick={() => navigationDrawer.current?.showModal()} className="flex size-10 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-ring">
              <Menu className="size-6" />
            </button>
            <div className="text-lg font-semibold sm:text-xl">הכר את החבר</div>
            <div className="bg-white px-1 pt-1.5 pb-0.5 rounded flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-8 sm:h-10" />
            </div>
          </div>
          <dialog ref={navigationDrawer} id="navigation-drawer" aria-labelledby="navigation-title" dir="rtl" onClick={(event) => {
            if (event.target === event.currentTarget) {
              const bounds = event.currentTarget.getBoundingClientRect()
              if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
                event.currentTarget.close()
              }
            }
          }} className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-72 max-w-[85vw] flex-col border-l bg-background p-4 text-foreground shadow-xl backdrop:bg-black/40 open:flex">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="navigation-title" className="text-lg font-semibold">הכר את החבר</h2>
              <button type="button" autoFocus aria-label="סגירת תפריט ניווט" title="סגירת תפריט ניווט" onClick={() => navigationDrawer.current?.close()} className="flex size-10 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="ניווט ראשי" className="flex flex-col gap-2">
              <a href="#/" onClick={() => navigationDrawer.current?.close()} aria-current={page === "quiz" ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring", page === "quiz" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                <Gamepad2 className="size-4" />משחק
              </a>
              <a href="#/leaderboard" onClick={() => navigationDrawer.current?.close()} aria-current={page === "leaderboard" ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring", page === "leaderboard" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                <Trophy className="size-4" />דירוג
              </a>
              <a href="#/members" onClick={() => navigationDrawer.current?.close()} aria-current={page === "members" ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring", page === "members" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                <Users className="size-4" />כל החברים
              </a>
              <a href="#/settings" onClick={() => navigationDrawer.current?.close()} aria-current={page === "settings" ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring", page === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                <Settings className="size-4" />הגדרות
              </a>
            </nav>
          </dialog>
          {/* Main content */}
          <div className="container mx-auto min-h-0 flex-1">
            {page === "members" ? <MembersPage /> : page === "leaderboard" ? <LeaderboardPage /> : page === "settings" ? <SettingsPage onRestart={() => {
              window.location.hash = "#/"
              setSessionVersion(version => version + 1)
            }} /> : <QuestionPage />}
          </div>
        </div>
      </UserContextProvider>
    </QueryClientProvider>
  )
}

export default App