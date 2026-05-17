import { redirect } from "next/navigation";

// Redirigir /registro a /login ya que usamos un sistema de Tabs
export default function RegistroPage() {
  redirect("/login");
}
