import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Award, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScormResultsSectionProps {
  userId: string;
  title?: string;
}

interface ScormProgressRow {
  id: string;
  lesson_status: string | null;
  score_raw: number | null;
  score_min: number | null;
  score_max: number | null;
  completion_status: string | null;
  success_status: string | null;
  total_time: string | null;
  last_accessed_at: string | null;
  scorm_packages: { title: string; scorm_version: string | null } | null;
  modules:
    | {
        title: string;
        course_id: string;
        courses: { title: string } | null;
      }
    | null;
}

function statusBadge(row: ScormProgressRow) {
  const raw =
    row.success_status ||
    row.lesson_status ||
    row.completion_status ||
    "not attempted";
  const s = raw.toLowerCase().trim();

  const map: Record<
    string,
    { label: string; className: string; variant?: "default" | "secondary" | "destructive" | "outline" }
  > = {
    passed: { label: "Aprobado", className: "bg-green-600 hover:bg-green-600 text-white" },
    failed: { label: "Suspenso", className: "bg-red-600 hover:bg-red-600 text-white" },
    completed: { label: "Completado", className: "bg-blue-600 hover:bg-blue-600 text-white" },
    incomplete: { label: "En curso", className: "bg-muted text-muted-foreground" },
    browsed: { label: "Visualizado", className: "bg-muted text-muted-foreground" },
    "not attempted": { label: "No iniciado", className: "bg-muted/50 text-muted-foreground" },
  };
  const def = map[s] ?? { label: raw, className: "bg-muted text-muted-foreground" };
  return <Badge className={def.className}>{def.label}</Badge>;
}

function formatScormTime(t: string | null): string {
  if (!t || t === "0000:00:00.00" || t === "00:00:00") return "—";
  // SCORM 1.2: HHHH:MM:SS.SS
  const m = t.match(/^(\d+):(\d{2}):(\d{2})/);
  if (!m) return "—";
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h === 0 && min === 0) {
    const s = parseInt(m[3], 10);
    return s > 0 ? `${s}s` : "—";
  }
  if (h === 0) return `${min}m`;
  return `${h}h ${min}m`;
}

function formatScore(row: ScormProgressRow): string {
  if (row.score_raw == null) return "—";
  const max = row.score_max ?? 100;
  return `${Number(row.score_raw)} / ${Number(max)}`;
}

function formatRelative(date: string | null): string {
  if (!date) return "—";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  } catch {
    return "—";
  }
}

export default function ScormResultsSection({
  userId,
  title = "Mis evaluaciones",
}: ScormResultsSectionProps) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["scorm-results", userId],
    queryFn: async (): Promise<ScormProgressRow[]> => {
      const { data, error } = await supabase
        .from("scorm_progress")
        .select(
          `id, lesson_status, score_raw, score_min, score_max, completion_status,
           success_status, total_time, last_accessed_at,
           scorm_packages ( title, scorm_version ),
           modules ( title, course_id, courses ( title ) )`
        )
        .eq("user_id", userId)
        .order("last_accessed_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as ScormProgressRow[];
    },
    enabled: !!userId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No se pudieron cargar los resultados
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Award className="h-10 w-10 opacity-40" />
            <p className="text-sm">Aún no hay evaluaciones realizadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Paquete</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Última actividad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.modules?.courses?.title ?? "—"}
                    </TableCell>
                    <TableCell>{row.modules?.title ?? "—"}</TableCell>
                    <TableCell>{row.scorm_packages?.title ?? "—"}</TableCell>
                    <TableCell>{statusBadge(row)}</TableCell>
                    <TableCell>{formatScore(row)}</TableCell>
                    <TableCell>{formatScormTime(row.total_time)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelative(row.last_accessed_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
