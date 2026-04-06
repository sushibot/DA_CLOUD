export function LoadingSplash() {
  return (
    <div className="h-dvh flex items-center justify-center bg-gray-950">
      <p className="text-white text-4xl font-semibold tracking-tight uppercase">
        Loading
        <span className="inline-flex">
          <span className="animate-[dot-flash_1.5s_step-end_infinite] [animation-delay:0s]">.</span>
          <span className="animate-[dot-flash_1.5s_step-end_infinite] [animation-delay:0.5s]">.</span>
          <span className="animate-[dot-flash_1.5s_step-end_infinite] [animation-delay:1s]">.</span>
        </span>
      </p>
    </div>
  )
}
