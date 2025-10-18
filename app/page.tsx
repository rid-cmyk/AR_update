import { redirect } from "next/navigation";

export default function Home() {
  // Force redirect to login page on every access to root
  redirect("/login");
}
