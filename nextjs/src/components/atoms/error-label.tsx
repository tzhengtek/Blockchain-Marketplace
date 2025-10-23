type ErrorLabelProps = {
  error: string;
};

export const ErrorLabel = ({ error }: ErrorLabelProps) => {
  return <em className="text-error-primary">{error}</em>;
};
