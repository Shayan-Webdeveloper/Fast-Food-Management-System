import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Star,
  Truck,
} from "lucide-react";
import { Button } from "../components/ui";
import { RESTAURANT } from "../config/resturant";

export default function Landing() {
  return (
    <>
      <section className="overflow-hidden bg-surface-900 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10 lg:grid-cols-2 lg:gap-12">
          <div
            className="order-2 md:order-1"
            data-gsap-in
            data-gsap-x="-180"
            data-gsap-y="-140"
            data-gsap-rotate="-18"
            data-gsap-scale="0.8"
            data-gsap-duration="1.6"
            data-gsap-ease="elastic.out(1,0.45)"
            data-gsap-start="top 80%"
          >
            <p className="mb-5 inline-flex rounded-full bg-brand-500/20 px-3 py-1.5 text-sm font-semibold text-brand-200">
              {RESTAURANT.tagline}
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-[.94] tracking-tight sm:text-6xl lg:text-7xl">
              {RESTAURANT.heroHeadingLine1}
              <br />
              <span className="text-brand-300">{RESTAURANT.heroHeadingLine2} {RESTAURANT.heroHeadingLine3}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-orange-100/75">
              {RESTAURANT.heroSubtext}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/menu">
                <Button
                  size="lg"
                  className="w-full rounded-full px-7 sm:w-auto"
                >
                  Order now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#story">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full rounded-full border border-white/20 px-7 text-white hover:bg-white/10 sm:w-auto"
                >
                  Our story
                </Button>
              </a>
            </div>
            <div className="mt-10 flex flex-col gap-3 text-sm text-orange-100/70 sm:flex-row sm:gap-6">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-brand-300" fill="currentColor" />
                4.9 rating
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-brand-300" />
                20–35 min
              </span>
            </div>
          </div>
          <div
            className="order-1 relative mx-auto w-full max-w-md md:order-2 md:max-w-none"
            data-gsap-in
            data-gsap-x="180"
            data-gsap-y="140"
            data-gsap-rotate="18"
            data-gsap-scale="0.82"
            data-gsap-duration="1.7"
            data-gsap-ease="back.out(1.8)"
            data-gsap-start="top 80%"
          >
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85"
              alt="Fresh cheeseburger and fries"
              className="relative aspect-square w-full rounded-[3rem] object-cover shadow-2xl"
            />
            <span className="absolute -bottom-4 -left-4 rotate-[-8deg] rounded-2xl bg-[#f5c968] px-4 py-3 text-sm font-black text-surface-900 shadow-lg">
              MADE FRESH
              <br />
              EVERY DAY
            </span>
          </div>
        </div>
      </section>
      <section
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div
          className="grid gap-5 md:grid-cols-3"
          data-gsap-in
          data-gsap-y="140"
          data-gsap-scale="0.72"
          data-gsap-rotate="-8"
          data-gsap-duration="1.3"
          data-gsap-ease="power4.out"
        >
          <div
            data-gsap-in
            data-gsap-delay="0.05"
            data-gsap-x="-120"
            data-gsap-y="180"
            data-gsap-rotate="-16"
            data-gsap-scale="0.78"
            data-gsap-duration="1.25"
            data-gsap-ease="back.out(1.4)"
          >
            <Feature
              icon={<Truck />}
              title="Fast delivery"
              text="Hot food at your door, when you want it."
            />
          </div>
          <div
            data-gsap-in
            data-gsap-delay="0.12"
            data-gsap-x="120"
            data-gsap-y="180"
            data-gsap-rotate="16"
            data-gsap-scale="0.78"
            data-gsap-duration="1.3"
            data-gsap-ease="expo.out"
          >
            <Feature
              icon={<Star />}
              title="Made with care"
              text="Good ingredients and zero shortcuts."
            />
          </div>
          <div
            data-gsap-in
            data-gsap-delay="0.2"
            data-gsap-y="220"
            data-gsap-rotate="-12"
            data-gsap-scale="0.74"
            data-gsap-duration="1.35"
            data-gsap-ease="elastic.out(1,0.55)"
          >
            <Feature
              icon={<MapPin />}
              title="Easy pickup"
              text="Order ahead and skip the queue."
            />
          </div>
        </div>
      </section>
      <section
        className="border-y border-[#f1dfcc] bg-brand-50 px-4 py-6 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center text-sm font-black text-brand-800"
          data-gsap-in
          data-gsap-y="90"
          data-gsap-rotate="3"
          data-gsap-duration="1.1"
        >
          <span>FREE DELIVERY OVER $20</span>
          <span className="hidden text-brand-300 sm:block">✦</span>
          <span>FRESHLY COOKED TO ORDER</span>
          <span className="hidden text-brand-300 sm:block">✦</span>
          <span>OPEN 7 DAYS A WEEK</span>
        </div>
      </section>
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div
          className="text-center"
          data-gsap-in
          data-gsap-x="-80"
          data-gsap-y="120"
          data-gsap-scale="0.75"
          data-gsap-rotate="-10"
          data-gsap-duration="1.25"
          data-gsap-ease="power3.out"
        >
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
            Something for every craving
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight">
            Browse by category.
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            data-gsap-in
            data-gsap-delay="0.05"
            data-gsap-x="-140"
            data-gsap-y="180"
            data-gsap-rotate="-18"
            data-gsap-scale="0.8"
            data-gsap-duration="1.2"
            data-gsap-ease="back.out(1.6)"
          >
            <Category
              image="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80"
              name="Burgers"
            />
          </div>
          <div
            data-gsap-in
            data-gsap-delay="0.1"
            data-gsap-x="140"
            data-gsap-y="180"
            data-gsap-rotate="18"
            data-gsap-scale="0.8"
            data-gsap-duration="1.25"
            data-gsap-ease="back.out(1.6)"
          >
            <Category
              image="https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80"
              name="Chicken"
            />
          </div>
          <div
            data-gsap-in
            data-gsap-delay="0.15"
            data-gsap-x="-140"
            data-gsap-y="200"
            data-gsap-rotate="-20"
            data-gsap-scale="0.78"
            data-gsap-duration="1.3"
            data-gsap-ease="expo.out"
          >
            <Category
              image="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
              name="Pizza"
            />
          </div>
          <div
            data-gsap-in
            data-gsap-delay="0.2"
            data-gsap-x="140"
            data-gsap-y="200"
            data-gsap-rotate="20"
            data-gsap-scale="0.78"
            data-gsap-duration="1.35"
            data-gsap-ease="elastic.out(1,0.5)"
          >
            <Category
              image="https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80"
              name="Shakes"
            />
          </div>
        </div>
      </section>
      <section
        className="bg-[#fff4e7] px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div
          className="mx-auto max-w-6xl"
          data-gsap-in
          data-gsap-x="-140"
          data-gsap-y="120"
          data-gsap-skew="-16"
          data-gsap-scale="0.72"
          data-gsap-rotate="-10"
          data-gsap-duration="1.35"
          data-gsap-ease="power3.out"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
                Our favourites
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-surface-900">
                The crowd-pleasers.
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
            >
              See full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FoodCard
              image="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=85"
              name="The House Smash"
              detail="Double beef · cheddar · house sauce"
              price="$8.99"
            />
            <FoodCard
              image="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=85"
              name="Loaded Fries"
              detail="Cheese sauce · jalapeños · seasoning"
              price="$4.99"
            />
            <FoodCard
              image="https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=85"
              name="Chocolate Shake"
              detail="Rich, cold and extra creamy"
              price="$3.99"
            />
          </div>
        </div>
      </section>
      <section
        className="bg-surface-900 px-4 py-20 text-white sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div
            data-gsap-in
            data-gsap-x="-150"
            data-gsap-y="120"
            data-gsap-rotate="-12"
            data-gsap-scale="0.78"
            data-gsap-duration="1.4"
            data-gsap-ease="back.out(1.3)"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-300">
                Your food, your way
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Sit in, pick up, or get it delivered.
              </h2>
              <p className="mt-5 max-w-lg leading-7 text-orange-100/70">
                However you’re hungry, we make ordering simple. Choose your
                favourites online, then let us take it from there.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Order from the full menu in a few taps",
                  "Track every order from confirmation to kitchen",
                  "Freshly prepared as soon as you order",
                ].map((text) => (
                  <p
                    key={text}
                    className="flex items-center gap-3 text-sm font-semibold"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500">
                      <Check className="h-4 w-4" />
                    </span>
                    {text}
                  </p>
                ))}
              </div>
              <Link to="/menu" className="mt-9 inline-block">
                <Button size="lg" className="rounded-full">
                  Start your order <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1000&q=85"
            alt="Friends enjoying food together"
            className="h-full min-h-80 w-full rounded-[2.5rem] object-cover"
            data-gsap-in
            data-gsap-x="150"
            data-gsap-y="120"
            data-gsap-rotate="12"
            data-gsap-scale="0.78"
            data-gsap-duration="1.45"
            data-gsap-ease="back.out(1.3)"
          />
        </div>
      </section>
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
          data-gsap-in
          data-gsap-x="-100"
          data-gsap-y="160"
          data-gsap-scale="0.74"
          data-gsap-skew="10"
          data-gsap-rotate="-8"
          data-gsap-duration="1.3"
          data-gsap-ease="power2.out"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
              Simple from start to finish
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">
              Three steps to a great meal.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-stone-600">
              No complicated forms and no waiting on hold. Choose, order, and
              enjoy.
            </p>
          </div>
          <div
            className="grid gap-5 sm:grid-cols-3"
            data-gsap-in
            data-gsap-x="120"
            data-gsap-y="140"
            data-gsap-rotate="10"
            data-gsap-scale="0.82"
            data-gsap-duration="1.35"
            data-gsap-ease="circ.out"
          >
            <Step
              number="01"
              title="Pick your food"
              text="Browse 100+ items, meals and treats."
            />
            <Step
              number="02"
              title="Place your order"
              text="Choose delivery or easy pickup."
            />
            <Step
              number="03"
              title="Enjoy it"
              text="We cook it fresh and send it your way."
            />
          </div>
        </div>
      </section>
      <section
        className="bg-[#fff4e7] px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1100&q=85"
            alt="Fresh ingredients prepared in a kitchen"
            className="aspect-[4/3] w-full rounded-[2.5rem] object-cover"
            data-gsap-in
            data-gsap-x="-180"
            data-gsap-y="140"
            data-gsap-rotate="-16"
            data-gsap-scale="0.78"
            data-gsap-duration="1.4"
            data-gsap-ease="back.out(1.4)"
          />
          <div
            data-gsap-in
            data-gsap-x="180"
            data-gsap-y="140"
            data-gsap-rotate="16"
            data-gsap-scale="0.78"
            data-gsap-duration="1.4"
            data-gsap-ease="back.out(1.4)"
          >
            <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
              Our promise
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">
              Good ingredients make better food.
            </h2>
            <p className="mt-5 leading-7 text-stone-600">
              We keep it honest: quality produce, carefully sourced meat, and
              sauces made for maximum flavour. Every order starts in our
              kitchen, not a freezer.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Fresh ingredients daily",
                "Cooked after you order",
                "Generous portions",
                "Friendly local service",
              ].map((text) => (
                <p
                  key={text}
                  className="flex items-center gap-2 text-sm font-bold"
                >
                  <Check className="h-4 w-4 text-brand-600" />
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-800 px-7 py-14 text-white sm:px-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div
              data-gsap-in
              data-gsap-y="120"
              data-gsap-scale="0.7"
              data-gsap-skew="12"
              data-gsap-rotate="-8"
              data-gsap-duration="1.25"
              data-gsap-ease="expo.out"
            >
              <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-200">
                This week only
              </p>
              <h2 className="mt-3 text-4xl font-black">
                Burger night just got better.
              </h2>
              <p className="mt-3 max-w-xl text-brand-100">
                Get two Classic Smash Burgers and two fries for $18 every
                Tuesday. Bring your appetite.
              </p>
            </div>
            <Link to="/menu">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-7"
              >
                See the deal <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section
        id="story"
        className="bg-[#f4e7d8] px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <img
            src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=85"
            alt="Freshly prepared fries"
            className="aspect-square max-w-md rounded-[2.5rem] object-cover shadow-sm"
            data-gsap-in
            data-gsap-x="-200"
            data-gsap-y="160"
            data-gsap-rotate="-20"
            data-gsap-scale="0.75"
            data-gsap-duration="1.4"
            data-gsap-ease="power4.out"
          />
          <div
            data-gsap-in
            data-gsap-x="200"
            data-gsap-y="160"
            data-gsap-rotate="20"
            data-gsap-scale="0.75"
            data-gsap-duration="1.4"
            data-gsap-ease="power4.out"
          >
            <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
              Our kitchen
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-surface-900">
              Comfort food, done properly.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-stone-600">
              We believe the best meals are simple: quality ingredients, serious
              flavour, and food that brings people together. That’s what we
              make, every single day.
            </p>
            <Link to="/menu" className="mt-7 inline-block">
              <Button className="rounded-full">
                Explore the menu <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div
          className="text-center"
          data-gsap-in
          data-gsap-y="120"
          data-gsap-skew="12"
          data-gsap-scale="0.7"
          data-gsap-duration="1.2"
          data-gsap-ease="power2.out"
        >
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
            Loved locally
          </p>
          <h2 className="mt-2 text-4xl font-black">What people are saying.</h2>
        </div>
        <div
          className="mt-10 grid gap-5 md:grid-cols-3"
          data-gsap-in
          data-gsap-y="140"
          data-gsap-skew="-12"
          data-gsap-rotate="-8"
          data-gsap-scale="0.76"
          data-gsap-duration="1.3"
          data-gsap-ease="elastic.out(1,0.4)"
        >
          <Quote
            text="The burger was honestly one of the best I’ve had in the city. It arrived hot, too."
            name="Ayesha K."
          />
          <Quote
            text="Fast delivery, generous portions and the loaded fries are incredible."
            name="Hamza R."
          />
          <Quote
            text="Our go-to for a relaxed family dinner. Always fresh and reliable."
            name="Sana M."
          />
        </div>
      </section>
      <section
        className="bg-surface-900 px-4 py-20 text-white sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div
            data-gsap-in
            data-gsap-x="-180"
            data-gsap-y="120"
            data-gsap-rotate="-12"
            data-gsap-scale="0.78"
            data-gsap-duration="1.35"
            data-gsap-ease="back.out(1.3)"
          >
            <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-300">
              Questions, answered
            </p>
            <h2 className="mt-3 text-4xl font-black">
              A few things you may want to know.
            </h2>
            <p className="mt-4 max-w-md text-orange-100/70">
              If you are unsure about anything, give us a call. We are always
              happy to help.
            </p>
          </div>
          <div
            className="space-y-3"
            data-gsap-in
            data-gsap-x="180"
            data-gsap-y="120"
            data-gsap-rotate="12"
            data-gsap-scale="0.78"
            data-gsap-duration="1.35"
            data-gsap-ease="back.out(1.3)"
          >
            <Faq
              question="When will my food arrive?"
              answer="We normally deliver within 20–35 minutes. On a busy Friday evening it can take a little longer, but we will always make your food fresh."
            />
            <Faq
              question="Can I make changes to my meal?"
              answer="Of course. Leave a note at checkout and we will do our best to make it exactly how you like it."
            />
            <Faq
              question="Can you help with a big order?"
              answer="Yes. For office lunches, birthdays, or family get-togethers, call us and we will help you put together a proper spread."
            />
            <Faq
              question="What if I have an allergy?"
              answer="Please call the restaurant before you order. Our team can talk through ingredients and help you choose safely."
            />
          </div>
        </div>
      </section>
      <section
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
        data-gsap-scroll
      >
        <div
          className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          data-gsap-in
          data-gsap-x="-120"
          data-gsap-y="100"
          data-gsap-scale="0.75"
          data-gsap-rotate="-10"
          data-gsap-duration="1.2"
          data-gsap-ease="power3.out"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">
              Follow along
            </p>
            <h2 className="mt-2 text-4xl font-black">
              Fresh from our kitchen.
            </h2>
          </div>
          <p className="font-bold text-brand-600">{RESTAURANT.socialHandle}</p>
        </div>
        <div
          className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"
          data-gsap-in
          data-gsap-y="140"
          data-gsap-scale="0.72"
          data-gsap-rotate="-8"
          data-gsap-duration="1.3"
          data-gsap-ease="expo.out"
        >
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
            alt="Burger"
            className="aspect-square rounded-2xl object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
            alt="Fries"
            className="aspect-square rounded-2xl object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
            alt="Pizza"
            className="aspect-square rounded-2xl object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80"
            alt="Shake"
            className="aspect-square rounded-2xl object-cover"
          />
        </div>
      </section>
      <section className="px-4 pb-20 sm:px-6 lg:px-8" data-gsap-scroll>
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-brand-500 px-7 py-14 text-white sm:px-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div
              data-gsap-in
              data-gsap-y="90"
              data-gsap-rotate="2"
              data-gsap-duration="1.1"
            >
              <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-100">
                Come say hello
              </p>
              <h2 className="mt-3 text-4xl font-black">
                Your next good meal is waiting.
              </h2>
              <p className="mt-4 max-w-lg text-brand-100">
                {RESTAURANT.address.line1}, {RESTAURANT.address.line2.split(',')[0]} · Open daily from {RESTAURANT.hours.time}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/menu">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-7"
                >
                  Order online
                </Button>
              </Link>
              <a href={`tel:${RESTAURANT.phone}`}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full border border-white/40 px-7 text-white hover:bg-white/10"
                >
                  Call the restaurant
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-[#eadfd2] bg-white p-6">
      <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="font-bold text-surface-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-500">{text}</p>
    </div>
  );
}
function FoodCard({ image, name, detail, price }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <img
        src={image}
        alt={name}
        className="aspect-[4/3] w-full object-cover"
      />
      <div className="p-5">
        <div className="flex justify-between gap-3">
          <h3 className="text-lg font-black">{name}</h3>
          <span className="font-black text-brand-600">{price}</span>
        </div>
        <p className="mt-1 text-sm text-stone-500">{detail}</p>
      </div>
    </article>
  );
}
function Quote({ text, name }) {
  return (
    <figure className="rounded-2xl border border-[#eadfd2] bg-white p-6">
      <div className="flex text-brand-500">★★★★★</div>
      <blockquote className="mt-4 leading-7 text-stone-600">
        “{text}”
      </blockquote>
      <figcaption className="mt-5 text-sm font-black text-surface-900">
        {name}
      </figcaption>
    </figure>
  );
}
function Category({ image, name }) {
  return (
    <Link
      to="/menu"
      className="group relative overflow-hidden rounded-2xl bg-surface-900"
    >
      <img
        src={image}
        alt={name}
        className="aspect-square w-full object-cover opacity-75 transition duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 px-4 py-4 text-lg font-black text-white">
        {name}
      </span>
    </Link>
  );
}
function Step({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-[#eadfd2] bg-white p-5">
      <p className="text-2xl font-black text-brand-500">{number}</p>
      <h3 className="mt-6 font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-500">{text}</p>
    </div>
  );
}
function Faq({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-xl border transition-colors duration-300 ${open ? "border-brand-400/60 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/[0.07]"}`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-bold"
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-brand-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 pr-10 text-sm leading-6 text-orange-100/75">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
