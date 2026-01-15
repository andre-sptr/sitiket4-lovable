import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail, Lock, Loader2, Activity, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SEO from "@/components/SEO";
import { Separator } from '@/components/ui/separator';
import { motion, Variants } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const Login = () => {
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: 'Error', description: 'Email dan password wajib diisi', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({ 
        title: 'Login Gagal', 
        description: error.message === 'Invalid login credentials' 
          ? 'Email atau password salah' 
          : error.message, 
        variant: 'destructive' 
      });
    } else {
      toast({ title: 'Login Berhasil', description: 'Selamat datang kembali!' });
      navigate('/dashboard');
    }
  };

  if (authLoading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <SEO 
        title="Login" 
        description="Portal Login SiTiket - Sistem Manajemen Tiket Gangguan Terpadu Telkom Infra. Monitoring TTR, status perbaikan, dan manajemen teknisi secara real-time."
      />
      
      {/* Animated Background Effects */}
      <motion.div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"
        variants={pulseVariants}
        animate="animate"
      />
      
      {/* Sparkle particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="relative w-full max-w-md z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo and Title */}
        <motion.div variants={itemVariants} className="text-center mb-4">
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <img 
                src="/logo.png" 
                alt="SiTiket Logo" 
                className="w-16 h-16 object-contain" 
              />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            SiTiket
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-sm max-w-sm mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Sistem Manajemen Tiket Gangguan Telkom Infra
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-border/50 shadow-2xl overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 pointer-events-none" />
            
            <form onSubmit={handleLogin}>
              <CardHeader className="pb-4 relative">
                <CardTitle className="text-xl flex items-center gap-2">
                  Masuk ke Akun
                </CardTitle>
                <CardDescription>Masukkan email dan password Anda</CardDescription>
              </CardHeader>
              <Separator className="bg-border/50" />
              <CardContent className="space-y-4 pt-6 relative">
                <motion.div 
                  className="space-y-2"
                  animate={{ scale: isFocused === 'email' ? 1.01 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                  <div className="relative group">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isFocused === 'email' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nama@gmail.com"
                      className={`pl-10 bg-muted/30 border-border/50 transition-all duration-300 ${isFocused === 'email' ? 'border-primary/50 ring-2 ring-primary/20 bg-background/50' : 'hover:border-border'}`}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onFocus={() => setIsFocused('email')}
                      onBlur={() => setIsFocused(null)}
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  animate={{ scale: isFocused === 'password' ? 1.01 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <div className="relative group">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isFocused === 'password' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 bg-muted/30 border-border/50 transition-all duration-300 ${isFocused === 'password' ? 'border-primary/50 ring-2 ring-primary/20 bg-background/50' : 'hover:border-border'}`}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onFocus={() => setIsFocused('password')}
                      onBlur={() => setIsFocused(null)}
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 btn-ripple" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Masuk
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
              <Separator className="bg-border/50" />
              <CardFooter className="flex flex-col gap-4 pt-4 bg-muted/10 relative">
                <div className="grid grid-cols-3 gap-3 w-full">
                  {[
                    { icon: Activity, label: 'Real-time', delay: 0 },
                    { icon: ShieldCheck, label: 'Secure', delay: 0.1 },
                    { icon: Clock, label: 'TTR Track', delay: 0.2 },
                  ].map((item, index) => (
                    <motion.div 
                      key={item.label}
                      className="flex flex-col items-center gap-1.5 group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + item.delay }}
                      whileHover={{ y: -2 }}
                    >
                      <motion.div 
                        className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <item.icon className="w-4 h-4 text-primary" />
                      </motion.div>
                      <span className="text-[10px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="mt-4 text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
        >
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Platform ini digunakan untuk memantau status tiket gangguan, performa teknisi, dan pemenuhan SLA di seluruh area operasional.
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            &copy; {new Date().getFullYear()} SiTiket &bull; Telkom Infra Management System
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
