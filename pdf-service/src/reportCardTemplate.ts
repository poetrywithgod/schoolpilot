// Builds the HTML for a single student's report card. Kept as plain
// string templating (no JSX) since this runs in a small Node service
// rendered through Puppeteer, not React.

interface SchoolInfo {
  name: string
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
}

interface SubjectResult {
  subjectName: string
  ca1: number
  ca2: number
  exam: number
  total: number
  grade: string
  position: number | null
}

interface ReportCardData {
  school: SchoolInfo
  student: {
    firstName: string
    lastName: string
    regNumber: string
    className: string
    photoUrl: string | null
  }
  term: {
    name: string
    sessionLabel: string // e.g. "2025/2026 Academic Session"
  }
  subjects: SubjectResult[]
  summary: {
    totalScore: number
    averageScore: number
    classPosition: number | null
    totalStudentsInClass: number | null
  }
  remarks: {
    classTeacher: string | null
    headTeacher: string | null
  }
}

const gradeRemark = (grade: string) => {
  const map: Record<string, string> = {
    A1: 'Excellent', B2: 'Very Good', B3: 'Good',
    C4: 'Credit', C5: 'Credit', C6: 'Credit',
    D7: 'Pass', E8: 'Pass', F9: 'Fail',
  }
  return map[grade] ?? '-'
}

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export const buildReportCardHtml = (data: ReportCardData): string => {
  const { school, student, term, subjects, summary, remarks } = data

  const subjectRows = subjects.map((s) => `
    <tr>
      <td class="subject-name">${s.subjectName}</td>
      <td class="num">${s.ca1}</td>
      <td class="num">${s.ca2}</td>
      <td class="num">${s.exam}</td>
      <td class="num total">${s.total}</td>
      <td class="num grade">${s.grade}</td>
      <td>${gradeRemark(s.grade)}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a1a;
    padding: 32px 40px;
    font-size: 12px;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 3px solid #0C3B2E;
    padding-bottom: 16px;
    margin-bottom: 20px;
  }
  .logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    border-radius: 8px;
  }
  .school-name {
    font-size: 22px;
    font-weight: 800;
    color: #0C3B2E;
  }
  .school-meta {
    font-size: 10px;
    color: #555;
    margin-top: 2px;
    line-height: 1.5;
  }
  .doc-title {
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    background: #0C3B2E;
    color: white;
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 18px;
  }
  .student-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 24px;
    margin-bottom: 20px;
    font-size: 12px;
  }
  .student-info .label { color: #888; font-weight: 600; display: inline-block; width: 90px; }
  table.results {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18px;
  }
  table.results th {
    background: #0C3B2E;
    color: white;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 6px;
    text-align: left;
  }
  table.results td {
    padding: 7px 6px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 11px;
  }
  table.results td.num { text-align: center; }
  table.results td.total { font-weight: 700; }
  table.results td.grade { font-weight: 700; text-align: center; }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .summary-box {
    background: #f0f7f0;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
  }
  .summary-box .value { font-size: 18px; font-weight: 800; color: #0C3B2E; }
  .summary-box .label { font-size: 9px; color: #6D9773; text-transform: uppercase; margin-top: 2px; }
  .remarks { margin-bottom: 24px; }
  .remarks .block { margin-bottom: 10px; }
  .remarks .block .title { font-size: 10px; font-weight: 700; color: #0C3B2E; text-transform: uppercase; margin-bottom: 3px; }
  .remarks .block .text { font-size: 11px; min-height: 16px; border-bottom: 1px dotted #ccc; padding-bottom: 4px; }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 30px;
  }
  .sig-line { border-top: 1px solid #333; padding-top: 4px; font-size: 10px; color: #555; }
  .footer { text-align: center; font-size: 9px; color: #aaa; margin-top: 30px; }
</style>
</head>
<body>

  <div class="header">
    ${school.logo_url ? `<img class="logo" src="${school.logo_url}" />` : ''}
    <div>
      <div class="school-name">${school.name}</div>
      <div class="school-meta">
        ${school.address ?? ''}<br/>
        ${school.phone ? `Tel: ${school.phone}` : ''} ${school.email ? `&nbsp;&middot;&nbsp; ${school.email}` : ''}
      </div>
    </div>
  </div>

  <div class="doc-title">Student Report Card &mdash; ${term.name}, ${term.sessionLabel}</div>

  <div class="student-info">
    <div><span class="label">Name:</span> ${student.lastName} ${student.firstName}</div>
    <div><span class="label">Reg Number:</span> ${student.regNumber}</div>
    <div><span class="label">Class:</span> ${student.className}</div>
    <div><span class="label">Position:</span> ${summary.classPosition ? `${ordinal(summary.classPosition)} of ${summary.totalStudentsInClass}` : 'Not ranked'}</div>
  </div>

  <table class="results">
    <thead>
      <tr>
        <th>Subject</th>
        <th>CA1</th>
        <th>CA2</th>
        <th>Exam</th>
        <th>Total</th>
        <th>Grade</th>
        <th>Remark</th>
      </tr>
    </thead>
    <tbody>
      ${subjectRows}
    </tbody>
  </table>

  <div class="summary-grid">
    <div class="summary-box">
      <div class="value">${subjects.length}</div>
      <div class="label">Subjects</div>
    </div>
    <div class="summary-box">
      <div class="value">${summary.totalScore}</div>
      <div class="label">Total Score</div>
    </div>
    <div class="summary-box">
      <div class="value">${summary.averageScore}%</div>
      <div class="label">Average</div>
    </div>
    <div class="summary-box">
      <div class="value">${summary.classPosition ? ordinal(summary.classPosition) : '-'}</div>
      <div class="label">Class Position</div>
    </div>
  </div>

  <div class="remarks">
    <div class="block">
      <div class="title">Class Teacher's Remark</div>
      <div class="text">${remarks.classTeacher ?? '&nbsp;'}</div>
    </div>
    <div class="block">
      <div class="title">Head Teacher's Remark</div>
      <div class="text">${remarks.headTeacher ?? '&nbsp;'}</div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-line">Class Teacher's Signature</div>
    <div class="sig-line">Head Teacher's Signature</div>
  </div>

  <div class="footer">Generated by SchoolPilot &middot; ${school.name}</div>

</body>
</html>
  `
}