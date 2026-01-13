import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, Loader2, Upload, Send, Calendar, FileText, 
  CheckCircle2, Clock, AlertCircle, Download, Trash2, X
} from "lucide-react";

interface ActivitySubmissionViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  enrollmentId: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  instructions: string | null;
  max_score: number | null;
  due_date: string | null;
  submission_type: string | null;
  allow_late_submission: boolean;
}

interface Submission {
  id: string;
  submission_text: string | null;
  file_path: string | null;
  file_name: string | null;
  submission_url: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

export function ActivitySubmissionViewer({ 
  open, 
  onOpenChange, 
  activityId,
  enrollmentId
}: ActivitySubmissionViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  
  // Form state
  const [responseText, setResponseText] = useState("");
  const [responseUrl, setResponseUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (open && activityId) {
      // Reset state when activity changes
      setActivity(null);
      setSubmission(null);
      setResponseText("");
      setResponseUrl("");
      setSelectedFile(null);
      loadActivityAndSubmission();
    }
  }, [open, activityId]);

  const loadActivityAndSubmission = async () => {
    setLoading(true);
    try {
      // Load activity details
      const { data: activityData, error: activityError } = await supabase
        .from("development_activities")
        .select("*")
        .eq("id", activityId)
        .single();

      if (activityError) throw activityError;
      setActivity(activityData);

      // Load existing submission
      const { data: submissionData } = await supabase
        .from("activity_submissions")
        .select("*")
        .eq("activity_id", activityId)
        .eq("enrollment_id", enrollmentId)
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (submissionData) {
        setSubmission(submissionData);
        setResponseText(submissionData.submission_text || "");
        setResponseUrl(submissionData.submission_url || "");
      }
    } catch (error: any) {
      console.error("Error loading activity:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la actividad",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: "El tamaño máximo permitido es 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!activity) return;

    // Validate based on submission type
    const needsText = activity.submission_type === 'text' || activity.submission_type === 'mixed';
    const needsFile = activity.submission_type === 'file' || activity.submission_type === 'mixed';
    const needsUrl = activity.submission_type === 'url';

    if (needsText && !responseText.trim() && !needsFile) {
      toast({
        title: "Error",
        description: "Debes escribir tu respuesta",
        variant: "destructive"
      });
      return;
    }

    if (needsUrl && !responseUrl.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar una URL",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      let filePath = null;
      let fileName = null;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const uniqueName = `${user!.id}/${activityId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("activity-submissions")
          .upload(uniqueName, selectedFile);

        if (uploadError) {
          // Try creating bucket if it doesn't exist
          console.error("Upload error:", uploadError);
          throw new Error("No se pudo subir el archivo");
        }

        filePath = uniqueName;
        fileName = selectedFile.name;
      }

      // Create or update submission
      const submissionData = {
        activity_id: activityId,
        enrollment_id: enrollmentId,
        user_id: user!.id,
        submission_text: responseText || null,
        submission_url: responseUrl || null,
        file_path: filePath || submission?.file_path || null,
        file_name: fileName || submission?.file_name || null,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        attempt_number: submission ? (submission as any).attempt_number + 1 : 1
      };

      if (submission) {
        const { error } = await supabase
          .from("activity_submissions")
          .update(submissionData)
          .eq("id", submission.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("activity_submissions")
          .insert(submissionData);
        
        if (error) throw error;
      }

      toast({
        title: "Entrega realizada",
        description: "Tu actividad ha sido enviada correctamente",
      });

      loadActivityAndSubmission();
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la actividad",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-500">Enviado</Badge>;
      case 'graded':
        return <Badge className="bg-green-500">Calificado</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = activity?.due_date && new Date(activity.due_date) < new Date();
  const canSubmit = !isOverdue || activity?.allow_late_submission;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded">
              <ClipboardList className="h-5 w-5 text-orange-600" />
            </div>
            {activity?.title || "Cargando..."}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activity ? (
          <div className="space-y-6">
            {/* Activity Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción de la Actividad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {activity.description}
                </p>
                
                {activity.instructions && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Instrucciones:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {activity.instructions}
                      </p>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-4 pt-2">
                  {activity.max_score && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">
                        Puntuación: {activity.max_score} pts
                      </Badge>
                    </div>
                  )}
                  {activity.due_date && (
                    <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : ''}`}>
                      <Calendar className="h-4 w-4" />
                      <span>
                        Fecha límite: {new Date(activity.due_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isOverdue && <AlertCircle className="h-4 w-4" />}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Previous Submission */}
            {submission && (
              <Card className={submission.status === 'graded' ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Tu Entrega
                    </div>
                    {getStatusBadge(submission.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {submission.submission_text && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Tu respuesta:</p>
                      <p className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">
                        {submission.submission_text}
                      </p>
                    </div>
                  )}
                  
                  {submission.file_name && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{submission.file_name}</span>
                    </div>
                  )}

                  {submission.submission_url && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">URL:</p>
                      <a href={submission.submission_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {submission.submission_url}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Enviado: {new Date(submission.submitted_at).toLocaleString('es-ES')}
                  </div>

                  {/* Feedback from teacher */}
                  {submission.status === 'graded' && (
                    <div className="mt-4 p-3 bg-white rounded border-l-4 border-l-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-green-700">Calificación del Tutor</p>
                        <Badge className="bg-green-600 text-lg px-3">
                          {submission.score} / {activity.max_score}
                        </Badge>
                      </div>
                      {submission.feedback && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submission Form */}
            {canSubmit && submission?.status !== 'graded' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {submission ? 'Modificar Entrega' : 'Tu Respuesta'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text response */}
                  {(activity.submission_type === 'text' || activity.submission_type === 'mixed') && (
                    <div>
                      <Label htmlFor="response">Escribe tu respuesta</Label>
                      <Textarea
                        id="response"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Escribe aquí tu respuesta a la actividad..."
                        rows={6}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* URL response */}
                  {activity.submission_type === 'url' && (
                    <div>
                      <Label htmlFor="url">URL de tu trabajo</Label>
                      <Input
                        id="url"
                        type="url"
                        value={responseUrl}
                        onChange={(e) => setResponseUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* File upload */}
                  {(activity.submission_type === 'file' || activity.submission_type === 'mixed') && (
                    <div>
                      <Label>Adjuntar archivo</Label>
                      <div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {selectedFile ? (
                            <div className="flex items-center justify-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium">{selectedFile.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedFile(null);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Haz clic para seleccionar un archivo
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, Word, Excel, PowerPoint (máx. 10MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {submission ? 'Actualizar Entrega' : 'Enviar Actividad'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Overdue warning */}
            {isOverdue && !activity.allow_late_submission && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Plazo finalizado</p>
                      <p className="text-sm">No se permiten entregas tardías para esta actividad.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No se encontró la actividad
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
