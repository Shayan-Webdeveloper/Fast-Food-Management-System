import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Card, Button, Input, Badge } from '../../components/ui'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile({
      name: form.name,
      email: form.email,
      avatar: form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-slate-500">Manage your personal information</p>

      <div className="mt-6 max-w-lg">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
              {user?.avatar}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <Badge variant="brand" className="capitalize mt-1">{user?.role}</Badge>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Member since <span className="font-medium text-slate-700">{user?.joinedAt}</span></p>
            </div>
            <Button type="submit">{saved ? 'Saved!' : 'Update Profile'}</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
