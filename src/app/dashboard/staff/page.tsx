import { StaffList } from '@/components/features/StaffList'

export default function StaffPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-black mb-6 text-black">Staff Management</h1>
            <StaffList />
        </div>
    )
}
