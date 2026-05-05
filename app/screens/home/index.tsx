import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  radius,
} from "../../../constants/theme";

// ── Types ─────────────────────────────────────────────────

type Person = {
  id: string;
  name: string;
};

type Bill = {
  id: string;
  date: string;
  title: string;
  totalAmount: number;
  taxAmount: number;
  people: Person[];
  settled: boolean;
};

// ── Dummy Data (remove once store is wired up) ────────────

const DUMMY_BILLS: Bill[] = [
  {
    id: "1",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    title: "Dinner at Bastian",
    totalAmount: 3240,
    taxAmount: 240,
    people: [
      { id: "1", name: "John" },
      { id: "2", name: "Sara" },
      { id: "3", name: "Mike" },
    ],
    settled: false,
  },
  {
    id: "2",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    title: "DMart groceries",
    totalAmount: 1820,
    taxAmount: 120,
    people: [
      { id: "1", name: "Rahul" },
      { id: "2", name: "You" },
    ],
    settled: true,
  },
  {
    id: "3",
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    title: "Goa trip expenses",
    totalAmount: 12600,
    taxAmount: 800,
    people: [
      { id: "1", name: "John" },
      { id: "2", name: "Sara" },
      { id: "3", name: "Mike" },
      { id: "4", name: "Priya" },
    ],
    settled: false,
  },
];

// ── Helpers ───────────────────────────────────────────────

function getPendingCount(bills: Bill[]) {
  return bills.filter((b) => !b.settled).length;
}

function getTotalOwed(bills: Bill[]) {
  return bills
    .filter((b) => !b.settled)
    .reduce((sum, b) => sum + b.totalAmount, 0);
}

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Empty State ───────────────────────────────────────────

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyGraphic}>
        <Text style={styles.emptyGraphicText}>🧾</Text>
      </View>
      <Text style={styles.emptyTitle}>Split bills, not friendships</Text>
      <Text style={styles.emptySub}>
        Scan any restaurant bill and split it fairly — item by item, in seconds.
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={onScan}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyBtnText}>Scan your first bill</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Summary Card ──────────────────────────────────────────

function SummaryCard({ bills }: { bills: Bill[] }) {
  const totalOwed = getTotalOwed(bills);
  const pendingCount = getPendingCount(bills);

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>Total owed to you</Text>
      <Text style={styles.summaryAmount}>{formatAmount(totalOwed)}</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={styles.chipLabel}>Pending</Text>
          <Text style={styles.chipValue}>{pendingCount} bills</Text>
        </View>
        <View style={styles.summaryChip}>
          <Text style={styles.chipLabel}>Total bills</Text>
          <Text style={styles.chipValue}>{bills.length}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Bill Card ─────────────────────────────────────────────

function BillCard({ bill, onPress }: { bill: Bill; onPress: () => void }) {
  const peopleNames = bill.people.map((p) => p.name).join(", ");

  return (
    <TouchableOpacity
      style={styles.billCard}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.billIcon,
          {
            backgroundColor: bill.settled
              ? colors.successLight
              : colors.primaryLight,
          },
        ]}
      >
        <Text style={styles.billIconText}>🧾</Text>
      </View>
      <View style={styles.billInfo}>
        <Text style={styles.billName} numberOfLines={1}>
          {bill.title}
        </Text>
        <Text style={styles.billMeta} numberOfLines={1}>
          {peopleNames} · {formatDate(bill.date)}
        </Text>
      </View>
      <View style={styles.billRight}>
        <Text style={styles.billTotal}>{formatAmount(bill.totalAmount)}</Text>
        <Text
          style={[
            styles.billStatus,
            bill.settled ? styles.statusSettled : styles.statusPending,
          ]}
        >
          {bill.settled ? "Settled" : "Pending"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Home Screen ───────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();

  // TODO: replace DUMMY_BILLS with useBillStore() once store is set up
  const bills = DUMMY_BILLS;

  const handleScan = () => {
    router.push("/groupSetup");
  };
  const handleBillPress = (billId: string) =>
    router.push(`/split-summary/${billId}`);
  const handleSeeAll = () => router.push("/history");
  const handleProfile = () => router.push("/profile");

  const recentBills = bills.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.wordmark}>Slyce</Text>
        <TouchableOpacity
          onPress={handleProfile}
          style={styles.avatar}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>VD</Text>
        </TouchableOpacity>
      </View>

      {bills.length === 0 ? (
        <EmptyState onScan={handleScan} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SummaryCard bills={bills} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent bills</Text>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onPress={() => handleBillPress(bill.id)}
            />
          ))}
        </ScrollView>
      )}

      {bills.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleScan}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+ Scan bill</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  wordmark: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.medium,
    color: colors.black,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  scrollContent: { paddingBottom: 100 },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.primaryMid,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.medium,
    color: colors.white,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  summaryRow: { flexDirection: "row", gap: spacing.sm },
  summaryChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  chipLabel: {
    fontSize: fontSize.xs,
    color: colors.primaryMid,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.black,
  },
  sectionLink: { fontSize: fontSize.sm, color: colors.primary },
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.gray200,
    gap: spacing.md,
  },
  billIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  billIconText: { fontSize: 20 },
  billInfo: { flex: 1 },
  billName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.black,
    marginBottom: 2,
  },
  billMeta: { fontSize: fontSize.sm, color: colors.gray700 },
  billRight: { alignItems: "flex-end" },
  billTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.black,
    marginBottom: 2,
  },
  billStatus: { fontSize: fontSize.xs },
  statusPending: { color: colors.warning },
  statusSettled: { color: colors.success },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.section,
  },
  emptyGraphic: {
    width: 80,
    height: 80,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
  },
  emptyGraphicText: { fontSize: 36 },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    color: colors.black,
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  emptySub: {
    fontSize: fontSize.base,
    color: colors.gray700,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    width: "100%",
    alignItems: "center",
  },
  emptyBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  fab: {
    position: "absolute",
    bottom: spacing.xxl,
    alignSelf: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  fabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});
