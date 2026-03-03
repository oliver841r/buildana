'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@buildana.com.au');
  const [password, setPassword] = useState('Buildana123!');
  const [error, setError] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-5 bg-gradient-to-br from-white via-white to-amber-50/60 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Welcome</p>
          <h1 className="text-2xl font-semibold">Buildana Cost Engine</h1>
        </div>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          onClick={async () => {
            const res = await signIn('credentials', { email, password, redirect: false });
            if (res?.error) setError('Invalid credentials');
            else router.push('/dashboard');
          }}
        >
          Sign in
        </Button>
      </Card>
    </div>
  );
}
