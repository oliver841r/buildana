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

const labelClass = 'mb-1 block text-sm font-medium text-zinc-700';

export default function SettingsPage() {
  const { data } = useSession();
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const [sumMessage, setSumMessage] = useState('');
  const form = useForm<any>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        form.reset(json);
        setLoaded(true);
      });
  }, [form]);

  const categorySum = CATEGORY_NAMES.map((name) => Number(form.watch(`categoryPercents.${name}`)) || 0).reduce((a, b) => a + b, 0);

  if (data?.user.role !== 'ADMIN') return <div className="p-6">Admin access required.</div>;
  if (!loaded) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Cost Engine Settings</h1>
      <Card className="p-6">
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              await updateSettings(values);
              setSumMessage('Saved successfully.');
            });
          })}
        >
          <section>
            <h2 className="text-lg font-semibold">Spec Rates ($/sqm)</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              {['STANDARD', 'MID', 'PREMIUM', 'ULTRA'].map((key) => (
                <div key={key}><label className={labelClass}>{key}</label><Input type="number" {...form.register(`specCostPerSqm.${key}`, { valueAsNumber: true })} /></div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Site Multiplier</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {['FLAT', 'MODERATE', 'COMPLEX'].map((key) => (
                <div key={key}><label className={labelClass}>{key}</label><Input type="number" step="0.01" {...form.register(`siteMultiplier.${key}`, { valueAsNumber: true })} /></div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Floors Multiplier</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {['1', '2', '3'].map((key) => (
                <div key={key}><label className={labelClass}>{key} floor(s)</label><Input type="number" step="0.01" {...form.register(`featureCosts.floorsMultiplier.${key}`, { valueAsNumber: true })} /></div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Add-on Defaults</h2>
            <div className="space-y-2">
              {(form.watch('addOnDefaults') ?? []).map((_: any, i: number) => (
                <div className="grid gap-2 md:grid-cols-3" key={i}>
                  <Input placeholder="Name" {...form.register(`addOnDefaults.${i}.name`)} />
                  <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" {...form.register(`addOnDefaults.${i}.type`)}>
                    <option value="flat">Flat</option>
                    <option value="multiplier">Multiplier</option>
                  </select>
                  <Input type="number" step="0.01" {...form.register(`addOnDefaults.${i}.value`, { valueAsNumber: true })} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Category Percentages</h2>
              <Button
                type="button"
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                onClick={() => {
                  const total = CATEGORY_NAMES.reduce((acc, name) => acc + (Number(form.getValues(`categoryPercents.${name}`)) || 0), 0);
                  CATEGORY_NAMES.forEach((name) => {
                    const value = Number(form.getValues(`categoryPercents.${name}`)) || 0;
                    form.setValue(`categoryPercents.${name}`, total ? value / total : 0);
                  });
                }}
              >
                Auto-normalize
              </Button>
            </div>
            <p className={`text-xs ${Math.abs(categorySum - 1) <= 0.01 ? 'text-emerald-600' : 'text-amber-700'}`}>
              Category sum: {(categorySum * 100).toFixed(2)}% {Math.abs(categorySum - 1) <= 0.01 ? '(valid)' : '(sum should equal 100%)'}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {CATEGORY_NAMES.map((name) => (
                <div key={name}><label className={labelClass}>{name}</label><Input type="number" step="0.01" {...form.register(`categoryPercents.${name}`, { valueAsNumber: true })} /></div>
              ))}
            </div>
          </section>

          <Button disabled={pending}>{pending ? 'Saving...' : 'Save Settings'}</Button>
          {sumMessage ? <p className="text-sm text-emerald-700">{sumMessage}</p> : null}
        </form>
      </Card>
    </div>
  );
}
