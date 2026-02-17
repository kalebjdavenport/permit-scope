import { Link, useParams } from "react-router"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { trpc } from "@/lib/trpc"
import { useQuery } from "@tanstack/react-query"
import { Heading, Subheading } from "./Heading"

export function Project() {
  const { id } = useParams()
  const { data: project } = useQuery(trpc.projects.get.queryOptions({ id: id! }))

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/projects">Projects</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-0">
        <Heading>{project.name}</Heading>
        <div className="text-sm text-muted-foreground -mt-2">{project.location}</div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <Subheading>Questionnaire</Subheading>
        <div className="flex flex-col gap-4">Your take-home assignment response goes here!</div>
      </div>
    </div>
  )
}
