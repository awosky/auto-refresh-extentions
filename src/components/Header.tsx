const Header = () => {
  return (
    <header className="mb-6 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-indigo-500/15">
        <img src="/logo.png" alt="Auto Refresh" className="h-full w-full object-contain" />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight">Auto Refresh</h2>
        <p className="text-xs text-slate-400">Keep your tabs up to date</p>
      </div>
      <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
        READY
      </span>
    </header>
  );
};

export default Header;
