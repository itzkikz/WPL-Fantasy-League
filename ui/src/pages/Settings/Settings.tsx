import React from 'react'
import StatRow from '../../components/StatRow'

export default function Settings() {
  return (
    <div className="p-6 border-b border-[#ebe5eb] dark:border-[#541e5d]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Personal Details</h2>
        </div>

        <div className="space-y-3 mb-4">
          <StatRow textSize='text-xl' label="Gmail" value={"......"} border={false} />
          <StatRow textSize='text-xl' label="Password" value={"Click to change"} border={false} />
        </div>
         <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Appearance</h2>
        </div>

        <div className="space-y-3">
          <StatRow label="Theme" value={"Dark"} border={false} />
        </div>
      </div>
  )
}
