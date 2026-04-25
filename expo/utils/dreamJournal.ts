import AsyncStorage from '@react-native-async-storage/async-storage';

export type JournalEntryType = 'dream' | 'journal';

export type DreamJournalEntry = {
  id: string;
  type: JournalEntryType;
  title: string;
  text: string;
  mood?: string;
  symbols?: string[];
  luckyNumbers?: number[];
  oracleMeaning?: string;
  createdAt: string;
  updatedAt: string;
  favorite?: boolean;
};

export type NewDreamJournalEntry = Omit<DreamJournalEntry, 'id' | 'createdAt' | 'updatedAt'>;

const DREAM_JOURNAL_STORAGE_KEY = 'LOTTO_MIND_DREAM_JOURNAL_ENTRIES_V1';

function makeJournalId(type: JournalEntryType) {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getEntries(): Promise<DreamJournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(DREAM_JOURNAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('[DreamJournal] Failed to load entries', error);
    return [];
  }
}

export async function addEntry(entry: NewDreamJournalEntry): Promise<DreamJournalEntry> {
  const now = new Date().toISOString();
  const nextEntry: DreamJournalEntry = {
    ...entry,
    id: makeJournalId(entry.type),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const entries = await getEntries();
    await AsyncStorage.setItem(DREAM_JOURNAL_STORAGE_KEY, JSON.stringify([nextEntry, ...entries]));
  } catch (error) {
    console.log('[DreamJournal] Failed to save entry', error);
    throw error;
  }

  return nextEntry;
}

export async function updateEntry(
  entryId: string,
  updates: Partial<Omit<DreamJournalEntry, 'id' | 'createdAt'>>
): Promise<DreamJournalEntry | null> {
  const entries = await getEntries();
  let updatedEntry: DreamJournalEntry | null = null;
  const nextEntries = entries.map((entry) => {
    if (entry.id !== entryId) return entry;
    updatedEntry = {
      ...entry,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return updatedEntry;
  });

  await AsyncStorage.setItem(DREAM_JOURNAL_STORAGE_KEY, JSON.stringify(nextEntries));
  return updatedEntry;
}

export async function deleteEntry(entryId: string): Promise<void> {
  const entries = await getEntries();
  await AsyncStorage.setItem(
    DREAM_JOURNAL_STORAGE_KEY,
    JSON.stringify(entries.filter((entry) => entry.id !== entryId))
  );
}

export async function clearEntries(): Promise<void> {
  await AsyncStorage.removeItem(DREAM_JOURNAL_STORAGE_KEY);
}
