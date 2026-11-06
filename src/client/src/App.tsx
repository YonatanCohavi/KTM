import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { QuestionPage } from "./Pages/QuestionPage"
import logo from "./assets/logo.png"
import { UserContextProvider } from "./contexts/userContext"
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

function App() {
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
          {/* Main content */}
          <div className="container mx-auto min-h-0 flex-1">
            <QuestionPage />
          </div>
        </div>
      </UserContextProvider>
    </QueryClientProvider>
  )
}

export default App