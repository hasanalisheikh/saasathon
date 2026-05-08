import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id, title, mode, status, risk_score, due_date, created_at,
      project_members(count)
    `)
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Manage your rubric-linked projects</p>
        </div>
        <Button asChild size="sm">
          <Link href="/projects/new">
            <Plus className="size-3.5" />
            New project
          </Link>
        </Button>
      </div>

      {!projects?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-muted-foreground text-sm">No projects yet</p>
          <Button asChild size="sm">
            <Link href="/projects/new">Create your first project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                    <RiskBadge score={project.risk_score} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{project.mode}</Badge>
                    <Badge variant={project.status === "active" ? "success" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.due_date && (
                    <p className="text-muted-foreground text-xs">
                      Due {new Date(project.due_date).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function RiskBadge({ score }: { score: number }) {
  if (score >= 75) return <Badge variant="success">Low risk</Badge>
  if (score >= 40) return <Badge variant="warning">{score}% covered</Badge>
  return <Badge variant="destructive">{score}% covered</Badge>
}
