import { GradeData } from '../types';

export const MOCK_GRADES: GradeData = [
  {
    name: "Introduction to Computer Science",
    grades: {
      moedA: { grade: 95, avgGrade: 78, coursePosition: 5, totalStuds: 150, date: "2024-01-15" }
    }
  },
  {
    name: "Calculus 1",
    grades: {
      moedA: { grade: 65, avgGrade: 70, coursePosition: 100, totalStuds: 200, date: "2024-01-20" },
      moedB: { grade: 88, avgGrade: 72, coursePosition: 20, totalStuds: 50, date: "2024-02-15" }
    }
  },
  {
    name: "Linear Algebra",
    grades: {
      moedA: { grade: 54, avgGrade: 65, coursePosition: 180, totalStuds: 200, date: "2024-01-25" },
      moedB: { grade: 56, avgGrade: 68, coursePosition: 150, totalStuds: 100, date: "2024-02-20" }
    }
  },
  {
    name: "Physics 1",
    grades: {
      moedA: { grade: 92, avgGrade: 75, coursePosition: 10, totalStuds: 120, date: "2024-01-18" }
    }
  },
  {
    name: "Data Structures",
    grades: {
      moedA: { grade: 40, avgGrade: 60, coursePosition: 140, totalStuds: 150, date: "2024-06-10" },
      moedB: { grade: 98, avgGrade: 65, coursePosition: 1, totalStuds: 80, date: "2024-07-15" }
    }
  },
  {
    name: "Algorithms",
    grades: {
      moedA: { grade: 85, avgGrade: 82, coursePosition: 30, totalStuds: 100, date: "2024-06-14" }
    }
  },
  {
    name: "Operating Systems",
    grades: {
      moedA: { grade: 70, avgGrade: 70, coursePosition: 50, totalStuds: 100, date: "2024-06-20" }
    }
  },
  {
    name: "Logic",
    grades: {
      moedA: { grade: 100, avgGrade: 80, coursePosition: 1, totalStuds: 100, date: "2024-01-10" }
    }
  }
];
