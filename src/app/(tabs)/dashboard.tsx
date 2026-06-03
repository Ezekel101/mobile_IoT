import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  mail: string;
  numero: string;
}

function BarChart({ color }: { color: string }) {
  const bars = [60, 80, 70, 90, 75, 85, 65, 88, 72, 95, 68, 82];
  return (
    <View style={chartStyles.container}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[
            chartStyles.bar,
            {
              height: h * 0.5,
              backgroundColor: color,
              opacity: i === bars.length - 1 ? 1 : 0.5 + i * 0.04,
            },
          ]}
        />
      ))}
    </View>
  );
}

function LineChart() {
  const hrPoints = [65, 68, 70, 72, 69, 71, 73, 70, 72, 74, 71, 70];
  const spo2Points = [97, 98, 97, 99, 98, 97, 98, 99, 98, 97, 98, 99];
  const chartW = width - 64;
  const chartH = 100;

  const toX = (i: number) => (i / (hrPoints.length - 1)) * chartW;
  const toYHR = (v: number) => chartH - ((v - 60) / 20) * chartH;
  const toYSpo2 = (v: number) => chartH - ((v - 95) / 5) * chartH;

  const timeLabels = ["12:00", "12:30", "13:00", "13:30", "14:00"];

  return (
    <View style={lineStyles.wrapper}>
      <View style={lineStyles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={lineStyles.gridLine} />
        ))}
      </View>
      <View style={{ height: chartH, position: "relative" }}>
        {hrPoints.map((v, i) => {
          if (i === hrPoints.length - 1) return null;
          const x1 = toX(i);
          const y1 = toYHR(v);
          const x2 = toX(i + 1);
          const y2 = toYHR(hrPoints[i + 1]);
          const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: x1,
                top: y1,
                width: len,
                height: 2,
                backgroundColor: "#1a3a8f",
                transformOrigin: "0 0",
                transform: [{ rotate: `${angle}deg` }],
              }}
            />
          );
        })}
        {spo2Points.map((v, i) => {
          if (i === spo2Points.length - 1) return null;
          const x1 = toX(i);
          const y1 = toYSpo2(v);
          const x2 = toX(i + 1);
          const y2 = toYSpo2(spo2Points[i + 1]);
          const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: x1,
                top: y1,
                width: len,
                height: 2,
                backgroundColor: "#2dd4bf",
                transformOrigin: "0 0",
                transform: [{ rotate: `${angle}deg` }],
              }}
            />
          );
        })}
      </View>
      <View style={lineStyles.timeRow}>
        {timeLabels.map((t, i) => (
          <Text key={i} style={lineStyles.timeLabel}>{t}</Text>
        ))}
      </View>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const response = await fetch(`http://192.168.43.19:3000/api/patients/${payload.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPatient(data);
    };
    fetchPatient();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patient ? `${patient.prenom[0]}${patient.nom[0]}` : '??'}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{patient ? `${patient.prenom} ${patient.nom}` : 'Chargement...'}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.push("/login")}
        >
          <MaterialIcons name="logout" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>

        {/* Device status */}
        <View style={styles.deviceBanner}>
          <View style={styles.deviceDot} />
          <Text style={styles.deviceText}>MATRIEL: CONNECT</Text>
          <Text style={styles.deviceIp}>IP: 192.168.1.142</Text>
        </View>

        {/* Heart Rate Card */}
        <View style={styles.vitalCard}>
          <View style={styles.vitalCardTop}>
            <View style={[styles.vitalIconBox, { backgroundColor: "#eef1fb" }]}>
              <MaterialCommunityIcons name="heart-pulse" size={26} color="red" />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Normal</Text>
            </View>
          </View>
          <Text style={styles.vitalName}>Fréquence cardiaque</Text>
          <View style={styles.vitalValueRow}>
            <Text style={styles.vitalValue}>70</Text>
            <Text style={styles.vitalUnit}>bpm</Text>
          </View>
          <BarChart color="#4f6fd8" />
        </View>

        {/* SpO2 Card */}
        <View style={styles.vitalCard}>
          <View style={styles.vitalCardTop}>
            <View style={[styles.vitalIconBox, { backgroundColor: "#e8f7f5" }]}>
              <MaterialCommunityIcons name="lungs" size={26} color="blue" />
            </View>
            <View style={[styles.badge, { backgroundColor: "#e6f9f5" }]}>
              <Text style={[styles.badgeText, { color: "#0d9488" }]}>Optimal</Text>
            </View>
          </View>
          <Text style={styles.vitalName}>SpO2</Text>
          <View style={styles.vitalValueRow}>
            <Text style={[styles.vitalValue, { color: "#0d9488" }]}>98</Text>
            <Text style={[styles.vitalUnit, { color: "#0d9488" }]}>%</Text>
          </View>
          <BarChart color="#2dd4bf" />
        </View>

        {/* Trend Chart */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Tendances en temps rรฉel</Text>
            <View style={styles.trendLegend}>
              <View style={[styles.legendDot, { backgroundColor: "#1a3a8f" }]} />
              <Text style={styles.legendText}>HR</Text>
              <View style={[styles.legendDot, { backgroundColor: "#2dd4bf" }]} />
              <Text style={styles.legendText}>SpO2</Text>
            </View>
          </View>
          <LineChart />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      {/* <View style={styles.tabBar}>
        {[
          { key: "dashboard", icon: "๐???", label: "Tableau de bord" },
          { key: "history", icon: "๐???", label: "Historique" },
          { key: "alerts", icon: "๐???", label: "Alertes" },
          { key: "profile", icon: "๐??ค", label: "Profil" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
          >
            {activeTab === tab.key ? (
              <View style={styles.activeTab}>
                <Text style={styles.tabIconActive}>{tab.icon}</Text>
                <Text style={styles.tabLabelActive}>{tab.label}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={styles.tabLabel}>{tab.label}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View> */}
    </SafeAreaView>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 50,
    gap: 3,
    marginTop: 12,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
  },
});

const lineStyles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#f5f7fa",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dce6f7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a3a8f",
    marginLeft: 8,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    fontSize: 18,
  },
  root: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  deviceBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  deviceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  deviceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  deviceIp: {
    fontSize: 12,
    color: "#9ca3af",
  },
  vitalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vitalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  vitalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  vitalIconText: { fontSize: 22 },
  badge: {
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a3a8f",
  },
  vitalName: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  vitalValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  vitalValue: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1a3a8f",
    lineHeight: 48,
  },
  vitalUnit: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
    marginLeft: 4,
  },
  trendCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  trendTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  trendLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#6b7280",
    marginRight: 6,
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#1a3a8f",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  tabIcon: { fontSize: 20 },
  tabLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
  },
  tabIconActive: { fontSize: 16 },
  tabLabelActive: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
  },
});
