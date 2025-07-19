"use client"

import { useAuth } from "@/hooks/use-auth"
import { UserDashboard } from "./user-dashboard"
import { AdminDashboard } from "./admin-dashboard"

export function Dashboard() {
  const { user } = useAuth()

  if (!user) return null

  return user.role === "ROLE_ADMIN" ? <AdminDashboard /> : <UserDashboard />
}
