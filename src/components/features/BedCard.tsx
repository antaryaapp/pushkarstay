import { User } from 'lucide-react'

interface BedCardProps {
    data: any
    onSelect: (item: any) => void
}

export function BedCard({ data, onSelect }: BedCardProps) {
    const isOccupied = data.status === 'OCCUPIED'
    const guestName = isOccupied && data.guests.length > 0 ? data.guests[0].name : null

    return (
        <div
            onClick={() => onSelect(data)}
            className={`
        relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm bg-white
        ${isOccupied ? 'border-red-400' : 'border-green-400'}
      `}
        >
            <div className="flex justify-between items-center mb-1">
                <span className="font-black text-black text-sm">Bed {data.bedNumber}</span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${data.type === 'LOWER' ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-orange-50 border-orange-200 text-orange-900'}`}>
                    {data.type}
                </span>
            </div>

            <div className="text-xs">
                {isOccupied ? (
                    <div className="flex items-center gap-1 text-red-700 truncate">
                        <User className="w-4 h-4" />
                        <span className="truncate max-w-[80px] font-bold text-black">{guestName}</span>
                    </div>
                ) : (
                    <span className="text-green-700 font-bold">Available</span>
                )}
            </div>
        </div>
    )
}
