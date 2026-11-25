import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { DEPARTMENTS, DEPARTMENT_LABELS, GENDERS, GENDER_LABELS, STATUSES, STATUS_LABELS, YEAR_LEVELS } from "../constants";
import type { Department, Gender, Student, StudentPayload, StudentStatus } from "../types";
import { Modal } from "./Modal";

type FormValues = Record<
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "date_of_birth"
  | "gender"
  | "department"
  | "year_level"
  | "gpa"
  | "status"
  | "address"
  | "enrollment_date",
  string
>;

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;

function toFormValues(student: Student | null): FormValues {
  return {
    first_name: student?.first_name ?? "",
    last_name: student?.last_name ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    date_of_birth: student?.date_of_birth ?? "",
    gender: student?.gender ?? "other",
    department: student?.department ?? "computer_science",
    year_level: String(student?.year_level ?? 1),
    gpa: student?.gpa ?? "",
    status: student?.status ?? "active",
    address: student?.address ?? "",
    enrollment_date: student?.enrollment_date ?? new Date().toISOString().slice(0, 10),
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.first_name.trim()) errors.first_name = "First name is required";
  if (!values.last_name.trim()) errors.last_name = "Last name is required";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address";
  if (values.phone && !PHONE_PATTERN.test(values.phone)) errors.phone = "Enter a valid phone number";

  const year = Number(values.year_level);
  if (!Number.isInteger(year) || year < 1 || year > 6) errors.year_level = "Year must be between 1 and 6";

  if (values.gpa !== "") {
    const gpa = Number(values.gpa);
    if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) errors.gpa = "GPA must be between 0 and 4";
  }
  if (!values.enrollment_date) errors.enrollment_date = "Enrollment date is required";
  return errors;
}

function toPayload(values: FormValues): StudentPayload {
  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    date_of_birth: values.date_of_birth || null,
    gender: values.gender as Gender,
    department: values.department as Department,
    year_level: Number(values.year_level),
    gpa: values.gpa || null,
    status: values.status as StudentStatus,
    address: values.address.trim(),
    enrollment_date: values.enrollment_date,
  };
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error && <small className="field__error">{error}</small>}
    </label>
  );
}

interface StudentFormProps {
  initial: Student | null;
  submitting: boolean;
  serverError: string | null;
  onSubmit: (payload: StudentPayload) => void;
  onCancel: () => void;
}

export function StudentForm({ initial, submitting, serverError, onSubmit, onCancel }: StudentFormProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initial));
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit(toPayload(values));
    }
  };

  return (
    <Modal title={initial ? "Edit student" : "Add student"} onClose={onCancel}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form__grid">
          <Field label="First name" error={errors.first_name}>
            <input className="input" name="first_name" value={values.first_name} onChange={handleChange} />
          </Field>
          <Field label="Last name" error={errors.last_name}>
            <input className="input" name="last_name" value={values.last_name} onChange={handleChange} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="input" type="email" name="email" value={values.email} onChange={handleChange} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input className="input" name="phone" value={values.phone} onChange={handleChange} />
          </Field>
          <Field label="Date of birth">
            <input className="input" type="date" name="date_of_birth" value={values.date_of_birth} onChange={handleChange} />
          </Field>
          <Field label="Gender">
            <select className="input" name="gender" value={values.gender} onChange={handleChange}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{GENDER_LABELS[g]}</option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <select className="input" name="department" value={values.department} onChange={handleChange}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>
              ))}
            </select>
          </Field>
          <Field label="Year level" error={errors.year_level}>
            <select className="input" name="year_level" value={values.year_level} onChange={handleChange}>
              {YEAR_LEVELS.map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </Field>
          <Field label="GPA (0 – 4)" error={errors.gpa}>
            <input className="input" type="number" step="0.01" min="0" max="4" name="gpa" value={values.gpa} onChange={handleChange} />
          </Field>
          <Field label="Status">
            <select className="input" name="status" value={values.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Enrollment date" error={errors.enrollment_date}>
            <input className="input" type="date" name="enrollment_date" value={values.enrollment_date} onChange={handleChange} />
          </Field>
          <Field label="Address">
            <textarea className="input" rows={2} name="address" value={values.address} onChange={handleChange} />
          </Field>
        </div>

        {serverError && <div className="alert alert--error">{serverError}</div>}

        <footer className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save student"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
