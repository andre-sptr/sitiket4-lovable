import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail, Lock, Loader2, Activity, Clock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SEO from "@/components/SEO";
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <SEO 
        title="Login" 
        description="Portal Login SiTiket - Sistem Manajemen Tiket Gangguan Terpadu Telkom Infra. Monitoring TTR, status perbaikan, dan manajemen teknisi secara real-time."
      />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl opacity-50" />
      
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="SiTiket Logo" 
            className="w-16 h-16 mb-4 object-contain mx-auto" 
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">SiTiket</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Sistem Manajemen Tiket Gangguan Telkom Infra
          </p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleLogin}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
              <CardDescription>Masukkan email dan password Anda</CardDescription>
            </CardHeader>
            <Separator/>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@gmail.com"
                    className="pl-10"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
            <Separator/>
            <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-4 bg-muted/20">
              <div className="grid grid-cols-3 gap-2 w-full text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Activity className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Real-time</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Clock className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">TTR Track</span>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-8 text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Platform ini digunakan untuk memantau status tiket gangguan, performa teknisi, dan pemenuhan SLA di seluruh area operasional.
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            &copy; {new Date().getFullYear()} SiTiket &bull; Telkom Infra Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
