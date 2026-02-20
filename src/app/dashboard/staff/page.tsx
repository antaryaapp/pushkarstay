'use client'

import { StaffList } from '@/components/features/StaffList'

export default function StaffPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-800">Staff Management</h1>
                <p className="text-sm text-gray-400 font-medium">Add, manage and control staff access</p>
            </div>
            <StaffList />
        </div>
    )
}
