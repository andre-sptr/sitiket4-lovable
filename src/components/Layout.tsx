import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  LayoutDashboard, 
  Ticket, 
  FileUp, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ChevronDown,
  Wrench
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface LayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tickets', label: 'Semua Tiket', icon: Ticket },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
  { path: '/users', label: 'Pengguna', icon: Users },
  { path: '/teknisi', label: 'Teknisi', icon: Wrench },
  { path: '/settings', label: 'Pengaturan', icon: Settings },
];

const hdNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tickets', label: 'Semua Tiket', icon: Ticket },
  { path: '/import', label: 'Import Tiket', icon: FileUp },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
  { path: '/users', label: 'Pengguna', icon: Users },
  { path: '/teknisi', label: 'Teknisi', icon: Wrench },
];

const guestNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tickets', label: 'Semua Tiket', icon: Ticket },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
  { path: '/users', label: 'Pengguna', icon: Users },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const navItems = user?.role === 'admin' ? adminNavItems : 
                   user?.role === 'hd' ? hdNavItems :
                   user?.role === 'guest' ? guestNavItems : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-6 h-6 object-contain" 
                  />
                </div>
                <span className="font-bold text-lg hidden sm:block text-foreground">SiTiket</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 h-9 px-3 font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 overflow-visible">
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm">Notifikasi</span>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                        onClick={() => markAllAsRead()}
                      >
                        Tandai semua dibaca
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Belum ada notifikasi
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenuItem 
                          key={notif.id} 
                          className={`flex flex-col items-start gap-1 px-4 py-3 cursor-pointer border-b border-border/50 last:border-0 ${!notif.isRead ? 'bg-muted/50' : ''}`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                              {notif.title}
                            </span>
                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: idLocale })}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-9 pl-2 pr-3 ml-1">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-lg flex items-center justify-center text-sm font-semibold">
                      {user?.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate text-sm font-medium">{user?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 hidden sm:block text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <nav className="fixed left-0 top-16 bottom-0 w-72 bg-card border-r border-border p-4 animate-slide-in-right shadow-xl">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-11 font-medium ${
                        isActive 
                          ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
};
