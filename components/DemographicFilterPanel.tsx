'use client'

import { useState } from 'react'
import { DISTRICTS, AGE_GROUPS, FACILITY_TYPES, EDUCATION_LEVELS } from '@/lib/types'
import type { Filters } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DemographicFilterPanelProps {
  onApply: (filters: Filters) => void
  loading?: boolean
}

const WEALTH_LABELS: Record<number, string> = { 1: 'Poorest', 2: 'Poor', 3: 'Middle', 4: 'Wealthy', 5: 'Richest' }

const DEFAULT: Filters = { districts: [], ageGroups: [], sex: 'all' }

function CheckPill({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-medium border transition-all',
        checked
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b">
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</h4>
      {children}
    </div>
  )
}

export function DemographicFilterPanel({ onApply, loading }: DemographicFilterPanelProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT)
  const [activeCount, setActiveCount] = useState(0)

  function toggleDistrict(d: string) {
    setFilters((prev) => ({
      ...prev,
      districts: prev.districts.includes(d) ? prev.districts.filter((x) => x !== d) : [...prev.districts, d],
    }))
  }

  function toggleAge(a: string) {
    setFilters((prev) => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(a) ? prev.ageGroups.filter((x) => x !== a) : [...prev.ageGroups, a],
    }))
  }

  function toggleWealth(q: number) {
    setFilters((prev) => {
      const wq = prev.wealthQuintiles ?? []
      return { ...prev, wealthQuintiles: wq.includes(q) ? wq.filter((x) => x !== q) : [...wq, q] }
    })
  }

  function toggleEducation(l: string) {
    setFilters((prev) => {
      const el = prev.educationLevels ?? []
      return { ...prev, educationLevels: el.includes(l) ? el.filter((x) => x !== l) : [...el, l] }
    })
  }

  function apply() {
    const count = filters.districts.length + filters.ageGroups.length +
      (filters.sex !== 'all' ? 1 : 0) + (filters.wealthQuintiles?.length ?? 0) +
      (filters.educationLevels?.length ?? 0) + (filters.displaced != null ? 1 : 0) +
      (filters.dateRange ? 1 : 0)
    setActiveCount(count)
    onApply(filters)
  }

  function reset() {
    setFilters(DEFAULT)
    setActiveCount(0)
    onApply(DEFAULT)
  }

  return (
    <div className="flex flex-col h-full">
      {activeCount > 0 && (
        <div className="px-4 py-2.5 bg-primary/5 border-b">
          <span className="text-xs text-primary font-medium">{activeCount} filter{activeCount > 1 ? 's' : ''} active</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <FilterSection title="District">
          <div className="flex flex-wrap gap-1.5">
            {DISTRICTS.map((d) => (
              <CheckPill
                key={d}
                label={d}
                checked={filters.districts.includes(d)}
                onChange={() => toggleDistrict(d)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Age Group">
          <div className="flex flex-wrap gap-1.5">
            {AGE_GROUPS.map((a) => (
              <CheckPill
                key={a}
                label={a}
                checked={filters.ageGroups.includes(a)}
                onChange={() => toggleAge(a)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Sex">
          <div className="flex gap-1.5">
            {(['all', 'female', 'male'] as const).map((s) => (
              <CheckPill
                key={s}
                label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                checked={filters.sex === s}
                onChange={() => setFilters((prev) => ({ ...prev, sex: s }))}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Facility Type">
          <div className="flex flex-wrap gap-1.5">
            {FACILITY_TYPES.map((ft) => (
              <CheckPill
                key={ft}
                label={ft.charAt(0).toUpperCase() + ft.slice(1)}
                checked={filters.facilityTypes?.includes(ft) ?? false}
                onChange={() => {
                  const current = filters.facilityTypes ?? []
                  setFilters((prev) => ({
                    ...prev,
                    facilityTypes: current.includes(ft) ? current.filter((x) => x !== ft) : [...current, ft],
                  }))
                }}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Wealth Quintile">
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((q) => (
              <CheckPill
                key={q}
                label={WEALTH_LABELS[q]}
                checked={filters.wealthQuintiles?.includes(q) ?? false}
                onChange={() => toggleWealth(q)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Education Level">
          <div className="flex flex-wrap gap-1.5">
            {EDUCATION_LEVELS.map((l) => (
              <CheckPill
                key={l}
                label={l.charAt(0).toUpperCase() + l.slice(1)}
                checked={filters.educationLevels?.includes(l) ?? false}
                onChange={() => toggleEducation(l)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Date Range">
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">From</label>
              <input
                type="date"
                value={filters.dateRange?.from ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: { from: e.target.value, to: prev.dateRange?.to ?? '' } }))}
                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
              <input
                type="date"
                value={filters.dateRange?.to ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: { from: prev.dateRange?.from ?? '', to: e.target.value } }))}
                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Special Populations">
          <CheckPill
            label="Displaced Persons"
            checked={filters.displaced === true}
            onChange={() => setFilters((prev) => ({ ...prev, displaced: prev.displaced === true ? null : true }))}
          />
        </FilterSection>
      </div>

      <div className="border-t p-4 space-y-2">
        <button
          onClick={apply}
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          Apply Filters
        </button>
        <button
          onClick={reset}
          className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          Reset All
        </button>
      </div>
    </div>
  )
}
