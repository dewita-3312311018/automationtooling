import { ForbiddenPage } from '@/features/rbac/components/forbidden-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/forbidden')({
  component: ForbiddenPage,
})
