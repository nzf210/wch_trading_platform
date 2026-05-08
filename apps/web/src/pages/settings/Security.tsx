import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function Security() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <section id="security-page" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account security, password, and two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-200">Change Password</h3>
            <form className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
              />
              <Button type="submit" disabled>
                Update Password
              </Button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="space-y-4 rounded-2xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-200">Two-Factor Authentication</h3>
                <p className="mt-1 text-xs text-slate-500">Add an extra layer of security to your account</p>
              </div>
              <Badge tone="neutral">Disabled</Badge>
            </div>
            <Button disabled>Enable 2FA (Coming Soon)</Button>
          </div>

          {/* Active Sessions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-200">Active Sessions</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3">
                <div>
                  <p className="font-medium text-white">Current Session</p>
                  <p className="text-xs text-slate-500">Active now</p>
                </div>
                <Badge tone="success">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
