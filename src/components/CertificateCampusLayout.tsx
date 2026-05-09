import { useNavigate } from "react-router-dom";
import {
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
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  { label: "Tutorías", tab: "tutorials", Icon: Briefcase },
  { label: "Plan de trabajo", tab: "work-plan", Icon: ClipboardList },
  { label: "Evaluación", tab: "grades", Icon: ListChecks },
];

const ORGANIZARME_ITEMS = [
  { id: "student-guide", label: "Cómo hacer mi curso", Icon: BookOpen },
  { id: "calendar", label: "Mi agenda", Icon: CalendarIcon },
  { id: "forum", label: "Mensajes pendientes", Icon: Inbox },
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

  const isAdmin =
    userRole === "admin" || userRole === "teacher" || userRole === "super_admin";

  const moduleStatus = (m: ModuleLite) => {
    const p = m.progress ?? 0;
    if (p >= 100) return "done";
    if (m.id === selectedModuleId) return "current";
    return "todo";
  };

  const COMUNICARME_ITEMS = [
    { id: "profile", label: "Mi perfil", Icon: UserIcon, action: () => navigate("/dashboard/settings") },
    { id: "contacts", label: "Mis contactos", Icon: UsersIcon, action: () => setActiveTab("forum") },
    { id: "mail", label: "Correo", Icon: Mail, action: () => setActiveTab("forum") },
    { id: "chat", label: "Chat", Icon: MessageSquare, action: () => setActiveTab("cafeteria") },
    {
      id: "phone",
      label: "Contacta en directo",
      Icon: Phone,
      action: () => {
        if (centerContact.phone) window.location.href = `tel:${centerContact.phone}`;
      },
    },
    {
      id: "cau",
      label: "CAU",
      Icon: HelpCircle,
      highlight: true,
      action: () => navigate("/campus-guide"),
    },
  ];

  return (
    <>
      {/* TOP STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm -mx-3 sm:-mx-4 lg:-mx-6 2xl:-mx-10 mb-3">
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

        {/* Module pills — full width, equal columns */}
        {modules.length > 0 && (
          <div className="px-2 py-2 bg-slate-50 border-t">
            <div className="flex items-stretch gap-1.5 w-full">
              {modules.map((m, idx) => {
                const status = moduleStatus(m);
                const code = m.course_code || `MF${idx + 1}`;
                const units = m.formative_units || [];
                const pillBase = cn(
                  "w-full px-2 py-2 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 truncate",
                  status === "done" &&
                    "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
                  status === "current" &&
                    "bg-amber-400 text-white border-amber-500 shadow",
                  status === "todo" &&
                    "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                );
                const StatusIcon =
                  status === "done" ? CheckCircle2 : status === "current" ? PlayCircle : Lock;
                return (
                  <Popover key={m.id}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={() => {
                          onSelectModule(m.id);
                          setActiveTab("modules");
                        }}
                        title={m.title}
                        className={cn(pillBase, "flex-1 min-w-0")}
                      >
                        <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{code}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="center" className="w-80 p-0">
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
                              onClick={() => {
                                onSelectModule(m.id);
                                setActiveTab("modules");
                              }}
                              className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-xs"
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
                          onClick={() => {
                            onSelectModule(m.id);
                            setActiveTab("modules");
                          }}
                        >
                          Ir al módulo completo
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
              <button
                onClick={() => {
                  onSelectModule("");
                  setActiveTab("modules");
                }}
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
      <aside className="hidden xl:flex fixed left-2 top-40 flex-col w-[120px] z-20 max-h-[calc(100vh-10rem)] overflow-y-auto">
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
      <aside className="hidden xl:flex fixed right-2 top-40 flex-col w-[120px] z-20">
        <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-2 rounded-t">
          Comunicarme
        </div>
        <div className="bg-white border border-t-0 rounded-b p-1.5 flex flex-col gap-0.5 shadow-sm">
          {COMUNICARME_ITEMS.map(({ id, label, Icon, action, highlight }) => (
            <button
              key={id}
              onClick={action}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded text-[10px] text-center leading-tight transition-colors",
                highlight
                  ? "text-red-600 hover:bg-red-50 font-semibold"
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
    </>
  );
}
