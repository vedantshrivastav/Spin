import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  radius,
} from "../../constants/theme";

// ── Types ─────────────────────────────────────────────────

type Person = {
  id: string;
  name: string;
};

type SavedGroup = {
  id: string;
  name: string;
  members: Person[];
};

// ── Dummy Saved Groups (replace with AsyncStorage later) ──

const DUMMY_SAVED_GROUPS: SavedGroup[] = [
  {
    id: "1",
    name: "Flatmates",
    members: [
      { id: "1", name: "Rahul" },
      { id: "2", name: "Priya" },
      { id: "3", name: "Karan" },
    ],
  },
  {
    id: "2",
    name: "College Gang",
    members: [
      { id: "1", name: "John" },
      { id: "2", name: "Sara" },
      { id: "3", name: "Mike" },
      { id: "4", name: "Ananya" },
    ],
  },
];

const MAX_PEOPLE = 10;

// ── Helpers ───────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Avatar ────────────────────────────────────────────────

function Avatar({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <View style={styles.avatarWrapper}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
        {onRemove && (
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.avatarName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

// ── Saved Group Card ──────────────────────────────────────

function SavedGroupCard({
  group,
  onSelect,
}: {
  group: SavedGroup;
  onSelect: () => void;
}) {
  const preview = group.members
    .slice(0, 3)
    .map((m) => m.name)
    .join(", ");
  const extra = group.members.length > 3 ? ` +${group.members.length - 3}` : "";

  return (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View style={styles.groupCardLeft}>
        <Text style={styles.groupCardName}>{group.name}</Text>
        <Text style={styles.groupCardMembers}>
          {preview}
          {extra}
        </Text>
      </View>
      <View style={styles.groupCardBadge}>
        <Text style={styles.groupCardBadgeText}>{group.members.length}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Group Setup Screen ────────────────────────────────────

export default function GroupSetupScreen() {
  const router = useRouter();

  // TODO: replace with useGroupStore() once store is set up
  const savedGroups = DUMMY_SAVED_GROUPS;

  const [members, setMembers] = useState<Person[]>([]);
  const [inputName, setInputName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [saveGroup, setSaveGroup] = useState(false);

  const addMember = () => {
    const trimmed = inputName.trim();
    if (!trimmed) return;

    if (members.length >= MAX_PEOPLE) {
      Alert.alert(
        "Limit reached",
        `You can add a maximum of ${MAX_PEOPLE} people.`,
      );
      return;
    }

    if (members.find((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert("Duplicate", "This person is already added.");
      return;
    }

    setMembers((prev) => [...prev, { id: generateId(), name: trimmed }]);
    setInputName("");
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSelectSavedGroup = (group: SavedGroup) => {
    setMembers(group.members.map((m) => ({ ...m, id: generateId() })));
    setGroupName(group.name);
  };

  const handleProceed = () => {
    if (members.length < 2) {
      Alert.alert(
        "Add more people",
        "You need at least 2 people to split a bill.",
      );
      return;
    }
    // TODO: if saveGroup → save to AsyncStorage
    // TODO: navigate to scan screen passing members
    router.push("/new-bill");
  };

  const isAtLimit = members.length >= MAX_PEOPLE;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who's splitting?</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Saved Groups */}
        {savedGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved groups</Text>
            {savedGroups.map((group) => (
              <SavedGroupCard
                key={group.id}
                group={group}
                onSelect={() => handleSelectSavedGroup(group)}
              />
            ))}
          </View>
        )}

        {/* Divider */}
        {savedGroups.length > 0 && (
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or create new</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        {/* Add Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Add people{" "}
            <Text style={styles.sectionCount}>
              ({members.length}/{MAX_PEOPLE})
            </Text>
          </Text>

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={colors.gray700}
              value={inputName}
              onChangeText={setInputName}
              onSubmitEditing={addMember}
              returnKeyType="done"
              editable={!isAtLimit}
            />
            <TouchableOpacity
              style={[styles.addBtn, isAtLimit && styles.addBtnDisabled]}
              onPress={addMember}
              disabled={isAtLimit}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {isAtLimit && (
            <Text style={styles.limitText}>
              Maximum {MAX_PEOPLE} people reached
            </Text>
          )}

          {/* Members Row */}
          {members.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.membersScroll}
              contentContainerStyle={styles.membersContent}
            >
              {members.map((member) => (
                <Avatar
                  key={member.id}
                  name={member.name}
                  onRemove={() => removeMember(member.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Save Group Option */}
        {members.length >= 2 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.saveGroupRow}
              onPress={() => setSaveGroup((prev) => !prev)}
              activeOpacity={0.75}
            >
              <View
                style={[styles.checkbox, saveGroup && styles.checkboxChecked]}
              >
                {saveGroup && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.saveGroupLabel}>
                Save this group for later
              </Text>
            </TouchableOpacity>

            {saveGroup && (
              <TextInput
                style={[styles.input, { marginTop: spacing.sm }]}
                placeholder="Group name (e.g. Flatmates)"
                placeholderTextColor={colors.gray700}
                value={groupName}
                onChangeText={setGroupName}
                returnKeyType="done"
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Proceed Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.proceedBtn,
            members.length < 2 && styles.proceedBtnDisabled,
          ]}
          onPress={handleProceed}
          activeOpacity={0.85}
          disabled={members.length < 2}
        >
          <Text style={styles.proceedBtnText}>
            Proceed with {members.length > 0 ? members.length : ""}{" "}
            {members.length === 1
              ? "person"
              : members.length >= 2
                ? "people"
                : "people"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.gray200,
  },
  backBtnText: {
    fontSize: fontSize.lg,
    color: colors.black,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.black,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.black,
    marginBottom: spacing.md,
  },
  sectionCount: {
    fontWeight: fontWeight.regular,
    color: colors.gray700,
  },

  // Saved Group Card
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.gray200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupCardLeft: { flex: 1 },
  groupCardName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.black,
    marginBottom: 2,
  },
  groupCardMembers: {
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
  groupCardBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  groupCardBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    fontSize: fontSize.xs,
    color: colors.gray700,
  },

  // Input
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.black,
    borderWidth: 0.5,
    borderColor: colors.gray200,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    backgroundColor: colors.gray200,
  },
  addBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  limitText: {
    fontSize: fontSize.xs,
    color: colors.warning,
    marginBottom: spacing.sm,
  },

  // Members
  membersScroll: {
    marginTop: spacing.sm,
  },
  membersContent: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  avatarWrapper: {
    alignItems: "center",
    width: 60,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarInitials: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  removeBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  avatarName: {
    fontSize: fontSize.xs,
    color: colors.black,
    textAlign: "center",
    width: 56,
  },

  // Save Group
  saveGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 11,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  saveGroupLabel: {
    fontSize: fontSize.base,
    color: colors.black,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
  },
  proceedBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  proceedBtnDisabled: {
    backgroundColor: colors.gray200,
  },
  proceedBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});
