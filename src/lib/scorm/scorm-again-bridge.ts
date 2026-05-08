/**
 * Bridge entre la librería `scorm-again` (Scorm12API + Scorm2004API) y nuestra
 * capa de persistencia en Supabase.
 *
 * Expone simultáneamente `window.API` (SCORM 1.2) y `window.API_1484_11`
 * (SCORM 2004), de forma que cualquier paquete los descubre con el `findAPI()`
 * estándar (asciende por window.parent / window.opener).
 *
 * Mapea LMSCommit/Commit y LMSFinish/Terminate a `onCommit` / `onFinish` con
 * un objeto `CmiData` plano (Record<string,string>) compatible con la tabla
 * `scorm_progress` (columna `cmi_data` JSONB).
 */

import { Scorm12API, Scorm2004API } from "scorm-again";
import type { CmiData } from "./scorm12-api";

export type ScormBridgeCallbacks = {
  onCommit: (cmi: CmiData) => void | Promise<void>;
  onFinish?: (cmi: CmiData) => void | Promise<void>;
};

export type ScormBridgeOptions = {
  studentId: string;
  studentName: string;
  /** Snapshot CMI previo (tabla scorm_progress.cmi_data). */
  previousCmi?: CmiData | null;
  /** Total acumulado (cmi.core.total_time / cmi.total_time). */
  previousTotalTime?: string | null;
  callbacks: ScormBridgeCallbacks;
};

export type ScormBridgeHandle = {
  /** Ambos objetos reales para invocaciones manuales (heartbeat, exit...). */
  scorm12: Scorm12API;
  scorm2004: Scorm2004API;
  /** Quita las referencias de window. */
  detach: () => void;
  /** Escribe session_time en ambas APIs y fuerza commit. */
  commitSessionTime: (scormTime12: string, scormTime2004: string) => void;
  /** Termina ambas APIs (se llama al salir). */
  finish: () => void;
};

function flattenCmi(api: Scorm12API | Scorm2004API): CmiData {
  // scorm-again guarda el modelo en `api.cmi`. Usamos el helper renderCMIToJSONString
  // y volvemos a flatten para mantener la forma plana { 'cmi.x.y': 'value' }.
  const json = api.renderCMIToJSONString();
  let obj: Record<string, unknown> = {};
  try {
    obj = JSON.parse(json) || {};
  } catch {
    return {};
  }
  const out: CmiData = {};
  const walk = (prefix: string, val: unknown) => {
    if (val === null || val === undefined) return;
    if (typeof val === "object" && !Array.isArray(val)) {
      for (const k of Object.keys(val as object)) {
        walk(prefix ? `${prefix}.${k}` : k, (val as Record<string, unknown>)[k]);
      }
    } else {
      out[prefix] = String(val);
    }
  };
  walk("cmi", obj);
  return out;
}

export function attachScormBridge(opts: ScormBridgeOptions): ScormBridgeHandle {
  const settings12: ConstructorParameters<typeof Scorm12API>[0] = {
    autocommit: false,
    logLevel: 4, // ERROR
    lmsCommitUrl: false,
    sendFullCommit: false,
  };
  const settings2004: ConstructorParameters<typeof Scorm2004API>[0] = {
    autocommit: false,
    logLevel: 4,
    lmsCommitUrl: false,
    sendFullCommit: false,
  };

  const scorm12 = new Scorm12API(settings12);
  const scorm2004 = new Scorm2004API(settings2004);

  // Pre-cargar identidad y estado anterior en SCORM 1.2
  try {
    scorm12.cmi.core.student_id = opts.studentId;
    scorm12.cmi.core.student_name = opts.studentName;
    if (opts.previousTotalTime) scorm12.cmi.core.total_time = opts.previousTotalTime;
    if (opts.previousCmi) {
      const prevStatus = opts.previousCmi["cmi.core.lesson_status"];
      if (prevStatus) scorm12.cmi.core.lesson_status = prevStatus;
      const prevLoc = opts.previousCmi["cmi.core.lesson_location"];
      if (prevLoc) scorm12.cmi.core.lesson_location = prevLoc;
      const prevSusp = opts.previousCmi["cmi.suspend_data"];
      if (prevSusp) scorm12.cmi.suspend_data = prevSusp;
      const scoreRaw = opts.previousCmi["cmi.core.score.raw"];
      if (scoreRaw) scorm12.cmi.core.score.raw = scoreRaw;
    }
  } catch (e) {
    console.warn("[SCORM bridge] no se pudo precargar 1.2:", e);
  }

  // Pre-cargar identidad en SCORM 2004
  try {
    scorm2004.cmi.learner_id = opts.studentId;
    scorm2004.cmi.learner_name = opts.studentName;
    if (opts.previousTotalTime) scorm2004.cmi.total_time = opts.previousTotalTime;
    if (opts.previousCmi) {
      const prevSusp = opts.previousCmi["cmi.suspend_data"];
      if (prevSusp) scorm2004.cmi.suspend_data = prevSusp;
      const prevLoc = opts.previousCmi["cmi.location"];
      if (prevLoc) scorm2004.cmi.location = prevLoc;
    }
  } catch (e) {
    console.warn("[SCORM bridge] no se pudo precargar 2004:", e);
  }

  const wireCommit = (api: Scorm12API | Scorm2004API) => {
    api.on("Commit", () => {
      try {
        const snap = flattenCmi(api);
        Promise.resolve(opts.callbacks.onCommit(snap)).catch((e) =>
          console.error("[SCORM bridge] onCommit error:", e)
        );
      } catch (e) {
        console.error("[SCORM bridge] commit serialise error:", e);
      }
    });
    api.on("Terminate", () => {
      try {
        const snap = flattenCmi(api);
        Promise.resolve(opts.callbacks.onFinish?.(snap)).catch((e) =>
          console.error("[SCORM bridge] onFinish error:", e)
        );
      } catch (e) {
        console.error("[SCORM bridge] finish serialise error:", e);
      }
    });
  };
  wireCommit(scorm12);
  wireCommit(scorm2004);

  const w = window as unknown as {
    API?: Scorm12API;
    API_1484_11?: Scorm2004API;
  };
  w.API = scorm12;
  w.API_1484_11 = scorm2004;

  return {
    scorm12,
    scorm2004,
    detach: () => {
      if (w.API === scorm12) delete w.API;
      if (w.API_1484_11 === scorm2004) delete w.API_1484_11;
    },
    commitSessionTime: (scormTime12, scormTime2004) => {
      try {
        scorm12.lmsSetValue("cmi.core.session_time", scormTime12);
        scorm12.lmsCommit();
      } catch (e) {
        console.warn("[SCORM bridge] commit 1.2 falló:", e);
      }
      try {
        scorm2004.lmsSetValue("cmi.session_time", scormTime2004);
        scorm2004.lmsCommit();
      } catch (e) {
        console.warn("[SCORM bridge] commit 2004 falló:", e);
      }
    },
    finish: () => {
      try { scorm12.lmsFinish(); } catch {}
      try { scorm2004.lmsFinish(); } catch {}
    },
  };
}

/** Convierte segundos a formato SCORM 1.2: HHHH:MM:SS.SS */
export function secondsToScorm12Time(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(4, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.00`;
}

/** Convierte segundos a duración ISO 8601 (SCORM 2004): PT1H2M3S */
export function secondsToScorm2004Time(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  let out = "PT";
  if (h) out += `${h}H`;
  if (m) out += `${m}M`;
  out += `${s}S`;
  return out;
}
