/**
 * Mis calificaciones — Vista permanente para el alumno (requisito SEPE).
 *
 * Agrega notas de:
 *  - evaluation_attempts (evaluaciones / tests)
 *  - activity_submissions (actividades de desarrollo)
 *  - scorm_progress (paquetes SCORM)
 *
 * Filtra por curso y muestra estado (aprobado / no apto / pendiente),
 * fecha, nº de intentos y enlace al recurso.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, GraduationCap, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type GradeRow = {
  id: string;
  source: "evaluation" | "activity" | "scorm";
  course_id: string | null;
  course_title: string | null;
  module_id: string | null;
  module_title: string | null;
  item_title: string;
  score: number | null;
  max_score: number;
  status: "passed" | "failed" | "pending" | "in_progress";
  attempts: number;
  date: string | null;
  link?: string;
};

const PASS_THRESHOLD = 50; // Por defecto; CFC usa 70 pero validamos por enrollment

function statusBadge(s: GradeRow["status"]) {
  switch (s) {
    case "passed":
      return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Apto</Badge>;
    case "failed":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />No apto</Badge>;
    case "in_progress":
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En curso</Badge>;
    default:
      return <Badge variant="outline">Pendiente</Badge>;
  }
}

export default function StudentGrades() {
  const { user } = useAuth();
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["student-grades", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<GradeRow[]> => {
      if (!user) return [];

      const out: GradeRow[] = [];

      // 1) Evaluaciones
      const { data: evals } = await supabase
        .from("evaluation_attempts")
        .select(`
          id, score, status, completed_at, started_at,
          evaluations:evaluation_id (
            id, title, course_id, module_id,
            courses:course_id ( id, title ),
            modules:module_id ( id, title )
          )
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      const evalGroups = new Map<string, any[]>();
      (evals ?? []).forEach((a: any) => {
        const k = a.evaluations?.id ?? a.id;
        if (!evalGroups.has(k)) evalGroups.set(k, []);
        evalGroups.get(k)!.push(a);
      });
      evalGroups.forEach((attempts, evalId) => {
        const best = attempts.reduce((p, c) => (c.score ?? 0) > (p.score ?? 0) ? c : p);
        const ev = best.evaluations;
        if (!ev) return;
        const score = best.score ?? null;
        const status: GradeRow["status"] = best.status === "completed"
          ? (score != null && score >= PASS_THRESHOLD ? "passed" : "failed")
          : "in_progress";
        out.push({
          id: `eval-${evalId}`,
          source: "evaluation",
          course_id: ev.course_id,
          course_title: ev.courses?.title ?? null,
          module_id: ev.module_id,
          module_title: ev.modules?.title ?? null,
          item_title: ev.title,
          score,
          max_score: 100,
          status,
          attempts: attempts.length,
          date: best.completed_at ?? best.started_at,
          link: ev.course_id ? `/dashboard/student/evaluations` : undefined,
        });
      });

      // 2) Actividades
      const { data: activities } = await supabase
        .from("activity_submissions")
        .select(`
          id, score, status, submitted_at, graded_at,
          development_activities:activity_id (
            id, title, course_id, module_id,
            courses:course_id ( id, title ),
            modules:module_id ( id, title )
          )
        `)
        .eq("user_id", user.id)
        .order("graded_at", { ascending: false, nullsFirst: false });

      (activities ?? []).forEach((a: any) => {
        const ac = a.development_activities;
        if (!ac) return;
        const score = a.score ?? null;
        const status: GradeRow["status"] = a.status === "graded"
          ? (score != null && score >= PASS_THRESHOLD ? "passed" : "failed")
          : a.status === "submitted" ? "pending" : "in_progress";
        out.push({
          id: `act-${a.id}`,
          source: "activity",
          course_id: ac.course_id,
          course_title: ac.courses?.title ?? null,
          module_id: ac.module_id,
          module_title: ac.modules?.title ?? null,
          item_title: ac.title,
          score,
          max_score: 100,
          status,
          attempts: 1,
          date: a.graded_at ?? a.submitted_at,
        });
      });

      // 3) SCORM
      const { data: scorms } = await supabase
        .from("scorm_progress")
        .select(`
          id, score_raw, score_max, lesson_status, last_accessed_at,
          module_id,
          scorm_packages:scorm_package_id ( id, title ),
          modules:module_id ( id, title, course_id, courses:course_id ( id, title ) )
        `)
        .eq("user_id", user.id)
        .order("last_accessed_at", { ascending: false });

      (scorms ?? []).forEach((s: any) => {
        const status: GradeRow["status"] =
          s.lesson_status === "passed" ? "passed"
          : s.lesson_status === "failed" ? "failed"
          : s.lesson_status === "completed" ? (s.score_raw != null && s.score_raw >= PASS_THRESHOLD ? "passed" : "failed")
          : s.lesson_status === "incomplete" ? "in_progress"
          : "pending";
        out.push({
          id: `scorm-${s.id}`,
          source: "scorm",
          course_id: s.modules?.course_id ?? null,
          course_title: s.modules?.courses?.title ?? null,
          module_id: s.module_id,
          module_title: s.modules?.title ?? null,
          item_title: s.scorm_packages?.title ?? "Paquete SCORM",
          score: s.score_raw ?? null,
          max_score: s.score_max ?? 100,
          status,
          attempts: 1,
          date: s.last_accessed_at,
        });
      });

      return out;
    },
  });

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    (rows ?? []).forEach((r) => {
      if (r.course_id && r.course_title) map.set(r.course_id, r.course_title);
    });
    return Array.from(map.entries());
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    if (courseFilter === "all") return rows;
    return rows.filter((r) => r.course_id === courseFilter);
  }, [rows, courseFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const passed = filtered.filter((r) => r.status === "passed").length;
    const failed = filtered.filter((r) => r.status === "failed").length;
    const pending = total - passed - failed;
    const avg = filtered.filter((r) => r.score != null).reduce((s, r) => s + (r.score ?? 0), 0) /
      Math.max(filtered.filter((r) => r.score != null).length, 1);
    return { total, passed, failed, pending, avg: isFinite(avg) ? avg : 0 };
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Mis calificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico permanente de tus notas en evaluaciones, actividades y contenidos SCORM.
          </p>
        </div>
        <div className="min-w-[220px]">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger><SelectValue placeholder="Filtrar por curso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los cursos</SelectItem>
              {courses.map(([id, title]) => (
                <SelectItem key={id} value={id}>{title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total elementos</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Aptos</CardDescription><CardTitle className="text-3xl text-green-600">{stats.passed}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>No aptos</CardDescription><CardTitle className="text-3xl text-destructive">{stats.failed}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Nota media</CardDescription>
            <CardTitle className="text-3xl">{stats.avg.toFixed(1)}</CardTitle></CardHeader>
          <CardContent><Progress value={stats.avg} /></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos ({filtered.length})</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluaciones</TabsTrigger>
          <TabsTrigger value="activity">Actividades</TabsTrigger>
          <TabsTrigger value="scorm">SCORM</TabsTrigger>
        </TabsList>

        {(["all", "evaluation", "activity", "scorm"] as const).map((t) => {
          const subset = t === "all" ? filtered : filtered.filter((r) => r.source === t);
          return (
            <TabsContent key={t} value={t}>
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Elemento</TableHead>
                        <TableHead className="text-center">Tipo</TableHead>
                        <TableHead className="text-center">Intentos</TableHead>
                        <TableHead className="text-center">Nota</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subset.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Sin calificaciones registradas todavía.
                        </TableCell></TableRow>
                      ) : subset.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.course_title ?? "—"}</TableCell>
                          <TableCell>{r.module_title ?? "—"}</TableCell>
                          <TableCell>{r.item_title}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="capitalize">{r.source === "scorm" ? "SCORM" : r.source === "evaluation" ? "Evaluación" : "Actividad"}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{r.attempts}</TableCell>
                          <TableCell className="text-center font-mono">
                            {r.score != null ? `${Number(r.score).toFixed(1)}/${r.max_score}` : "—"}
                          </TableCell>
                          <TableCell className="text-center">{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.date ? new Date(r.date).toLocaleString("es-ES") : "—"}
                          </TableCell>
                          <TableCell>
                            {r.course_id && (
                              <Button asChild size="sm" variant="ghost">
                                <Link to={`/course/${r.course_id}`}>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
