import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      
      <div className="mx-auto flex h-[70px] max-w-[1080px] items-center justify-between px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-[15px] font-semibold"
        >
          <span className="h-[9px] w-[9px] rounded-full bg-accent shadow-[0_0_0_3px_rgba(255,65,54,0.2)]" />

          ResQRoute AI
        </Link>


        {/* Navigation */}
        <div className="hidden items-center gap-[22px] font-mono text-xs uppercase tracking-[0.06em] md:flex">

          <Link
            href="/report"
            className="text-muted transition-colors hover:text-accent"
          >
            Report
          </Link>

          <Link
            href="/map"
            className="text-muted transition-colors hover:text-accent"
          >
            Live Map
          </Link>

          <Link
            href="/navigate"
            className="text-muted transition-colors hover:text-accent"
          >
            Navigate
          </Link>

          <Link
            href="/verify"
            className="text-muted transition-colors hover:text-accent"
          >
            Verify
          </Link>

          <Link
            href="/dispatch"
            className="text-muted transition-colors hover:text-accent"
          >
            Dispatch
          </Link>

          <Link
            href="/dashboard"
            className="text-muted transition-colors hover:text-accent"
          >
            Dashboard
          </Link>

        </div>


        {/* Mobile menu placeholder */}
        <button
          className="font-mono text-xs uppercase text-muted md:hidden"
          aria-label="Open navigation menu"
        >
          Menu
        </button>

      </div>

    </nav>
  );
};

export default Navbar;