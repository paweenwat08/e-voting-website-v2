import type { Party } from "./Party";

export interface Candidate {
  _id: string;
  number: number;
  firstname: string;
  lastname: string;
  district: number;
  party: string | Party; // รองรับทั้ง string ID และ Object Party ที่ถูก Populate มา
}