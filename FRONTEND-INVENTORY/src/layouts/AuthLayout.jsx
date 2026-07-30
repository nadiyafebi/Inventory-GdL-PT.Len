export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex w-1/2 text-white flex-col justify-center px-12 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background.png')" }}
      >
        <div className="absolute inset-0 bg-navy/70" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold leading-tight">
            INVENTARIS
            <br />
            WORKSHOP RADAR
            <br />& ELECTRONIC WARFARE
          </h1>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col p-8">
        <div className="flex justify-end gap-2 mb-6">
          <div className="w-9 h-9 rounded bg-brand-red flex items-center justify-center text-white text-[9px] font-bold text-center leading-tight">
            KEMHAN
          </div>
          <div className="w-9 h-9 rounded bg-navy flex items-center justify-center text-white text-xs font-bold">
            LEN
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}