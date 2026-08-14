import { Link } from 'react-router-dom'
import { RESTAURANT } from '../config/resturant'

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 !text-slate-900 dark:!text-slate-100">
      <Link to="/" className="text-sm font-bold text-brand-600 hover:text-brand-700">← Back to home</Link>
      <h1 className="mt-4 text-3xl font-black !text-slate-900 dark:!text-slate-100">Privacy Policy</h1>
      <p className="mt-2 text-sm !text-slate-600 dark:!text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 text-sm leading-7 !text-slate-700 dark:!text-slate-300">
        <p>
          {RESTAURANT.name} ("we", "us", "our") operates this website and ordering platform.
          This page explains what information we collect, how we use it, and the choices you have.
        </p>

        <section>
          <h2 className="text-lg font-bold !text-slate-900 dark:!text-slate-100">Information we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account information: your name and email address when you register.</li>
            <li>Order information: items ordered, delivery name, phone number, and delivery address.</li>
            <li>Usage information: pages you visit and actions you take on this site.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold !text-slate-900 dark:!text-slate-100">How we use your information</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To process and deliver your orders.</li>
            <li>To send you order confirmations and account-related emails.</li>
            <li>To improve our menu, service, and website.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold !text-slate-900 dark:!text-slate-100">How we store your information</h2>
          <p className="mt-2">
            Your data is stored securely using Supabase, a third-party database provider. We use
            access controls (Row Level Security) so that only you and authorized staff can see
            your order and account details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold !text-slate-900 dark:!text-slate-100">Sharing your information</h2>
          <p className="mt-2">
            We do not sell your personal information. We only share order details (like your name,
            phone, and address) internally with our own staff, so they can prepare and deliver your order.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold !text-slate-900 dark:!text-slate-100">Your choices</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You can update your name and notification preferences from your account settings.</li>
            <li>You can request that we delete your account by contacting us directly.</li>
            <li>You can opt out of marketing emails from your notification settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold !text-slate-900 dark:!text-slate-100">Contact us</h2>
          <p className="mt-2">
            If you have questions about this policy or your data, contact us at{' '}
            <a href={`tel:${RESTAURANT.phone}`} className="font-semibold text-brand-600 dark:text-brand-400">{RESTAURANT.phone}</a>{' '}
            or visit us at {RESTAURANT.address.line1}, {RESTAURANT.address.line2}.
          </p>
        </section>
      </div>
    </div>
  )
}