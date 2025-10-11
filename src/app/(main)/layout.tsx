
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { WheatIcon } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import Header from '@/components/shared/header';
import SidebarNav from '@/components/shared/sidebar-nav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useMemo, useEffect, useState } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useMemo(() => pathname.startsWith('/distributor') ? 'distributor' : 'user', [pathname]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDistributor = role === 'distributor';
  const avatarId = isDistributor ? 'distributor-avatar-1' : 'user-avatar-1';
  const avatar = PlaceHolderImages.find((img) => img.id === avatarId);
  const userName = isDistributor ? 'Distributor' : 'Card Holder';

  if (!isMounted) {
    return (
        <div className="min-h-screen w-full" />
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <WheatIcon className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl">Anna Seva Portal</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav role={role} />
        </SidebarContent>
        <SidebarFooter className="border-t">
            <div className="flex items-center gap-3 p-2">
              <Avatar>
                <AvatarImage src={avatar?.imageUrl} data-ai-hint={avatar?.imageHint} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
