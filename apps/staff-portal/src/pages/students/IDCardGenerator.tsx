import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { useSchoolStore } from '../../store/schoolStore'
import { getStudents } from '../../services/student.service'
import { getClasses } from '../../services/class.service'

interface Student {
  id: string
  first_name: string
  last_name: string
  middle_name: string | null
  reg_number: string
  gender: string | null
  photo_url: string | null
  class_id: string | null
  classes: { level: string; arm: string } | null
}

export const IDCardGenerator = () => {
  const { user } = useAuthStore()
  const { school } = useSchoolStore()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [classFilter, setClassFilter] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.schoolId) return
      setIsLoading(true)
      try {
        const [studentData, classData] = await Promise.all([
          getStudents(user.schoolId),
          getClasses(user.schoolId),
        ])
        setStudents(studentData)
        setClasses(classData)
      } catch {
        setError('Failed to load students')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.schoolId])

  const filtered = classFilter
    ? students.filter((s) => s.class_id === classFilter)
    : students

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelected(filtered.map((s) => s.id))
  }

  const clearAll = () => setSelected([])

  const generateIDCards = () => {
    const selectedStudents = students.filter((s) => selected.includes(s.id))

    const cardsHTML = selectedStudents.map((student) => `
      <div style="
        width: 85mm;
        height: 54mm;
        border: 2px solid #1d4ed8;
        border-radius: 8px;
        padding: 10px;
        display: inline-flex;
        flex-direction: column;
        justify-content: space-between;
        margin: 5px;
        background: white;
        font-family: Arial, sans-serif;
        page-break-inside: avoid;
        box-sizing: border-box;
      ">
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
          <div style="width: 28px; height: 28px; background: #1d4ed8; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: 900; font-size: 14px;">S</span>
          </div>
          <div>
            <p style="font-size: 9px; font-weight: 700; color: #1d4ed8; margin: 0;">${school?.name ?? 'SchoolPilot'}</p>
            <p style="font-size: 7px; color: #6b7280; margin: 0;">Student ID Card</p>
          </div>
        </div>

        <!-- Body -->
        <div style="display: flex; gap: 8px; flex: 1; padding: 6px 0;">
          <!-- Photo -->
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #eff6ff;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #bfdbfe;
            overflow: hidden;
            flex-shrink: 0;
          ">
            ${student.photo_url
              ? `<img src="${student.photo_url}" style="width: 100%; height: 100%; object-fit: cover;" />`
              : `<span style="font-size: 14px; font-weight: 700; color: #1d4ed8;">${student.first_name[0]}${student.last_name[0]}</span>`
            }
          </div>

          <!-- Info -->
          <div style="flex: 1;">
            <p style="font-size: 10px; font-weight: 700; color: #111827; margin: 0 0 2px 0;">
              ${student.last_name} ${student.first_name}
              ${student.middle_name ? student.middle_name : ''}
            </p>
            <p style="font-size: 8px; color: #6b7280; margin: 0 0 2px 0;">
              Class: <strong>${student.classes ? `${student.classes.level} ${student.classes.arm}` : '—'}</strong>
            </p>
            <p style="font-size: 8px; color: #6b7280; margin: 0 0 2px 0;">
              Gender: <strong style="text-transform: capitalize;">${student.gender ?? '—'}</strong>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          background: #1d4ed8;
          border-radius: 4px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <p style="font-size: 9px; font-weight: 700; color: white; margin: 0; letter-spacing: 1px;">
            ${student.reg_number}
          </p>
          <p style="font-size: 7px; color: #bfdbfe; margin: 0;">
            2025/2026
          </p>
        </div>
      </div>
    `).join('')

    const printContent = `
      <html>
        <head>
          <title>ID Cards — ${school?.name}</title>
          <style>
            body { margin: 10px; background: white; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 16px; font-family: Arial; font-size: 13px; color: #374151;">
            Printing ${selectedStudents.length} ID card${selectedStudents.length !== 1 ? 's' : ''} for ${school?.name}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${cardsHTML}
          </div>
        </body>
      </html>
    `

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
  }

  return (
    <PageWrapper title="ID Card Generator">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              ID Card Generator
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select students and generate print-ready ID cards
            </p>
          </div>
          {selected.length > 0 && (
            <button
              onClick={generateIDCards}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print {selected.length} ID Card{selected.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value)
              setSelected([])
            }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.level} {cls.arm}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Select All ({filtered.length})
            </button>
            {selected.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {selected.length > 0 && (
            <span className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
              {selected.length} selected
            </span>
          )}
        </div>

        {/* Student Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <span className="text-5xl">🪪</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              No students found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((student) => (
              <div
                key={student.id}
                onClick={() => toggleSelect(student.id)}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                  selected.includes(student.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden shrink-0">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      )}
                    </div>
                    {selected.includes(student.id) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {student.last_name} {student.first_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {student.reg_number} · {student.classes ? `${student.classes.level} ${student.classes.arm}` : '—'}
                    </p>
                    {!student.photo_url && (
                      <p className="text-xs text-yellow-500 mt-0.5">No photo</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}