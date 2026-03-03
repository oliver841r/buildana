import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { EstimateOutput } from '@/lib/engine/calculate';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, color: '#111111' },
  header: { backgroundColor: '#111111', color: '#facc15', padding: 10, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: 1, borderBottomColor: '#eee', paddingVertical: 4 },
  meta: { marginTop: 8, marginBottom: 8, color: '#374151' }
});

export function EstimatePdf({ projectName, estimate }: { projectName: string; estimate: EstimateOutput }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Buildana Cost Engine</Text>
          <Text>{projectName}</Text>
        </View>
        <Text>Total: ${estimate.total.toFixed(0)}</Text>
        <Text>Subtotal: ${estimate.subtotal.toFixed(0)}</Text>
        <Text>Preliminaries: ${estimate.prelimCost.toFixed(0)}</Text>
        <Text>Margin: ${estimate.margin.toFixed(0)}</Text>
        <Text>GST: ${estimate.gstCost.toFixed(0)}</Text>
        <Text>Discount: -${estimate.discountAmount.toFixed(0)}</Text>

        <View style={styles.meta}>
          <Text>Region: {estimate.advancedConfiguration.regionType}</Text>
          <Text>Facade: {estimate.advancedConfiguration.facadeType}</Text>
          <Text>Sustainability: {estimate.advancedConfiguration.sustainabilityLevel}</Text>
          <Text>Energy package: {estimate.advancedConfiguration.energyPackage}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          {estimate.categoryBreakdown.map((row) => (
            <View style={styles.row} key={row.categoryName}>
              <Text>{row.categoryName}</Text>
              <Text>${row.amount.toFixed(0)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
