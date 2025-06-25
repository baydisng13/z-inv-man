import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactElement;
}) {
  const { data: session } = await authClient.getSession(); // Removed unused 'error'

  if (session?.user?.name) {
    redirect('/app')
  }

  return <>{children}</>;
}
