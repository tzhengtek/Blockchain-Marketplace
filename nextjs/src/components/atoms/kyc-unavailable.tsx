interface KYCUnavailableProps {
  onRetry: () => void;
}

export function KYCUnavailable({ onRetry }: KYCUnavailableProps) {
  return (
    <div style={{ color: "tomato" }}>
      KYC status unavailable.
      <button
        onClick={onRetry}
        style={{ marginLeft: 8, padding: "4px 8px" }}
      >
        Retry
      </button>
    </div>
  );
}
