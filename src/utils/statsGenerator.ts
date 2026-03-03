import { GradeData, WrappedStat, WrappedMode } from '../types';

const PALETTES = ['green', 'pink', 'blue', 'purple', 'orange'] as const;

// Helper to get text based on mode
const getText = (mode: WrappedMode, encouraging: string, evil: string, mixed?: string) => {
  if (mode === 'encouraging') return encouraging;
  if (mode === 'evil') return evil;
  return mixed || (Math.random() > 0.5 ? encouraging : evil);
};

export function generateStats(data: GradeData, mode: WrappedMode = 'mixed'): WrappedStat[] {
  const stats: WrappedStat[] = [];
  
  // Helper to get best grade details for a course
  const getBestGradeDetails = (course: any) => {
    const a = course.grades.moedA;
    const b = course.grades.moedB;
    if (!b) return a;
    if (!a) return b;
    return b.grade >= a.grade ? b : a;
  };

  const getBestGradeValue = (course: any) => {
    const details = getBestGradeDetails(course);
    return details?.grade || 0;
  };

  const coursesTaken = data.length;
  const moedBCount = data.filter(c => c.grades.moedB).length;
  const allGrades = data.map(getBestGradeValue).filter(g => g > 0);
  const average = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
  
  // 1. Intro
  stats.push({
    id: 'intro',
    type: 'intro',
    template: 'text-focus',
    data: { year: new Date().getFullYear() },
    text: getText(mode, "You made it!", "Prepare yourself.", "Wrapped is here."),
    subtext: getText(mode, "Let's celebrate your journey.", "Let's see the damage.", "Your academic year, defined."),
    colorPalette: 'pink'
  });

  // 2. Total Courses
  stats.push({
    id: 'total-courses',
    type: 'stat',
    template: 'big-number',
    data: { value: coursesTaken },
    text: getText(mode, "Courses Completed", "Courses Survived", "You survived"),
    subtext: getText(mode, "What a productive year!", "Barely.", "courses this year."),
    colorPalette: 'green'
  });

  // 3. Moed B Analysis
  if (moedBCount === 0) {
    stats.push({
      id: 'moed-b-zero',
      type: 'stat',
      template: 'text-focus',
      data: {},
      text: getText(mode, "Perfectionist!", "Nerd Alert.", "Zero. Moed. Bs."),
      subtext: getText(mode, "First try, every time. Amazing.", "Do you even have a social life?", "Are you even a real student?"),
      colorPalette: 'blue'
    });
  } else if (moedBCount > coursesTaken / 2) {
    stats.push({
      id: 'moed-b-high',
      type: 'stat',
      template: 'big-number',
      data: { value: moedBCount },
      text: getText(mode, "Persistence is key!", "Glutton for punishment?", "You loved the exam halls,"),
      subtext: getText(mode, `You didn't give up ${moedBCount} times.`, `You failed to pass ${moedBCount} times on the first try.`, `you went back ${moedBCount} times for Moed B.`),
      colorPalette: 'orange'
    });
  } else {
    stats.push({
      id: 'moed-b-normal',
      type: 'stat',
      template: 'big-number',
      data: { value: moedBCount },
      text: getText(mode, "Second chances taken:", "Wasted time:", "Second chances taken:"),
      subtext: getText(mode, "Smart move to improve.", "Could have been a vacation.", "Because who gets it right the first time?"),
      colorPalette: 'purple'
    });
  }

  // 4. Best Course & Position Logic
  const bestCourse = [...data].sort((a, b) => getBestGradeValue(b) - getBestGradeValue(a))[0];
  if (bestCourse) {
    const details = getBestGradeDetails(bestCourse);
    const grade = details?.grade || 0;
    const position = details?.coursePosition;
    const totalStuds = details?.totalStuds;

    let text = getText(mode, "You absolutely crushed", "Overachiever detected:", "You absolutely crushed");
    let subtext = getText(mode, `${bestCourse.name} with a ${grade}. Amazing work!`, `${bestCourse.name} with a ${grade}. Teacher's pet?`, `${bestCourse.name} with a ${grade}. Nerd.`);

    // Special Position Logic
    if (position === 1) {
      text = getText(mode, "TOP OF THE CLASS!", "Tryhard Alert.", "TOP OF THE CLASS!");
      subtext = getText(mode, `You were #1 in ${bestCourse.name}. Incredible!`, `Rank 1 in ${bestCourse.name}. Nobody likes a show-off.`, `Rank 1 in ${bestCourse.name}. You beat everyone.`);
    } else if (position && totalStuds && position <= totalStuds * 0.1) {
      text = getText(mode, "Top 10% Performance", "Elitist.", "Top 10% Performance");
      subtext = getText(mode, `You ranked ${position} out of ${totalStuds} in ${bestCourse.name}.`, `Rank ${position}/${totalStuds}. Do you want a medal?`, `Rank ${position} out of ${totalStuds} in ${bestCourse.name}.`);
    }

    stats.push({
      id: 'best-course',
      type: 'stat',
      template: 'text-focus',
      data: { course: bestCourse.name, grade },
      text: text,
      subtext: subtext,
      colorPalette: 'green'
    });
  }

  // 5. Average Comparison Logic (Better than average?)
  let aboveAvgCount = 0;
  let totalComparisons = 0;
  let biggestGap = 0;
  let biggestGapCourse = null;

  data.forEach(c => {
    const details = getBestGradeDetails(c);
    if (details && details.avgGrade && details.grade) {
      totalComparisons++;
      if (details.grade > details.avgGrade) {
        aboveAvgCount++;
        const gap = details.grade - details.avgGrade;
        if (gap > biggestGap) {
          biggestGap = gap;
          biggestGapCourse = c;
        }
      }
    }
  });

  if (biggestGapCourse && biggestGap > 15) {
    stats.push({
      id: 'above-avg-king',
      type: 'stat',
      template: 'comparison',
      data: { 
        course: biggestGapCourse.name, 
        before: getBestGradeDetails(biggestGapCourse)?.avgGrade, 
        after: getBestGradeValue(biggestGapCourse),
        labels: ['Average', 'You']
      },
      text: getText(mode, "Way Above Average", "Main Character Syndrome", "Built Different"),
      subtext: getText(mode, `In ${biggestGapCourse.name}, you beat the average by ${biggestGap.toFixed(0)} points!`, `You scored ${biggestGap.toFixed(0)} points higher than the plebs in ${biggestGapCourse.name}.`, `You were ${biggestGap.toFixed(0)} points above average in ${biggestGapCourse.name}.`),
      colorPalette: 'blue'
    });
  } else if (totalComparisons > 0 && aboveAvgCount === totalComparisons) {
     stats.push({
      id: 'always-above-avg',
      type: 'stat',
      template: 'text-focus',
      data: {},
      text: getText(mode, "Consistently Great", "Ego check needed.", "Always Above Average"),
      subtext: getText(mode, "You scored above average in every single course!", "You're better than everyone, we get it.", "You beat the average every single time."),
      colorPalette: 'purple'
    });
  }

  // 6. The "Comeback" (Biggest improvement from A to B)
  let maxImprovement = 0;
  let comebackCourse = null;
  
  data.forEach(c => {
    if (c.grades.moedA && c.grades.moedB) {
      const diff = c.grades.moedB.grade - c.grades.moedA.grade;
      if (diff > maxImprovement) {
        maxImprovement = diff;
        comebackCourse = c;
      }
    }
  });

  if (comebackCourse && maxImprovement > 10) {
    stats.push({
      id: 'comeback',
      type: 'stat',
      template: 'comparison',
      data: { 
        course: comebackCourse.name, 
        before: comebackCourse.grades.moedA.grade, 
        after: comebackCourse.grades.moedB.grade,
        labels: ['Moed A', 'Moed B']
      },
      text: getText(mode, "Comeback of the Year", "Finally got lucky?", "The Comeback"),
      subtext: getText(mode, `In ${comebackCourse.name}, you improved by ${maxImprovement} points!`, `In ${comebackCourse.name}, you went from ${comebackCourse.grades.moedA.grade} to ${comebackCourse.grades.moedB.grade}. Miracle?`, `In ${comebackCourse.name}, you improved from ${comebackCourse.grades.moedA.grade} to ${comebackCourse.grades.moedB.grade}.`),
      colorPalette: 'blue'
    });
  }

  // 7. Hell Week (Most exams in 7 days)
  const exams: {date: Date, course: string, type: string}[] = [];
  data.forEach(c => {
    if (c.grades.moedA?.date) exams.push({ date: new Date(c.grades.moedA.date), course: c.name, type: 'Moed A' });
    if (c.grades.moedB?.date) exams.push({ date: new Date(c.grades.moedB.date), course: c.name, type: 'Moed B' });
  });
  
  exams.sort((a, b) => a.date.getTime() - b.date.getTime());

  let maxExamsInWeek = 0;
  let hellWeekStart = null;

  for (let i = 0; i < exams.length; i++) {
    let count = 0;
    const windowStart = exams[i].date;
    const windowEnd = new Date(windowStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    for (let j = i; j < exams.length; j++) {
      if (exams[j].date <= windowEnd) {
        count++;
      } else {
        break;
      }
    }
    
    if (count > maxExamsInWeek) {
      maxExamsInWeek = count;
      hellWeekStart = windowStart;
    }
  }

  if (maxExamsInWeek >= 3) {
    stats.push({
      id: 'hell-week',
      type: 'stat',
      template: 'big-number',
      data: { value: maxExamsInWeek },
      text: getText(mode, "Warrior Week", "Academic Victim", "Hell Week Detected"),
      subtext: getText(mode, `${maxExamsInWeek} exams in 7 days. Did you remember to eat?`, `${maxExamsInWeek} exams in a week. My condolences.`, `${maxExamsInWeek} exams in 7 days. Survival mode: ON.`),
      colorPalette: 'pink'
    });
  }

  // 8. The "Calculated" Pass (Lowest passing grade)
  const passingGrades = allGrades.filter(g => g >= 55 && g <= 65);
  if (passingGrades.length > 0) {
    const lowestPass = Math.min(...passingGrades);
    const riskyCourse = data.find(c => getBestGradeValue(c) === lowestPass);
    stats.push({
      id: 'risky-pass',
      type: 'stat',
      template: 'text-focus',
      data: { grade: lowestPass },
      text: getText(mode, "A pass is a pass!", "Living dangerously.", "Living on the edge."),
      subtext: getText(mode, `Passed ${riskyCourse?.name} with a ${lowestPass}. You did it!`, `Passed ${riskyCourse?.name} with a ${lowestPass}. Embarrassing.`, `Passed ${riskyCourse?.name} with a ${lowestPass}. A win is a win.`),
      colorPalette: 'orange'
    });
  }

  // 9. Average
  stats.push({
    id: 'average',
    type: 'stat',
    template: 'big-number',
    data: { value: average.toFixed(1) },
    text: getText(mode, "Your Solid Average", "Your Mediocre Average", "Your Average"),
    subtext: getText(mode, average > 85 ? "Dean's list material! Keep it up!" : "Great effort this year!", average > 85 ? "Nerd alert." : "Cs get degrees, right?", average > 85 ? "Dean's list material?" : "Cs get degrees."),
    colorPalette: 'purple'
  });

  // 10. Leaderboard
  const leaderboard = data.map(c => {
    const myGrade = getBestGradeValue(c);
    const avg = getBestGradeDetails(c)?.avgGrade || 0;
    return {
      name: c.name,
      grade: myGrade,
      avg: avg,
      beatAvg: myGrade > avg
    };
  }).sort((a, b) => b.grade - a.grade);

  stats.push({
    id: 'leaderboard',
    type: 'summary',
    template: 'leaderboard',
    data: { leaderboard },
    text: getText(mode, "Hall of Fame", "The Good, The Bad, The Ugly", "Course Leaderboard"),
    subtext: getText(mode, "Look at those numbers!", "Some of these are painful to look at.", "Here is how you stacked up."),
    colorPalette: 'orange'
  });

  // 11. Summary
  stats.push({
    id: 'summary',
    type: 'summary',
    template: 'list',
    data: {
      topCourse: bestCourse?.name,
      topGrade: bestCourse ? getBestGradeValue(bestCourse) : 0,
      totalExams: exams.length,
      average: average.toFixed(1),
      moedBs: moedBCount
    },
    text: getText(mode, "You did great!", "Finally over.", "202X Wrapped"),
    subtext: getText(mode, "Proud of you.", "Try harder next time.", "See you next semester."),
    colorPalette: 'green'
  });

  return stats;
}
