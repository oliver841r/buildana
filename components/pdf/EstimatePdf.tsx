import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { EstimateOutput } from '@/lib/engine/calculate';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, color: '#111111', fontFamily: 'Helvetica' },
  yellowBar: { height: 8, backgroundColor: '#FFC700', marginBottom: 10 },
  heading: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  sub: { color: '#52525b', marginBottom: 2 },
  summaryBox: { border: 1, borderColor: '#e4e4e7', backgroundColor: '#fafafa', borderRadius: 8, padding: 10, marginVertical: 12 },
  summaryTitle: { fontSize: 9, textTransform: 'uppercase', color: '#71717a' },
  totalValue: { fontSize: 20, fontWeight: 700, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#111111', color: '#fff', padding: 6, marginTop: 10 },
  cellCat: { flex: 2 },
  cellPct: { flex: 1, textAlign: 'right' },
  cellAmt: { flex: 1, textAlign: 'right' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottom: 1, borderBottomColor: '#f0f0f0' },
  sectionTitle: { marginTop: 14, marginBottom: 6, fontSize: 11, fontWeight: 700 },
  disclaimer: { color: '#52525b', marginBottom: 3 },
  signature: { marginTop: 20, borderTop: 1, borderTopColor: '#e4e4e7', paddingTop: 12 }
});

const aud = (value: number) => `$${Math.round(value).toLocaleString('en-AU')}`;

export function EstimatePdf({
  projectName,
  estimate,
  mode,
  clientName,
  address,
  notes
}: {
  projectName: string;
  estimate: EstimateOutput;
  mode: 'CLIENT' | 'INTERNAL';
  clientName?: string;
  address?: string;
  notes?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.yellowBar} />
        <Text style={styles.heading}>Estimate Summary</Text>
        <Text style={styles.sub}>{projectName}</Text>
        {clientName ? <Text style={styles.sub}>Client: {clientName}</Text> : null}
        {address ? <Text style={styles.sub}>Address: {address}</Text> : null}
        <Text style={styles.sub}>Generated: {new Date().toLocaleDateString('en-AU')}</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Total Investment</Text>
          <Text style={styles.totalValue}>{aud(estimate.total)}</Text>
          <View style={styles.row}><Text>Subtotal</Text><Text>{aud(estimate.subtotal)}</Text></View>
          <View style={styles.row}><Text>Preliminaries</Text><Text>{aud(estimate.prelimCost)}</Text></View>
          <View style={styles.row}><Text>Contingency</Text><Text>{aud(estimate.contingencyCost)}</Text></View>
          <View style={styles.row}><Text>Margin</Text><Text>{aud(estimate.margin)}</Text></View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.cellCat}>Category</Text>
          <Text style={styles.cellPct}>%</Text>
          <Text style={styles.cellAmt}>Amount</Text>
        </View>
        {estimate.categoryBreakdown.map((row, i) => (
          <View key={row.categoryName} style={{ ...styles.tableRow, backgroundColor: i % 2 ? '#fafafa' : '#ffffff' }}>
            <Text style={styles.cellCat}>{row.categoryName}</Text>
            <Text style={styles.cellPct}>{(row.percentNormalized * 100).toFixed(1)}%</Text>
            <Text style={styles.cellAmt}>{aud(row.amount)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Notes & Assumptions</Text>
        <Text style={styles.disclaimer}>• Estimate only, subject to final design/engineering approvals.</Text>
        <Text style={styles.disclaimer}>• Excludes land, authority fees unless stated.</Text>
        <Text style={styles.disclaimer}>• Validity: 14 days.</Text>
        {mode === 'INTERNAL' && notes ? <Text style={styles.disclaimer}>Internal Notes: {notes}</Text> : null}

        <View style={styles.signature}>
          <Text>Prepared by Buildana</Text>
          <Text style={styles.disclaimer}>Signature: ____________________________</Text>
          <Text style={styles.disclaimer}>Contact: estimations@buildana.com.au · +61 000 000 000</Text>
        </View>
      </Page>
    </Document>
  );
}
