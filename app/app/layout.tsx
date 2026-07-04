import { AppSidebar } from '@/components/app/AppSidebar';
import { AppTopbar } from '@/components/app/AppTopbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden relative z-10 bg-white">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">{children}</main>
      </div>
    </div>
  );
}
