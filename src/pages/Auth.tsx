import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import authBackground from "@/assets/auth-background.jpg";

const emailSchema = z.string().email("Email inválido").max(255, "Email demasiado largo");
const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100, "Contraseña demasiado larga");

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  
  const { signIn, signUp, resetPassword, user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userRole) {
      // Redirect based on role
      if (userRole === "admin") {
        navigate("/dashboard/admin");
      } else if (userRole === "teacher") {
        navigate("/dashboard/teacher");
      } else if (userRole === "student") {
        navigate("/dashboard/student");
      }
    }
  }, [user, userRole, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (error: any) {
      toast({
        title: "Error de validación",
        description: error.errors?.[0]?.message || "Por favor verifica los datos ingresados",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if account is locked
      const { data: lockStatus } = await supabase
        .rpc('is_account_locked', { p_email: loginEmail.toLowerCase().trim() });

      if (lockStatus && lockStatus.length > 0 && lockStatus[0].is_locked) {
        const unlockTime = new Date(lockStatus[0].unlock_time);
        const minutesLeft = Math.ceil((unlockTime.getTime() - Date.now()) / 60000);
        
        toast({
          title: "Cuenta bloqueada temporalmente",
          description: `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Attempt login
      const { error } = await signIn(loginEmail, loginPassword);

      if (error) {
        toast({
          title: "Error al iniciar sesión",
          description: error.message === "Invalid login credentials" 
            ? "Email o contraseña incorrectos" 
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bienvenido",
          description: "Has iniciado sesión correctamente",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar iniciar sesión",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleTutorDemo = async () => {
    // Acceso directo como Tutora (crea la cuenta si no existe y asigna rol)
    const email = 'tutora@talentcloud.demo';
    const password = 'Demo2025!';
    setIsLoading(true);
    try {
      const { error: signUpError } = await signUp(email, password, 'teacher');
      if (signUpError && !signUpError.message.toLowerCase().includes('already')) {
        toast({ title: 'Error al crear cuenta', description: signUpError.message, variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        toast({ title: 'Error al iniciar sesión', description: signInError.message, variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      // Asignar rol de teacher si no existe (permitido por RLS)
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (userId) {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'teacher' });
      }

      toast({ title: 'Bienvenida', description: 'Acceso como Tutora habilitado' });
      navigate('/dashboard/teacher');
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'No se pudo acceder como tutora', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAccess = async () => {
    // Crear cuenta de administrador
    const email = 'formacion.empleate@gmail.com';
    const password = 'empleate2025';
    setIsLoading(true);
    try {
      const { error: signUpError } = await signUp(email, password, 'admin');
      if (signUpError && !signUpError.message.toLowerCase().includes('already')) {
        toast({ title: 'Error al crear cuenta', description: signUpError.message, variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        toast({ title: 'Error al iniciar sesión', description: signInError.message, variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      // Asignar rol de admin si no existe (permitido por RLS)
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (userId) {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      }

      toast({ title: 'Bienvenido', description: 'Acceso como Administrador habilitado' });
      navigate('/dashboard/admin');
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'No se pudo acceder como administrador', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(resetEmail);
    } catch (error: any) {
      toast({
        title: "Error de validación",
        description: error.errors?.[0]?.message || "Email inválido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(resetEmail);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña.",
      });
      setMode('login');
      setResetEmail("");
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 relative" style={{ backgroundImage: `url(${authBackground})` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-sm" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <img
              src="/branding/talentcloud-logo.png"
              alt="TalentCloud Solutions"
              className="h-20 object-contain"
            />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Campus Virtual</CardTitle>
            <CardDescription>
              {mode === 'reset' ? "Recuperar contraseña" : "Plataforma de formación online"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'reset' ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar email de recuperación"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode('login')}
                disabled={isLoading}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setMode('reset')}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      setLoginEmail('alumno@talentcloud.demo');
                      setLoginPassword('Demo2025!');
                    }}
                    disabled={isLoading}
                  >
                    Alumno
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleTutorDemo}
                    disabled={isLoading}
                  >
                    Tutora
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleAdminAccess}
                    disabled={isLoading}
                  >
                    Administrador
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      setLoginEmail('auditor@talentcloud.demo');
                      setLoginPassword('Demo2025!');
                    }}
                    disabled={isLoading}
                  >
                    Auditor
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button variant="link" asChild>
              <a href="/">Volver al inicio</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
