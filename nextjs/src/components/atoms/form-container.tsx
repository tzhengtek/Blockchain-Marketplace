import { Button } from "@/components/atoms/button";
import { ErrorLabel } from "@/components/atoms/error-label";
import { getFirstErrorMessage } from "@/utils/form";
import { AnyFormApi, useStore } from "@tanstack/react-form";
import { ReactNode } from "react";

type FormContainerProps = {
  formApi: AnyFormApi;
  buttonLabelKey?: string;
  children: ReactNode;
};

export const FormContainer = ({
  formApi,
  buttonLabelKey,
  children,
}: FormContainerProps) => {
  const formErrorMap = useStore(formApi.store, (state) => state.errorMap);
  const firstErrorMessage = getFirstErrorMessage(formErrorMap);

  return (
    <form
      className="flex flex-col gap-4 items-stretch"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formApi.handleSubmit();
      }}
    >
      {children}
      {firstErrorMessage && <ErrorLabel error={firstErrorMessage} />}
      {buttonLabelKey && (
        <Button className="w-full" type="submit" size="lg">
          {buttonLabelKey}
        </Button>
      )}
    </form>
  );
};
