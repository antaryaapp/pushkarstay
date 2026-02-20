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
        relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md bg-white
        ${isOccupied ? 'border-red-400 hover:border-red-500' : 'border-green-400 hover:border-green-500'}
      `}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-black text-black text-lg">{data.roomNumber}</span>
                {data.hasBalcony && <span className="text-xs bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-bold">Balcony</span>}
            </div>

            <div className="min-h-[2rem]">
                {isOccupied ? (
                    <div className="flex items-center gap-2 text-red-700">
                        <User className="w-5 h-5" />
                        <span className="text-sm font-bold truncate text-black">{guestName}</span>
                    </div>
                ) : (
                    <span className="text-sm text-green-700 font-bold">Available</span>
                )}
            </div>
        </div>
    )
}
