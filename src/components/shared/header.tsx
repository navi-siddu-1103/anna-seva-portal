
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Globe, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import SidebarNav from './sidebar-nav';
import { WheatIcon } from '../icons';
import { useMemo } from 'react';

export default function Header() {
  const pathname = usePathname();
  const isDistributor = pathname.startsWith('/distributor');
  const userName = isDistributor ? 'Distributor' : 'Card Holder';
  const userRole = isDistributor ? 'PDS Distributor' : 'Ration Card Holder';
  
  const role = useMemo(() => pathname.startsWith('/distributor') ? 'distributor' : 'user', [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
       <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 bg-sidebar text-sidebar-foreground">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <WheatIcon className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg">Anna Seva Portal</span>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav role={role} />
            </div>
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>English</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>हिंदी (Hindi)</DropdownMenuItem>
            <DropdownMenuItem>ಕನ್ನಡ (Kannada)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                 <AvatarFallback><User /></AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="font-medium">{userName}</div>
              <div className="text-xs text-muted-foreground">{userRole}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/login">
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
