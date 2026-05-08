"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Fragment } from "react"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const paths = pathname.split("/").filter(Boolean)

  if (paths.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink render={<Link href="/dashboard" />}>monad</BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => {
          const href = "/" + paths.slice(0, index + 1).join("/")
          const isLast = index === paths.length - 1
          
          let title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")
          
          // Check if path is a UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          if (uuidRegex.test(path)) {
            title = path.slice(0, 6) + "..."
          }

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>{title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
