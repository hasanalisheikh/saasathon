import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import {
  ClassificationBadge,
  StatusBadge,
  getClassificationColorClass,
} from "@workspace/ui/components/status-badge"
import { PageHeader, PageTitle, PageDescription, PageActions } from "@workspace/ui/components/page-header"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@workspace/ui/components/empty-state"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single()

  if (!project) notFound()

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })

  const STATUS_FILTERS = ["all", "pending_review", "sent_to_client", "approved", "declined", "deferred"]

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/projects" />}>Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <PageHeader>
        <div>
          <PageTitle className="text-2xl font-light">{project.name}</PageTitle>
          <PageDescription>
            {project.client_name}
            {project.client_email ? ` · ${project.client_email}` : ""}
          </PageDescription>
        </div>
        <PageActions>
          <Button render={<Link href={`/projects/${id}/requests/new`} />} nativeButton={false}>
            + Add Request
          </Button>
        </PageActions>
      </PageHeader>

      {/* Inbound email banner */}
      {project.inbound_email && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary mb-1">Inbound email address</p>
              <p className="text-sm font-medium">{project.inbound_email}</p>
            </div>
            <p className="text-xs text-muted-foreground">Forward or BCC client emails here</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="requests">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="proof-pack">Proof Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {/* Request filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <Badge
                key={f}
                variant={f === "all" ? "default" : "outline"}
                className="capitalize cursor-pointer"
                render={<button type="button" />}
              >
                {f.replace("_", " ")}
              </Badge>
            ))}
          </div>

          {/* Request list */}
          {!requests?.length ? (
            <EmptyState>
              <EmptyStateTitle>No requests yet.</EmptyStateTitle>
              <EmptyStateDescription>
                Forward client emails to{" "}
                <span className="font-medium text-muted-foreground">{project.inbound_email}</span>
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <Link
                  key={req.id}
                  href={`/projects/${id}/requests/${req.id}`}
                  className="block"
                >
                  <Card
                    className={cn(
                      "transition-all hover:ring-foreground/20 border-l-[3px]",
                      getClassificationColorClass(req.classification)
                    )}
                  >
                    <CardContent className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {req.raw_email_subject || req.raw_email_body?.slice(0, 60)}
                        </p>
                        <p className="text-xs mt-0.5 text-muted-foreground/50">
                          {req.raw_email_from} · {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        {req.classification && (
                          <ClassificationBadge classification={req.classification} />
                        )}
                        {req.cost_min && (
                          <span className="text-xs text-primary">
                            ${req.cost_min.toLocaleString()}–${req.cost_max?.toLocaleString()}
                          </span>
                        )}
                        <StatusBadge status={req.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="github">
          <EmptyState>
            <EmptyStateTitle>GitHub integration coming soon.</EmptyStateTitle>
          </EmptyState>
        </TabsContent>

        <TabsContent value="proof-pack">
          <EmptyState>
            <EmptyStateTitle>Proof pack will be generated after client approvals.</EmptyStateTitle>
          </EmptyState>
        </TabsContent>
      </Tabs>
    </div>
  )
}
