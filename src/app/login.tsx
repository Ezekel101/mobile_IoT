import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef1f8" />
      <ScrollView
        contentContainerStyle={styles.root}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>✚</Text>
            </View>
            <Text style={styles.logoText}>VitalTrack Pro</Text>
          </View>
          <TouchableOpacity style={styles.langBtn}>
            <MaterialCommunityIcons name="earth" size={25} color="#1a3a8f" />
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
           <MaterialCommunityIcons name="shield" size={50} color="#1a3a8f" />
          </View>

          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour suivre vos constantes vitales
          </Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email ou Identifiant</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} />
              <TextInput
                style={styles.input}
                placeholder="nom@exemple.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mot de passe</Text>
              <TouchableOpacity>
                <Text style={styles.forgotBtn}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} />
              <TextInput
                style={[styles.input, { paddingRight: 48 }]}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember + Biometrics */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxLabel}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>Rester connecté</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnLoading]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.submitInner}>
                <Text style={styles.submitText}>Se connecter</Text>
                <Text style={styles.submitArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Nouveau sur VitalTrack ? </Text>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLine}>
            © 2024 VitalTrack Pro. Tous droits réservés.
          </Text>
          <Text style={styles.footerSub}>
            Certifié conforme aux normes de protection des données de santé
            (HDS).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eef1f8",
  },
  root: {
    flexGrow: 1,
    backgroundColor: "#eef1f8",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#dce6f7",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    fontSize: 14,
    color: "#1a3a8f",
    fontWeight: "700",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a3a8f",
    letterSpacing: -0.3,
    marginLeft: 8,
  },
  langBtn: {
    padding: 4,
  },
  langIcon: {
    fontSize: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#1a3a8f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#dce6f7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconCircleText: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  fieldGroup: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  forgotBtn: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a3a8f",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    height: 52,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  optionsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#1a3a8f",
    borderColor: "#1a3a8f",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  checkboxText: {
    fontSize: 14,
    color: "#374151",
  },
  biometricBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  biometricIcon: {
    fontSize: 18,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a3a8f",
    marginLeft: 6,
  },
  submitBtn: {
    width: "100%",
    height: 54,
    backgroundColor: "#1a3a8f",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  submitBtnLoading: {
    backgroundColor: "#2d4eb0",
  },
  submitInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginRight: 8,
  },
  submitArrow: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a3a8f",
  },
  footer: {
    width: "100%",
    alignItems: "center",
    marginTop: 28,
  },
  footerLine: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },
});
