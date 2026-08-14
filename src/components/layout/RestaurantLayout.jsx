  import { useState } from "react";
  import { Link, NavLink } from "react-router-dom";
  import { Menu, Moon, ShoppingBag, Sun, UserRound, X } from "lucide-react";
  import { useData } from "../../context/DataContext";
  import { useAuth } from "../../context/AuthContext";
  import { useTheme } from "../../context/ThemeContext";
  import { RESTAURANT } from "../../config/resturant";

  export default function RestaurantLayout({ children }) {
    const { cart } = useData();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartCount = cart.reduce((total, item) => total + item.qty, 0);
    const isDark = theme === "dark";

    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#fffaf3] text-surface-900"}`}>
        <style>{`
          @keyframes marquee-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          .marquee-track {
            animation: marquee-scroll 18s linear infinite;
            will-change: transform;
          }

          .marquee-track--slow {
            animation-duration: 24s;
          }

          .marquee-track--reverse {
            animation-direction: reverse;
          }
        `}</style>
        <div className="overflow-hidden bg-surface-900 px-4 py-2 text-xs font-medium tracking-wide text-orange-100">
          <div className="flex flex-col gap-1">
            <div className="marquee-track flex w-max items-center whitespace-nowrap">
            <span className="mx-4">{RESTAURANT.tickerText}</span>
            <span className="mx-4" aria-hidden="true">{RESTAURANT.tickerText}</span>
            <span className="mx-4" aria-hidden="true">{RESTAURANT.tickerText}</span>
            <span className="mx-4" aria-hidden="true">{RESTAURANT.tickerText}</span>
            <span className="mx-4" aria-hidden="true">{RESTAURANT.tickerText}</span>
            <span className="mx-4" aria-hidden="true">{RESTAURANT.tickerText}</span>
            <span className="mx-4" aria-hidden="true">{RESTAURANT.tickerText}</span>
            </div>
          </div>
        </div>
        <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${isDark ? "border-slate-700/70 bg-slate-950/70" : "border-[#eadfd2] bg-[#fffaf3]/90"}`}>
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-2.5 transition-transform duration-200 hover:-translate-y-0.5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-xl shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md">
                {RESTAURANT.logoEmoji}
              </span>
              <span className={`text-sm font-black tracking-tight transition-colors duration-200 sm:text-base ${isDark ? "text-slate-100 hover:text-brand-400" : "text-surface-900 hover:text-brand-600"}`}>
                {RESTAURANT.name}<span className="text-brand-500">.</span>
              </span>
              </Link>
              <nav className={`hidden items-center gap-4 text-sm font-semibold md:flex ${isDark ? "text-slate-300" : "text-stone-600"}`}>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `relative px-1 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:text-brand-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:rounded-full after:bg-brand-500 after:transition-transform after:duration-200 hover:after:scale-x-100 ${
                      isActive ? "text-brand-600 after:scale-x-100" : ""
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/menu"
                  className={({ isActive }) =>
                    `relative px-1 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:text-brand-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:rounded-full after:bg-brand-500 after:transition-transform after:duration-200 hover:after:scale-x-100 ${
                      isActive ? "text-brand-600 after:scale-x-100" : ""
                    }`
                  }
                >
                  Our Menu
                </NavLink>
<Link
                to="/#story"
                className="relative px-1 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:text-brand-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:rounded-full after:bg-brand-500 after:transition-transform after:duration-200 hover:after:scale-x-100"
              >
                Our story
              </Link>
              </nav>
              <div className="ml-auto flex items-center gap-2 sm:ml-0">
                <Link
                  to="/checkout"
                  className={`relative grid h-10 w-10 place-items-center rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md ${isDark ? "bg-slate-800/80 text-brand-300 hover:bg-slate-700" : "bg-brand-50 text-brand-700 hover:bg-brand-100"}`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 ${isDark ? "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-brand-400 hover:bg-slate-800 hover:text-brand-300" : "border-[#dfcfc0] text-stone-700"}`}
                  aria-label="Toggle color theme"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link
                  to={user ? "/dashboard" : "/login"}
                  className={`hidden h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:flex ${isDark ? "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-brand-400 hover:bg-slate-800 hover:text-brand-300" : "border-[#dfcfc0] text-stone-700"}`}
                >
                  <UserRound className="h-4 w-4" />
                  {user ? "My account" : "Sign in"}
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  className={`grid h-10 w-10 place-items-center rounded-full border md:hidden ${isDark ? "border-slate-700 bg-slate-900/70 text-slate-200" : "border-[#dfcfc0] text-stone-700"}`}
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {mobileMenuOpen && (
              <div className={`mt-3 rounded-2xl border px-3 py-3 md:hidden ${isDark ? "border-slate-700 bg-slate-900/90" : "border-[#eadfd2] bg-[#fffaf3]/95"}`}>
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/"
                    end
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-semibold ${isActive ? "bg-brand-500/10 text-brand-600" : isDark ? "text-slate-200" : "text-stone-700"}`}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-semibold ${isActive ? "bg-brand-500/10 text-brand-600" : isDark ? "text-slate-200" : "text-stone-700"}`}
                  >
                    Our Menu
                  </NavLink>
<Link
                  to="/#story"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${isDark ? "text-slate-200" : "text-stone-700"}`}
                >
                  Our story
                </Link>
                  <Link
                    to={user ? "/dashboard" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${isDark ? "bg-slate-800 text-slate-100" : "bg-white text-stone-700"}`}
                  >
                    {user ? "My account" : "Sign in"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 bg-surface-900 px-4 py-12 text-orange-50">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xl font-black">
              {RESTAURANT.name}<span className="text-brand-300">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-orange-100/70">
              Big flavour, honest ingredients, and comfort food made for
              sharing.
            </p>
          </div>
          <div>
            <p className="font-bold">Visit us</p>
            <p className="mt-3 text-sm leading-6 text-orange-100/70">
              {RESTAURANT.address.line1}
              <br />
              {RESTAURANT.address.line2}
            </p>
          </div>
          <div>
            <p className="font-bold">Opening hours</p>
            <p className="mt-3 text-sm leading-6 text-orange-100/70">
              {RESTAURANT.hours.days}
              <br />
              {RESTAURANT.hours.time}
            </p>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-orange-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {RESTAURANT.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-orange-100">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-orange-100">Terms of Service</Link>
          </div>
        </div>
        </footer>
      </div>
    );
  }
