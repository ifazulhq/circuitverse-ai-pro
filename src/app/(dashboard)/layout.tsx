import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { ProjectProvider } from "@/context/ProjectContext";
import { ToastProvider } from "@/context/ToastContext";
import { PreferencesHydrator } from "@/components/dashboard/PreferencesHydrator";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
  <SessionProvider>
  <ToastProvider>
    <ProjectProvider>
      <PreferencesHydrator />
      <div className="flex min-h-screen bg-zinc-900">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <DashboardNavbar />

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProjectProvider>
  </ToastProvider>
</SessionProvider>
  );
}