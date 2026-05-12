import { useNavigate } from "react-router-dom";
import { ChevronDown,
  ArrowLeft,
  Settings,
  BookOpen,
  Calendar as CalendarIcon,
  Inbox,
  BarChart3,
  Award,
  User as UserIcon,
  Users as UsersIcon,
  Mail,
  MessageSquare,
  Phone,
  HelpCircle,
  CheckCircle2,
  PlayCircle,
  Lock,
  ShieldCheck,
  Download,
  GraduationCap,
  Briefcase,
  ClipboardList,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CAUSupportForm } from "@/components/campus/CAUSupportForm";
import { ContactsListDialog } from "@/components/campus/ContactsListDialog";
import { TutorMessaging } from "@/components/TutorMessaging";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

interface UnitLite {
  id: string;
  title: string;
  unit_code?: string | null;
}

interface ModuleLite {
  id: string;
  title: string;
  course_code?: string | null;
  order_index?: number;
  progress?: number;
  formative_units?: UnitLite[];
}

interface CenterContact {
  email?: string | null;
  phone?: string | null;
}

interface Props {
  course: {
    id?: string;
    title: string;
    course_code?: string | null;
    duration_hours?: number;
    qualification_level?: number | string | null;
    tutor_id?: string | null;
  };
  modules: ModuleLite[];
  selectedModuleId: string | null;
  onSelectModule: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string | null;
  centerContact: CenterContact;
  progressPercent?: number;
  onEditMode?: () => void;
  editMode?: boolean;
  onOpenAdvancedEditor?: () => void;
  onBack?: () => void;
  onOpenStudentGuide?: () => void;
}

const RECURSOS_TABS = [
  { label: "Introducción", tab: "intro", Icon: Sparkles },
  { label: "Formación en campus", tab: "modules", Icon: GraduationCap },
  { label: "Programa formativo", tab: "course-program", Icon: ClipboardList },
  { label: "Tutorías", tab: "tutorials", Icon: Briefcase },
  { label: "Plan de trabajo", tab: "work-plan", Icon: ClipboardList },
  { label: "Evaluación", tab: "exams", Icon: ListChecks },
];

const ORGANIZARME_ITEMS = [
  { id: "student-guide", label: "Cómo hacer mi curso", Icon: BookOpen },
  { id: "calendar", label: "Mi agenda", Icon: CalendarIcon },
  { id: "schedule", label: "Cronograma", Icon: ClipboardList },
  
  { id: "time-tracking", label: "Mis progresos", Icon: BarChart3 },
  { id: "grades", label: "Mis calificaciones", Icon: Award },
];

export function CampusChrome({
  course,
  modules,
  selectedModuleId,
  onSelectModule,
  activeTab,
  setActiveTab,
  userRole,
  centerContact,
  progressPercent = 0,
  onEditMode,
  editMode = false,
  onOpenAdvancedEditor,
  onBack,
  onOpenStudentGuide,
}: Props) {
  const navigate = useNavigate();
  const [verTodoOpen, setVerTodoOpen] = useState(false);
  const [cauOpen, setCauOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [tutorChatOpen, setTutorChatOpen] = useState(false);
  const [unitsOpen, setUnitsOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useAuth();

  // Fetch unread incoming messages for this course (real-time)
  useEffect(() => {
    if (!user?.id || !course.id) return;
    const courseId = course.id;

    const fetchCount = async () => {
      const { count } = await supabase
        .from("communications")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setPendingCount(count || 0);
    };
    fetchCount();

    const channel = supabase
      .channel(`pending-msgs-${courseId}-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "communications", filter: `receiver_id=eq.${user.id}` },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, course.id]);

  // Mark messages as read when opening the tutor chat dialog
  useEffect(() => {
    if (!tutorChatOpen || !user?.id || !course.id || pendingCount === 0) return;
    (async () => {
      await supabase
        .from("communications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("course_id", course.id)
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setPendingCount(0);
    })();
  }, [tutorChatOpen, user?.id, course.id, pendingCount]);

  const goToUnit = (moduleId: string, unitId?: string) => {
    onSelectModule(moduleId);
    setActiveTab("modules");
    setVerTodoOpen(false);
    if (unitId) {
      // Best-effort scroll to the unit element if it's already rendered
      setTimeout(() => {
        const el =
          document.querySelector(`[data-unit-id="${unitId}"]`) ||
          document.getElementById(`unit-${unitId}`);
        if (el) {
          (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
          (el as HTMLElement).classList.add("ring-2", "ring-amber-400");
          setTimeout(() => (el as HTMLElement).classList.remove("ring-2", "ring-amber-400"), 2200);
        }
      }, 250);
    }
  };

  const isAdmin =
    userRole === "admin" || userRole === "teacher" || userRole === "super_admin";

  const moduleStatus = (m: ModuleLite) => {
    const p = m.progress ?? 0;
    if (p >= 100) return "done";
    if (m.id === selectedModuleId) return "current";
    return "todo";
  };

  const goToTab = (tab: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const COMUNICARME_ITEMS = [
    { id: "profile", label: "Mi perfil", Icon: UserIcon, action: () => navigate("/profile") },
    { id: "contacts", label: "Mis contactos", Icon: UsersIcon, action: () => setContactsOpen(true) },
    {
      id: "mail",
      label: "Correo",
      Icon: Mail,
      action: () => {
        if (centerContact.email) {
          window.location.href = `mailto:${centerContact.email}`;
        } else {
          goToTab("forum");
        }
      },
    },
    { id: "chat", label: "Chat", Icon: MessageSquare, action: () => goToTab("cafeteria") },
    { id: "chat-tutor", label: "Chat con el tutor", Icon: MessageSquare, action: () => setTutorChatOpen(true) },
    { id: "pending-messages", label: "Mensajes pendientes", Icon: Inbox, action: () => setTutorChatOpen(true), badge: pendingCount },
    { id: "forum", label: "Foro", Icon: MessageSquare, action: () => goToTab("forum") },
    {
      id: "phone",
      label: "Contacta en directo",
      Icon: Phone,
      action: () => {
        if (centerContact.phone) {
          window.location.href = `tel:${centerContact.phone.replace(/\s+/g, "")}`;
        } else {
          alert("El centro no ha configurado un teléfono de contacto. Contacta a través del CAU.");
        }
      },
    },
    {
      id: "cau",
      label: "CAU",
      Icon: HelpCircle,
      highlight: true,
      action: () => setCauOpen(true),
    },
  ];

  return (
    <>
      {/* TOP STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm mb-3">
        {/* Slim top row: back + admin actions */}
        <div className="px-4 py-1.5 flex items-center justify-between gap-4 border-b border-slate-100">
          <button
            onClick={onBack ?? (() => navigate(-1))}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Mis cursos
          </button>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{progressPercent}% completado</span>
            </div>
            {isAdmin && onOpenAdvancedEditor && (
              <Button size="sm" variant="ghost" onClick={onOpenAdvancedEditor} className="text-xs h-7">
                Editor avanzado
              </Button>
            )}
            {isAdmin && onEditMode && (
              <Button
                size="sm"
                variant={editMode ? "default" : "outline"}
                onClick={onEditMode}
                className={cn("h-7", editMode && "bg-amber-500 hover:bg-amber-600 text-white")}
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                {editMode ? "Salir de edición" : "Modo edición"}
              </Button>
            )}
          </div>
        </div>

        {/* HERO: title + badges + progress + Guía del Alumno */}
        <div className="px-4 py-3 bg-gradient-to-r from-primary/5 via-background to-amber-50/40 flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {course.course_code && (
                <Badge className="bg-primary text-primary-foreground font-bold">{course.course_code}</Badge>
              )}
              {course.qualification_level && (
                <Badge variant="secondary">Nivel {course.qualification_level}</Badge>
              )}
              {course.duration_hours && (
                <Badge variant="outline" className="text-xs">{course.duration_hours}h</Badge>
              )}
            </div>
            <h1 className="text-base md:text-lg font-bold leading-tight truncate">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <Progress value={progressPercent} className="h-2 max-w-[320px] flex-1" />
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{progressPercent}% completado</span>
            </div>
          </div>
          {onOpenStudentGuide && (
            <Button
              size="lg"
              onClick={onOpenStudentGuide}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg ring-2 ring-amber-300 shrink-0"
            >
              <Download className="h-5 w-5 mr-2" />
              Guía del Alumno
            </Button>
          )}
        </div>

        {/* Itinerario row — pills with chevron popover, like the reference */}
        {modules.length > 0 && (
          <div className="px-2 py-2 bg-slate-50 border-t">
            <div className="flex items-stretch gap-1.5 w-full">
              <div className="hidden md:flex items-center px-3 bg-primary text-primary-foreground rounded text-[10px] font-bold tracking-wider shrink-0">
                ITINERARIO
              </div>
              <div className="flex items-stretch gap-1.5 flex-1 min-w-0">
                {modules.map((m, idx) => {
                  const status = moduleStatus(m);
                  const code = m.course_code || `MF${idx + 1}`;
                  const units = m.formative_units || [];
                  const isCurrent = m.id === selectedModuleId;
                  const pillBase = cn(
                    "h-full px-2 py-2 rounded-l text-xs font-semibold border transition-all flex items-center gap-1.5 truncate flex-1 min-w-0",
                    status === "done" &&
                      "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
                    isCurrent &&
                      "bg-amber-400 text-white border-amber-500 shadow",
                    status === "todo" && !isCurrent &&
                      "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  );
                  const StatusIcon =
                    status === "done" ? CheckCircle2 : isCurrent ? PlayCircle : Lock;
                  return (
                    <div key={m.id} className="flex flex-1 min-w-0 items-stretch">
                      <button
                        onClick={() => {
                          onSelectModule(m.id);
                          setActiveTab("modules");
                        }}
                        title={m.title}
                        className={pillBase}
                      >
                        <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-bold shrink-0">{code}</span>
                        <span className="truncate opacity-90">· {m.title}</span>
                      </button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            title="Ver unidades formativas"
                            className={cn(
                              "px-1.5 rounded-r border border-l-0 transition-all flex items-center justify-center shrink-0",
                              status === "done" && "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
                              isCurrent && "bg-amber-400 text-white border-amber-500",
                              status === "todo" && !isCurrent && "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 p-0">
                          <div className="bg-primary text-primary-foreground px-3 py-2 text-xs font-bold">
                            {code} — {m.title}
                          </div>
                          <div className="p-2 max-h-72 overflow-y-auto">
                            {units.length === 0 ? (
                              <p className="text-xs text-muted-foreground p-2">
                                Este módulo aún no tiene unidades formativas.
                              </p>
                            ) : (
                              units.map((u) => (
                                <button
                                  key={u.id}
                                  onClick={() => goToUnit(m.id, u.id)}
                                  className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded hover:bg-primary/5 text-xs"
                                >
                                  <BookOpen className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                  <span>
                                    {u.unit_code && (
                                      <span className="font-bold mr-1">{u.unit_code}</span>
                                    )}
                                    {u.title}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                          <div className="border-t p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                              onClick={() => goToUnit(m.id)}
                            >
                              Ir al módulo completo
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setVerTodoOpen(true)}
                className="px-3 py-2 rounded text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 whitespace-nowrap"
              >
                Ver Todo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LEFT RAIL — Organizarme + Recursos */}
      {!editMode && (
      <aside
        className="hidden lg:flex fixed top-40 flex-col w-[150px] xl:w-[170px] 2xl:w-[190px] z-20 max-h-[calc(100vh-10rem)] overflow-y-auto"
        style={{ left: "max(0.5rem, calc((100vw - 1800px) / 2 + 0.5rem))" }}
      >
        <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-2 rounded-t">
          Organizarme
        </div>
        <div className="bg-white border border-t-0 p-1.5 flex flex-col gap-0.5 shadow-sm">
          {ORGANIZARME_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded text-[10px] text-center leading-tight transition-colors",
                activeTab === id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
          {(userRole === "auditor" || userRole === "admin" || userRole === "super_admin") && (
            <button
              onClick={() => setActiveTab("audit")}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded text-[10px] text-center leading-tight transition-colors",
                activeTab === "audit"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Auditoría</span>
            </button>
          )}
        </div>

        {/* Recursos — moved here from top */}
        <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-2 mt-2 rounded-t">
          Recursos
        </div>
        <div className="bg-white border border-t-0 rounded-b p-1.5 flex flex-col gap-0.5 shadow-sm">
          {RECURSOS_TABS.map(({ label, tab, Icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded text-[10px] text-center leading-tight transition-colors",
                activeTab === tab
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
      )}

      {/* RIGHT RAIL — Comunicarme */}
      {!editMode && (
      <aside
        className="hidden lg:flex fixed top-40 flex-col w-[150px] xl:w-[170px] 2xl:w-[190px] z-20"
        style={{ right: "max(0.5rem, calc((100vw - 1800px) / 2 + 0.5rem))" }}
      >
        <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-2 rounded-t">
          Comunicarme
        </div>
        <div className="bg-white border border-t-0 rounded-b p-1.5 flex flex-col gap-0.5 shadow-sm">
          {COMUNICARME_ITEMS.map(({ id, label, Icon, action, highlight, badge }: any) => (
            <button
              key={id}
              onClick={action}
              className={cn(
                "relative flex flex-col items-center gap-1 p-2 rounded text-[10px] text-center leading-tight transition-colors",
                highlight
                  ? "text-red-600 hover:bg-red-50 font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
      )}

      {/* "Ver Todo" — modal with all modules and their formative units */}
      <Dialog open={verTodoOpen} onOpenChange={setVerTodoOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Itinerario completo del certificado
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Selecciona cualquier unidad formativa para ir directamente a ella.
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Este curso aún no tiene módulos configurados.
              </p>
            ) : (
              modules.map((m, idx) => {
                const status = moduleStatus(m);
                const code = m.course_code || `MF${idx + 1}`;
                const units = m.formative_units || [];
                const StatusIcon =
                  status === "done" ? CheckCircle2 : status === "current" ? PlayCircle : Lock;
                return (
                  <div
                    key={m.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => goToUnit(m.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        status === "done" && "bg-emerald-50 hover:bg-emerald-100",
                        status === "current" && "bg-amber-50 hover:bg-amber-100",
                        status === "todo" && "bg-slate-50 hover:bg-slate-100"
                      )}
                    >
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 shrink-0",
                          status === "done" && "bg-emerald-200 text-emerald-900",
                          status === "current" && "bg-amber-400 text-white",
                          status === "todo" && "bg-slate-200 text-slate-700"
                        )}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {code}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {units.length} {units.length === 1 ? "unidad formativa" : "unidades formativas"}
                          {typeof m.progress === "number" && ` • ${m.progress}% completado`}
                        </p>
                      </div>
                    </button>
                    {units.length > 0 && (
                      <ul className="bg-white divide-y">
                        {units.map((u, uIdx) => (
                          <li key={u.id}>
                            <button
                              onClick={() => goToUnit(m.id, u.id)}
                              className="w-full flex items-start gap-3 px-5 py-2.5 text-left text-sm hover:bg-primary/5 transition-colors group"
                            >
                              <span className="text-xs font-mono text-muted-foreground mt-0.5 w-6 shrink-0 text-right">
                                {uIdx + 1}.
                              </span>
                              <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <span className="flex-1">
                                {u.unit_code && (
                                  <span className="font-bold mr-1.5">{u.unit_code}</span>
                                )}
                                <span className="group-hover:text-primary">{u.title}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cauOpen} onOpenChange={setCauOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Centro de Atención al Usuario</DialogTitle>
          </DialogHeader>
          <CAUSupportForm
            courseId={course.id || ""}
            courseTitle={course.title}
            supportEmail={centerContact.email || undefined}
            supportPhone={centerContact.phone || undefined}
          />
        </DialogContent>
      </Dialog>

      <ContactsListDialog
        courseId={course.id || ""}
        tutorId={course.tutor_id || null}
        open={contactsOpen}
        onOpenChange={setContactsOpen}
      />

      <Dialog open={tutorChatOpen} onOpenChange={setTutorChatOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-5 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat con el tutor
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <TutorMessaging
              courseId={course.id || ""}
              tutorId={course.tutor_id || undefined}
              supportEmail={centerContact.email || undefined}
              supportPhone={centerContact.phone || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
