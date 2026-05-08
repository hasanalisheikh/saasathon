"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCriteriaBatch(
  projectId: string,
  criteria: { name: string; description: string; weight: number }[],
): Promise<{ criteriaMap: Record<string, string>; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("rubric_criteria")
    .insert(
      criteria.map((c) => ({
        project_id: projectId,
        name: c.name,
        description: c.description,
        weight: c.weight,
        ai_extracted: true,
      })),
    )
    .select("id, name")

  if (error) return { criteriaMap: {}, error: error.message }

  const criteriaMap: Record<string, string> = {}
  for (const row of data ?? []) {
    criteriaMap[row.name] = row.id
  }

  revalidatePath(`/projects/${projectId}`)
  return { criteriaMap }
}

export async function updateCriterionStatus(
  criterionId: string,
  projectId: string,
  status: "covered" | "partial" | "uncovered",
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("rubric_criteria")
    .update({ status })
    .eq("id", criterionId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/risk`)
  return { success: true }
}
