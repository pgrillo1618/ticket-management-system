import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function App() {
  const stats = [
    { label: 'Open', value: 0, valueColor: 'text-blue-600', borderColor: 'border-blue-100' },
    { label: 'Resolved', value: 0, valueColor: 'text-green-600', borderColor: 'border-green-100' },
    { label: 'Closed', value: 0, valueColor: 'text-gray-400', borderColor: 'border-gray-200' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your support tickets</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, valueColor, borderColor }) => (
          <Card key={label} className={`border ${borderColor} rounded-xl py-0 shadow-none`}>
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
              <span className={`text-3xl font-bold ${valueColor}`}>{value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl overflow-hidden border-gray-200 py-0 shadow-none">
        <CardHeader className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between space-y-0">
          <h2 className="text-sm font-semibold text-gray-800">Recent Tickets</h2>
          <Button variant="link" className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0 font-medium">
            View all
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent border-0">
                <TableCell colSpan={4} className="px-5 py-16 text-center">
                  <p className="text-sm text-gray-400">No tickets yet</p>
                  <p className="text-xs text-gray-300 mt-1">Tickets will appear here once created</p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
