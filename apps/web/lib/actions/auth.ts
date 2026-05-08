"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirectWithError("/login", "Email and password are required.")
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirectWithError("/login", error.message)
  }

  redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!fullName || !email || !password) {
    redirectWithError("/signup", "Full name, email, and password are required.")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    redirectWithError("/signup", error.message)
  }

  const admin = createAdminClient()
  await admin.from("profiles").upsert(
    { id: data.user!.id, email, full_name: fullName },
    { onConflict: "id" }
  )

  if (!data.session) {
    redirect("/login?message=Check%20your%20email%20to%20confirm%20your%20account.")
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
