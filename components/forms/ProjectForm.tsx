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
import { AddOnInput } from '@/lib/engine/calculate';

const addOnOptions: AddOnInput[] = [
  { name: 'POOL', flatCost: 65000 },
  { name: 'HIGH_CEILINGS', multiplier: 1.05 },
  { name: 'UPGRADED_WINDOWS', flatCost: 18000 },
  { name: 'SMART_HOME', flatCost: 22000 },
  { name: 'LANDSCAPING_PREMIUM', flatCost: 30000 }
];

export function ProjectForm({
  initial,
  onSave,
  onExport
}: {
  initial: ProjectInput;
  onSave: (data: ProjectInput) => Promise<void>;
  onExport?: () => Promise<string>;
}) {
  const [calc, setCalc] = useState<any>();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: initial });

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
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const submit = form.handleSubmit((values) => {
    startTransition(async () => {
      await onSave(values);
    });
  });

  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <div>
            <label>Project Name</label>
            <Input {...form.register('projectName')} />
          </div>
          <div>
            <label>Total sqm</label>
            <Input type="number" step="0.01" {...form.register('totalSqm', { valueAsNumber: true })} />
          </div>
          <div>
            <label>Build Type</label>
            <Select {...form.register('buildType')}>
              <option value="DUPLEX">Duplex</option>
              <option value="CUSTOM_HOME">Custom Home</option>
            </Select>
          </div>
          <div>
            <label>Spec Level</label>
            <Select {...form.register('specLevel')}>
              <option value="STANDARD">Standard</option>
              <option value="MID">Mid</option>
              <option value="PREMIUM">Premium</option>
            </Select>
          </div>
          <div>
            <label>Site Complexity</label>
            <Select {...form.register('siteComplexity')}>
              <option value="FLAT">Flat</option>
              <option value="MODERATE">Moderate</option>
              <option value="COMPLEX">Complex</option>
            </Select>
          </div>
          <div>
            <label>Prelim %</label>
            <Input type="number" step="0.01" {...form.register('prelimPercent', { valueAsNumber: true })} />
          </div>
          <div>
            <label>Margin %</label>
            <Input type="number" step="0.01" {...form.register('marginPercent', { valueAsNumber: true })} />
          </div>
          <div className="md:col-span-2">
            <label>Add-ons</label>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {addOnOptions.map((addOn) => (
                <label key={addOn.name} className="flex items-center gap-2 rounded border p-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = form.getValues('addOns') ?? [];
                      if (e.target.checked) {
                        form.setValue('addOns', [...current, addOn]);
                      } else {
                        form.setValue(
                          'addOns',
                          current.filter((x) => x.name !== addOn.name)
                        );
                      }
                    }}
                  />
                  {addOn.name}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" disabled={pending}>Save Project</Button>
            {onExport ? <Button type="button" onClick={async () => { const b64 = await onExport(); const a = document.createElement('a'); a.href = `data:application/pdf;base64,${b64}`; a.download = `${form.getValues('projectName') || 'estimate'}.pdf`; a.click(); }}>Export PDF</Button> : null}
          </div>
        </form>
      </Card>

      {calc?.error ? <WarningsBanner warnings={[calc.error]} /> : null}
      {calc?.warnings ? <WarningsBanner warnings={calc.warnings} /> : null}
      {calc ? (
        <>
          <TotalsCards total={calc.total} subtotal={calc.subtotal} prelim={calc.prelimCost} margin={calc.margin} />
          <BreakdownTable rows={calc.categoryBreakdown} />
        </>
      ) : null}
    </div>
  );
}
