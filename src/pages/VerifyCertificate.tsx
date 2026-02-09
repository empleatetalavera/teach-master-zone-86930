import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, Award, Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface VerificationResult {
  student_name: string;
  course_title: string;
  course_hours: number;
  issue_date: string;
  verification_code: string;
}

const VerifyCertificate = () => {
  const { code } = useParams();
  const [searchCode, setSearchCode] = useState(code || "");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    setSearched(true);

    try {
      const { data, error } = await supabase.rpc("verify_certificate", {
        p_code: searchCode.trim().toUpperCase(),
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setResult(data[0]);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if code is in URL
  useEffect(() => {
    if (code) {
      setSearchCode(code);
      handleVerify();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verificación de Diploma</h1>
          <p className="text-muted-foreground text-sm">
            Introduce el código de verificación seguro (CSV) que aparece en el diploma
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: CSV-A1B2C3D4E5"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="font-mono text-center tracking-wider"
              />
              <Button onClick={handleVerify} disabled={loading || !searchCode.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-700 dark:text-green-400 text-lg">
                  ✓ Diploma Verificado
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Alumno/a</p>
                  <p className="font-semibold text-lg">{result.student_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Curso</p>
                  <p className="font-medium">{result.course_title}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Duración</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{result.course_hours} horas</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Fecha emisión</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(result.issue_date), "dd/MM/yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Código CSV</p>
                  <Badge variant="outline" className="font-mono tracking-wider">
                    {result.verification_code}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {notFound && searched && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="font-medium text-destructive">Diploma no encontrado</p>
              <p className="text-sm text-muted-foreground">
                El código introducido no corresponde a ningún diploma registrado. 
                Verifique que el código es correcto.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Este servicio permite verificar la autenticidad de los diplomas emitidos por nuestra plataforma.
        </p>
      </div>
    </div>
  );
};

export default VerifyCertificate;
