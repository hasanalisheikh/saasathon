import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { ProjectStatusBadge } from "@workspace/ui/components/status-badge"
import { PageHeader, PageTitle, PageDescription, PageActions } from "@workspace/ui/components/page-header"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateAction,
} from "@workspace/ui/components/empty-state"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      <PageHeader>
        <div>
          <PageTitle>Projects</PageTitle>
          <PageDescription>
            Manage your active client projects, view request history, and track project health.
          </PageDescription>
        </div>
        <PageActions>
          <Button render={<Link href="/projects/new" />} nativeButton={false}>+ New Project</Button>
        </PageActions>
      </PageHeader>

      {!projects?.length ? (
        <EmptyState>
          <EmptyStateTitle>No projects yet.</EmptyStateTitle>
          <EmptyStateAction>
            <Button variant="link" render={<Link href="/projects/new" />} nativeButton={false}>
              Create your first project →
            </Button>
          </EmptyStateAction>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectCard({ project }: { project: any }) {
  return (
    <Link href={`/projects/${project.id as string}`} className="block">
      <Card className="transition-all hover:ring-foreground/20">
        <CardHeader>
          <CardTitle className="font-semibold">{project.name as string}</CardTitle>
          <div className="flex items-start justify-end">
            <ProjectStatusBadge status={project.status as string} />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {project.client_name as string}
            {project.client_email ? ` · ${project.client_email as string}` : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
