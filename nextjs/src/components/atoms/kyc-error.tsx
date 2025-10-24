interface KYCErrorProps {
  error: unknown;
}

export function KYCError({ error }: KYCErrorProps) {
  const errorMessage = (error as any)?.message;

  return (
    <div style={{ color: "tomato" }}>
      Failed to reach KYC API
      {errorMessage ? ` — ${errorMessage}` : ""}.
    </div>
  );
}
