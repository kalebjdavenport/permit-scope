import { BlurFade } from "@/components/magicui/blur-fade"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { trpc } from "@/lib/trpc"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router"
import { Heading, Subheading } from "./Heading"
import { QuestionnaireContext } from "./questionnaire/context"
import { HeaderPermitBadge } from "./questionnaire/HeaderPermitBadge"
import { Questionnaire } from "./questionnaire/Questionnaire"

export function Project() {
  const { id } = useParams()

  const { data: project } = useQuery({
    ...trpc.projects.get.queryOptions({ id: id! }),
    enabled: !!id
  })

  if (!id || !project) {
    return <div>Project not found</div>
  }

  return (
    <QuestionnaireContext.Provider>
      <HeaderPermitBadge location={project.location} />
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

        <BlurFade>
          <Heading>{project.name}</Heading>
          <div className="text-sm text-muted-foreground -mt-2">{project.location}</div>
        </BlurFade>

        <BlurFade delay={0.1}>
          <div className="flex flex-col gap-2 mt-4 max-w-lg">
            <Subheading>Questionnaire</Subheading>
            <Questionnaire projectId={id} />
          </div>
        </BlurFade>
      </div>
    </QuestionnaireContext.Provider>
  )
}
