export function CoursesView({ courses, status, error }) {
  if (status === "loading") {
    return <p>Loading courses…</p>;
  }

  if (status === "error") {
    return <p>Couldn't load courses: {error}</p>;
  }

  if (courses.length === 0) {
    return <p>No courses yet.</p>;
  }

  return (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>
          <div>
            {course.code} · {course.title}
          </div>
          <div>
            {course.credits} credits · {course.department} ·{" "}
            {course.seatsLeft === 0
              ? "Full"
              : course.seatsLeft === 1
                ? "1 seat left"
                : `${course.seatsLeft} seats left`}
          </div>
        </li>
      ))}
    </ul>
  );
}
