import { ReactNode } from "react";
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

export type CampusSection =
  | "intro"
  | "modules"
  | "tutorials"
  | "work-plan"
  | "grades";

interface ModuleLite {
  id: string;
  title: string;
  course_code?: string | null;
  order_index?: number;
}

interface CenterContact {
  email?: string | null;
  phone?: string | null;
  campus_url?: string | null;
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
  onSelectModule: (id: string | null) => void;
  moduleProgress?: Record<string, number>; // 0..100
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string | null;
  centerContact: CenterContact;
  centerName?: string;
  progressPercent?: number;
  onEditMode?: () => void;
  children: ReactNode;
}

const RECURSOS_TABS: { id: CampusSection; label: string; tab: string }[] = [
  { id: "intro", label: "Introducción", tab: "intro" },
  { id: "modules", label: "Formación en campus", tab: "modules" },
  { id: "tutorials", label: "Tutorías", tab: "tutorials" },
  { id: "work-plan", label: "Plan de trabajo", tab: "work-plan" },
  { id: "grades", label: "Evaluación", tab: "grades" },
];

const ORGANIZARME_ITEMS = [
  { id: "student-guide", label: "Cómo hacer mi curso", Icon: BookOpen },
  { id: "calendar", label: "Mi agenda", Icon: CalendarIcon },
  { id: "forum", label: "Mensajes pendientes", Icon: Inbox },
  { id: "time-tracking", label: "Mis progresos", Icon: BarChart3 },
  { id: "grades", label: "Mis calificaciones", Icon: Award },
];

export function CertificateCampusLayout({
  course,
  modules,
  selectedModuleId,
  onSelectModule,
  moduleProgress = {},
  activeTab,
  setActiveTab,
  userRole,
  centerContact,
  centerName,
  progressPercent = 0,
  onEditMode,
  children,
}: Props) {
  const navigate = useNavigate();

  const isAdmin =
    userRole === "admin" || userRole === "teacher" || userRole === "super_admin";

  const moduleStatus = (mId: string) => {
    const p = moduleProgress[mId] ?? 0;
    if (p >= 100) return "done";
    if (mId === selectedModuleId) return "current";
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
    <div className="min-h-screen bg-slate-50">
      {/* Top header band */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
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
            {isAdmin && onEditMode && (
              <Button size="sm" variant="outline" onClick={onEditMode}>
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Modo edición
              </Button>
            )}
          </div>
        </div>

        {/* Module pills */}
        {modules.length > 0 && (
          <div className="max-w-[1600px] mx-auto px-4 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {modules.map((m, idx) => {
                const status = moduleStatus(m.id);
                const code = m.course_code || `MF${idx + 1}`;
                const isSelected = m.id === selectedModuleId;
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
                        "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200",
                      isSelected && "ring-2 ring-primary"
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
      </div>

      {/* 3-column body */}
      <div className="max-w-[1600px] mx-auto flex gap-3 p-3">
        {/* LEFT — Organizarme */}
        <aside className="hidden lg:flex flex-col w-[120px] shrink-0">
          <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-2 rounded-t">
            Organizarme
          </div>
          <div className="bg-white border border-t-0 rounded-b flex-1 p-2 flex flex-col gap-1">
            {ORGANIZARME_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded text-[11px] text-center leading-tight transition-colors",
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
                  "flex flex-col items-center gap-1 p-2 rounded text-[11px] text-center leading-tight transition-colors",
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

        {/* CENTER — Recursos */}
        <main className="flex-1 min-w-0 bg-white border rounded">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t flex items-center justify-between">
            <span className="text-sm font-bold">Recursos</span>
            {selectedModuleId && (
              <span className="text-xs opacity-90 font-mono">
                {modules.find((m) => m.id === selectedModuleId)?.course_code || ""}
              </span>
            )}
          </div>
          <div className="border-b px-2 flex items-center gap-1 overflow-x-auto">
            {RECURSOS_TABS.map((t) => {
              const isActive = activeTab === t.tab;
              return (
                <button
                  key={t.id}
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
          <div className="p-3 md:p-4">{children}</div>
        </main>

        {/* RIGHT — Comunicarme */}
        <aside className="hidden lg:flex flex-col w-[120px] shrink-0">
          <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-2 rounded-t">
            Comunicarme
          </div>
          <div className="bg-white border border-t-0 rounded-b flex-1 p-2 flex flex-col gap-1">
            {COMUNICARME_ITEMS.map(({ id, label, Icon, action, highlight }) => (
              <button
                key={id}
                onClick={action}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded text-[11px] text-center leading-tight transition-colors",
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
      </div>
    </div>
  );
}
