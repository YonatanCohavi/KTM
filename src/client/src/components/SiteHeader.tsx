import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useUser } from "@/contexts/userContext";

interface HeaderProps {
  onMenuClick: () => void;
  navigationDrawerRef: React.RefObject<HTMLDialogElement | null>;
  onNavigationClose?: () => void;
}

export function SiteHeader({ onMenuClick, navigationDrawerRef }: HeaderProps) {
  const { name } = useUser();

  return (
    <>
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-2 bg-primary p-2 text-background shadow sm:gap-4 sm:p-4">
        {/* Left: Menu Button */}
        <button
          type="button"
          aria-label="פתיחת תפריט ניווט"
          title="פתיחת תפריט ניווט"
          aria-haspopup="dialog"
          aria-controls="navigation-drawer"
          onClick={onMenuClick}
          className="flex shrink-0 size-10 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Menu className="size-6" />
        </button>

        {/* Center: Logo & Title */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
          <div className="text-center">
            <div className="text-lg font-semibold sm:text-xl truncate">
              הכר את החבר
            </div>
            {name && (
              <div className="text-xs sm:text-sm font-medium text-background/80 truncate">
                {name}
              </div>
            )}
          </div>
        </div>

        {/* Right: Spacer for balance */}
        <div className="shrink-0 size-10" />
          <div className="bg-white px-1 pt-1.5 pb-0.5 rounded flex items-center justify-center shrink-0">
            <img src={logo} alt="Logo" className="h-8 sm:h-10" />
          </div>
      </div>

      {/* Navigation Drawer */}
      <dialog
        ref={navigationDrawerRef}
        id="navigation-drawer"
        aria-labelledby="navigation-title"
        dir="rtl"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            ) {
              event.currentTarget.close();
            }
          }
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-72 max-w-[85vw] flex-col border-l bg-background p-4 text-foreground shadow-xl backdrop:bg-black/40 open:flex"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="navigation-title" className="text-lg font-semibold">
            הכר את החבר
          </h2>
          <button
            type="button"
            autoFocus
            aria-label="סגירת תפריט ניווט"
            title="סגירת תפריט ניווט"
            onClick={() => navigationDrawerRef.current?.close()}
            className="flex size-10 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="size-5" />
          </button>
        </div>
        {/* Navigation content will be passed as children or added in App.tsx */}
      </dialog>
    </>
  );
}
