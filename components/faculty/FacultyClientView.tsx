'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  createFacultyAction,
  updateFacultyAction,
  deleteFacultyAction,
} from '@/app/actions/faculty'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Search,
  ArrowLeft,
  X,
  Loader2,
  AlertCircle,
  Building2,
  Info,
  ExternalLink,
} from 'lucide-react'

export interface FacultyLocationOption {
  id: string
  name: string
}

export interface FacultyMemberItem {
  id: string
  name: string
  role?: string | null
  department?: string | null
  cabin_number?: string | null
  location_id?: string | null
  photo_url?: string | null
  email?: string | null
  phone?: string | null
  created_at?: string
  locations?: { id: string; name: string } | null
}

interface FacultyClientViewProps {
  faculty: FacultyMemberItem[]
  locations: FacultyLocationOption[]
  universityName?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-indigo-600',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export default function FacultyClientView({
  faculty,
  locations,
  universityName,
}: FacultyClientViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeFaculty, setActiveFaculty] = useState<FacultyMemberItem | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<FacultyMemberItem | null>(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formDepartment, setFormDepartment] = useState('')
  const [formCabin, setFormCabin] = useState('')
  const [formLocationId, setFormLocationId] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  // Derive unique departments
  const uniqueDepartments = Array.from(
    new Set(faculty.map((f) => f.department?.trim()).filter(Boolean))
  ) as string[]

  const openCreateModal = () => {
    setModalMode('create')
    setActiveFaculty(null)
    setFormName('')
    setFormRole('')
    setFormDepartment('')
    setFormCabin('')
    setFormLocationId('')
    setFormEmail('')
    setFormPhone('')
    setPhotoPreview(null)
    setRemovePhoto(false)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (member: FacultyMemberItem) => {
    setModalMode('edit')
    setActiveFaculty(member)
    setFormName(member.name)
    setFormRole(member.role || '')
    setFormDepartment(member.department || '')
    setFormCabin(member.cabin_number || '')
    setFormLocationId(member.location_id || '')
    setFormEmail(member.email || '')
    setFormPhone(member.phone || '')
    setPhotoPreview(member.photo_url || null)
    setRemovePhoto(false)
    setFormError(null)
    setIsModalOpen(true)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Photo size must not exceed 2 MB.')
        return
      }
      const objectUrl = URL.createObjectURL(file)
      setPhotoPreview(objectUrl)
      setRemovePhoto(false)
      setFormError(null)
    }
  }

  const handleRemoveCurrentPhoto = () => {
    setPhotoPreview(null)
    setRemovePhoto(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    if (!formName.trim()) {
      setFormError('Faculty member name is required.')
      return
    }

    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    // Override or set controlled states
    formData.set('name', formName.trim())
    formData.set('role', formRole.trim())
    formData.set('department', formDepartment.trim())
    formData.set('cabin_number', formCabin.trim())
    formData.set('location_id', formLocationId)
    formData.set('email', formEmail.trim())
    formData.set('phone', formPhone.trim())
    formData.set('remove_photo', removePhoto ? 'true' : 'false')

    startTransition(async () => {
      if (modalMode === 'create') {
        const res = await createFacultyAction(null, formData)
        if (!res.success) {
          setFormError(res.error || 'Failed to create faculty member.')
        } else {
          setIsModalOpen(false)
        }
      } else if (modalMode === 'edit' && activeFaculty) {
        formData.set('id', activeFaculty.id)
        const res = await updateFacultyAction(null, formData)
        if (!res.success) {
          setFormError(res.error || 'Failed to update faculty member.')
        } else {
          setIsModalOpen(false)
        }
      }
    })
  }

  const handleDelete = () => {
    if (!deleteCandidate) return

    startTransition(async () => {
      const res = await deleteFacultyAction(deleteCandidate.id)
      if (res.success) {
        setDeleteCandidate(null)
      } else {
        alert(res.error || 'Failed to delete faculty member.')
      }
    })
  }

  // Filtered members
  const filteredFaculty = faculty.filter((member) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      member.name.toLowerCase().includes(query) ||
      (member.role && member.role.toLowerCase().includes(query)) ||
      (member.department && member.department.toLowerCase().includes(query)) ||
      (member.cabin_number && member.cabin_number.toLowerCase().includes(query))

    const matchesDept =
      selectedDeptFilter === 'all' ||
      member.department?.toLowerCase() === selectedDeptFilter.toLowerCase()

    return matchesSearch && matchesDept
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Console</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-xs text-zinc-400">Faculty Directory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Faculty &amp; Staff Directory
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {universityName ? `${universityName} — ` : ''}Manage professors, lecturers, cabin numbers, and photos
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* No Locations Warning / Hint */}
      {locations.length === 0 && (
        <div className="rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 text-amber-900 dark:text-amber-200 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                No campus locations mapped yet
              </p>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                Map your campus blocks, libraries, and buildings so you can link faculty cabins directly to pins.
              </p>
            </div>
          </div>

          <Link
            href="/admin/locations"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-200/90 dark:bg-amber-900/90 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 text-xs font-semibold transition-colors flex-shrink-0"
          >
            <span>Add Locations</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Search & Department Filter */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, role, department, or cabin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments ({faculty.length})</option>
              {uniqueDepartments.map((dept) => {
                const count = faculty.filter((f) => f.department?.trim() === dept).length
                return (
                  <option key={dept} value={dept}>
                    {dept} ({count})
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Directory Grid */}
      {filteredFaculty.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            {faculty.length === 0
              ? 'No faculty members listed yet'
              : 'No faculty members match your search'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {faculty.length === 0
              ? 'Add your professors and staff so new students can easily discover their cabins and contact information.'
              : 'Try clearing your search query or department filter.'}
          </p>
          {faculty.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Faculty Member</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculty.map((member) => (
            <div
              key={member.id}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Profile Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Photo or Initials */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-tr ${getAvatarColor(
                          member.name
                        )} flex items-center justify-center text-white font-bold text-sm tracking-wide`}
                      >
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {member.name}
                    </h3>
                    {member.role && (
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {member.role}
                      </p>
                    )}
                    {member.department && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                        {member.department}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  {/* Cabin / Room */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span className="truncate">
                      {member.cabin_number ? (
                        <>Cabin: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{member.cabin_number}</span></>
                      ) : (
                        <span className="text-zinc-400">Cabin not specified</span>
                      )}
                      {member.locations?.name && (
                        <span className="ml-1 text-zinc-500 font-normal">
                          ({member.locations.name})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Email */}
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="truncate hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}

                  {/* Phone */}
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <a
                        href={`tel:${member.phone}`}
                        className="truncate hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                      >
                        {member.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(member)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteCandidate(member)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-red-300 hover:bg-red-50 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Faculty Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-xl p-6 sm:p-7 shadow-xl my-8 relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {modalMode === 'create' ? 'Add Faculty Member' : 'Edit Faculty Member'}
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload with Preview */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Profile Photo (Optional, max 2 MB)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoPreview}
                        alt="Photo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-7 h-7 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoSelect}
                      className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>JPG, PNG, or WebP</span>
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveCurrentPhoto}
                          className="text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Gupta"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Professor"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Cabin Number & Linked Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Cabin / Room Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 304, 3rd Floor"
                    value={formCabin}
                    onChange={(e) => setFormCabin(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Campus Location (Optional)
                  </label>
                  <select
                    value={formLocationId}
                    onChange={(e) => setFormLocationId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="">No linked location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="prof@university.edu"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone / Extension
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199 or Ext 402"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Add to Directory' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
              <span className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Remove Faculty Member?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteCandidate.name}</span> from the university directory? Their photo and details will be permanently deleted.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
