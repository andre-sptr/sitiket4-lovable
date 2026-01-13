import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="text-center space-y-8 animate-fade-in relative z-10 max-w-md mx-auto">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-lg backdrop-blur-sm">
            <FileQuestion className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-destructive/10 text-destructive p-2 rounded-full border border-destructive/20">
             <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-extrabold text-foreground tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari sepertinya tidak ada atau telah dipindahkan ke alamat lain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate(-1)}
            className="gap-2 h-11"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          
          <Button 
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="gap-2 h-11 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            Ke Dashboard
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60 mt-12">
          SiTiket - Telkom Infra &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default NotFound;