import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactElement;
}) {
  const { data: session, error } = await authClient.getSession();

  if (session?.user?.name) {
    redirect('/app')
  }

  return <>{children}</>;
}
