import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api/axios'

// ── Icons ──────────────────────────────────────────────────────────────────────

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <motion.path d="M5 13l4 4L19 7" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }}/>
  </svg>
)

// ── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'hostel',      label: 'Hostel',      emoji: '🏠' },
  { value: 'mess',        label: 'Mess',        emoji: '🍽️' },
  { value: 'academic',    label: 'Academic',    emoji: '📚' },
  { value: 'maintenance', label: 'Maintenance', emoji: '🔧' },
  { value: 'other',       label: 'Other',       emoji: '📋' },
]

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CreateComplaint() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    complaintName: '',
    description: '',
    location: '',
    category: '',
  })
  const [photos, setPhotos] = useState([])          // { file, preview, name }
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    API.get('/student/profile').catch((err) => {
      if (err.response?.status === 404) {
        navigate('/complete-profile');
      }
    });
  }, [navigate]);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  // ── Photo handling ───────────────────────────────────────────────────────────

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    const previews = valid.map(file => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
    }))
    setPhotos(prev => [...prev, ...previews].slice(0, 5)) // max 5
  }

  const removePhoto = (idx) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  // ── Upload photos to server (adjust endpoint as needed) ──────────────────────

  const uploadPhotos = async () => {
    if (!photos.length) return []
    setUploading(true)
    try {
      const urls = await Promise.all(photos.map(async ({ file }) => {
        const fd = new FormData()
        fd.append('photo', file)
        const res = await API.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        return res.data.url
      }))
      return urls
    } finally {
      setUploading(false)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { complaintName, description, location, category } = form
    if (!complaintName || !description || !location || !category) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    try {
      let photoUrls = []
      try { photoUrls = await uploadPhotos() } catch { /* photos optional */ }

      await API.post('/student/create-complaint', {
        complaintName,
        description,
        location,
        category,
        photos: photoUrls,
      })

      setSuccess(true)
      setTimeout(() => navigate('/view-complaints'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f5fa] flex items-start justify-center px-4 py-10">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-[600px]"
      >

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[14px] text-[#7a7a92] hover:text-[#534AB7] transition-colors mb-5 group"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#534AB7] flex items-center justify-center shadow-lg shadow-purple-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[26px] font-bold text-[#1a1a22] tracking-tight leading-none">New Complaint</h1>
              <p className="text-[14px] text-[#7a7a92] mt-0.5">Describe your issue and we'll get it resolved</p>
            </div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-black/[0.06] overflow-hidden">

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2.5 bg-red-50 border-b border-red-100 text-red-600 text-[14px] px-6 py-3.5"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
                  <path d="M8 5v3M8 10h.01" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success overlay */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center rounded-2xl px-8"
              >
                <div className="w-16 h-16 rounded-full bg-[#1D9E75]/10 flex items-center justify-center mb-4">
                  <CheckIcon />
                </div>
                <h3 className="text-[20px] font-bold text-[#1a1a22] mb-1.5">Complaint Submitted!</h3>
                <p className="text-[14px] text-[#6a6a82] text-center leading-relaxed">
                  Your complaint has been registered and is now <span className="font-medium text-[#1a1a22]">pending review</span>. We'll notify you of updates.
                </p>
                <div className="w-48 bg-green-100 rounded-full h-1 mt-5 overflow-hidden">
                  <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3, ease: 'linear' }} className="h-full bg-[#1D9E75] rounded-full" />
                </div>
                <p className="text-[13px] text-[#9a9ab0] mt-2">Redirecting to your complaints…</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className={`p-6 space-y-5 relative ${success ? 'pointer-events-none' : ''}`}>

            {/* Complaint Name */}
            <div>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">
                Complaint Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Water leakage in room 204"
                value={form.complaintName}
                onChange={update('complaintName')}
                className="w-full h-[48px] px-4 text-[15px] text-[#1a1a22] bg-[#f9f9fb] border border-black/[0.1] rounded-xl outline-none focus:border-[#534AB7] focus:bg-white focus:ring-2 focus:ring-[#534AB7]/10 transition-all placeholder:text-[#b0b0c0]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, category: value }))}
                    className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-[13px] font-medium transition-all ${
                      form.category === value
                        ? 'bg-[#534AB7] border-[#534AB7] text-white shadow-md shadow-purple-200'
                        : 'bg-[#f9f9fb] border-black/[0.08] text-[#6a6a82] hover:border-[#534AB7]/40 hover:text-[#534AB7]'
                    }`}
                  >
                    <span className="text-[18px]">{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Block B, Room 204, 2nd Floor"
                value={form.location}
                onChange={update('location')}
                className="w-full h-[48px] px-4 text-[15px] text-[#1a1a22] bg-[#f9f9fb] border border-black/[0.1] rounded-xl outline-none focus:border-[#534AB7] focus:bg-white focus:ring-2 focus:ring-[#534AB7]/10 transition-all placeholder:text-[#b0b0c0]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe the issue in detail — when it started, how severe it is, and any other relevant information..."
                value={form.description}
                onChange={update('description')}
                className="w-full px-4 py-3 text-[15px] text-[#1a1a22] bg-[#f9f9fb] border border-black/[0.1] rounded-xl outline-none focus:border-[#534AB7] focus:bg-white focus:ring-2 focus:ring-[#534AB7]/10 transition-all placeholder:text-[#b0b0c0] resize-none leading-relaxed"
              />
              <p className="text-[12px] text-[#b0b0c0] mt-1 text-right">{form.description.length} chars</p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">
                Photos <span className="text-[#b0b0c0] font-normal">(optional, max 5)</span>
              </label>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  dragOver
                    ? 'border-[#534AB7] bg-[#534AB7]/5'
                    : 'border-black/[0.1] bg-[#f9f9fb] hover:border-[#534AB7]/50 hover:bg-[#534AB7]/5'
                }`}
              >
                <div className="text-[#9a9ab0]"><UploadIcon /></div>
                <p className="text-[14px] text-[#7a7a92]">
                  <span className="text-[#534AB7] font-medium">Click to upload</span> or drag & drop
                </p>
                <p className="text-[12px] text-[#b0b0c0]">PNG, JPG, WEBP up to 10MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* Preview thumbnails */}
              <AnimatePresence>
                {photos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2.5 flex-wrap mt-3"
                  >
                    {photos.map((p, i) => (
                      <motion.div
                        key={p.preview}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group w-[80px] h-[80px] rounded-xl overflow-hidden border border-black/[0.08] shadow-sm"
                      >
                        <img src={p.preview} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removePhoto(i) }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <XIcon />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="border-t border-black/[0.06] !mt-6" />

            {/* Submit */}
            <div className="flex gap-3 !mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 h-[50px] rounded-xl border border-black/[0.1] text-[15px] font-medium text-[#6a6a82] hover:border-[#534AB7]/40 hover:text-[#534AB7] transition-all"
              >
                Cancel
              </button>

              <motion.button
                type="submit"
                disabled={loading || uploading}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-[2] h-[50px] bg-[#534AB7] hover:bg-[#6259c9] text-white text-[15px] font-semibold rounded-xl transition-colors shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(loading || uploading) ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    {uploading ? 'Uploading photos…' : 'Submitting…'}
                  </>
                ) : (
                  <>
                    Submit Complaint
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </motion.button>
            </div>

          </form>
        </motion.div>

        {/* Footer note */}
        <motion.p variants={fadeUp} className="text-center text-[13px] text-[#b0b0c0] mt-5">
          Your complaint will be visible to hostel admins only. Expected response within 24 hours.
        </motion.p>

      </motion.div>
    </div>
  )
}