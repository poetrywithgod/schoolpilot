import { useNavigate } from 'react-router-dom'

export const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        <div className="relative mx-auto w-48 h-48 mb-8">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full">
            <span className="text-8xl">🔒</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-12 bg-gray-300" />
          <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Error 403</span>
          <div className="h-px w-12 bg-gray-300" />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-3">
          Restricted Zone
        </h1>

        <p className="text-gray-500 mb-2">
          You don't have permission to enter this classroom.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Contact your school admin if you think this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Back to Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-300 mt-12">
          SchoolPilot · This door has a bouncer 🚫
        </p>
      </div>
    </div>
  )
}