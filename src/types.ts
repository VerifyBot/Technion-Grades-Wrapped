export interface GradeDetails {
  grade: number;
  avgGrade?: number;
  coursePosition?: number; // 1 for highest, or rank
  totalStuds?: number;
  date?: string; // ISO string
}

export interface CourseGrades {
  moedA?: GradeDetails | null;
  moedB?: GradeDetails | null;
  moedC?: GradeDetails | null; // Just in case
}

export interface Course {
  name: string;
  grades: CourseGrades;
}

export type GradeData = Course[];

export type WrappedMode = 'encouraging' | 'evil' | 'mixed';

export interface WrappedStat {
  id: string;
  type: 'intro' | 'summary' | 'stat';
  template: 'big-number' | 'list' | 'comparison' | 'text-focus' | 'leaderboard';
  data: any;
  text: string;
  subtext?: string;
  colorPalette: 'green' | 'pink' | 'blue' | 'purple' | 'orange';
}
