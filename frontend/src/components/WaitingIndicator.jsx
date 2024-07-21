function WaitingIndicator({ children }) {
  return (
    <div
      className="indicator"
      style={{ fontSize: "14px", display: "flex", gap: "8px" }}
    >
      {children}
    </div>
  );
}

export default WaitingIndicator;
