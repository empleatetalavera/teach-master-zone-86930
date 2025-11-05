import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, GraduationCap, Shield, Copy, CheckCircle } from "lucide-react";

export default function TestAccounts() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const testAccounts = [
    {
      role: 'student' as const,
      email: 'alumna@talentcloud.demo',
      password: 'Demo2025!',
      name: 'María García',
      description: 'Cuenta de estudiante con acceso a cursos y seguimiento',
      icon: GraduationCap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      role: 'teacher' as const,
      email: 'tutora@talentcloud.demo',
      password: 'Demo2025!',
      name: 'Ana Martínez',
      description: 'Cuenta de tutora con gestión de alumnos y calificaciones',
      icon: User,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      role: 'admin' as const,
      email: 'admin@talentcloud.demo',
      password: 'Demo2025!',
      name: 'Laura Sánchez',
      description: 'Cuenta de administradora con acceso completo al sistema',
      icon: Shield,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const createAccount = async (account: typeof testAccounts[0]) => {
    setLoading(account.email);
    try {
      const { error: signUpError } = await signUp(account.email, account.password, account.role);
      
      if (signUpError) {
        // Si el usuario ya existe, intentar hacer login
        if (signUpError.message.includes('already registered')) {
          const { error: signInError } = await signIn(account.email, account.password);
          if (signInError) {
            toast({
              title: "Error al iniciar sesión",
              description: signInError.message,
              variant: "destructive"
            });
            return;
          }
          
          toast({
            title: "Sesión iniciada",
            description: `Bienvenida ${account.name}`,
          });
          
          // Redirigir según el rol
          if (account.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (account.role === 'teacher') {
            navigate('/dashboard/teacher');
          } else {
            navigate('/dashboard/student');
          }
          return;
        }
        
        toast({
          title: "Error al crear cuenta",
          description: signUpError.message,
          variant: "destructive"
        });
        return;
      }

      // Cuenta creada exitosamente
      toast({
        title: "Cuenta creada",
        description: `Cuenta de ${account.name} creada exitosamente. Iniciando sesión...`,
      });

      // Esperar un momento y hacer login
      setTimeout(async () => {
        const { error: signInError } = await signIn(account.email, account.password);
        if (!signInError) {
          // Redirigir según el rol
          if (account.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (account.role === 'teacher') {
            navigate('/dashboard/teacher');
          } else {
            navigate('/dashboard/student');
          }
        }
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string, email: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
    toast({
      title: "Copiado",
      description: "Credenciales copiadas al portapapeles",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Cuentas de Prueba
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Acceso a Cuentas Demo
            </h1>
            <p className="text-lg text-muted-foreground">
              Crea o accede a cuentas de prueba para explorar las diferentes funcionalidades de la plataforma
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {testAccounts.map((account) => (
              <Card key={account.email} className="p-6">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-xl ${account.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <account.icon className={`w-8 h-8 ${account.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{account.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {account.role === 'student' ? 'Alumna' : 
                         account.role === 'teacher' ? 'Tutora' : 
                         'Administradora'}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {account.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-sm">{account.email}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(account.email, account.email)}
                          >
                            {copiedEmail === account.email ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Contraseña</p>
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-sm">{account.password}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(account.password, `${account.email}-pass`)}
                          >
                            {copiedEmail === `${account.email}-pass` ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => createAccount(account)}
                      disabled={loading !== null}
                    >
                      {loading === account.email ? "Procesando..." : "Crear y acceder"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2">📝 Nota importante</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Estas son cuentas de demostración para testing</li>
              <li>Si la cuenta ya existe, se iniciará sesión automáticamente</li>
              <li>Los datos se almacenan en la base de datos real</li>
              <li>Puedes cerrar sesión y cambiar entre cuentas cuando quieras</li>
            </ul>
          </Card>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
