import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRef, useState, useSyncExternalStore } from "react"
import { Gamepad2, Settings, Trophy, Users } from "lucide-react"

import { QuestionPage } from "./Pages/QuestionPage"
import { MembersPage } from "./Pages/MembersPage"
import { SettingsPage } from "./Pages/SettingsPage"
import { LeaderboardPage } from "./Pages/LeaderboardPage"
import { SiteHeader } from "./components/SiteHeader"
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

  return (
    <QueryClientProvider client={queryClient}>
      <UserContextProvider key={sessionVersion}>
        <div className="mx-auto flex h-dvh flex-col overflow-hidden">
          <SiteHeader
            onMenuClick={() => navigationDrawer.current?.showModal()}
            navigationDrawerRef={navigationDrawer}
          />

          {/* Navigation Drawer Content */}
          <dialog
            ref={navigationDrawer}
            id="navigation-drawer"
            aria-labelledby="navigation-title"
            dir="rtl"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                const bounds = event.currentTarget.getBoundingClientRect()
                if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
                  event.currentTarget.close()
                }
              }
            }}
            className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-72 max-w-[85vw] flex-col border-l bg-background p-4 text-foreground shadow-xl backdrop:bg-black/40 open:flex"
          >
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