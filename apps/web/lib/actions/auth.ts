"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validatePassword } from "@/lib/auth/password-validation"
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
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/login?unconfirmed=1&email=${encodeURIComponent(email)}`)
    }
    redirectWithError("/login", "Invalid email or password.")
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

  const { valid, message } = validatePassword(password)
  if (!valid) {
    redirectWithError("/signup", message)
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const verifiedNext = encodeURIComponent("/auth/verified?verified=1")

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${appUrl}/api/auth/callback?next=${verifiedNext}`,
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
    redirect(
      `/login?message=${encodeURIComponent("Check your email to confirm your account.")}&email=${encodeURIComponent(email)}&awaiting_verification=1`
    )
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    redirectWithError("/forgot-password", "Email is required.")
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/api/auth/callback?next=/reset-password`,
  })

  redirect(
    `/forgot-password?message=${encodeURIComponent("If that email exists, a reset link has been sent.")}`
  )
}

export async function resendVerificationAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    redirectWithError("/login", "Email is required to resend verification.")
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const verifiedNext = encodeURIComponent("/auth/verified?verified=1")

  await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${appUrl}/api/auth/callback?next=${verifiedNext}`,
    },
  })

  redirect(
    `/login?message=${encodeURIComponent("Verification email sent. Check your inbox.")}&email=${encodeURIComponent(email)}&awaiting_verification=1`
  )
}

export async function resetPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirm_password") ?? "")

  if (!password || !confirmPassword) {
    redirectWithError("/reset-password", "Both password fields are required.")
  }

  if (password !== confirmPassword) {
    redirectWithError("/reset-password", "Passwords do not match.")
  }

  const { valid, message } = validatePassword(password)
  if (!valid) {
    redirectWithError("/reset-password", message)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirectWithError("/reset-password", error.message)
  }

  await supabase.auth.signOut()
  redirect(
    `/login?message=${encodeURIComponent("Password reset successfully. Please sign in.")}`
  )
}
