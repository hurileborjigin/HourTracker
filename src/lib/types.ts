export interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  tipAmount: number | null;
  createdAt: string;
}
