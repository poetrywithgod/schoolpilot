import express from 'express'
import cors from 'cors'
import puppeteer from 'puppeteer'
import { createClient } from '@supabase/supabase-js'
import { buildReportCardHtml } from './reportCardTemplate.js'

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let browserPromise: ReturnType<typeof puppeteer.launch> | null = null
const getBrowser = () => {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }
  return browserPromise
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.get('/report-card/:studentId/:termId', async (req, res) => {
  const { studentId, termId } = req.params

  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('first_name, last_name, reg_number, photo_url, class_id, school_id, classes(level, arm)')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('name, address, phone, email, logo_url')
      .eq('id', student.school_id)
      .single()

    if (schoolError || !school) {
      return res.status(404).json({ error: 'School not found' })
    }

    const { data: term, error: termError } = await supabase
      .from('terms')
      .select('name, session')
      .eq('id', termId)
      .single()

    if (termError || !term) {
      return res.status(404).json({ error: 'Term not found' })
    }

    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select(`
        ca1_score, ca2_score, exam_score, total_score, grade, position,
        subject_assignment:subject_assignments(subject:subjects(name))
      `)
      .eq('student_id', studentId)
      .eq('term_id', termId)
      .eq('is_published', true)

    if (resultsError) throw resultsError

    const { data: summary } = await supabase
      .from('term_summaries')
      .select('total_score, average_score, class_position, total_students_in_class, class_teacher_remark, head_teacher_remark')
      .eq('student_id', studentId)
      .eq('term_id', termId)
      .maybeSingle()

    const classInfo: any = Array.isArray(student.classes) ? student.classes[0] : student.classes

    const subjects = (results ?? []).map((r: any) => {
      const sa = Array.isArray(r.subject_assignment) ? r.subject_assignment[0] : r.subject_assignment
      const subj = Array.isArray(sa?.subject) ? sa.subject[0] : sa?.subject
      return {
        subjectName: subj?.name ?? 'Unknown Subject',
        ca1: Number(r.ca1_score ?? 0),
        ca2: Number(r.ca2_score ?? 0),
        exam: Number(r.exam_score ?? 0),
        total: Number(r.total_score ?? 0),
        grade: r.grade ?? '-',
        position: r.position ?? null,
      }
    })

    const html = buildReportCardHtml({
      school: {
        name: school.name,
        address: school.address,
        phone: school.phone,
        email: school.email,
        logo_url: school.logo_url,
      },
      student: {
        firstName: student.first_name,
        lastName: student.last_name,
        regNumber: student.reg_number,
        className: classInfo ? `${classInfo.level} ${classInfo.arm}` : 'No class',
        photoUrl: student.photo_url,
      },
      term: {
        name: term.name,
        sessionLabel: (term as any).session ?? '',
      },
      subjects,
      summary: {
        totalScore: summary?.total_score ?? 0,
        averageScore: summary?.average_score ?? 0,
        classPosition: summary?.class_position ?? null,
        totalStudentsInClass: summary?.total_students_in_class ?? null,
      },
      remarks: {
        classTeacher: summary?.class_teacher_remark ?? null,
        headTeacher: summary?.head_teacher_remark ?? null,
      },
    })

    const browser = await getBrowser()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    })
    await page.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${student.reg_number}-report-card.pdf"`
    )
    res.send(pdfBuffer)
  } catch (err: any) {
    console.error('Report card generation failed:', err)
    res.status(500).json({ error: err.message || 'Failed to generate report card' })
  }
})

const PORT = process.env.PORT || 4001
app.listen(PORT, () => {
  console.log(`PDF service running on port ${PORT}`)
})