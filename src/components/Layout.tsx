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
import { motion, AnimatePresence } from 'framer-motion';

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
];

const mobileMenuVariants = {
  closed: {
    x: "-100%",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
};

const menuItemVariants = {
  closed: { opacity: 0, x: -20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

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
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 hover:bg-primary/10"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <motion.div 
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-6 h-6 object-contain" 
                  />
                </motion.div>
                <span className="font-bold text-lg hidden sm:block text-foreground group-hover:text-primary transition-colors duration-200">SiTiket</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={item.path}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 h-9 px-3 font-medium transition-all duration-200 relative ${
                          isActive 
                            ? 'text-primary hover:text-primary' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                        <span className="hidden lg:inline">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 overflow-visible hover:bg-primary/10">
                      <Bell className="w-[18px] h-[18px]" />
                      <AnimatePresence>
                        {unreadCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                          >
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              {unreadCount}
                            </motion.span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 glass-card">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
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
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        Belum ada notifikasi
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <DropdownMenuItem 
                            className={`flex flex-col items-start gap-1 px-4 py-3 cursor-pointer border-b border-border/30 last:border-0 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <motion.span 
                                  className="w-2 h-2 rounded-full bg-primary"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                            <span className="text-[10px] text-muted-foreground/60 mt-1">
                              {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: idLocale })}
                            </span>
                          </DropdownMenuItem>
                        </motion.div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="ghost" size="sm" className="gap-2 h-9 pl-2 pr-3 ml-1 hover:bg-primary/10">
                      <motion.div 
                        className="w-7 h-7 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-lg flex items-center justify-center text-sm font-semibold shadow-sm"
                        whileHover={{ rotate: 5 }}
                      >
                        {user?.name.charAt(0)}
                      </motion.div>
                      <span className="hidden sm:block max-w-[100px] truncate text-sm font-medium">{user?.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block text-muted-foreground" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut} 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.nav 
              className="fixed left-0 top-16 bottom-0 w-72 bg-card border-r border-border/50 p-4 z-50 md:hidden shadow-xl"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      custom={index}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link 
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 h-12 font-medium transition-all duration-200 ${
                            isActive 
                              ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                          {item.label}
                          {isActive && (
                            <motion.div
                              layoutId="activeMobileNav"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          )}
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
