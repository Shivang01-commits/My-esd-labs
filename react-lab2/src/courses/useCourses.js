import { useEffect, useState } from "react";
import { apiFetch } from "../api/client.js";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    code: "",
    title: "",
    department: "",
    credits: "",
    capacity: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await apiFetch("/api/courses");
        setCourses(data);
      } catch (error) {
        setLoadError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    const courseRequest = {
      code: form.code,
      title: form.title,
      department: form.department,
      credits: Number(form.credits),
      capacity: Number(form.capacity),
      description: form.description === "" ? null : form.description,
    };

    try {
      const created = await apiFetch("/api/courses", {
        method: "POST",
        body: courseRequest,
      });

      setCourses((previous) =>
        [...previous, created].sort((a, b) => a.code.localeCompare(b.code)),
      );

      setForm({
        code: "",
        title: "",
        department: "",
        credits: "",
        capacity: "",
        description: "",
      });
    } catch (error) {
      setSubmitError(error.message);

      if (error.status === 400 && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    courses,
    loading,
    loadError,
    form,
    submitting,
    submitError,
    fieldErrors,
    handleChange,
    handleSubmit,
  };
}
