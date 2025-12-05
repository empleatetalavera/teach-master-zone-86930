import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Upload, FileText, CheckCircle2, Clock, AlertCircle, Send } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  instructions: string | null;
  max_score: number | null;
  due_date: string | null;
  submission_type: string | null;
  allowed_file_types: string[] | null;
  course_id: string;
}

interface Submission {
  id: string;
  submission_text: string | null;
  file_path: string | null;
  file_name: string | null;
  score: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string | null;
}

export default function ActivityView() {
  const { courseId, activityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (activityId && user) {
      loadActivity();
    }
  }, [activityId, user]);

  const loadActivity = async () => {
    try {
      const [activityResult, submissionResult] = await Promise.all([
        supabase
          .from("development_activities")
          .select("*")
          .eq("id", activityId)
          .single(),
        supabase
          .from("activity_submissions")
          .select("*")
          .eq("activity_id", activityId)
          .eq("user_id", user!.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      if (activityResult.error) throw activityResult.error;
      setActivity(activityResult.data);
      setSubmission(submissionResult.data);
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

  const handleSubmit = async () => {
    if (!activity || !user) return;

    setSubmitting(true);
    try {
      // Get enrollment
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .single();

      if (!enrollment) {
        throw new Error("No estás inscrito en este curso");
      }

      let filePath = null;
      let fileName = null;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const uniqueFileName = `${user.id}/${activityId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('student-documents')
          .upload(uniqueFileName, selectedFile);

        if (uploadError) throw uploadError;
        
        filePath = uniqueFileName;
        fileName = selectedFile.name;
      }

      // Create submission
      const { error } = await supabase
        .from("activity_submissions")
        .insert({
          activity_id: activityId,
          user_id: user.id,
          enrollment_id: enrollment.id,
          submission_text: submissionText || null,
          submission_url: submissionUrl || null,
          file_path: filePath,
          file_name: fileName,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Actividad enviada",
        description: "Tu entrega ha sido registrada correctamente",
      });

      // Reload activity
      loadActivity();
      setSubmissionText("");
      setSubmissionUrl("");
      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Calificada</Badge>;
      case 'submitted':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente de revisión</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Requiere corrección</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Actividad no encontrada</CardTitle>
            <CardDescription>
              La actividad que buscas no existe o no está disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/course/${courseId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al curso
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{activity.title}</CardTitle>
                <CardDescription className="mt-2">{activity.description}</CardDescription>
              </div>
              {submission && getStatusBadge(submission.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {activity.instructions && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Instrucciones</h3>
                <p className="text-sm whitespace-pre-wrap">{activity.instructions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {activity.max_score && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{activity.max_score}</p>
                  <p className="text-sm text-muted-foreground">Puntuación máxima</p>
                </div>
              )}
              {activity.due_date && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-lg font-bold text-primary">
                    {new Date(activity.due_date).toLocaleDateString("es-ES")}
                  </p>
                  <p className="text-sm text-muted-foreground">Fecha límite</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Previous Submission */}
        {submission && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tu Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.submission_text && (
                <div>
                  <p className="text-sm font-medium mb-1">Texto enviado:</p>
                  <p className="text-sm bg-muted p-3 rounded">{submission.submission_text}</p>
                </div>
              )}
              {submission.file_name && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{submission.file_name}</span>
                </div>
              )}
              {submission.submitted_at && (
                <p className="text-xs text-muted-foreground">
                  Enviado: {new Date(submission.submitted_at).toLocaleString("es-ES")}
                </p>
              )}

              {submission.status === 'graded' && (
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="font-semibold">Calificación: {submission.score}/{activity.max_score || 100}</p>
                  {submission.feedback && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Retroalimentación:</p>
                      <p className="text-sm mt-1">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submission Form */}
        {(!submission || submission.status === 'rejected') && (
          <Card>
            <CardHeader>
              <CardTitle>Enviar Actividad</CardTitle>
              <CardDescription>
                Completa tu entrega y envíala para revisión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="submission-text">Respuesta escrita</Label>
                <Textarea
                  id="submission-text"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submission-url">URL (opcional)</Label>
                <Input
                  id="submission-url"
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submission-file">Archivo (opcional)</Label>
                <Input
                  id="submission-file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept={activity.allowed_file_types?.join(',') || undefined}
                />
                {activity.allowed_file_types && (
                  <p className="text-xs text-muted-foreground">
                    Tipos permitidos: {activity.allowed_file_types.join(', ')}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={submitting || (!submissionText && !submissionUrl && !selectedFile)}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Actividad
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
