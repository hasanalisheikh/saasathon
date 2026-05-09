export const requestTableClassName = "min-w-[1040px] table-fixed text-sm"

export const requestTableHeadClassName =
  "h-9 px-3 text-sm/5 font-normal text-muted-foreground"

export function RequestTableColumnGroup() {
  return (
    <colgroup>
      <col className="w-16" />
      <col className="w-48" />
      <col className="w-[34%]" />
      <col className="w-36" />
      <col className="w-40" />
      <col className="w-36" />
      <col className="w-28" />
    </colgroup>
  )
}
