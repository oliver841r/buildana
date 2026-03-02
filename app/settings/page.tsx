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
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Buildana Configuration</p>
        <h1 className="text-3xl font-semibold">Cost Engine Settings</h1>
      </div>

      <Card className="bg-gradient-to-br from-white to-amber-50/50 p-6">
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              await updateSettings(values);
            });
          })}
        >
          <section>
            <h2 className="text-lg font-semibold">Spec Rates ($/sqm)</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {['STANDARD', 'MID', 'PREMIUM'].map((key) => (
                <div key={key}>
                  <label className={labelClass}>{key}</label>
                  <Input type="number" step="1" {...form.register(`specCostPerSqm.${key}`, { valueAsNumber: true })} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Site Complexity Multipliers</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {['FLAT', 'MODERATE', 'COMPLEX'].map((key) => (
                <div key={key}>
                  <label className={labelClass}>{key}</label>
                  <Input type="number" step="0.01" {...form.register(`siteMultiplier.${key}`, { valueAsNumber: true })} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Room & Storey Cost Drivers</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Bedroom Cost</label>
                <Input type="number" step="100" {...form.register('featureCosts.bedroomCost', { valueAsNumber: true })} />
              </div>
              <div>
                <label className={labelClass}>Bathroom Cost</label>
                <Input type="number" step="100" {...form.register('featureCosts.bathroomCost', { valueAsNumber: true })} />
              </div>
              <div>
                <label className={labelClass}>Garage Space Cost</label>
                <Input type="number" step="100" {...form.register('featureCosts.garageSpaceCost', { valueAsNumber: true })} />
              </div>
              <div>
                <label className={labelClass}>Double Storey Multiplier</label>
                <Input type="number" step="0.01" {...form.register('featureCosts.doubleStoreyMultiplier', { valueAsNumber: true })} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Category Percentages</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {CATEGORY_NAMES.map((name) => (
                <div key={name}>
                  <label className={labelClass}>{name}</label>
                  <Input type="number" step="0.01" {...form.register(`categoryPercents.${name}`, { valueAsNumber: true })} />
                </div>
              ))}
            </div>
          </section>

          <Button disabled={pending}>{pending ? 'Saving...' : 'Save Settings'}</Button>
        </form>
      </Card>
    </div>
  );
}
