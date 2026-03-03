'use client';

import { useState, useTransition } from 'react';
import { ProjectInput } from '@/lib/validation/schemas';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type WorkspaceTab = 'ESTIMATE' | 'PDF' | 'VERSIONS' | 'NOTES';
type ExportMode = 'CLIENT' | 'INTERNAL';

type VersionItem = { id: string; versionNumber: number; label: string | null; createdAt: Date; snapshot: { inputs: ProjectInput; outputs: unknown } };

export function ProjectWorkspace({
  initial,
  versions,
  onSave,
  onExport,
  onSaveVersion,
  onSaveNotes
}: {
  initial: ProjectInput;
  versions: VersionItem[];
  onSave: (data: ProjectInput) => Promise<void>;
  onExport: (mode: ExportMode) => Promise<string>;
  onSaveVersion: (label?: string) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<WorkspaceTab>('ESTIMATE');
  const [pdfSrc, setPdfSrc] = useState('');
  const [mode, setMode] = useState<ExportMode>('CLIENT');
  const [noteText, setNoteText] = useState(initial.notes ?? '');
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['ESTIMATE', 'PDF', 'VERSIONS', 'NOTES'] as WorkspaceTab[]).map((name) => (
          <Button key={name} type="button" className={tab === name ? 'bg-[#FFC700] text-zinc-950' : 'bg-zinc-100 text-zinc-900'} onClick={() => setTab(name)}>{name}</Button>
        ))}
      </div>

      {tab === 'ESTIMATE' ? <ProjectForm initial={initial} onSave={onSave} onExport={onExport} /> : null}

      {tab === 'PDF' ? (
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm" value={mode} onChange={(e) => setMode(e.target.value as ExportMode)}>
              <option value="CLIENT">Client version</option>
              <option value="INTERNAL">Internal version</option>
            </select>
            <Button type="button" onClick={async () => {
              const b64 = await onExport(mode);
              const bytes = atob(b64);
              const arr = Uint8Array.from(bytes, (x) => x.charCodeAt(0));
              const blob = new Blob([arr], { type: 'application/pdf' });
              setPdfSrc(URL.createObjectURL(blob));
            }}>Generate Preview</Button>
          </div>
          {pdfSrc ? <iframe title="pdf-preview" src={pdfSrc} className="h-[780px] w-full rounded-xl border border-zinc-200" /> : <p className="text-sm text-zinc-500">Generate PDF preview to view.</p>}
        </Card>
      ) : null}

      {tab === 'VERSIONS' ? (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Saved Versions</p>
            <Button type="button" onClick={() => startTransition(async () => onSaveVersion())} disabled={pending}>Save Version</Button>
          </div>
          {versions.length === 0 ? <p className="text-sm text-zinc-500">No versions saved yet.</p> : null}
          <div className="space-y-2">
            {versions.map((v) => (
              <details key={v.id} className="rounded-xl border border-zinc-200 p-3">
                <summary className="cursor-pointer text-sm font-medium">Version {v.versionNumber} · {v.label || 'Snapshot'} · {new Date(v.createdAt).toLocaleString()}</summary>
                <pre className="mt-2 overflow-auto rounded bg-zinc-50 p-2 text-xs">{JSON.stringify(v.snapshot, null, 2)}</pre>
              </details>
            ))}
          </div>
        </Card>
      ) : null}

      {tab === 'NOTES' ? (
        <Card className="space-y-3">
          <p className="font-semibold">Project Notes</p>
          <textarea className="min-h-40 w-full rounded-xl border border-zinc-300 p-3 text-sm" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <Button type="button" onClick={() => startTransition(async () => onSaveNotes(noteText))} disabled={pending}>{pending ? 'Saving...' : 'Save Notes'}</Button>
        </Card>
      ) : null}
    </div>
  );
}
