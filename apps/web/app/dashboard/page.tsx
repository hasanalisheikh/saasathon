import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { Button } from "@workspace/ui/components/button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-svh flex-col p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">ProjectPilot</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome, {user?.user_metadata?.full_name ?? user?.email}
          </p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center flex-1 gap-4 text-center">
        <h2 className="text-xl font-medium">Your projects will appear here</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Create a new project, paste your assignment brief, and let AI generate your full rubric-linked task plan.
        </p>
        <Button className="mt-2">New Project</Button>
      </div>
    </div>
  )
}
