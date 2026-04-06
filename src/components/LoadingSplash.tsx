export function LoadingSplash() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <p className="text-white text-6xl font-bold tracking-tight uppercase">
        Loading
        <span className="inline-flex">
          <span className="animate-[dot-flash_0.9s_step-end_infinite] [animation-delay:0s]">
            .
          </span>
          <span className="animate-[dot-flash_0.9s_step-end_infinite] [animation-delay:0.3s]">
            .
          </span>
          <span className="animate-[dot-flash_0.9s_step-end_infinite] [animation-delay:0.6s]">
            .
          </span>
        </span>
      </p>
    </div>
  );
}
