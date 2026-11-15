import { useState } from "react";

export function AddCourseForm({ onAdd }) {
  const [form, setForm] = useState({
    code: "",
    title: "",
    department: "",
    credits: "",
    capacity: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    setFormError("");
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
      await onAdd(courseRequest);

      setForm({
        code: "",
        title: "",
        department: "",
        credits: "",
        capacity: "",
        description: "",
      });
    } catch (error) {
      setFormError(error.message);

      if (error.status === 400 && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function renderFieldError(name) {
    if (!fieldErrors[name]) {
      return null;
    }

    return (
      <div id={`${name}-error`} className="field-error">
        {fieldErrors[name]}
      </div>
    );
  }

  function getFieldProps(name) {
    return {
      "aria-invalid": Boolean(fieldErrors[name]),
      "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
    };
  }

  return (
    <div>
      <h2>Add a course</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="code">Code</label>
          <input
            id="code"
            name="code"
            value={form.code}
            onChange={handleChange}
            {...getFieldProps("code")}
          />
          {renderFieldError("code")}
        </div>

        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            {...getFieldProps("title")}
          />
          {renderFieldError("title")}
        </div>

        <div>
          <label htmlFor="department">Department</label>
          <input
            id="department"
            name="department"
            value={form.department}
            onChange={handleChange}
            {...getFieldProps("department")}
          />
          {renderFieldError("department")}
        </div>

        <div>
          <label htmlFor="credits">Credits</label>
          <input
            id="credits"
            name="credits"
            type="number"
            value={form.credits}
            onChange={handleChange}
            {...getFieldProps("credits")}
          />
          {renderFieldError("credits")}
        </div>

        <div>
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            {...getFieldProps("capacity")}
          />
          {renderFieldError("capacity")}
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            {...getFieldProps("description")}
          />
          {renderFieldError("description")}
        </div>

        {formError && (
          <p role="alert" className="error">
            {formError}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          Add course
        </button>
      </form>
    </div>
  );
}
