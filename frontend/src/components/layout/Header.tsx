import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Leaf, Menu, X } from "lucide-react";
import clsx from "clsx";
import SearchBar from "@/components/common/SearchBar";
import { CATEGORIES } from "@/data/products";
import { CART_ITEMS, WISHLIST_ITEMS } from "@/data/misc";

/**
 * Premium sticky header: logo, category nav, search bar, and account/
 * cart/wishlist icons with live badge counts from dummy data.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = CART_ITEMS.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistCount = WISHLIST_ITEMS.length;

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
          {CATEGORIES.slice(0, 4).map((c) => (
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

          <button onClick={() => navigate("/account/profile")} className="p-2 hidden sm:block" aria-label="Account">
            <User className="w-5 h-5 text-forest-700" />
          </button>

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
          {CATEGORIES.map((c) => (
            <NavLink key={c.id} to={`/products?category=${c.slug}`} onClick={() => setMenuOpen(false)}>{c.name}</NavLink>
          ))}
          <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist ({wishlistCount})</NavLink>
          <NavLink to="/account/profile" onClick={() => setMenuOpen(false)}>My Account</NavLink>
        </div>
      )}
    </header>
  );
}
