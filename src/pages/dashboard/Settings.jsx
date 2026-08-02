import { useState } from 'react'
import { Bell, Shield, Store, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Card, Button, Input, Badge } from '../../components/ui'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { useRevealAnimation } from '../../hooks/useRevealAnimation'

export default function Settings() {
  const { user, updateProfile, createStaffAccount, isAdmin } = useAuth()
  const pageRef = useRevealAnimation(!!user)
  const [restaurantName, setRestaurantName] = useState(user?.restaurant || 'FoodHub Downtown')
  const [notifications, setNotifications] = useState({ orders: true, marketing: false, reports: true })
  const [saved, setSaved] = useState(false)
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'manager' })
  const [staffMessage, setStaffMessage] = useState('')

  const handleSave = () => {
    updateProfile({ restaurant: restaurantName })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    setStaffMessage('')
    const result = await createStaffAccount(staffForm)
    if (result.success) {
      setStaffMessage(result.message)
      setStaffForm({ name: '', email: '', password: '', role: 'manager' })
    } else {
      setStaffMessage(result.error)
    }
  }

  return (
    <div ref={pageRef}>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-slate-500">Manage your account and restaurant preferences</p>

      <div className="mt-6 space-y-6 max-w-2xl">
        <Card data-gsap-in="slide-left">
          <div className="flex items-center gap-3 mb-4">
            <Store className="h-5 w-5 text-brand-500" />
            <h3 className="font-semibold text-slate-900">Restaurant Settings</h3>
          </div>
          <Input
            label="Restaurant Name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
          />
          <div className="mt-4">
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Changes'}</Button>
          </div>
        </Card>

        <Card data-gsap-in="slide-right">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-brand-500" />
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: 'orders', label: 'New order alerts', desc: 'Get notified when a new order comes in' },
              { key: 'marketing', label: 'Marketing emails', desc: 'Receive tips and promotional content' },
              { key: 'reports', label: 'Weekly reports', desc: 'Get weekly analytics summary via email' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="group flex items-center justify-between rounded-lg border border-slate-100 p-3 cursor-pointer hover:bg-brand-50">
                <div>
                  <p className="text-sm font-medium group-hover:!text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 group-hover:!text-slate-600">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card data-gsap-in="blur">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-brand-500" />
            <h3 className="font-semibold text-slate-900">Account & Security</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-600">Role</span>
              <Badge variant="brand" className="capitalize">{user?.role}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-600">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-600">Member since</span>
              <span className="font-medium">{user?.joinedAt}</span>
            </div>
          </div>
        </Card>

        {isAdmin && (
          <Card data-gsap-in="zoom-flip">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold text-slate-900">Create Staff Account</h3>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <Input label="Full Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required />
              <Input label="Email" type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
              <Input label="Temporary Password" type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <CustomSelect
                  value={staffForm.role}
                  onChange={(value) => setStaffForm({ ...staffForm, role: value })}
                  options={[
                    { value: 'manager', label: 'Manager' },
                    { value: 'staff', label: 'Staff' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                  className="w-full"
                />
              </div>
              {staffMessage && <p className={`rounded-lg px-3 py-2 text-sm ${staffMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{staffMessage}</p>}
              <Button type="submit">Create account</Button>
            </form>
          </Card>
        )}

        
      </div>
    </div>
  )
}
