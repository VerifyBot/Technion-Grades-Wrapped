async function fetchIndex() {
    const resp = await fetch("https://grades.technion.ac.il/index.aspx", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9,he;q=0.8",
    "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "upgrade-insecure-requests": "1"
  },
  "referrer": "https://grades.technion.ac.il/",
  "body": null,
  "method": "GET",
  "credentials": "include"
});
    // 1. Get the raw binary buffer instead of text
  const buffer = await resp.arrayBuffer();

  // 2. Decode the raw data explicitly as Windows-1255
  const decoder = new TextDecoder('windows-1255');
  return decoder.decode(buffer);
}

const content = await fetchIndex()

function extractLastSemesterCourses(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const courseLinks = doc.querySelectorAll('#sem0 .sub-menu a.ga-course');
    const courses = [];

    courseLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Extract just the numbers after cID=
        const cidMatch = href.match(/cID=(\d+)/);
        const cid = cidMatch ? cidMatch[1] : href;

        const rawText = link.textContent.replace(/\s+/g, ' ').trim();
        const textMatch = rawText.match(/(\d{6,7})\s+(.*)/);

        if (textMatch) {
            courses.push({
                name: textMatch[2].trim(),
                id: textMatch[1],
                cid: cid // <-- Fixed! Now passing the extracted number
            });
        }
    });

    return courses;
}

const lastSemesterCourses = extractLastSemesterCourses(content);

const isNotNumber = (str) => !Number.isFinite(+str);

async function processCourseData(lastSemesterCourses) {
    const fetchOptions = {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "accept-language": "en-US,en;q=0.9,he;q=0.8",
        },
        "method": "GET",
        "credentials": "include"
    };

    // Helper to fetch and decode Windows-1255 properly
    async function fetchHtml(url) {
        const resp = await fetch(url, fetchOptions);
        const buffer = await resp.arrayBuffer();
        const decoder = new TextDecoder('windows-1255');
        const html = decoder.decode(buffer);
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }

    // Helper to safely extract stats from the chart row
    function extractStats(chartRow) {
        if (!chartRow) return null;
        const tds = chartRow.querySelectorAll('td');
        return {
            "Students": tds[5]?.textContent.trim() || null,
            "Pass/Fail": tds[6]?.textContent.trim() || null,
            "Pass(%)": tds[7]?.textContent.trim() || null,
            "Your location": tds[8]?.textContent.trim() || null,
            "Min": tds[9]?.textContent.trim() || null,
            "Max": tds[10]?.textContent.trim() || null,
            "Average": tds[11]?.textContent.trim() || null,
            "Median": tds[12]?.textContent.trim() || null,
            "STD": tds[13]?.textContent.trim() || null,
            "IQR": tds[14]?.textContent.trim() || null,
            "Date": tds[15]?.textContent.trim() || null,
        };
    }

    for (let course of lastSemesterCourses) {
        course.moedA = null;
        course.moedB = null;

        // Fetch the main course content page
        const courseUrl = `https://grades.technion.ac.il/content.aspx?cID=${course.cid}`;
        const courseDoc = await fetchHtml(courseUrl);

        // Find the grades table
        const gradeRows = courseDoc.querySelectorAll('#cBody_GV_StudentGrade tbody tr');

        // Parse each row in the grades table
        for (const row of gradeRows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 8) continue; // Skip invalid rows

            const task = cells[3].textContent.trim();
            const category = cells[4].textContent.trim();
            let grade = cells[5].textContent.trim();
            let date = cells[6].innerHTML.replace(/<br[^>]*>/i, ' ').trim().replace('&nbsp;', '')
                            || cells[7].innerHTML.replace(/<br[^>]*>/i, ' ').trim().replace('&nbsp;', ''); // Format multiline dates nicely
            
            // Check if grade hasn't been published yet
            if (grade.includes("לא התרחשה") || grade.includes("עדין") || !grade || isNotNumber(grade)) {
                grade = null;
                continue
            }

            // Look for the tID to fetch chart data
            const chartLink = row.querySelector('a.histogram');
            const tIDMatch = chartLink ? chartLink.getAttribute('href').match(/tID=(\d+)/) : null;
            const tID = tIDMatch ? tIDMatch[1] : null;

            let stats = null;
            if (tID) {
                // Fetch the stats chart page
                const chartUrl = `https://grades.technion.ac.il/chart.aspx?tID=${tID}`;
                const chartDoc = await fetchHtml(chartUrl);
                const chartRow = chartDoc.querySelector('#gvChart tbody tr');
                stats = extractStats(chartRow);
                if (stats.Date) date = stats.Date
            }

            const examData = {
                category: category,
                grade: grade,
                date: date,
                stats: stats
            };

            // Map to moedA or moedB based on fallbacks
            if (task === "Final A" || task === "Finals" || task === "Exam A") {
                course.moedA = examData;
            } else if (task === "Final B" || task === "Exam B") {
                course.moedB = examData;
            }
        }
    }

    return lastSemesterCourses;
}

const normalizeDate = (dateStr) => {
  if (!dateStr) return dateStr;

  // Split the string into the date part and the time part (if it exists)
  const [datePart, timePart] = dateStr.split(' ');

  // Extract day, month, and year from DD/MM/YYYY
  const [day, month, year] = datePart.split('/');

  // Default to 9:00:00 AM
  let hours = 9, minutes = 0, seconds = 0;

  // If a time part exists, override the defaults
  if (timePart) {
    const parsedTime = timePart.split(':');
    hours = parseInt(parsedTime[0], 10);
    minutes = parseInt(parsedTime[1], 10) || 0;
    seconds = parseInt(parsedTime[2], 10) || 0;
  }

  // Use Date.UTC to prevent local timezone offsets from shifting the output
  // Note: month is 0-indexed in JS (January is 0, February is 1, etc.), so we subtract 1
  const dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

  // .toISOString() returns exactly the "YYYY-MM-DDTHH:mm:ss.sssZ" format you want
  return dateObj.toISOString();
};

const normalizeExamData = (data) => {
  return data.map(course => {
    // Create a shallow copy of the course to avoid mutating your original data
    const updatedCourse = { ...course };

    // Update moedA date if it exists
    if (updatedCourse.moedA && updatedCourse.moedA.date) {
      updatedCourse.moedA = { 
        ...updatedCourse.moedA, 
        date: normalizeDate(updatedCourse.moedA.date) 
      };
    }

    // Update moedB date if it exists
    if (updatedCourse.moedB && updatedCourse.moedB.date) {
      updatedCourse.moedB = { 
        ...updatedCourse.moedB, 
        date: normalizeDate(updatedCourse.moedB.date) 
      };
    }

    return updatedCourse;
  });
};

// Call the function
const results = normalizeExamData(await processCourseData(lastSemesterCourses));

function transformGrades(data) {
  return data
    .map(course => {
      const transformedCourse = {
        name: course.name,
        grades: {}
      };

      ['moedA', 'moedB'].forEach(moed => {
        const examData = course[moed];
        
        // Only map if the exam and stats exist
        if (examData && examData.stats) {
          const stats = examData.stats;
          
          transformedCourse.grades[moed] = {
            grade: parseInt(examData.grade, 10),
            date: examData.date,
            
            // All statistical parameters included
            totalStuds: parseInt(stats.Students, 10),
            coursePosition: parseInt(stats['Your location'], 10),
            avgGrade: parseFloat(stats.Average),
            medianGrade: parseInt(stats.Median, 10),
            minGrade: parseInt(stats.Min, 10),
            maxGrade: parseInt(stats.Max, 10),
            passPercentage: parseInt(stats['Pass(%)'], 10),
            passFail: stats['Pass/Fail'], // Kept as string (e.g., "142/25")
            stdDev: parseFloat(stats.STD),
            iqr: stats.IQR                // Kept as string (e.g., "23=85-62")
          };
        }
      });

      return transformedCourse;
    })
    // Filter out courses with no valid grades yet
    .filter(course => Object.keys(course.grades).length > 0);
}

// Download JSON file
const downloadDataAsJSON = (data, filename = 'grades.json') => {
  // 1. Convert the JavaScript object to a formatted JSON string
  const jsonString = JSON.stringify(data, null, 2);

  // 2. Create a Blob (Binary Large Object) representing the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });

  // 3. Create a temporary URL pointing to the Blob
  const url = URL.createObjectURL(blob);

  // 4. Create an invisible anchor (<a>) element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // 5. Append it to the document, click it to trigger the download, and clean up
  document.body.appendChild(link);
  link.click();
  
  // Clean up the DOM and free up memory
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Call the download function
downloadDataAsJSON(transformGrades(results));