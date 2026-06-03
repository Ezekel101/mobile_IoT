import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Data model based on CAPTURE table
type Capture = {
  id_capture: number;
  frequence_cardiaque: number; // heart rate bpm
  oxygene_sang: number;        // SpO2 %
  date_heure_capture: string;  // ISO datetime
};

type FilterType = 'all' | 'heartRate' | 'spo2';
type StatusType = 'LOW_SPO2' | 'ELEVATED' | 'NORMAL';

function makeDate(daysAgo: number, hours: number, minutes: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

// Fake data — replace with real API calls later
const FAKE_CAPTURES: Capture[] = [
  { id_capture: 1, frequence_cardiaque: 72,  oxygene_sang: 91, date_heure_capture: makeDate(0, 14, 45) },
  { id_capture: 2, frequence_cardiaque: 68,  oxygene_sang: 98, date_heure_capture: makeDate(0, 11, 20) },
  { id_capture: 3, frequence_cardiaque: 115, oxygene_sang: 97, date_heure_capture: makeDate(1, 19, 15) },
  { id_capture: 4, frequence_cardiaque: 62,  oxygene_sang: 99, date_heure_capture: makeDate(1,  8,  0) },
  { id_capture: 5, frequence_cardiaque: 78,  oxygene_sang: 96, date_heure_capture: makeDate(2, 16, 30) },
  { id_capture: 6, frequence_cardiaque: 88,  oxygene_sang: 93, date_heure_capture: makeDate(2,  9, 45) },
  { id_capture: 7, frequence_cardiaque: 65,  oxygene_sang: 98, date_heure_capture: makeDate(3, 10, 15) },
  { id_capture: 8, frequence_cardiaque: 108, oxygene_sang: 95, date_heure_capture: makeDate(3,  7, 30) },
];

function getStatus(c: Capture): StatusType {
  if (c.oxygene_sang < 94) return 'LOW_SPO2';
  if (c.frequence_cardiaque > 100) return 'ELEVATED';
  return 'NORMAL';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = (h % 12 || 12).toString().padStart(2, '0');
  return `${display}:${m} ${ampm}`;
}

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const label = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  if (d.toDateString() === now.toDateString()) return `TODAY, ${label}`;
  if (d.toDateString() === yesterday.toDateString()) return `YESTERDAY, ${label}`;
  return label;
}

type Group = { key: string; label: string; items: Capture[] };

function groupCaptures(captures: Capture[]): Group[] {
  const order: string[] = [];
  const map = new Map<string, Group>();
  for (const c of captures) {
    const key = new Date(c.date_heure_capture).toDateString();
    if (!map.has(key)) {
      const g: Group = { key, label: formatDateLabel(c.date_heure_capture), items: [] };
      map.set(key, g);
      order.push(key);
    }
    map.get(key)!.items.push(c);
  }
  return order.map((k) => map.get(k)!);
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChartIcon() {
  const heights = [8, 14, 10, 18, 12];
  return (
    <View style={s.barChart}>
      {heights.map((h, i) => (
        <View key={i} style={[s.bar, { height: h }]} />
      ))}
    </View>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: StatusType }) {
  const cfg = {
    LOW_SPO2: { label: 'LOW SPO2', bg: '#FFE8E8', color: '#C62828' },
    ELEVATED:  { label: 'ELEVATED',  bg: '#FFE8E8', color: '#C62828' },
    NORMAL:    { label: 'NORMAL',    bg: '#EFEFEF', color: '#757575' },
  }[status];
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ── Capture row ───────────────────────────────────────────────────────────────
function CaptureItem({ capture }: { capture: Capture }) {
  const status = getStatus(capture);
  const isAlert = status !== 'NORMAL';
  const heartColor = status === 'ELEVATED' ? '#C62828' : '#1565C0';

  return (
    <View style={[s.captureItem, isAlert && s.captureItemAlert]}>
      <View style={s.captureTop}>
        <Text style={s.captureTime}>{formatTime(capture.date_heure_capture)}</Text>
        <StatusBadge status={status} />
      </View>
      <View style={s.captureMetrics}>
        <View style={s.metric}>
          <Text style={[s.metricIcon, { color: heartColor }]}>♥</Text>
          <Text style={s.metricVal}>{capture.frequence_cardiaque} bpm</Text>
        </View>
        <View style={s.metric}>
          <Text style={[s.metricIcon, { color: '#1565C0' }]}>≋</Text>
          <Text style={s.metricVal}>{capture.oxygene_sang} %</Text>
        </View>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const [filter, setFilter] = useState<FilterType>('all');

  const visible = FAKE_CAPTURES.filter((c) => {
    if (filter === 'heartRate') return c.frequence_cardiaque < 60 || c.frequence_cardiaque > 100;
    if (filter === 'spo2') return c.oxygene_sang < 95;
    return true;
  });

  const groups = groupCaptures(visible);
  const total = FAKE_CAPTURES.length.toLocaleString();

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all',       label: 'All Data' },
    { key: 'heartRate', label: 'Heart Rate' },
    { key: 'spo2',      label: 'SpO2' },
  ];

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>img</Text>
          </View>
          <Text style={s.headerTitle}>VitalTrack Pro</Text>
          <TouchableOpacity style={s.gearBtn} activeOpacity={0.7}>
            <Text style={s.gearIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* ── 30-Day Trend card ── */}
        <View style={s.card}>
          <View style={s.trendRow}>
            <Text style={s.trendWave}>∿</Text>
            <Text style={s.cardLabel}>30-DAY TREND</Text>
          </View>
          <Text style={s.trendValue}>Stable</Text>
          <Text style={s.trendDesc}>Your metrics are within 5% of your baseline.</Text>
        </View>

        {/* ── Total captures card ── */}
        <View style={[s.card, s.captureCard]}>
          <View style={s.captureCardInfo}>
            <Text style={s.cardLabel}>TOTAL CAPTURES</Text>
            <Text style={s.captureCount}>{total}</Text>
          </View>
          <View style={s.chartBox}>
            <BarChartIcon />
          </View>
        </View>

        {/* ── Filter tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filterScroll}
          contentContainerStyle={s.filterContent}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[s.filterTab, active && s.filterTabActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}>
                <Text style={[s.filterTabTxt, active && s.filterTabTxtActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Capture log ── */}
        <Text style={s.sectionTitle}>Capture Log</Text>

        {groups.length === 0 ? (
          <Text style={s.empty}>No captures found.</Text>
        ) : (
          groups.map((g) => (
            <View key={g.key}>
              <Text style={s.dateLabel}>{g.label}</Text>
              {g.items.map((c) => (
                <CaptureItem key={c.id_capture} capture={c} />
              ))}
            </View>
          ))
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
  default: {},
});

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF2F8',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B0BEC5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: { color: '#fff', fontSize: 11, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1565C0',
    letterSpacing: 0.2,
  },
  gearBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearIcon: { fontSize: 20, color: '#455A64' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    ...cardShadow,
  },

  // Trend card
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  trendWave: { fontSize: 18, color: '#1565C0' },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#90A4AE',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trendValue: { fontSize: 28, fontWeight: '700', color: '#1A2B3C', marginBottom: 4 },
  trendDesc:  { fontSize: 13, color: '#78909C', lineHeight: 19 },

  // Capture count card
  captureCard: { flexDirection: 'row', alignItems: 'center' },
  captureCardInfo: { flex: 1 },
  captureCount: { fontSize: 34, fontWeight: '700', color: '#1A2B3C', marginTop: 4 },
  chartBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#DDEAFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 5, borderRadius: 2, backgroundColor: '#1565C0' },

  // Filter tabs
  filterScroll: { marginBottom: 4 },
  filterContent: { gap: 8, paddingVertical: 6 },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#E4E8EF',
  },
  filterTabActive: { backgroundColor: '#1A2B4A' },
  filterTabTxt: { fontSize: 14, fontWeight: '600', color: '#546E7A' },
  filterTabTxtActive: { color: '#fff' },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2B3C',
    marginTop: 6,
    marginBottom: 12,
  },

  // Date group label
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#90A4AE',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 2,
  },

  // Capture item
  captureItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  captureItemAlert: { borderLeftColor: '#E53935' },
  captureTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  captureTime: { fontSize: 14, fontWeight: '700', color: '#263238' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  captureMetrics: { flexDirection: 'row', gap: 24 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metricIcon: { fontSize: 14 },
  metricVal: { fontSize: 14, fontWeight: '500', color: '#455A64' },

  // Misc
  empty: { color: '#90A4AE', textAlign: 'center', marginTop: 24, fontSize: 14 },
  bottomPad: { height: 28 },
});