import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Projects</h1>
        <Link
          href="/projects/new"
          className="px-4 py-2 rounded text-sm font-medium"
          style={{ background: '#f59e0b', color: '#080c14' }}
        >
          + New Project
        </Link>
      </div>

      {/* Grid */}
      {!projects?.length ? (
        <div className="flex flex-col items-center py-20 rounded-lg" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-sm mb-4" style={{ color: '#4a5568' }}>No projects yet.</p>
          <Link href="/projects/new" className="text-sm" style={{ color: '#f59e0b' }}>
            Create your first project →
          </Link>
        </div>
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
  const statusColors: Record<string, string> = {
    active: '#10b981',
    completed: '#8892a4',
    archived: '#4a5568',
  }
  const status = project.status as string

  return (
    <Link
      href={`/projects/${project.id as string}`}
      className="block p-5 rounded-lg transition-all"
      style={{
        background: '#0f1624',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-sm font-medium" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          {project.name as string}
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full uppercase"
          style={{
            color: statusColors[status] ?? '#8892a4',
            background: `${statusColors[status] ?? '#8892a4'}18`,
            letterSpacing: '0.05em',
          }}
        >
          {status}
        </span>
      </div>

      <p className="text-xs mb-1" style={{ color: '#8892a4' }}>
        {project.client_name as string}
        {project.client_email ? ` · ${project.client_email as string}` : ''}
      </p>

      {project.inbound_email && (
        <p className="text-xs mt-3 truncate" style={{ color: '#4a5568', fontFamily: 'DM Mono, monospace' }}>
          {project.inbound_email as string}
        </p>
      )}
    </Link>
  )
}
