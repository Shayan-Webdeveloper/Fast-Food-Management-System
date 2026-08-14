import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingBag, Search, SlidersHorizontal, X } from "lucide-react";
import { useData } from "../context/DataContext";
import { Button } from "../components/ui";
import { foodImage } from "../utils/foodImages";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRevealAnimation } from "../hooks/useRevealAnimation";
import { CustomSelect } from "../components/ui/CustomSelect";

export default function MenuPage() {
  const { menu, cart, cartTotal, addToCart } = useData();
  const [categories_selected, setCategoriesSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [revealed, setRevealed] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (mobileFiltersOpen) {
      const timer = requestAnimationFrame(() => setDrawerVisible(true));
      return () => cancelAnimationFrame(timer);
    } else {
      setDrawerVisible(false);
    }
  }, [mobileFiltersOpen]);
  const pageRef = useRevealAnimation(!!menu);
  const categories = [...new Set(menu.map((item) => item.category))];
  let items =
    categories_selected.length === 0
      ? menu
      : menu.filter((item) => categories_selected.includes(item.category));
  items = items.filter((item) =>
    `${item.name} ${item.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  if (minPrice !== "")
    items = items.filter((item) => Number(item.price) >= Number(minPrice));
  if (maxPrice !== "")
    items = items.filter((item) => Number(item.price) <= Number(maxPrice));
  if (popularOnly) items = items.filter((item) => item.popular);
  if (sort === "price-low") items.sort((a, b) => a.price - b.price);
  if (sort === "price-high") items.sort((a, b) => b.price - a.price);

  useEffect(() => {
    if (items.length) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [items]);

  useEffect(() => {
    if (items.length && !revealed) {
      const timer = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(timer);
    }
  }, [items.length, revealed]);

  const FilterSidebarContent = () => (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the menu"
          className="w-full rounded-xl border border-[#e5d6c6] bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-all duration-200 focus:border-brand-500 focus:shadow-md focus:shadow-brand-500/10"
        />
      </div>

      <CustomSelect
        value={sort}
        onChange={setSort}
        options={[
          { value: "featured", label: "Featured" },
          { value: "price-low", label: "Price: low to high" },
          { value: "price-high", label: "Price: high to low" },
        ]}
        className="mt-3 w-full"
      />

      {(minPrice !== "" ||
        maxPrice !== "" ||
        popularOnly ||
        categories_selected.length > 0 ||
        search !== "") && (
        <div className="mt-6 border-t border-[#eadfd2] pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
            Active filters
          </p>
          <div className="flex flex-wrap gap-2">
            {search !== "" && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                "{search}"
                <button
                  onClick={() => setSearch("")}
                  className="cursor-pointer hover:text-brand-900"
                >
                  ✕
                </button>
              </span>
            )}
            {categories_selected.map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700"
              >
                {cat}
                <button
                  onClick={() =>
                    setCategoriesSelected((current) =>
                      current.filter((c) => c !== cat),
                    )
                  }
                  className="cursor-pointer hover:text-brand-900"
                >
                  ✕
                </button>
              </span>
            ))}
            {minPrice !== "" && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                Min ${minPrice}
                <button
                  onClick={() => setMinPrice("")}
                  className="cursor-pointer hover:text-brand-900"
                >
                  ✕
                </button>
              </span>
            )}
            {maxPrice !== "" && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                Max ${maxPrice}
                <button
                  onClick={() => setMaxPrice("")}
                  className="cursor-pointer hover:text-brand-900"
                >
                  ✕
                </button>
              </span>
            )}
            {popularOnly && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                Popular only
                <button
                  onClick={() => setPopularOnly(false)}
                  className="cursor-pointer hover:text-brand-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              setPopularOnly(false);
              setCategoriesSelected([]);
              setSearch("");
            }}
            className="mt-3 w-full cursor-pointer rounded-xl border border-[#e5d6c6] py-2 text-sm font-bold text-stone-600 dark:text-slate-300 transition-colors hover:!bg-brand-500 hover:!text-white"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-[#eadfd2] pt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
          Price range
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded-xl border border-[#e5d6c6] bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <span className="text-stone-400">–</span>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full rounded-xl border border-[#e5d6c6] bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-[#eadfd2] pt-5">
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm font-bold text-stone-700">Popular only</span>
          <input
            type="checkbox"
            checked={popularOnly}
            onChange={(e) => setPopularOnly(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-500 focus:ring-brand-500"
          />
        </label>
      </div>

      <div className="mt-6 border-t border-[#eadfd2] pt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
          Categories
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setCategoriesSelected([])}
            className={`flex w-full items-center justify-between whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-bold transition cursor-pointer ${
              categories_selected.length === 0
                ? "!bg-brand-500 !text-white"
                : "border border-transparent text-stone-700 dark:text-slate-300 hover:!bg-brand-500 hover:!text-white"
            }`}
          >
            All
            {categories_selected.length === 0 && <span>✓</span>}
          </button>
          {categories.map((item) => {
            const isSelected = categories_selected.includes(item);
            return (
              <button
                key={item}
                onClick={() =>
                  setCategoriesSelected((current) =>
                    isSelected
                      ? current.filter((c) => c !== item)
                      : [...current, item],
                  )
                }
                className={`flex w-full items-center justify-between whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-bold transition cursor-pointer ${
                  isSelected
                    ? "!bg-brand-500 !text-white"
                    : "border border-transparent text-stone-700 dark:text-slate-300 hover:!bg-brand-500 hover:!text-white"
                }`}
              >
                {item}
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div ref={pageRef} className="mx-auto max-w-7xl px-4 py-12 menu-page-root">
      <div data-gsap-in="zoom-flip" className="max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
          Made to order
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          The menu
        </h1>
        <p className="mt-3 text-stone-600">
          Pick your favourites, we’ll take care of the rest.
        </p>
      </div>

      <div className="mt-6 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e5d6c6] bg-white py-2.5 text-sm font-bold text-stone-700"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters{" "}
          {(categories_selected.length > 0 ||
            minPrice !== "" ||
            maxPrice !== "" ||
            popularOnly) &&
            `(${categories_selected.length + (minPrice !== "" ? 1 : 0) + (maxPrice !== "" ? 1 : 0) + (popularOnly ? 1 : 0)})`}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawerVisible ? "opacity-100" : "opacity-0"}`}
              onClick={() => {
                setDrawerVisible(false);
                setTimeout(() => setMobileFiltersOpen(false), 300);
              }}
            />
            <div
              className={`absolute inset-y-0 left-0 w-full max-w-xs overflow-y-auto bg-white transition-transform duration-300 ease-out ${drawerVisible ? "translate-x-0" : "-translate-x-full"}`}
            >
              <div className="flex items-center justify-between border-b border-[#eadfd2] p-4">
                <p className="font-bold text-stone-900">Filters</p>
                <button
                  onClick={() => {
                    setDrawerVisible(false);
                    setTimeout(() => setMobileFiltersOpen(false), 300);
                  }}
                  className="cursor-pointer text-stone-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                <FilterSidebarContent />
              </div>
            </div>
          </div>
        )}

        <aside
          data-gsap-in="slide-left"
          className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-[#eadfd2] bg-white shadow-sm"
        >
          <div className="p-5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <FilterSidebarContent />
          </div>
        </aside>

        {/* Items grid */}
        <div>
          <div className="mt-1 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className={`menu-card overflow-hidden rounded-3xl border border-[#eadfd2] bg-white shadow-sm transition-all duration-700 ${
                  revealed
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 -translate-x-10 scale-95"
                }`}
              >
                <Link to={`/menu/${item.id}`}>
                  <img
                    src={item.image_url || foodImage(item)}
                    alt={item.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </Link>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/menu/${item.id}`}>
                      <h2 className="text-lg font-black text-surface-900 hover:text-brand-600">
                        {item.name}
                      </h2>
                    </Link>
                    <span className="whitespace-nowrap font-black text-brand-600">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-stone-500">
                    {item.description}
                  </p>
                  <Button
                    className="mt-5 w-full rounded-full"
                    onClick={() => addToCart(item)}
                  >
                    <Plus className="h-4 w-4" />
                    Add to order
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {!items.length && (
            <div className="py-20 text-center">
              <p className="text-4xl">🍽️</p>
              <h2 className="mt-4 text-xl font-black">
                Nothing matched that search
              </h2>
              <p className="mt-2 text-stone-500">
                Try another category or search term.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto flex max-w-lg items-center justify-between rounded-2xl bg-surface-900 p-3 pl-5 text-white shadow-xl">
        <div>
          <p className="text-xs text-orange-100/70">
            {cart.reduce((total, item) => total + item.qty, 0)} items in your
            order
          </p>
          <p className="font-black">${cartTotal.toFixed(2)}</p>
        </div>
        <Link to="/checkout">
          <Button className="rounded-xl">
            <ShoppingBag className="h-4 w-4" />
            View order
          </Button>
        </Link>
      </div>
    </div>
  );
}
