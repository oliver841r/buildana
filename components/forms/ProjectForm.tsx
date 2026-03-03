'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectInput } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TotalsCards } from '@/components/estimate/TotalsCards';
import { BreakdownTable } from '@/components/estimate/BreakdownTable';
import { WarningsBanner } from '@/components/estimate/WarningsBanner';

const sectionTitle = 'text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500';

type AddOnDefault = { name: string; type: 'flat' | 'multiplier'; value: number };

export function ProjectForm({
  initial,
  onSave,
  onExport
}: {
  initial: ProjectInput;
  onSave: (data: ProjectInput) => Promise<void>;
  onExport?: (mode?: 'CLIENT' | 'INTERNAL') => Promise<string>;
}) {
  const [calc, setCalc] = useState<any>();
  const [compare, setCompare] = useState<any>();
  const [pending, startTransition] = useTransition();
  const [addOnDefaults, setAddOnDefaults] = useState<AddOnDefault[]>([]);
  const form = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: initial });

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((json) => setAddOnDefaults(json.addOnDefaults ?? []));
  }, []);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values.projectName) return;
      fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, addOns: values.addOns ?? [] })
      })
        .then((res) => res.json())
        .then((res) => setCalc(res))
        .catch(() => setCalc(undefined));

      const altSpec = values.specLevel === 'PREMIUM' ? 'ULTRA' : 'PREMIUM';
      fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, specLevel: altSpec, addOns: values.addOns ?? [] })
      })
        .then((res) => res.json())
        .then((res) => setCompare({ spec: altSpec, estimate: res }))
        .catch(() => setCompare(undefined));
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      await onSave(values);
    });
  });

  const selectedAddOns = form.watch('addOns') ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <Card className="border-zinc-200 bg-gradient-to-br from-white via-white to-amber-50/60 p-6 shadow-lg shadow-zinc-200/40">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <p className={sectionTitle}>Client & Project</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium">Project Name</label><Input {...form.register('projectName')} /></div>
              <div><label className="mb-1 block text-sm font-medium">Client Name</label><Input {...form.register('clientName')} /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Address</label><Input {...form.register('address')} /></div>
              <div><label className="mb-1 block text-sm font-medium">Status</label><Select {...form.register('status')}><option value="DRAFT">Draft</option><option value="FEASIBILITY">Feasibility</option><option value="QUOTED">Quoted</option><option value="SIGNED">Signed</option><option value="ARCHIVED">Archived</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Total sqm</label><Input type="number" step="0.01" {...form.register('totalSqm', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Build Type</label><Select {...form.register('buildType')}><option value="DUPLEX">Duplex</option><option value="CUSTOM_HOME">Custom Home</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Spec Level</label><Select {...form.register('specLevel')}><option value="STANDARD">Standard</option><option value="MID">Mid</option><option value="PREMIUM">Premium</option><option value="ULTRA">Ultra</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Site Complexity</label><Select {...form.register('siteComplexity')}><option value="FLAT">Flat</option><option value="MODERATE">Moderate</option><option value="COMPLEX">Complex</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Floors</label><Input type="number" {...form.register('floors', { valueAsNumber: true })} /></div>
            </div>
          </div>

          <div>
            <p className={sectionTitle}>Commercial Controls</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div><label className="mb-1 block text-sm font-medium">Prelim %</label><Input type="number" step="0.01" {...form.register('prelimPercent', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Contingency %</label><Input type="number" step="0.01" {...form.register('contingencyPercent', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Margin %</label><Input type="number" step="0.01" {...form.register('marginPercent', { valueAsNumber: true })} /></div>
            </div>
          </div>

          <div>
            <p className={sectionTitle}>Add-on Selections</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {addOnDefaults.map((addOn) => (
                <label key={addOn.name} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
                  <input
                    type="checkbox"
                    checked={selectedAddOns.some((x) => x.name === addOn.name)}
                    onChange={(e) => {
                      const current = form.getValues('addOns') ?? [];
                      if (e.target.checked) {
                        form.setValue('addOns', [...current, { name: addOn.name as any, ...(addOn.type === 'flat' ? { flatCost: addOn.value } : { multiplier: addOn.value }) }]);
                      } else {
                        form.setValue('addOns', current.filter((x) => x.name !== addOn.name));
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{addOn.name.replaceAll('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={sectionTitle}>Notes</p>
            <textarea className="mt-2 min-h-24 w-full rounded-lg border border-zinc-300 p-3 text-sm" {...form.register('notes')} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Project'}</Button>
            {onExport ? <Button type="button" className="bg-[#FFC700] text-zinc-950 hover:bg-[#e6b400]" onClick={async () => {
              const b64 = await onExport('CLIENT');
              const a = document.createElement('a');
              a.href = `data:application/pdf;base64,${b64}`;
              a.download = `${form.getValues('projectName') || 'estimate'}-client.pdf`;
              a.click();
            }}>Export Client PDF</Button> : null}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {calc?.warnings ? <WarningsBanner warnings={calc.warnings} /> : null}
        {calc ? (
          <>
            <TotalsCards total={calc.total} subtotal={calc.subtotal} prelim={calc.prelimCost} margin={calc.margin} contingency={calc.contingencyCost} />
            <BreakdownTable rows={calc.categoryBreakdown ?? []} />
            {compare?.estimate ? (
              <Card>
                <p className="mb-2 text-sm font-semibold">Compare Specs: {form.getValues('specLevel')} vs {compare.spec}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Current Total: <span className="font-semibold">${Math.round(calc.total).toLocaleString('en-AU')}</span></div>
                  <div>Alt Total: <span className="font-semibold">${Math.round(compare.estimate.total).toLocaleString('en-AU')}</span></div>
                  <div>Delta: <span className="font-semibold">${Math.round(compare.estimate.total - calc.total).toLocaleString('en-AU')}</span></div>
                  <div>Margin Delta: <span className="font-semibold">{(((compare.estimate.margin - calc.margin) / Math.max(calc.margin, 1)) * 100).toFixed(1)}%</span></div>
                </div>
              </Card>
            ) : null}
          </>
        ) : (
          <Card><p className="text-sm text-zinc-500">Fill inputs to view live estimate.</p></Card>
        )}
      </div>
    </div>
  );
}
