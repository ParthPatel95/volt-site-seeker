
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationResult } from '@/utils/inputValidation';

interface SecureInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => ValidationResult;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}

export function SecureInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  validate,
  required = false,
  placeholder,
  maxLength = 255,
  autoComplete,
  className = ''
}: SecureInputProps) {
  const [touched, setTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (validate && touched) {
      const result = validate(newValue);
      setValidationResult(result);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validate) {
      const result = validate(value);
      setValidationResult(result);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={`${className} ${
          touched && !validationResult.isValid ? 'border-red-500 focus:border-red-500' : ''
        }`}
        aria-invalid={touched && !validationResult.isValid}
        aria-describedby={touched && !validationResult.isValid ? `${id}-error` : undefined}
      />
      {touched && !validationResult.isValid && (
        <p id={`${id}-error`} className="text-sm text-red-500" role="alert">
          {validationResult.message}
        </p>
      )}
    </div>
  );
}
