import { Layout } from "@/Layout"
import { Navigate, Route, Routes } from "react-router"
import { CreateProjectPage } from "./CreateProjectPage"
import { Project } from "./Project"
import { ProjectListPage } from "./ProjectListPage"

/**
 * This is the main entry point for the frontend application.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/new" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<Project />} />

        <Route path="/" element={<Navigate to="/projects" />} />
      </Route>
    </Routes>
  )
}
