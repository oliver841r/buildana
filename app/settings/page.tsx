'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { settingsSchema } from '@/lib/validation/schemas';
import { updateSettings } from '@/app/actions/projectActions';
import { CATEGORY_NAMES } from '@/lib/engine/normalize';

export default function SettingsPage() {
  const { data } = useSession();
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const form = useForm<any>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        form.reset(json);
        setLoaded(true);
      });
  }, [form]);

  if (data?.user.role !== 'ADMIN') return <div className="p-6">Admin access required.</div>;
  if (!loaded) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <Card>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              await updateSettings({
                specCostPerSqm: values.specCostPerSqm,
                siteMultiplier: values.siteMultiplier,
                categoryPercents: { raw: values.categoryPercents, normalized: values.categoryPercents }
              });
            });
          })}
        >
          <p className="font-semibold">Spec $/sqm</p>
          {['STANDARD', 'MID', 'PREMIUM'].map((key) => (
            <Input key={key} type="number" step="1" {...form.register(`specCostPerSqm.${key}`, { valueAsNumber: true })} />
          ))}

          <p className="font-semibold">Site Multipliers</p>
          {['FLAT', 'MODERATE', 'COMPLEX'].map((key) => (
            <Input key={key} type="number" step="0.01" {...form.register(`siteMultiplier.${key}`, { valueAsNumber: true })} />
          ))}

          <p className="font-semibold">Category Percentages</p>
          {CATEGORY_NAMES.map((name) => (
            <div key={name}>
              <label>{name}</label>
              <Input type="number" step="0.01" {...form.register(`categoryPercents.${name}`, { valueAsNumber: true })} />
            </div>
          ))}

          <Button disabled={pending}>Save Settings</Button>
        </form>
      </Card>
    </div>
  );
}
