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

const sectionTitle = 'text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500';

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
    <div className="space-y-6">
      <Card className="border-zinc-200 bg-gradient-to-br from-white via-white to-amber-50/60 p-6 shadow-lg shadow-zinc-200/40">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <p className={sectionTitle}>Project Basics</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium">Project Name</label><Input {...form.register('projectName')} placeholder="e.g. Paddington Residence" /></div>
              <div><label className="mb-1 block text-sm font-medium">Total sqm</label><Input type="number" step="0.01" {...form.register('totalSqm', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Build Type</label><Select {...form.register('buildType')}><option value="DUPLEX">Duplex</option><option value="CUSTOM_HOME">Custom Home</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Spec Level</label><Select {...form.register('specLevel')}><option value="STANDARD">Standard</option><option value="MID">Mid</option><option value="PREMIUM">Premium</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Site Complexity</label><Select {...form.register('siteComplexity')}><option value="FLAT">Flat</option><option value="MODERATE">Moderate</option><option value="COMPLEX">Complex</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Storeys</label><Input type="number" {...form.register('storeys', { valueAsNumber: true })} /></div>
            </div>
          </div>

          <div>
            <p className={sectionTitle}>Room Configuration</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div><label className="mb-1 block text-sm font-medium">Bedrooms</label><Input type="number" {...form.register('bedroomCount', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Bathrooms</label><Input type="number" {...form.register('bathroomCount', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Garage Spaces</label><Input type="number" {...form.register('garageSpaces', { valueAsNumber: true })} /></div>
            </div>
          </div>

          <div>
            <p className={sectionTitle}>Advanced Cost Drivers</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div><label className="mb-1 block text-sm font-medium">Region</label><Select {...form.register('regionType')}><option value="METRO">Metro</option><option value="REGIONAL">Regional</option><option value="REMOTE">Remote</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Facade Type</label><Select {...form.register('facadeType')}><option value="STANDARD">Standard</option><option value="ARCHITECTURAL">Architectural</option><option value="LUXURY">Luxury</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Sustainability</label><Select {...form.register('sustainabilityLevel')}><option value="NONE">None</option><option value="SILVER">Silver</option><option value="GOLD">Gold</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Energy Package</label><Select {...form.register('energyPackage')}><option value="STANDARD">Standard</option><option value="BASIX_PLUS">BASIX Plus</option><option value="NET_ZERO_READY">Net Zero Ready</option></Select></div>
              <div><label className="mb-1 block text-sm font-medium">Timeline (months)</label><Input type="number" {...form.register('timelineMonths', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Permit Cost</label><Input type="number" step="100" {...form.register('permitCost', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Demolition Cost</label><Input type="number" step="100" {...form.register('demolitionCost', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Escalation % (annual)</label><Input type="number" step="0.01" {...form.register('escalationPercent', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Contingency %</label><Input type="number" step="0.01" {...form.register('contingencyPercent', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">QA %</label><Input type="number" step="0.01" {...form.register('qualityAssurancePercent', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Discount %</label><Input type="number" step="0.01" {...form.register('discountPercent', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">GST %</label><Input type="number" step="0.01" {...form.register('gstPercent', { valueAsNumber: true })} /></div>
              <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium">
                <input type="checkbox" {...form.register('includeGst')} /> Include GST in total
              </label>
            </div>
          </div>

          <div>
            <p className={sectionTitle}>Commercial Controls</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium">Prelim %</label><Input type="number" step="0.01" {...form.register('prelimPercent', { valueAsNumber: true })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Margin %</label><Input type="number" step="0.01" {...form.register('marginPercent', { valueAsNumber: true })} /></div>
            </div>
          </div>

          <div>
            <p className={sectionTitle}>Add-on Selections</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {addOnOptions.map((addOn) => (
                <label key={addOn.name} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
                  <input
                    type="checkbox"
                    checked={(form.watch('addOns') ?? []).some((x) => x.name === addOn.name)}
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
                  <span className="text-sm font-medium">{addOn.name.replaceAll('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Project'}</Button>
            {onExport ? (
              <Button
                type="button"
                className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
                onClick={async () => {
                  const b64 = await onExport();
                  const a = document.createElement('a');
                  a.href = `data:application/pdf;base64,${b64}`;
                  a.download = `${form.getValues('projectName') || 'estimate'}.pdf`;
                  a.click();
                }}
              >
                Export Branded PDF
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      {calc?.error ? <WarningsBanner warnings={[calc.error]} /> : null}
      {calc?.warnings ? <WarningsBanner warnings={calc.warnings} /> : null}
      {calc ? (
        <>
          <TotalsCards
            total={calc.total}
            subtotal={calc.subtotal}
            prelim={calc.prelimCost}
            margin={calc.margin}
            gst={calc.gstCost}
            discount={calc.discountAmount}
            escalation={calc.escalationCost}
            contingency={calc.contingencyCost}
          />
          <BreakdownTable rows={calc.categoryBreakdown ?? []} />
        </>
      ) : null}
    </div>
  );
}
