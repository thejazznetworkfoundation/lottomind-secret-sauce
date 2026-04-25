export type PsychicEventName =
  | 'PSYCHIC_DAILY_FORTUNE_READY'
  | 'PSYCHIC_READING_SAVED'
  | 'PSYCHIC_UNLOCK_EXPIRED';

export function emitPsychicEvent(eventName: PsychicEventName, payload?: Record<string, unknown>): void {
  if (__DEV__) {
    console.log(`[PsychicEvent] ${eventName}`, payload ?? {});
  }
}
