import { generateRegNumber } from '@schoolpilot/shared-utils'
import { Button } from '@schoolpilot/ui-kit'

function App() {
  const regNumber = generateRegNumber('DOM', 2026, 1)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900">SchoolPilot Staff Portal</h1>
      <p className="text-gray-500">Sample Reg Number: {regNumber}</p>
      <Button onClick={() => alert('SchoolPilot is alive! 🎓')}>
        Test Button
      </Button>
    </div>
  )
}

export default App