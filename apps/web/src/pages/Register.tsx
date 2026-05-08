import { useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Creates a user and stores the issued token in the same auth contract as login.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            register.mutate({ name, email, password });
          }}
        >
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button type="submit" busy={register.isPending}>
            Register
          </Button>
          {register.error ? <p className="text-sm text-rose-300">{register.error.message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
