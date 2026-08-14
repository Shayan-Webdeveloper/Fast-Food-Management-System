import { Link } from 'react-router-dom'
import { RESTAURANT } from '../config/resturant'

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link to="/" className="text-sm font-bold text-brand-600 hover:text-brand-700">← Back to home</Link>
      <h1 className="mt-4 text-3xl font-black">Terms of Service</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-stone-700">
        <p>
          By using this website and placing an order with {RESTAURANT.name}, you agree to the
          following terms.
        </p>

        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">Orders</h2>
          <p className="mt-2">
            All orders are subject to availability. Prices shown are current at the time of
            ordering and may change without notice. We reserve the right to cancel an order if
            an item becomes unavailable or if we're unable to fulfil the delivery details provided.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">Payment</h2>
          <p className="mt-2">
            We accept card and cash payment on delivery. You are responsible for providing accurate
            delivery information at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">Delivery</h2>
          <p className="mt-2">
            Delivery times are estimates and may vary due to demand, weather, or other factors
            outside our control. We are not liable for delays beyond our reasonable control.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">Accounts</h2>
          <p className="mt-2">
            You are responsible for keeping your account credentials secure. Notify us immediately
            if you suspect unauthorized access to your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">Cancellations and refunds</h2>
          <p className="mt-2">
            If there's an issue with your order, please contact us directly and we'll work with you
            to resolve it, which may include a replacement or refund at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of our service after changes
            means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100">Contact us</h2>
          <p className="mt-2">
            Questions about these terms? Contact us at{' '}
            <a href={`tel:${RESTAURANT.phone}`} className="font-semibold text-brand-600">{RESTAURANT.phone}</a>{' '}
            or visit us at {RESTAURANT.address.line1}, {RESTAURANT.address.line2}.
          </p>
        </section>
      </div>
    </div>
  )
}

