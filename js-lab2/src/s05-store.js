// Section 05 — State as a state machine
//
// The whole app's state is ONE object. It only ever changes through
// transition(state, event), which returns a NEW state (or the SAME state
// when the event changes nothing). Never change `state` itself.

export const initialState = Object.freeze({
  status: "idle", // "idle" | "loading" | "ready" | "error"
  courses: [], // the courses from the last successful load
  error: null, // the error message when status is "error"
  departments: [], // every department name, sorted — filled by the first successful load
  department: "", // the selected department filter ("" = all)
  query: "", // the search box text
  planner: [], // planned courses: { id, code, title, credits }
  grades: {}, // the SGPA calculator form: { [courseId]: "A" | "A-" | … }
});

export function transition(state, event) {
  switch (event.type) {
    case "LOAD_START":
      // status becomes "loading" and error becomes null; everything else stays
      return { ...state, status: "loading", error: null };

    case "LOAD_OK": {
      // fill departments (unique, sorted) from those courses // status "ready", courses from event.courses; on the FIRST success also
      const departments =
        state.departments.length === 0
          ? [
              ...new Set(event.courses.map((course) => course.department)),
            ].sort()
          : state.departments;

      return {
        ...state,
        status: "ready",
        courses: event.courses,
        departments,
        error: null,
      };
    }

    case "LOAD_FAIL":
      // status "error", error from event.message (keep the old courses)
      return {
        ...state,
        status: "error",
        error: event.message,
      };

    case "SET_DEPARTMENT":
      // department from event.department — the SAME state if it didn't change
      if (state.department === event.department) {
        return state;
      }

      return {
        ...state,
        department: event.department,
      };

    case "SET_QUERY":
      // query from event.query — the SAME state if it didn't change
      if (state.query === event.query) {
        return state;
      }

      return {
        ...state,
        query: event.query,
      };

    case "ADD": {
      // Stretch: also refuse a full course, or one that would go over 24 credits. // the SAME state if it's already there. // add { id, code, title, credits } of event.course to the planner —
      const course = event.course;

      if (state.planner.some((item) => item.id === course.id)) {
        return state;
      }

      if (course.seatsLeft === 0) {
        return state;
      }

      const currentCredits = state.planner.reduce(
        (total, item) => total + item.credits,
        0,
      );

      if (currentCredits + course.credits > 24) {
        return state;
      }

      const newCourse = {
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits,
      };

      return {
        ...state,
        planner: [...state.planner, newCourse],
      };
    }

    case "REMOVE": {
      // the SAME state if it isn't in the planner // remove the course with id event.id, AND its grade if it has one —
      const exists = state.planner.some((course) => course.id === event.id);

      if (!exists) {
        return state;
      }

      const planner = state.planner.filter((course) => course.id !== event.id);

      const { [event.id]: removed, ...grades } = state.grades;

      return {
        ...state,
        planner,
        grades,
      };
    }

    case "SET_GRADE": // removes that course's entry — the SAME state if nothing changes // grades[event.id] = event.grade (a computed key!); an empty grade ""
    {
      if (event.grade === "") {
        if (!(event.id in state.grades)) {
          return state;
        }

        const { [event.id]: removed, ...grades } = state.grades;

        return {
          ...state,
          grades,
        };
      }

      if (state.grades[event.id] === event.grade) {
        return state;
      }

      return {
        ...state,
        grades: {
          ...state.grades,
          [event.id]: event.grade,
        },
      };
    }

    default:
      return state; // an event we don't know changes nothing
  }
}
