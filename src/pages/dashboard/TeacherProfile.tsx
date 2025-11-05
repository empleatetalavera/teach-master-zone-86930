import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Award, BookOpen, Users, Calendar, ClipboardCheck, MessageSquare, Bell, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TeacherProfile {
  full_name: string;
  bio: string;
  specializations: string[];
  experience_years: number;
  certifications: string[];
  education: string;
  languages: string[];
  teaching_courses: number;
  total_students: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  duration_hours: number;
  level: string;
}

export default function TeacherProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingActivities, setPendingActivities] = useState(0);
  const [profile, setProfile] = useState<TeacherProfile>({
    full_name: "",
    bio: "",
    specializations: [],
    experience_years: 0,
    certifications: [],
    education: "",
    languages: [],
    teaching_courses: 0,
    total_students: 0,
  });
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      // Load basic profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      // Load or create teacher profile
      let { data: teacherData, error: teacherError } = await supabase
        .from("teacher_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      // Create teacher profile if it doesn't exist
      if (!teacherData && !teacherError) {
        const { data: newTeacherData, error: insertError } = await supabase
          .from("teacher_profiles")
          .insert({
            user_id: user!.id,
            specializations: [],
            certifications: [],
            languages: [],
            experience_years: 0,
            education: "",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        teacherData = newTeacherData;
      }

      // Count teaching courses
      const { count: coursesCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Count total students across all courses
      const { count: studentsCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true });

      // Load teacher's courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url, duration_hours, level")
        .eq("tutor_id", user!.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // Count pending activities to grade
      const { count: pendingCount } = await supabase
        .from("activity_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted");

      if (profileData && teacherData) {
        setProfile({
          full_name: profileData.full_name || "",
          bio: profileData.bio || "",
          specializations: (teacherData.specializations as string[]) || [],
          experience_years: teacherData.experience_years || 0,
          certifications: (teacherData.certifications as string[]) || [],
          education: teacherData.education || "",
          languages: (teacherData.languages as string[]) || [],
          teaching_courses: coursesCount || 0,
          total_students: studentsCount || 0,
        });
        setCourses(coursesData || []);
        setPendingActivities(pendingCount || 0);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update basic profile (name and bio)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
        })
        .eq("id", user!.id);

      if (profileError) throw profileError;

      // Update teacher profile
      const { error: teacherError } = await supabase
        .from("teacher_profiles")
        .update({
          specializations: profile.specializations,
          certifications: profile.certifications,
          languages: profile.languages,
          experience_years: profile.experience_years,
          education: profile.education,
        })
        .eq("user_id", user!.id);

      if (teacherError) throw teacherError;

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setProfile({
        ...profile,
        specializations: [...profile.specializations, newSpecialization.trim()],
      });
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index: number) => {
    setProfile({
      ...profile,
      specializations: profile.specializations.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile({
        ...profile,
        certifications: [...profile.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setProfile({
        ...profile,
        languages: [...profile.languages, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mi Perfil Docente</h1>
        <p className="text-muted-foreground">
          Gestiona tu información profesional y currículum vitae
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cursos Impartidos</p>
              <p className="text-2xl font-bold">{profile.teaching_courses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estudiantes Totales</p>
              <p className="text-2xl font-bold">{profile.total_students}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Años de Experiencia</p>
              <p className="text-2xl font-bold">{profile.experience_years}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-primary/20 hover:border-primary"
          onClick={() => navigate('/dashboard/teacher/courses')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mis Cursos</p>
              <p className="text-lg font-bold">{courses.length}</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-orange-500/20 hover:border-orange-500"
          onClick={() => navigate('/dashboard/teacher/students')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
              <p className="text-lg font-bold">{pendingActivities}</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-indigo-500/20 hover:border-indigo-500"
          onClick={() => navigate('/dashboard/teacher/calendar')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Calendario</p>
              <p className="text-lg font-bold">Eventos</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-green-500/20 hover:border-green-500"
          onClick={() => navigate('/dashboard/teacher/support')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mensajería</p>
              <p className="text-lg font-bold">Ver</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-purple-500/20 hover:border-purple-500"
          onClick={() => navigate('/dashboard/teacher/alerts')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alertas</p>
              <p className="text-lg font-bold">Config</p>
            </div>
          </div>
        </Card>
      </div>

      {/* My Courses Section */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Cursos</CardTitle>
                <CardDescription>Cursos que estás impartiendo actualmente</CardDescription>
              </div>
              <Button onClick={() => navigate('/dashboard/teacher/courses')} variant="outline">
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {courses.slice(0, 4).map((course) => (
                <Card 
                  key={course.id} 
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dashboard/teacher/courses/${course.id}`)}
                >
                  <div className="flex gap-4">
                    {course.thumbnail_url && (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{course.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{course.level}</Badge>
                        <Badge variant="outline">{course.duration_hours}h</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tu información básica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía Profesional</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              placeholder="Describe tu experiencia, especialidades y enfoque docente..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">Años de Experiencia Docente</Label>
            <Input
              id="experience_years"
              type="number"
              value={profile.experience_years}
              onChange={(e) =>
                setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Formación Académica</Label>
            <Input
              id="education"
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              placeholder="Título más alto obtenido"
            />
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Especializaciones
          </CardTitle>
          <CardDescription>Áreas de conocimiento en las que te especializas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.specializations.map((spec, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeSpecialization(index)}
              >
                {spec} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Añadir especialización..."
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSpecialization()}
            />
            <Button onClick={addSpecialization} variant="outline">
              Añadir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificaciones y Títulos
          </CardTitle>
          <CardDescription>Certificados profesionales y académicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {profile.certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <span>{cert}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Añadir certificación..."
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCertification()}
            />
            <Button onClick={addCertification} variant="outline">
              Añadir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Idiomas</CardTitle>
          <CardDescription>Idiomas que dominas para impartir clases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeLanguage(index)}
              >
                {lang} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Añadir idioma..."
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addLanguage()}
            />
            <Button onClick={addLanguage} variant="outline">
              Añadir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
