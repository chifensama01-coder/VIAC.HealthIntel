'use client'

import { useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DISTRICTS, AGE_GROUPS } from '@/lib/types'
import type { Filters } from '@/lib/types'

interface DemographicFiltersProps {
  onApply: (filters: Filters) => void
}

const DEFAULT_FILTERS: Filters = { districts: [], ageGroups: [], sex: 'all' }

export default function DemographicFilters({ onApply }: DemographicFiltersProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  function toggleDistrict(district: string) {
    setFilters((prev) => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter((d) => d !== district)
        : [...prev.districts, district],
    }))
  }

  function toggleAgeGroup(ag: string) {
    setFilters((prev) => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(ag)
        ? prev.ageGroups.filter((a) => a !== ag)
        : [...prev.ageGroups, ag],
    }))
  }

  function reset() {
    setFilters(DEFAULT_FILTERS)
    onApply(DEFAULT_FILTERS)
  }

  return (
    <aside className="flex h-full w-full flex-col gap-6 rounded-xl border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-700">Filters</h2>
      </div>

      {/* District checkboxes */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          District
        </p>
        <div className="space-y-2">
          {DISTRICTS.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <Checkbox
                id={`dist-${d}`}
                checked={filters.districts.includes(d)}
                onCheckedChange={() => toggleDistrict(d)}
              />
              <Label htmlFor={`dist-${d}`} className="cursor-pointer text-sm">
                {d}
              </Label>
            </div>
          ))}
        </div>
      </section>

      {/* Age group checkboxes */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Age Group
        </p>
        <div className="space-y-2">
          {AGE_GROUPS.map((ag) => (
            <div key={ag} className="flex items-center gap-2">
              <Checkbox
                id={`age-${ag}`}
                checked={filters.ageGroups.includes(ag)}
                onCheckedChange={() => toggleAgeGroup(ag)}
              />
              <Label htmlFor={`age-${ag}`} className="cursor-pointer text-sm">
                {ag}
              </Label>
            </div>
          ))}
        </div>
      </section>

      {/* Sex dropdown */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Sex</p>
        <Select value={filters.sex} onValueChange={(v) => setFilters((p) => ({ ...p, sex: v }))}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="male">Male</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Action buttons */}
      <div className="mt-auto flex flex-col gap-2">
        <Button onClick={() => onApply(filters)} className="w-full" size="sm">
          Apply Filters
        </Button>
        <Button onClick={reset} variant="outline" size="sm" className="w-full gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Active filter summary */}
      {(filters.districts.length > 0 || filters.ageGroups.length > 0 || filters.sex !== 'all') && (
        <p className="text-xs text-slate-400">
          Filtered:{' '}
          {[
            filters.districts.length && `${filters.districts.length} district(s)`,
            filters.ageGroups.length && `${filters.ageGroups.length} age group(s)`,
            filters.sex !== 'all' && filters.sex,
          ]
            .filter(Boolean)
            .join(', ')}
        </p>
      )}
    </aside>
  )
}
