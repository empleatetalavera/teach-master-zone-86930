import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, FileSearch } from "lucide-react";

interface Finding {
  type: "suspicious" | "warning" | "positive";
  description: string;
  excerpt?: string;
}

interface PlagiarismReportData {
  originalityScore: number;
  risk: "bajo" | "medio" | "alto";
  summary: string;
  findings: Finding[];
  recommendations: string[];
}

interface PlagiarismReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: PlagiarismReportData | null;
  loading: boolean;
}

export function PlagiarismReport({ open, onOpenChange, report, loading }: PlagiarismReportProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "bajo": return "text-green-600 bg-green-50 border-green-200";
      case "medio": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "alto": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "bajo": return <CheckCircle className="h-5 w-5" />;
      case "medio": return <Info className="h-5 w-5" />;
      case "alto": return <AlertTriangle className="h-5 w-5" />;
      default: return <FileSearch className="h-5 w-5" />;
    }
  };

  const getFindingIcon = (type: string) => {
    switch (type) {
      case "suspicious": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <Info className="h-4 w-4 text-yellow-500" />;
      case "positive": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            SafeAssign - Informe de Originalidad
          </DialogTitle>
          <DialogDescription>
            Análisis automático de plagio y coincidencias del contenido
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Analizando el contenido...</p>
            <p className="text-sm text-muted-foreground">
              Este proceso puede tomar unos segundos
            </p>
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Puntuación General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className={`text-4xl font-bold ${getScoreColor(report.originalityScore)}`}>
                      {report.originalityScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">Originalidad</p>
                  </div>
                  <Badge className={getRiskColor(report.risk)} variant="outline">
                    <span className="flex items-center gap-2">
                      {getRiskIcon(report.risk)}
                      Riesgo {report.risk.toUpperCase()}
                    </span>
                  </Badge>
                </div>
                <Progress value={report.originalityScore} className="h-2" />
                <p className="text-sm text-muted-foreground">{report.summary}</p>
              </CardContent>
            </Card>

            {/* Findings */}
            {report.findings && report.findings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hallazgos del Análisis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.findings.map((finding, index) => (
                    <Alert key={index} variant={finding.type === "suspicious" ? "destructive" : "default"}>
                      <div className="flex gap-3">
                        {getFindingIcon(finding.type)}
                        <div className="flex-1 space-y-1">
                          <AlertDescription className="font-medium">
                            {finding.description}
                          </AlertDescription>
                          {finding.excerpt && (
                            <blockquote className="border-l-2 border-muted-foreground/20 pl-3 italic text-sm text-muted-foreground mt-2">
                              "{finding.excerpt}"
                            </blockquote>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recomendaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm text-muted-foreground">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Acerca de SafeAssign:</strong> Este es un análisis automático basado en IA que busca patrones 
                indicativos de plagio y contenido no original. Los resultados de SafeAssign deben ser interpretados 
                por el profesor como una herramienta de apoyo, no como una conclusión definitiva. Se recomienda realizar 
                una revisión manual adicional cuando sea necesario.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay informe disponible</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
