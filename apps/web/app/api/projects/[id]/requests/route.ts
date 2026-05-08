import { NextRequest, NextResponse } from "next/server"
import { analyseAndPersistRequest } from "@/lib/request-analysis"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const body = await req.json()
    const rawEmailBody = String(body.raw_email_body ?? "").trim()
    const rawEmailSubject = String(body.raw_email_subject ?? "").trim()
    const rawEmailFrom = String(body.raw_email_from ?? "").trim()
    const commentId: string | null = body.comment_id ?? null
    const source = commentId ? "widget" : "manual"

    if (!rawEmailBody) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    const { data: request, error } = await supabase
      .from("requests")
      .insert({
        project_id: id,
        raw_email_from: rawEmailFrom || null,
        raw_email_subject: rawEmailSubject || null,
        raw_email_body: rawEmailBody,
        source,
        status: "pending_review",
      })
      .select("id")
      .single()

    if (error || !request) {
      return NextResponse.json({ error: error?.message ?? "Request creation failed" }, { status: 500 })
    }

    if (commentId) {
      await supabase
        .from("widget_comments")
        .update({ converted_to_request_id: request.id })
        .eq("id", commentId)
        .eq("project_id", id)
    }

    await analyseAndPersistRequest(request.id)

    return NextResponse.json({ id: request.id }, { status: 201 })
  } catch (err) {
    console.error("Create manual request error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
