import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { QuestionPage } from "./Pages/QuestionPage"
import logo from "./assets/logo.png"
import { Toaster } from "./components/ui/sonner"
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex  flex-col mx-auto h-screen">
        {/* // Toolbar */}
        <div className="flex bg-primary text-background p-4 shadow  justify-around items-center gap-4">
          <div className="bg-white px-1 pt-1.5 pb-0.5 rounded flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-10" />
          </div>
          <div className="font-semibold text-xl">הכר את החבר</div>
          <div className="bg-white px-1 pt-1.5 pb-0.5 rounded flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-10" />
          </div>
        </div>
        {/* Main content */}
        <div className="container mx-auto grow h-full">
          <QuestionPage />
        </div>
      </div>
      <Toaster />

    </QueryClientProvider>
  )
}

export default App