import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function Profile() {
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  return (
    <section id="profile-page" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-lg font-semibold text-cyan-400">
                {user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
              <Badge tone={user?.role === 'admin' ? 'warning' : 'info'}>{user?.role ?? 'user'}</Badge>
            </div>
          </div>

          <form className="space-y-4">
            <Input
              label="Display Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              disabled
              hint="Email cannot be changed"
            />
            <div className="flex gap-3">
              <Button type="submit" disabled>
                Save Changes
              </Button>
              <Button type="button" variant="ghost" disabled>
                Coming Soon
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
