# Audit — React Lab 2

Part of what you submit. Fill in sections 0–4 **before** you ask the AI to change anything:
deciding what's wrong is your job, not the AI's. The sheet you audit against is "The Shape
of a Good React Slice" — section 08 of the lab doc.

Point at code as `file:line`, e.g. `CoursesPage.jsx:14`.

---

## 0. What came back

| File the AI gave you            | What's in it (components, hooks)                                                                                                                                                                                                                                     | Lines |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `src/courses/useCourses.js`     | 1 custom hook (`useCourses`). 7 `useState` calls (`courses`, `loading`, `loadError`, `form`, `submitting`, `submitError`, `fieldErrors`). 1 `useEffect` (fetch on mount, no cleanup). 2 functions (`handleChange`, `handleSubmit`). 2 `apiFetch` calls (GET + POST). | ~75   |
| `src/courses/CoursesView.jsx`   | 1 component (`CoursesView`). 9 props. Contains the list (`.map` with `key={course.id}`) **and** the entire form (6 inputs, textarea, button, `renderFieldError` helper, error display). No hooks. No `apiFetch`.                                                     | ~100  |
| `src/courses/CoursesPage.jsx`   | 1 component (`CoursesPage`). Calls `useCourses()`, spreads everything into `CoursesView` via `{...coursesData}`.                                                                                                                                                     | ~7    |
| `src/courses/AddCourseForm.jsx` | **Not created.** Still the TODO placeholder (`throw new Error("TODO")`).                                                                                                                                                                                             | 0     |

**Total: 3 files, ~182 lines. Missing: `AddCourseForm.jsx` as a real component.**

- Does it run? List loads / valid add appears in order / duplicate code shows the 409
  message / bad input shows fieldErrors under the inputs:
- Ans: Yes , it runs. List loads, valid add appears in order, duplicate code shows 409.
- Requests in the Network tab — on page load: 2 ; per add: 2 (one for login for first add, one for fetch) , After first fetch, one request per add.

- `npm test` before any fix: 31 passed / 31 failed. Which test files fail?
- Failed files are:useCourses.test.jsx , CoursesView.test.jsx , AddCourseForm.test.jsx, fieldErrors.test.jsx

## 1. Part A — walk the allowed list

Is each element present, and in the right place?

| Element (the sheet, Part A)                                  | Where it is in the AI's code (`file:line`, or "missing")                       | Right place? If not, where should it be?                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One View component that only renders                         | CoursesView.jsx — but it contains the entire form, takes 6 inputs instead of 3 | CoursesView should show only the list (props: courses, status, error). The form should be a separate AddCourseForm.jsx.                                                  |
| Fetch + logic in a separate hook or module                   | useCourses.js — has the fetch, list state, and form state+ form logic          | Form state and handlers belong inside AddCourseForm, not in the hook                                                                                                     |
| `useState` for the course list, at the right level           | useCourses.js                                                                  | At right place                                                                                                                                                           |
| `useState` for the form's inputs, at the right level         | useCourses.js                                                                  | Wrong level. Should live inside AddCourseForm                                                                                                                            |
| `useEffect` — for the initial fetch only (with a cleanup)    | useCourses.js                                                                  | Right location, right job (fetch on mount), but no cleanup.                                                                                                              |
| Props down, callbacks up (the form raises "add this course") | Missing                                                                        | Should be: AddCourseForm owns its state, calls onAdd(course) on submit. Page provides addCourse as the onAdd prop. Form raises the action; parent decides what it means. |
| `.map` to render the list, with a stable `key`               | CoursesView.jsx                                                                | Correct place                                                                                                                                                            |
| Loading / error / empty states, from one `status`            | useCourses.js                                                                  | Wrong shape. Two fields allow impossible states (loading=true AND loadError="something").                                                                                |

## 2. Part B — scan for "not yet"

Search the files (VS Code: Ctrl/Cmd+Shift+F) for each one.

| Not yet                                                                   | Found? (`file:line`) | What it does in _this_ slice | Cut, or keep — and why |
| ------------------------------------------------------------------------- | -------------------- | ---------------------------- | ---------------------- |
| `useMemo`                                                                 | Not found            |                              |                        |
| `useCallback`                                                             | Not found            |                              |                        |
| `useReducer`                                                              | Not found            |                              |                        |
| `useRef`                                                                  | Not found            |                              |                        |
| Context (`createContext`, `useContext`)                                   | Not found            |                              |                        |
| A data-fetching library, or `axios`, or raw `fetch` instead of `apiFetch` | Not found            |                              |                        |
| TypeScript (types, interfaces, `.ts`/`.tsx`)                              | Not Found            |                              |                        |
| Anything else nobody taught you (name it)                                 | No                   |                              |                        |

## 3. The rule — every hook and every component split

One row for **each** `useState`, `useEffect` and custom hook call, and for **each**
component. Say what it does _in this slice_. "The AI added it" and "just in case" are not
answers — if you can't name its job, the decision is "cut".

| Hook call or component (`file:line`)                        | What earns it here? (one sentence)                                                    | Keep / cut / move (to where)                                                                                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useState([])` for `courses` (`useCourses.js`)              | Holds the list. Shared between `CoursesView` (shows it) and `addCourse` (changes it). | Keep                                                                                                                                                                                          |
| `useState(true)` for `loading` (`useCourses.js`)            | Tracks whether the initial fetch is in flight.                                        | Cut. Replace with one `useState("loading")` for `status`. Two fields (`loading` + `loadError`) allow impossible states.                                                                       |
| `useState("")` for `loadError` (`useCourses.js`)            | Stores the error message from a failed initial fetch.                                 | Cut. Replace with one `useState(null)` for `error` + the `status` field above.                                                                                                                |
| `useState({ code: "", ... })` for `form` (`useCourses.js`)  | Holds the six half-typed form values.                                                 | Move to `AddCourseForm`. Used only by the form.                                                                                                                                               |
| `useState(false)` for `submitting` (`useCourses.js`)        | Disables the button while the POST is in flight.                                      | Move to `AddCourseForm`. Only the form's button reads it.                                                                                                                                     |
| `useState("")` for `submitError` (`useCourses.js`)          | Stores the error message from a failed POST.                                          | Move to `AddCourseForm`. Only the form displays it.                                                                                                                                           |
| `useState({})` for `fieldErrors` (`useCourses.js`)          | Stores per-field validation reasons from a 400.                                       | Move to `AddCourseForm`. Only the form displays them under inputs.                                                                                                                            |
| `useEffect(() => { loadCourses(); }, [])` (`useCourses.js`) | Fetches the list once on mount.                                                       | Keep the job. Fix:add cleanup.                                                                                                                                                                |
| `useCourses()` call (`CoursesPage.jsx`)                     | Loads the list and provides `addCourse`. The page's data source.                      | Keep                                                                                                                                                                                          |
| `apiFetch` inside `useEffect` (`useCourses.js`)             | The initial GET /api/courses.                                                         | Keep.                                                                                                                                                                                         |
| `apiFetch` inside `handleSubmit` (`useCourses.js`)          | The POST /api/courses.                                                                | Move to `AddCourseForm`'s `onAdd` call chain. The form raises the action; the hook's `addCourse` function does the fetch. The form should call `await onAdd(...)` and catch the error itself. |
| `CoursesPage` component (`CoursesPage.jsx`)                 | Wiring: calls the hook, passes data to view, passes callback to form.                 | Keep. But fix: currently spreads everything to one view.                                                                                                                                      |
| `CoursesView` component (`CoursesView.jsx`)                 | Shows the list (or loading/error/empty state).                                        | Keep the list part. Cut everything from `<h2>Add a course</h2>` downward. That form belongs in a new `AddCourseForm` component.                                                               |
| `AddCourseForm` component                                   | Missing. File is still the TODO placeholder.                                          | Create it                                                                                                                                                                                     |

## 4. Decisions — before any fix prompt

- I will **cut**:
  - `useState(true)` for `loading` (`useCourses.js`) — replaced by one `status` string.
  - `useState("")` for `loadError` (`useCourses.js`) — replaced by one `error` string + `status`.
  - Everything from `<h2>Add a course</h2>` downward in `CoursesView.jsx` — that's form JSX, not view.
  - `renderFieldError` helper function in `CoursesView.jsx` — belongs in the form component.

- I will **move** (from → to):
  - `useState({ code: "", ... })` for `form` — from `useCourses.js` → `AddCourseForm.jsx`
  - `useState(false)` for `submitting` — from `useCourses.js` → `AddCourseForm.jsx`
  - `useState("")` for `submitError` — from `useCourses.js` → `AddCourseForm.jsx`
  - `useState({})` for `fieldErrors` — from `useCourses.js` → `AddCourseForm.jsx`
  - `handleChange` function — from `useCourses.js` → `AddCourseForm.jsx`
  - `handleSubmit` function — from `useCourses.js` → `AddCourseForm.jsx` (renamed, calls `onAdd` prop instead of doing the fetch itself)
  - The form JSX (6 inputs, textarea, button, error display) — from `CoursesView.jsx` → `AddCourseForm.jsx`

- I will **add** (missing from the AI's version):
  - `AddCourseForm.jsx` — a new component. Owns form state. Takes one prop: `onAdd`. Calls `await onAdd(courseRequest)` on submit. Catches errors itself. Clears form on success.
  - `status` string state (`useState("loading")`) in `useCourses.js` — replaces `loading` + `loadError`.
  - `error` string state (`useState(null)`) in `useCourses.js` — the message from a failed fetch.
  - Cleanup in `useEffect`: `let ignore = false` before the fetch, `return () => { ignore = true; }` after.
  - `onAdd` callback pattern: `CoursesPage` passes `addCourse` (from the hook) as `onAdd` prop to `AddCourseForm`.
  - `addCourse` as a named export from `useCourses.js` — the hook returns `{ courses, status, error, addCourse }`.
  - `aria-invalid` + `aria-describedby` on inputs with field errors (for accessibility tests).
  - `role="alert"` on the form-level error message (for accessibility tests).

- Other smells I found (state stored that could be computed, a reload after add, browser validation, `key={index}`, swallowed errors…):
  - **None.**

---

## 5. Strip check (section 14 of the doc)

For each "not yet" item you removed — one at a time:

| Removed | `npm test` after | The app after (loads / adds / shows errors) |
| ------- | ---------------- | ------------------------------------------- |
| (none)  | —                | —                                           |

The AI used none of the Part B items.

**Which rule in prompt 1 prevented it:**

The explicit constraint: "Use only useState and useEffect. Do not use useMemo, useCallback, useReducer, useRef, or context. No TypeScript. Plain fetch, no data-fetching library."

## 6. Before / after

|                              | Before (the AI's first version)                                                                                            | After (yours)                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Files and components         | 3 files: CoursesPage.jsx, CoursesView.jsx, useCourses.js. AddCourseForm.jsx has still the TODO placeholder.                | 4 files: CoursesPage.jsx, CoursesView.jsx , AddCourseForm.jsx, useCourses.js                                                             |
| `useState` calls (and where) | 7 calls, **all** in `useCourses.js`: `courses`, `loading`, `loadError`, `form`, `submitting`, `submitError`, `fieldErrors` | 7 calls, splited: `useCourses.js` — `courses`, `status`, `error`. `AddCourseForm.jsx` — `form`, `submitting`, `formError`, `fieldErrors` |
| `useEffect` calls            | 1 in `useCourses.js` (fetch on mount, no cleanup)                                                                          | 1 in `useCourses.js` added cleanup                                                                                                       |
| "Not yet" items              | None                                                                                                                       | None                                                                                                                                     |
| Requests: on load / per add  | 2 GET (StrictMode) / 1 POST                                                                                                | 2 GET (StrictMode) / 1 POST (unchanged)                                                                                                  |
| `npm test`                   | 31 passed / 31 failed                                                                                                      | 62 passed / 0 failed (all 9 files passing)                                                                                               |

## 7. Two sentences

- One thing the AI got right that you might have gotten wrong: It wrote setCourses(prev => [...prev, created].sort(...)) — a new array every time, old reference preserved. I might have written prev.push(created); prev.sort(...) which mutates the existing array. React would see the same reference, skip the re-render, and the new course would never appear on screen.

- One thing you will never accept from an AI without checking again: The exact string values and file structure. The AI wrote setStatus("success") when the spec says "ready" — a one-word difference that broke 8 tests silently.
