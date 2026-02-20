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
                relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
                ${isOccupied
                    ? 'border-red-200 bg-red-50/50 hover:border-red-300'
                    : 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                }
            `}
        >
            <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-gray-800 text-sm">Bed {data.bedNumber}</span>
                <span className={`
                    text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full tracking-wider
                    ${data.type === 'LOWER'
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }
                `}>
                    {data.type}
                </span>
            </div>

            <div className="text-xs">
                {isOccupied ? (
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-red-500" />
                        </div>
                        <span className="truncate max-w-[80px] font-semibold text-gray-700">{guestName}</span>
                    </div>
                ) : (
                    <span className="text-emerald-600 font-semibold">Available</span>
                )}
            </div>

            {data.price > 0 && (
                <div className="mt-1.5 text-[10px] text-gray-400 font-medium">₹{data.price}/night</div>
            )}
        </div>
    )
}
