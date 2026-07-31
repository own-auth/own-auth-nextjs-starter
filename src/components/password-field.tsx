"use client";

import {
  type InputHTMLAttributes,
  useId,
  useState
} from "react";

type PasswordFieldProps = Readonly<
  {
    label: string;
  } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>;

export function PasswordField({ label, ...inputProps }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const generatedId = useId();
  const inputId = inputProps.id ?? generatedId;

  return (
    <div className="password-field">
      <label htmlFor={inputId}>{label}</label>
      <span className="password-input">
        <input
          {...inputProps}
          id={inputId}
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="password-toggle"
          onClick={() => setIsVisible((visible) => !visible)}
          type="button"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </span>
    </div>
  );
}
