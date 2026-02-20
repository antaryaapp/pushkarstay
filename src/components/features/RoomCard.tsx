import { User } from 'lucide-react'

interface RoomCardProps {
    data: any
    onSelect: (item: any) => void
}

export function RoomCard({ data, onSelect }: RoomCardProps) {
    const isOccupied = data.status === 'OCCUPIED'
    const guestName = isOccupied && data.guests.length > 0 ? data.guests[0].name : null

    return (
        <div
            onClick={() => onSelect(data)}
            className={`
                relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]
                ${isOccupied
                    ? 'border-red-200 bg-red-50/50 hover:border-red-300 hover:shadow-red-100'
                    : 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 hover:shadow-emerald-100'
                }
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-black text-gray-800 text-lg">{data.roomNumber}</span>
                {data.hasBalcony && (
                    <span className="text-[10px] bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Balcony
                    </span>
                )}
            </div>

            <div className="min-h-[2rem]">
                {isOccupied ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <span className="text-sm font-semibold truncate text-gray-700">{guestName}</span>
                    </div>
                ) : (
                    <span className="text-sm text-emerald-600 font-semibold">Available</span>
                )}
            </div>

            {/* Price tag */}
            {data.price > 0 && (
                <div className="mt-2 text-xs text-gray-400 font-medium">₹{data.price}/night</div>
            )}
        </div>
    )
}
