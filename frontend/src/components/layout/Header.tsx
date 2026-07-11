import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Leaf, Menu, X, Package, MapPin, LogOut, LogIn } from "lucide-react";
import clsx from "clsx";
import SearchBar from "@/components/common/SearchBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutThunk } from "@/features/auth/authSlice";

/**
 * Premium sticky header: logo, category nav, search bar, and account/
 * cart/wishlist icons with live badge counts from Redux state.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user, refreshToken } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const categories = useAppSelector((s) => s.products.categories);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    dispatch(logoutThunk(refreshToken));
    setAccountOpen(false);
    navigate("/");
  }

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "backdrop-blur-md bg-cream/90 shadow-soft" : "bg-cream/60 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-forest-700">
            <Leaf className="w-5 h-5 text-gold" />
          </div>
          <span className="font-display text-xl text-forest-700 hidden sm:block">Prakruti Organics</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 font-body text-sm font-medium text-forest-700 shrink-0">
          {categories.slice(0, 4).map((c) => (
            <NavLink key={c.id} to={`/products?category=${c.slug}`} className="hover:text-pista-700 transition-colors whitespace-nowrap">
              {c.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block flex-1 max-w-md ml-auto">
          <SearchBar />
        </div>

        <div className="flex items-center gap-1 md:gap-2 ml-auto md:ml-0">
          <button className="md:hidden p-2" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <Search className="w-5 h-5 text-forest-700" />
          </button>

          <button onClick={() => navigate("/wishlist")} className="relative p-2 hidden sm:block" aria-label="Wishlist">
            <Heart className="w-5 h-5 text-forest-700" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 text-[10px] w-4 h-4 rounded-full flex items-center justify-center text-white bg-soft-orange">
                {wishlistCount}
              </span>
            )}
          </button>

          <button onClick={() => navigate("/cart")} className="relative p-2" aria-label="Cart">
            <ShoppingCart className="w-5 h-5 text-forest-700" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 text-[10px] w-4 h-4 rounded-full flex items-center justify-center text-white bg-soft-orange">
                {cartCount}
              </span>
            )}
          </button>

          <div className="relative hidden sm:block" ref={accountRef}>
            <button onClick={() => setAccountOpen((v) => !v)} className="p-2" aria-label="Account" aria-expanded={accountOpen}>
              <User className="w-5 h-5 text-forest-700" />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-glass overflow-hidden z-50 animate-scale-in origin-top-right">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-beige">
                      <p className="text-sm font-semibold text-forest-700 truncate">{user?.full_name}</p>
                      <p className="text-xs text-brown-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/account/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-pista-50 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-pista-50 transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link to="/account/addresses" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-pista-50 transition-colors">
                      <MapPin className="w-4 h-4" /> Addresses
                    </Link>
                    {user?.is_admin && (
                      <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-pista-700 hover:bg-pista-50 transition-colors font-medium">
                        <Leaf className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-beige">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-pista-50 transition-colors">
                      <LogIn className="w-4 h-4" /> Log In
                    </Link>
                    <Link to="/register" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-pista-50 transition-colors">
                      <User className="w-4 h-4" /> Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6 text-forest-700" /> : <Menu className="w-6 h-6 text-forest-700" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="md:hidden px-4 pb-3 animate-fade-up">
          <SearchBar autoFocus onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {menuOpen && (
        <div className="lg:hidden px-4 pb-4 flex flex-col gap-3 font-body text-sm text-forest-700 animate-fade-up">
          {categories.map((c) => (
            <NavLink key={c.id} to={`/products?category=${c.slug}`} onClick={() => setMenuOpen(false)}>{c.name}</NavLink>
          ))}
          <div className="border-t border-beige my-1" />
          <NavLink to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</NavLink>
          <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist ({wishlistCount})</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/account/profile" onClick={() => setMenuOpen(false)}>My Account</NavLink>
              <NavLink to="/orders" onClick={() => setMenuOpen(false)}>My Orders</NavLink>
              <NavLink to="/account/addresses" onClick={() => setMenuOpen(false)}>Addresses</NavLink>
              {user?.is_admin && <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="font-semibold text-pista-700">Admin Dashboard</NavLink>}
              <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="text-left text-red-600 font-medium">Log Out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)}>Log In</NavLink>
              <NavLink to="/register" onClick={() => setMenuOpen(false)}>Create Account</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
