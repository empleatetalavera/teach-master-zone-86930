/**
 * SCORM 1.2 LMS Run-Time Environment API
 * Spec: ADL SCORM Version 1.2 — The SCORM Run-Time Environment
 *
 * Implements the standard window.API surface that a SCO discovers via the
 * findAPI() walk up window.parent / window.opener. All methods are SYNCHRONOUS
 * and return strings ("true"/"false" or values), per spec.
 *
 * Persistence is delegated to onCommit/onFinish callbacks so this file stays
 * framework-agnostic and unit-testable.
 *
 * IMPORTANT — same-origin requirement:
 * The SCO iframe must be served from the SAME ORIGIN as the parent app.
 * If the iframe loads a cross-origin URL (e.g. a Supabase Storage signed URL
 * at <project>.supabase.co) the SCO cannot access window.parent.API due to
 * the same-origin policy. See scorm-persistence.ts header for the proxy
 * approach.
 */

export type CmiData = Record<string, string>;

export type ScormCallbacks = {
  /** Called on LMSCommit and inside LMSFinish. Persist the snapshot. */
  onCommit: (cmi: CmiData) => void | Promise<void>;
  /** Called on LMSFinish only. Final state after commit. */
  onFinish?: (cmi: CmiData) => void | Promise<void>;
  /** Optional hook on every LMSSetValue (debugging/audit). */
  onSetValue?: (element: string, value: string) => void;
};

export type ScormInitOptions = {
  /** Authenticated student id (becomes cmi.core.student_id, read-only). */
  studentId: string;
  /** Display name "Last, First" (becomes cmi.core.student_name, read-only). */
  studentName: string;
  /** Previous CMI snapshot from scorm_progress.cmi_data, if resuming. */
  previousCmi?: CmiData | null;
  /** Total accumulated time (e.g. "0001:23:45.00") from previous sessions. */
  previousTotalTime?: string | null;
  /** Whether SCO is read-only (review mode). */
  reviewMode?: boolean;
  /** Persistence callbacks. */
  callbacks: ScormCallbacks;
};

const ERR = {
  NO_ERROR: '0',
  GENERAL: '101',
  INVALID_ARG: '201',
  ELEMENT_CANNOT_HAVE_CHILDREN: '202',
  ELEMENT_NOT_ARRAY: '203',
  NOT_INITIALIZED: '301',
  NOT_IMPLEMENTED: '401',
  INVALID_KEYWORD: '402',
  READ_ONLY: '403',
  WRITE_ONLY: '404',
  INCORRECT_TYPE: '405',
} as const;

const ERR_TEXT: Record<string, string> = {
  '0': 'No error',
  '101': 'General Exception',
  '201': 'Invalid argument error',
  '202': 'Element cannot have children',
  '203': 'Element not an array - cannot have count',
  '301': 'Not initialized',
  '401': 'Not implemented error',
  '402': 'Invalid set value, element is a keyword',
  '403': 'Element is read only',
  '404': 'Element is write only',
  '405': 'Incorrect data type',
};

const READ_ONLY = new Set([
  'cmi.core._children',
  'cmi.core.student_id',
  'cmi.core.student_name',
  'cmi.core.credit',
  'cmi.core.entry',
  'cmi.core.total_time',
  'cmi.core.lesson_mode',
  'cmi.core.score._children',
  'cmi.launch_data',
  'cmi.comments_from_lms',
  'cmi.objectives._count',
  'cmi.interactions._count',
  'cmi.student_data._children',
]);

const WRITE_ONLY = new Set([
  'cmi.core.exit',
  'cmi.core.session_time',
]);

const VALID_LESSON_STATUS = new Set([
  'passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted',
]);

const VALID_EXIT = new Set(['', 'time-out', 'suspend', 'logout']);

export type Scorm12API = {
  LMSInitialize: (arg: string) => string;
  LMSFinish: (arg: string) => string;
  LMSGetValue: (element: string) => string;
  LMSSetValue: (element: string, value: string) => string;
  LMSCommit: (arg: string) => string;
  LMSGetLastError: () => string;
  LMSGetErrorString: (code: string) => string;
  LMSGetDiagnostic: (code: string) => string;
};

export function createScorm12API(opts: ScormInitOptions): Scorm12API {
  let initialized = false;
  let finished = false;
  let lastError: string = ERR.NO_ERROR;

  // Initialise CMI dataset with spec defaults, overlaid with previous snapshot if any.
  const cmi: CmiData = {
    'cmi.core._children':
      'student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time',
    'cmi.core.score._children': 'raw,min,max',
    'cmi.core.student_id': opts.studentId,
    'cmi.core.student_name': opts.studentName,
    'cmi.core.lesson_location': '',
    'cmi.core.credit': 'credit',
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.entry': 'ab-initio',
    'cmi.core.score.raw': '',
    'cmi.core.score.min': '',
    'cmi.core.score.max': '100',
    'cmi.core.total_time': opts.previousTotalTime || '0000:00:00.00',
    'cmi.core.lesson_mode': opts.reviewMode ? 'review' : 'normal',
    'cmi.core.exit': '',
    'cmi.core.session_time': '0000:00:00.00',
    'cmi.suspend_data': '',
    'cmi.launch_data': '',
    ...(opts.previousCmi || {}),
  };

  // LMS-authoritative fields override anything that came from previousCmi.
  cmi['cmi.core.student_id'] = opts.studentId;
  cmi['cmi.core.student_name'] = opts.studentName;
  cmi['cmi.core.lesson_mode'] = opts.reviewMode ? 'review' : 'normal';

  // Determine entry: ab-initio on first attempt, resume if there was prior progress.
  const prev = opts.previousCmi?.['cmi.core.lesson_status'];
  cmi['cmi.core.entry'] = prev && prev !== 'not attempted' ? 'resume' : 'ab-initio';

  return {
    LMSInitialize(arg) {
      if (arg !== '') { lastError = ERR.INVALID_ARG; return 'false'; }
      if (initialized) { lastError = ERR.GENERAL; return 'false'; }
      initialized = true;
      lastError = ERR.NO_ERROR;
      return 'true';
    },
    LMSFinish(arg) {
      if (arg !== '') { lastError = ERR.INVALID_ARG; return 'false'; }
      if (!initialized) { lastError = ERR.NOT_INITIALIZED; return 'false'; }
      if (finished) { lastError = ERR.GENERAL; return 'false'; }
      finished = true;
      const snapshot = { ...cmi };
      // Per spec, LMSFinish behaves like a final commit. We chain commit -> finish.
      Promise.resolve()
        .then(() => opts.callbacks.onCommit(snapshot))
        .then(() => opts.callbacks.onFinish?.(snapshot))
        .catch((e) => console.error('[SCORM] finish error:', e));
      lastError = ERR.NO_ERROR;
      return 'true';
    },
    LMSGetValue(element) {
      if (!initialized) { lastError = ERR.NOT_INITIALIZED; return ''; }
      if (WRITE_ONLY.has(element)) { lastError = ERR.WRITE_ONLY; return ''; }
      if (!(element in cmi)) {
        // Many SCOs query keys we don't track. Spec: return "" with error 401.
        lastError = ERR.NOT_IMPLEMENTED;
        return '';
      }
      lastError = ERR.NO_ERROR;
      return cmi[element] ?? '';
    },
    LMSSetValue(element, value) {
      if (!initialized) { lastError = ERR.NOT_INITIALIZED; return 'false'; }
      if (READ_ONLY.has(element)) { lastError = ERR.READ_ONLY; return 'false'; }

      // Vocabulary validation for known fields.
      if (element === 'cmi.core.lesson_status' && !VALID_LESSON_STATUS.has(value)) {
        lastError = ERR.INVALID_ARG; return 'false';
      }
      if (element === 'cmi.core.exit' && !VALID_EXIT.has(value)) {
        lastError = ERR.INVALID_ARG; return 'false';
      }

      cmi[element] = value;
      opts.callbacks.onSetValue?.(element, value);
      lastError = ERR.NO_ERROR;
      return 'true';
    },
    LMSCommit(arg) {
      if (arg !== '') { lastError = ERR.INVALID_ARG; return 'false'; }
      if (!initialized) { lastError = ERR.NOT_INITIALIZED; return 'false'; }
      const snapshot = { ...cmi };
      Promise.resolve()
        .then(() => opts.callbacks.onCommit(snapshot))
        .catch((e) => console.error('[SCORM] commit error:', e));
      lastError = ERR.NO_ERROR;
      return 'true';
    },
    LMSGetLastError() { return lastError; },
    LMSGetErrorString(code) { return ERR_TEXT[code] ?? ''; },
    LMSGetDiagnostic(code) { return ERR_TEXT[code] ?? ''; },
  };
}

/**
 * Attach the API to window so the SCO's findAPI() can locate it.
 * Returns a cleanup function to detach when the player unmounts.
 *
 * ONLY EFFECTIVE for same-origin iframes. For cross-origin SCOs you need a
 * postMessage bridge or a same-origin proxy (see ScormPlayer integration).
 */
export function attachScorm12ToWindow(api: Scorm12API): () => void {
  (window as unknown as { API: Scorm12API }).API = api;
  return () => {
    if ((window as unknown as { API?: Scorm12API }).API === api) {
      delete (window as unknown as { API?: Scorm12API }).API;
    }
  };
}
