
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Wheat, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Header from '@/components/shared/header';
import SidebarNav from '@/components/shared/sidebar-nav';
import { useMemo } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useMemo(() => pathname.startsWith('/distributor') ? 'distributor' : 'user', [pathname]);

  const isDistributor = role === 'distributor';
  const userName = isDistributor ? 'Distributor' : 'Card Holder';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Wheat className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl">Anna Seva Portal</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav role={role} />
        </SidebarContent>
        <SidebarFooter className="border-t">
            <div className="flex items-center gap-3 p-2">
              <Avatar>
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
