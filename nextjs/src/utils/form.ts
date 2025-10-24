import {
  FormValidationErrorMap,
  StandardSchemaV1Issue,
} from "@tanstack/react-form";

export function getFirstErrorMessage<T>(
  formErrorMap: FormValidationErrorMap<T>
) {
  if (!formErrorMap.onChange) {
    return null;
  }

  return Array.from(Object.values(formErrorMap.onChange)).flatMap((error) =>
    error.map((e: StandardSchemaV1Issue) => e.message)
  )[0];
}
