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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModuleLite {
  id: string;
  title: string;
  course_code?: string | null;
  order_index?: number;
  progress?: number;
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
}

const RECURSOS_TABS = [
  { label: "Introducción", tab: "intro" },
  { label: "Formación en campus", tab: "modules" },
  { label: "Tutorías", tab: "tutorials" },
  { label: "Plan de trabajo", tab: "work-plan" },
  { label: "Evaluación", tab: "grades" },
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
      {/* TOP BANDS — Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm -mx-3 sm:-mx-4 lg:-mx-6 2xl:-mx-10 mb-3">
        <div className="px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack ?? (() => navigate(-1))}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Mis cursos
            </button>
            <span className="text-muted-foreground">|</span>
            <div className="text-sm font-semibold truncate">
              {course.course_code && (
                <span className="text-primary mr-2">{course.course_code}</span>
              )}
              {course.title}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{progressPercent}% completado</span>
            </div>
            {isAdmin && onOpenAdvancedEditor && (
              <Button size="sm" variant="ghost" onClick={onOpenAdvancedEditor} className="text-xs">
                Editor avanzado
              </Button>
            )}
            {isAdmin && onEditMode && (
              <Button
                size="sm"
                variant={editMode ? "default" : "outline"}
                onClick={onEditMode}
                className={editMode ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                {editMode ? "Salir de edición" : "Modo edición"}
              </Button>
            )}
          </div>
        </div>

        {modules.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {modules.map((m, idx) => {
                const status = moduleStatus(m);
                const code = m.course_code || `MF${idx + 1}`;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModule(m.id);
                      setActiveTab("modules");
                    }}
                    title={m.title}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-bold border transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5",
                      status === "done" &&
                        "bg-emerald-100 text-emerald-800 border-emerald-300",
                      status === "current" &&
                        "bg-amber-400 text-white border-amber-500 shadow",
                      status === "todo" &&
                        "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    )}
                  >
                    {status === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {status === "current" && <PlayCircle className="h-3.5 w-3.5" />}
                    {status === "todo" && <Lock className="h-3.5 w-3.5" />}
                    {code}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recursos sub-tabs */}
        <div className="bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold flex items-center gap-2">
          <span>Recursos</span>
          {selectedModuleId && (
            <span className="opacity-90 font-mono ml-auto">
              {modules.find((m) => m.id === selectedModuleId)?.course_code || ""}
            </span>
          )}
        </div>
        <div className="bg-white px-2 flex items-center gap-1 overflow-x-auto">
          {RECURSOS_TABS.map((t) => {
            const isActive = activeTab === t.tab;
            return (
              <button
                key={t.tab}
                onClick={() => setActiveTab(t.tab)}
                className={cn(
                  "px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT RAIL — Fixed */}
      {!editMode && (
      <aside className="hidden xl:flex fixed left-2 top-44 flex-col w-[110px] z-20">
        <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-2 rounded-t">
          Organizarme
        </div>
        <div className="bg-white border border-t-0 rounded-b p-1.5 flex flex-col gap-0.5 shadow-sm">
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
      </aside>
      )}

      {/* RIGHT RAIL — Fixed */}
      {!editMode && (
      <aside className="hidden xl:flex fixed right-2 top-44 flex-col w-[110px] z-20">
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
