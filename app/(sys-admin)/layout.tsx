import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {


  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });


  // if (!session?.user?.id) {
  //   redirect("/login");
  // }
  // const organizations = await auth.api.listOrganizations();

  // if (organizations.length === 0 ) {
  //   redirect("/app/onboarding");
  // }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col gap-4 w-full h-screen">
        <Header />
        <header className="flex justify-between items-center gap-4 p-4 ">
          <div className="flex gap-4 items-center">
            <span className="text-lg font-bold">Dashboard</span>
          </div>
          <div className="flex gap-4 items-center"></div>
        </header>
        {children}
      </main>
    </SidebarProvider>
  );
}
