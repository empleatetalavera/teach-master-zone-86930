import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FormativeUnit {
  id: string;
  title: string;
  description?: string | null;
  duration_hours?: number | null;
  objectives?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number;
  formative_units?: FormativeUnit[];
}

interface AnnexCalendarWorkPlanProps {
  course: {
    title: string;
    course_code?: string | null;
    duration_hours?: number;
    presential_hours?: number | null;
    internship_hours?: number | null;
    qualification_level?: number | null;
    professional_family?: string | null;
    start_date?: string;
    end_date?: string;
  };
  modules: Module[];
  centerName: string;
  centerCity?: string;
}

// Daily workload in hours for teleformación
const DAILY_HOURS = 2.5;

// Generate session distribution for each module/UF
function generateSessionPlan(modules: Module[], dailyHours: number) {
  let sessionCounter = 1;
  const plan: Array<{
    moduleTitle: string;
    moduleIndex: number;
    moduleHours: number;
    ufTitle: string;
    ufCode: string;
    ufIndex: number;
    ufHours: number;
    sessions: Array<{
      sessionNum: number;
      type: 'content' | 'activity' | 'forum' | 'autoeval' | 'material' | 'intro' | 'tutoria_virtual' | 'test_final' | 'eval_1conv' | 'eval_2conv' | 'practicas';
      space: string;
      tasks: string;
      description: string;
    }>;
    tutorProfile: number;
  }> = [];

  modules.forEach((mod, mIndex) => {
    const modHours = mod.duration_minutes ? Math.round(mod.duration_minutes / 60) : 0;
    const units = mod.formative_units || [];
    const isPracticas = mod.title.toLowerCase().includes('prácticas') || mod.title.toLowerCase().includes('práctica');

    if (isPracticas) {
      // Módulo de prácticas
      const practSessions: typeof plan[0]['sessions'] = [];
      const practDays = Math.ceil(modHours / 4); // 4h/day for practices
      for (let d = 0; d < practDays; d++) {
        practSessions.push({
          sessionNum: sessionCounter++,
          type: 'practicas',
          space: 'CENTRO DE TRABAJO',
          tasks: `Realización de módulo de prácticas profesionales no laborales, con una carga horaria de 4 horas al día.`,
          description: ''
        });
      }
      plan.push({
        moduleTitle: mod.title,
        moduleIndex: mIndex,
        moduleHours: modHours,
        ufTitle: mod.title,
        ufCode: `MP`,
        ufIndex: 0,
        ufHours: modHours,
        sessions: practSessions,
        tutorProfile: mIndex + 1
      });
      return;
    }

    units.forEach((uf, ufIndex) => {
      const ufHours = uf.duration_hours || 0;
      const totalSessions = Math.ceil(ufHours / dailyHours);
      const sessions: typeof plan[0]['sessions'] = [];

      // First session of first UF of each module: SESIÓN INICIAL
      if (ufIndex === 0) {
        sessions.push({
          sessionNum: sessionCounter++,
          type: 'intro',
          space: 'CAMPUS - INTRODUCCIÓN',
          tasks: 'SESIÓN INICIAL (*Videoconferencia) / CUESTIONARIO DE CONOCIMIENTOS PREVIOS',
          description: 'Asiste a la sesión inicial donde tu tutor-formador te explicará el funcionamiento del curso y los trabajos que deberás realizar. Completa además el cuestionario de conocimientos previos.'
        });
      }

      // Content sessions (CONTENIDO MULTIMEDIA)
      const contentSessions = Math.max(1, Math.floor(totalSessions * 0.35));
      for (let c = 0; c < contentSessions; c++) {
        sessions.push({
          sessionNum: sessionCounter++,
          type: 'content',
          space: 'CAMPUS - UNIDAD DIDÁCTICA\n(Contenido Multimedia)',
          tasks: `CONTENIDO MULTIMEDIA UD${ufIndex + 1}`,
          description: 'Estudio de los contenidos interactivos y realiza los ejercicios de autoevaluación que te proponen.'
        });
      }

      // Supplementary material
      sessions.push({
        sessionNum: sessionCounter++,
        type: 'material',
        space: 'CAMPUS - UNIDAD DIDÁCTICA\n(Material complementario)',
        tasks: `Documentos y vídeos complementarios de la unidad`,
        description: 'Consulta los materiales complementarios para ampliar los conocimientos y profundizar en los contenidos de la unidad didáctica.'
      });

      // Activities
      sessions.push({
        sessionNum: sessionCounter++,
        type: 'activity',
        space: 'CAMPUS - UNIDAD DIDÁCTICA\n(Actividades de aprendizaje)',
        tasks: `Actividades de aprendizaje de la unidad formativa`,
        description: 'Realiza las actividades de aprendizaje que se te proponen. Tu tutor-formador te indicará los compañeros con los que deberás realizar las actividades grupales y recuerda que debes entregar la actividad en la fecha indicada.'
      });

      // Forum
      sessions.push({
        sessionNum: sessionCounter++,
        type: 'forum',
        space: 'CAMPUS - UNIDAD DIDÁCTICA\n(Foros)',
        tasks: `Foro de debate y Foro de dudas/consultas: ${uf.title}`,
        description: 'Accede a los foros de debate y participa con tu opinión sobre los temas que se proponen. Consulta también tus dudas sobre el contenido, el Campus o la programación de las actividades de aprendizaje.'
      });

      // Self-assessment
      sessions.push({
        sessionNum: sessionCounter++,
        type: 'autoeval',
        space: 'CAMPUS - UNIDAD DIDÁCTICA\n(Contenido Multimedia)',
        tasks: 'Prueba de autoevaluación de la unidad didáctica.',
        description: 'Prueba de autoevaluación tipo test sobre los conocimientos adquiridos de la unidad didáctica.'
      });

      // Last UF of module: tutoría virtual + test final
      if (ufIndex === units.length - 1) {
        sessions.push({
          sessionNum: sessionCounter++,
          type: 'tutoria_virtual',
          space: 'CAMPUS - TUTORÍA VIRTUAL',
          tasks: 'Tutoría virtual grupal (* Videoconferencia)\nTest Final de la unidad formativa',
          description: 'Asiste a la tutoría virtual grupal donde se repasarán los contenidos y se te facilitará información sobre la prueba de evaluación final. Realiza el test final en el apartado de EVALUACIÓN.'
        });

        sessions.push({
          sessionNum: sessionCounter++,
          type: 'eval_1conv',
          space: 'CENTRO DE FORMACIÓN',
          tasks: '1ª Convocatoria: Prueba de evaluación final presencial.',
          description: 'Realización de prueba de evaluación final presencial consistente en prueba teórico-práctica realizada en instalaciones específicas del certificado de profesionalidad.'
        });

        sessions.push({
          sessionNum: sessionCounter++,
          type: 'eval_2conv',
          space: 'CENTRO DE FORMACIÓN',
          tasks: '2ª Convocatoria: Prueba de evaluación final presencial.',
          description: 'Si la prueba de evaluación final presencial no ha sido superada tienes la oportunidad de repetirla en esta segunda convocatoria.'
        });
      }

      plan.push({
        moduleTitle: mod.title,
        moduleIndex: mIndex,
        moduleHours: modHours,
        ufTitle: uf.title,
        ufCode: `UF${String(mIndex + 1).padStart(2, '0')}${String(ufIndex + 1).padStart(2, '0')}`,
        ufIndex,
        ufHours: ufHours,
        sessions,
        tutorProfile: mIndex < Math.ceil(modules.length / 2) ? 1 : 2
      });
    });
  });

  return { plan, totalSessions: sessionCounter - 1 };
}

// Generate monthly calendar grid
function generateCalendarGrid(totalSessions: number) {
  const months: Array<{ label: string; weeks: number[][] }> = [];
  let session = 1;
  const sessionsPerWeek = 5; // L-V
  const weeksPerMonth = 4;

  let monthNum = 1;
  while (session <= totalSessions) {
    const weeks: number[][] = [];
    for (let w = 0; w < weeksPerMonth && session <= totalSessions; w++) {
      const week: number[] = [];
      for (let d = 0; d < sessionsPerWeek && session <= totalSessions; d++) {
        week.push(session++);
      }
      weeks.push(week);
    }
    months.push({ label: `MES ${monthNum}`, weeks });
    monthNum++;
  }

  return months;
}

// Get row background color based on session type
function getSessionRowClass(type: string): string {
  switch (type) {
    case 'eval_1conv': return 'bg-amber-50 dark:bg-amber-950/20';
    case 'eval_2conv': return 'bg-stone-100 dark:bg-stone-900/20';
    case 'tutoria_virtual': return 'bg-blue-50 dark:bg-blue-950/20';
    case 'intro': return 'bg-green-50 dark:bg-green-950/20';
    case 'practicas': return 'bg-rose-50 dark:bg-rose-950/20';
    default: return '';
  }
}

export function AnnexCalendarWorkPlan({ course, modules, centerName, centerCity }: AnnexCalendarWorkPlanProps) {
  const courseCode = course.course_code || "Sin código";
  const presentialHours = course.presential_hours ?? 10;
  const internshipHours = course.internship_hours ?? 40;
  const { plan, totalSessions } = generateSessionPlan(modules, DAILY_HOURS);
  const calendarGrid = generateCalendarGrid(totalSessions);

  // Build dynamic planning summary
  const moduleSummary = modules.map((mod, mIndex) => {
    const modHours = mod.duration_minutes ? Math.round(mod.duration_minutes / 60) : 0;
    const units = mod.formative_units || [];
    const isPracticas = mod.title.toLowerCase().includes('prácticas') || mod.title.toLowerCase().includes('práctica');
    return {
      title: mod.title,
      hours: modHours,
      isPracticas,
      tutorProfile: mIndex < Math.ceil(modules.length / 2) ? 1 : 2,
      units: units.map((uf, ufIndex) => ({
        title: uf.title,
        hours: uf.duration_hours || 0,
        presentialHours: 0,
        examHours: ufIndex === units.length - 1 ? 2 : 0
      }))
    };
  });

  return (
    <section className="space-y-8 mt-8">
      {/* Title Page */}
      <div className="text-center py-12 border-2 border-muted rounded-lg bg-muted/10">
        <h2 className="text-3xl font-bold text-muted-foreground tracking-widest">ANEXO I: CALENDARIO Y</h2>
        <h2 className="text-3xl font-bold text-muted-foreground tracking-widest mt-3">PLAN DE TRABAJO</h2>
      </div>

      {/* ===== SECCIÓN 1: TABLA RESUMEN ===== */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-primary text-primary-foreground px-4 py-3 text-center">
          <h3 className="font-bold text-sm uppercase tracking-wide">
            {courseCode} - {course.title}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold text-xs">Módulo Formativo (MF)</TableHead>
                <TableHead className="font-bold text-xs text-center w-16">Horas (MF)</TableHead>
                <TableHead className="font-bold text-xs">Unidad Formativa (UF)</TableHead>
                <TableHead className="font-bold text-xs text-center w-16">Horas (UF)</TableHead>
                <TableHead className="font-bold text-xs text-center w-14">Tut. Pres.</TableHead>
                <TableHead className="font-bold text-xs text-center w-14">Prueba Final</TableHead>
                <TableHead className="font-bold text-xs text-center w-20">Tutor-Formador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moduleSummary.map((mod, mIndex) => {
                if (mod.isPracticas) {
                  return (
                    <TableRow key={`sum-${mIndex}`} className="bg-rose-50 dark:bg-rose-950/20">
                      <TableCell className="font-bold text-xs">{mod.title}</TableCell>
                      <TableCell className="text-center text-xs font-semibold">{mod.hours}</TableCell>
                      <TableCell colSpan={5} className="text-xs text-center text-muted-foreground italic">
                        Prácticas profesionales no laborales
                      </TableCell>
                    </TableRow>
                  );
                }
                return mod.units.map((uf, ufIndex) => (
                  <TableRow key={`sum-${mIndex}-${ufIndex}`}>
                    {ufIndex === 0 && (
                      <>
                        <TableCell rowSpan={mod.units.length} className="font-bold text-xs bg-muted/20 align-top border-r">
                          {mod.title}
                        </TableCell>
                        <TableCell rowSpan={mod.units.length} className="text-center text-xs font-semibold bg-muted/20 align-top border-r">
                          {mod.hours}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-xs">{uf.title}</TableCell>
                    <TableCell className="text-center text-xs">{uf.hours}</TableCell>
                    <TableCell className="text-center text-xs">{uf.presentialHours}</TableCell>
                    <TableCell className="text-center text-xs">{uf.examHours}</TableCell>
                    {ufIndex === 0 && (
                      <TableCell rowSpan={mod.units.length} className="text-center text-xs align-top border-l">
                        <Badge variant="outline" className="text-[10px]">Perfil {mod.tutorProfile}</Badge>
                      </TableCell>
                    )}
                  </TableRow>
                ));
              })}
              {/* Total row */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell className="text-xs font-bold" colSpan={3}>TOTAL</TableCell>
                <TableCell className="text-center text-xs font-bold">
                  {course.duration_hours || moduleSummary.reduce((acc, m) => acc + m.hours, 0)}
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-2 bg-muted/30 text-[10px] text-muted-foreground space-y-1">
          <p><strong>Nota:</strong> El módulo de prácticas se realiza con una carga horaria diaria de 4 horas.</p>
          <p><strong>Nota 2:</strong> Las pruebas de evaluación se realizan al completar las unidades formativas que componen cada módulo.</p>
        </div>

        {/* Carga horaria / Festivo / Horario boxes */}
        <div className="px-4 py-3 border-t flex flex-wrap gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Carga horaria:</span>
            <span className="border px-3 py-1 rounded font-bold">{DAILY_HOURS}</span>
            <span className="text-muted-foreground">h/día</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Festivo:</span>
            <span className="border px-3 py-1 rounded bg-red-100 text-red-700 font-bold">F</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">No lectivo:</span>
            <span className="border px-3 py-1 rounded bg-muted font-bold">1</span>
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 2: CALENDARIO MENSUAL ===== */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-primary/10 px-4 py-3">
          <h3 className="font-bold text-primary">Calendario de Sesiones</h3>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="border-collapse text-[11px] w-auto">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-muted/50"></th>
                <th className="border px-3 py-1 bg-muted/50 font-bold">L</th>
                <th className="border px-3 py-1 bg-muted/50 font-bold">M</th>
                <th className="border px-3 py-1 bg-muted/50 font-bold">X</th>
                <th className="border px-3 py-1 bg-muted/50 font-bold">J</th>
                <th className="border px-3 py-1 bg-muted/50 font-bold">V</th>
                <th className="border px-3 py-1 bg-muted/20 font-bold text-muted-foreground">S</th>
                <th className="border px-3 py-1 bg-muted/20 font-bold text-muted-foreground">D</th>
              </tr>
            </thead>
            <tbody>
              {calendarGrid.map((month, monthIdx) => (
                month.weeks.map((week, weekIdx) => {
                  // Determine colors for session numbers based on plan
                  const getSessionColor = (sNum: number) => {
                    for (const p of plan) {
                      for (const s of p.sessions) {
                        if (s.sessionNum === sNum) {
                          if (s.type === 'eval_1conv') return 'bg-amber-200 dark:bg-amber-900/40';
                          if (s.type === 'eval_2conv') return 'bg-stone-200 dark:bg-stone-800/40';
                          if (s.type === 'practicas') return 'bg-rose-100 dark:bg-rose-900/30';
                        }
                      }
                    }
                    return '';
                  };

                  return (
                    <tr key={`cal-${monthIdx}-${weekIdx}`}>
                      {weekIdx === 0 ? (
                        <td rowSpan={month.weeks.length} className="border px-2 py-1 font-bold bg-muted/30 text-center align-middle whitespace-nowrap">
                          {month.label}
                        </td>
                      ) : null}
                      {[0, 1, 2, 3, 4].map(dayIdx => {
                        const sNum = week[dayIdx];
                        return (
                          <td key={dayIdx} className={`border px-3 py-1 text-center ${sNum ? getSessionColor(sNum) : ''}`}>
                            {sNum ? `${sNum}º` : ''}
                          </td>
                        );
                      })}
                      <td className="border px-3 py-1 bg-muted/10"></td>
                      <td className="border px-3 py-1 bg-muted/10"></td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-4 text-xs space-y-1">
            <p className="font-semibold">Leyenda:</p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-amber-200 border rounded"></span>
              <span>1ª convocatoria prueba de evaluación final presencial.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-stone-200 border rounded"></span>
              <span>2ª convocatoria prueba de evaluación final presencial.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-rose-100 border rounded"></span>
              <span>Módulo de prácticas profesionales no laborales.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 3: PRESCRIPCIONES DE LOS FORMADORES ===== */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-primary/10 px-4 py-3">
          <h3 className="font-bold text-primary">Prescripciones de los Formadores</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold text-xs" rowSpan={2}>MÓDULO FORMATIVO</TableHead>
                <TableHead className="font-bold text-xs text-center" colSpan={3}>PRESCRIPCIONES DE LOS FORMADORES</TableHead>
                <TableHead className="font-bold text-xs text-center" rowSpan={2}>Perfil</TableHead>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold text-[10px]">Acreditación requerida</TableHead>
                <TableHead className="font-bold text-[10px] text-center w-24">Exp. con acreditación</TableHead>
                <TableHead className="font-bold text-[10px] text-center w-24">Exp. sin acreditación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moduleSummary.filter(m => !m.isPracticas).map((mod, idx) => (
                <TableRow key={`presc-${idx}`}>
                  <TableCell className="text-xs font-semibold">{mod.title}</TableCell>
                  <TableCell className="text-[10px]">
                    <ul className="space-y-0.5 list-disc list-inside">
                      <li>Licenciado, ingeniero, arquitecto o el título de grado correspondiente u otros títulos equivalentes.</li>
                      <li>Diplomado, ingeniero técnico, arquitecto técnico o el título de grado correspondiente u otros títulos equivalentes.</li>
                      <li>Técnico y Técnico Superior de las familias profesionales afines.</li>
                      <li>Certificados de profesionalidad de nivel 2 y 3 del área profesional correspondiente.</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-xs text-center">1 año</TableCell>
                  <TableCell className="text-xs text-center">3 años</TableCell>
                  <TableCell className="text-xs text-center">
                    <Badge variant="outline" className="text-[10px]">Perfil {mod.tutorProfile}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ===== SECCIÓN 4: PLAN DE TRABAJO DETALLADO SESIÓN A SESIÓN ===== */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-primary/10 px-4 py-3">
          <h3 className="font-bold text-primary">Plan de Trabajo Detallado - Sesión a Sesión</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold text-[10px] w-28">MÓDULO FORMATIVO</TableHead>
                <TableHead className="font-bold text-[10px] w-28">UNIDAD FORMATIVA</TableHead>
                <TableHead className="font-bold text-[10px] text-center w-12">Nº</TableHead>
                <TableHead className="font-bold text-[10px] w-36">ESPACIO</TableHead>
                <TableHead className="font-bold text-[10px]">ESPACIO / TAREAS PROGRAMADAS</TableHead>
                <TableHead className="font-bold text-[10px]">DESCRIPCIÓN TAREAS</TableHead>
                <TableHead className="font-bold text-[10px] text-center w-16">FORMADOR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.map((entry, entryIdx) => {
                const moduleRowSpan = entry.sessions.length;
                
                return entry.sessions.map((session, sIdx) => (
                  <TableRow key={`plan-${entryIdx}-${sIdx}`} className={getSessionRowClass(session.type)}>
                    {/* Module column - only show on first session of first UF per module */}
                    {sIdx === 0 && entryIdx === 0 || (sIdx === 0 && plan[entryIdx - 1]?.moduleIndex !== entry.moduleIndex) ? (
                      <TableCell
                        rowSpan={plan.filter(p => p.moduleIndex === entry.moduleIndex).reduce((acc, p) => acc + p.sessions.length, 0)}
                        className="text-[10px] font-bold align-top border-r bg-muted/10 whitespace-normal break-words"
                      >
                        {entry.moduleTitle}
                      </TableCell>
                    ) : null}

                    {/* UF column */}
                    {sIdx === 0 && (
                      <TableCell rowSpan={moduleRowSpan} className="text-[10px] align-top border-r whitespace-normal break-words">
                        {entry.ufTitle}
                      </TableCell>
                    )}

                    {/* Session number */}
                    <TableCell className="text-[10px] text-center font-semibold">{session.sessionNum}</TableCell>

                    {/* Space */}
                    <TableCell className="text-[10px] whitespace-pre-line">{session.space}</TableCell>

                    {/* Tasks */}
                    <TableCell className="text-[10px] whitespace-pre-line font-medium">{session.tasks}</TableCell>

                    {/* Description */}
                    <TableCell className="text-[10px] whitespace-normal">{session.description}</TableCell>

                    {/* Formador */}
                    {sIdx === 0 && entryIdx === 0 || (sIdx === 0 && plan[entryIdx - 1]?.moduleIndex !== entry.moduleIndex) ? (
                      <TableCell
                        rowSpan={plan.filter(p => p.moduleIndex === entry.moduleIndex).reduce((acc, p) => acc + p.sessions.length, 0)}
                        className="text-[10px] text-center align-top border-l"
                      >
                        <Badge variant="outline" className="text-[9px]">Perfil {entry.tutorProfile}</Badge>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Firma */}
      <div className="border rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">El/La Responsable del Centro</p>
            <div className="h-20 border-b border-dashed"></div>
            <p className="text-xs text-muted-foreground">Fdo.: ________________________</p>
            <p className="text-xs text-muted-foreground">{centerName}</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Fecha y Sello</p>
            <div className="h-20 border-b border-dashed"></div>
            <p className="text-xs text-muted-foreground">
              En {centerCity || '____________'}, a _____ de _______________ de {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
