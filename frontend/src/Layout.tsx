import { NavBar } from "@/app/NavBar"
import { Outlet } from "react-router"

export function Layout() {
  return (
    <>
      <NavBar />
      <main className="p-4 mx-auto max-w-screen-lg">
        <Outlet />
      </main>
    </>
  )
}
