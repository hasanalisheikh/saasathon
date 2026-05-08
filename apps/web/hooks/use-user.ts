"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function useUser() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setLoading(false); return }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      setUser(data)
      setLoading(false)
    }

    load()
  }, [])

  const isPro = user?.tier === "pro" || user?.tier === "org"
  const isOrg = user?.tier === "org"

  return { user, loading, isPro, isOrg }
}
