# Prompt log — React Lab 2

Part of what you submit. It shows _how_ you used AI: did you hand it the contract and the
rules, or type "make it work"? Fill it in **as you go**, not from memory at the end.

- Name and roll number:Shivang Shrivastava MT2026094
- AI tool and plan (e.g. ChatGPT free, Gemini, Claude free, Copilot): Chatgpt free

**Log every prompt you send, in order — including the ones that didn't help.** Paste each
prompt in full. One exception: if you pasted CONTRACT.md's prompt 1 unchanged, write
"CONTRACT.md prompt 1, unchanged". Summarise each reply; don't paste whole files.

---

## Prompt 1 — generate

**Sent:**

```text
CONTRACT.md prompt 1, unchanged
```

**What came back:** (which files; which hooks it used; anything from the "not yet" list;
anything it did that the contract didn't ask for)
-> 3 files came, AddcourseForm.jsx is missing. Nothing is used from not yet list.

**Did it run?** (`npm run dev`: list loads? add works? 409 shown? fieldErrors shown? list loads, add works, 409 is shown, fielderrors are also shown
`npm test`: 31 passed / 31 failed)

**What I did with it:**

1. Ran `npm run dev` — page works end-to-end (list loads, add works, 409 shown, fieldErrors shown).
2. Checked Network tab — 2 GETs on load (StrictMode), 1 POST per add (no unnecessary reload).
3. Ran `npm test` — 31 passed / 31 failed.
4. Wrote AUDIT.md
5. Gave Prompt 2 (the fix prompt carrying my decisions) to the AI.
6. AI returned 4 files. Ran `npm test` — 54 passed / 8 failed. All 8 failures: `expected 'success' to be 'ready'` (one-word mismatch in `useCourses.js`).
7. changed `setStatus("success")` to `setStatus("ready")`."
8. Ran `npm test` — **62 passed / 0 failed**.

---

## Prompt 2 —

**Why I sent it:** (for a fix prompt: which decision in AUDIT.md it carries out)
Carries out all decisions from AUDIT.md : the split (CoursesView → list only, new AddCourseForm file), the move (form state from hook → form component), the fix (loading + loadError → status + error, add cleanup), and the add (onAdd callback pattern, aria attributes, role="alert").

**Sent:**

```text
I audited the code you gave me. Change it exactly like this, and nothing else:

1. Split CoursesView.jsx into TWO components:
   - CoursesView.jsx: shows ONLY the list (or loading/error/empty state). Props: { courses, status, error }. No form. No inputs. No button. No handleChange. No handleSubmit.
   - AddCourseForm.jsx (NEW file): the form. Owns its own state internally (one useState for the form object, one for submitting, one for formError, one for fieldErrors). Takes ONE prop: { onAdd }. On submit, calls await onAdd(courseRequest). Catches errors itself. Clears form on success. Shows fieldErrors under each input. Shows formError above the button with role="alert". Inputs with field errors get aria-invalid and aria-describedby.

2. Fix useCourses.js:
   - Remove ALL form state (form, submitting, submitError, fieldErrors, handleChange, handleSubmit).
   - Replace useState(true) for loading + useState("") for loadError with: useState("loading") for status + useState(null) for error.
   - Add cleanup to useEffect: let ignore = false before the fetch; return () => { ignore = true; } after.
   - Export an addCourse(courseRequest) function that does the POST via apiFetch, inserts the 201 response into the array sorted by code, and returns the created course. It must THROW on failure (do not catch inside addCourse).
   - Return exactly: { courses, status, error, addCourse }.

3. Fix CoursesPage.jsx:
   - Call useCourses() and destructure { courses, status, error, addCourse }.
   - Render: <h1>Courses</h1>, then <CoursesView courses={courses} status={status} error={error} />, then <AddCourseForm onAdd={addCourse} />.
   - Do NOT spread everything into one component.

4. The form sends: credits as Number(form.credits), capacity as Number(form.capacity), description as null when empty. No browser validation (no required attributes).

The files must end up with exactly this shape:
- src/courses/useCourses.js: a hook. useState + useEffect only. Returns { courses, status, error, addCourse }. No JSX. No form state.
- src/courses/CoursesView.jsx: a component that only renders. Props: { courses, status, error }. No fetch. No hooks. No form.
- src/courses/AddCourseForm.jsx: a component. Props: { onAdd }. Owns form state via useState. Calls onAdd on submit. Catches errors. No fetch. No apiFetch.
- src/courses/CoursesPage.jsx: wiring. Calls useCourses. Passes data to CoursesView. Passes addCourse to AddCourseForm as onAdd.

Same rules as before: only useState and useEffect; no useMemo, useCallback, useReducer, useRef or context; JavaScript; apiFetch only. Named exports. Reply with the changed files in full, path on the first line.
```

**What came back:**
4 files, correct structure. All the splits, moves, and adds were done as specified. One bug: setStatus("success") instead of setStatus("ready") in useCourses.js. Result: 54 passed / 8 failed (all 8 the same one-word mismatch).

**What I kept, and what I rejected:**
Kept: All 4 files, the entire structure.
Rejected / fixed: setStatus("success") → setStatus("ready"). One word. "changed setStatus("success") to setStatus("ready") in useCourses.js." After that: 62 passed / 0 failed.

---

<!-- Copy the "Prompt 2" block for each further prompt. -->

## Afterwards

- How many prompts did the whole feature take?
- Ans: 2
- Which of your prompts would you write differently now, and how?
- ans:Prompt 1. I would have added: "The status string values are exactly: "loading", "ready", "error". Not "success", not "loaded", not "done". The tests check for these exact strings." And: "Create FOUR files. AddCourseForm.jsx is a separate component — do not put the form inside CoursesView." The contract said "one View component that only renders" but the AI interpreted "one View" as "one component that shows everything." Being explicit about the file count and the exact string values would have saved Prompt 2.

- One thing the rules in prompt 1 prevented (or failed to prevent):
- ans: Prevented: the "not yet" list — no useMemo, useCallback, useRef, useReducer, context, or data-fetching library appeared.

Failed to prevent: the wrong file split (3 files instead of 4, form crammed into the view) and the wrong status string ("success" instead of "ready"). The rules constrained which hooks to use but not how to structure the files or what exact string values to use. Those required reading the test files, which the prompt didn't reference.
