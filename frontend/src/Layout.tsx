import { Link, Outlet } from "react-router"

export function Layout() {
  return (
    <>
      <nav className="h-14 border-b bg-card flex items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 mx-auto max-w-screen-lg w-full px-4">
          <Link to="/" className="font-semibold text-lg tracking-tight">
            PermitFlow
          </Link>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            Scope of Work
          </span>
        </div>
      </nav>
      <main className="p-4 mx-auto max-w-screen-lg">
        <Outlet />
      </main>
    </>
  )
}
