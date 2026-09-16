export interface Voter {
  _id: string;
  studentId: string;
  firstname: string;
  lastname: string;
  district: number;
  hasVoted: boolean;
}