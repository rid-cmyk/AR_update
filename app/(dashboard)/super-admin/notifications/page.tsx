import { redirect } from "next/navigation";

export default function SuperAdminNotificationsRedirect() {
  redirect("/super-admin/notifications/forgot-passcode");
}
