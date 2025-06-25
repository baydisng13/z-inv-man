import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
// import { authClient } from "@/lib/auth-client"; // Unused
// import { redirect } from "next/navigation"; // Unused
// import { auth } from "@/lib/auth"; // Unused
// import { headers } from "next/headers"; // Unused

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
        
        {children}
      </main>
    </SidebarProvider>
  );
}
