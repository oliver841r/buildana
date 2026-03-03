import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from '@react-pdf/renderer';
import { EstimatePdf } from '../components/pdf/EstimatePdf';

describe('EstimatePdf structure', () => {
  it('renders key sections and internal notes mode gating', async () => {
    const estimate = {
      total: 200000,
      subtotal: 160000,
      prelimCost: 10000,
      contingencyCost: 5000,
      margin: 25000,
      categoryBreakdown: [{ categoryName: 'Slab & Structure', percentNormalized: 0.2, amount: 40000 }]
    };

    const internalPdf = await renderToString(
      React.createElement(EstimatePdf, {
        projectName: 'Project X',
        estimate,
        mode: 'INTERNAL',
        notes: 'Secret'
      })
    );

    const clientPdf = await renderToString(
      React.createElement(EstimatePdf, {
        projectName: 'Project X',
        estimate,
        mode: 'CLIENT',
        notes: 'Secret'
      })
    );

    expect(internalPdf).toContain('Estimate Summary');
    expect(internalPdf).toContain('Internal Notes');
    expect(clientPdf).not.toContain('Internal Notes');
  });
});
