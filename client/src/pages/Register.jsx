import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import API from '../api/axios'

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await API.post('/auth/signup', {
        name:            form.name,
        email:           form.email,
        password:        form.password,
        confirmPassword: form.confirmPassword,
        role:            form.role,
      })
      sessionStorage.setItem('canVerify', 'true')
      sessionStorage.setItem('pendingEmail', form.email)
      setSuccess(true)
      setTimeout(() => navigate('/verify-email'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex lg:w-[48%] bg-[#534AB7] relative overflow-hidden flex-col justify-between p-12">
        <motion.div animate={{ x: [0, 30, -15, 0], y: [0, -40, 25, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[-60px] left-[-60px] w-[380px] h-[380px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
        <motion.div animate={{ x: [0, -40, 20, 0], y: [0, 30, -20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }} className="absolute bottom-[-80px] right-[-40px] w-[420px] h-[420px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <motion.div animate={{ x: [0, 25, -10, 0], y: [0, -20, 30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }} className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.95"/>
              <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.65"/>
              <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.65"/>
              <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.35"/>
            </svg>
          </div>
          <span className="text-[18px] font-semibold text-white tracking-tight">HostelPulse</span>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h2 className="text-[40px] font-bold text-white leading-tight tracking-tight mb-5">
              Your hostel,<br />your voice.
            </h2>
            <p className="text-[16px] text-white/65 leading-relaxed max-w-[320px]">
              Join hundreds of IET Lucknow students who raise, track, and resolve hostel issues — faster than ever.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="flex gap-8 mt-10">
            {[['1,200+', 'Issues resolved'], ['98%', 'Resolution rate'], ['24hr', 'Avg response']].map(([val, label]) => (
              <div key={label}>
                <div className="text-[24px] font-bold text-white">{val}</div>
                <div className="text-[13px] text-white/55 mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 bg-white/10 border border-white/15 rounded-2xl p-5">
          <p className="text-[14px] text-white/80 leading-relaxed italic">
            "Finally a system that actually keeps track of our complaints. Got my water issue fixed in less than a day."
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold text-white">AS</div>
            <div>
              <div className="text-[13px] font-medium text-white">Abhinav Singh</div>
              <div className="text-[12px] text-white/50">2nd Year, IET Lucknow</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[440px]">

          <motion.div variants={fadeUp} className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-[#534AB7] rounded-[7px] flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.95"/>
                  <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.65"/>
                  <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.65"/>
                  <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.35"/>
                </svg>
              </div>
              <span className="text-[16px] font-semibold text-[#1a1a22]">HostelPulse</span>
            </div>
            <h1 className="text-[32px] font-bold text-[#1a1a22] tracking-tight mb-1.5">Create your account</h1>
            <p className="text-[15px] text-[#7a7a92]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#534AB7] font-medium hover:underline">Log in</Link>
            </p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-[14px] px-4 py-3 rounded-xl mb-6">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
                  <path d="M8 5v3M8 10h.01" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center bg-green-50 border border-green-200 rounded-2xl px-6 py-8 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#1D9E75]/10 flex items-center justify-center mb-4">
                  <motion.svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <motion.path d="M5 13l4 4L19 7" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                  </motion.svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#1a1a22] mb-1.5">Account created!</h3>
                <p className="text-[14px] text-[#6a6a82] leading-relaxed mb-3">
                  We've sent a verification email to<br />
                  <span className="font-medium text-[#1a1a22]">{form.email}</span>
                </p>
                <p className="text-[13px] text-[#9a9ab0]">Please verify your email to continue. Redirecting...</p>
                <div className="w-full bg-green-100 rounded-full h-1 mt-4 overflow-hidden">
                  <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3, ease: 'linear' }} className="h-full bg-[#1D9E75] rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className={`space-y-4 ${success ? 'opacity-50 pointer-events-none' : ''}`}>

            <motion.div variants={fadeUp}>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">Full name</label>
              <input type="text" required placeholder="Arjun Kumar" value={form.name} onChange={update('name')} className="w-full h-[48px] px-4 text-[15px] text-[#1a1a22] bg-[#f9f9fb] border border-black/[0.1] rounded-xl outline-none focus:border-[#534AB7] focus:bg-white focus:ring-2 focus:ring-[#534AB7]/10 transition-all placeholder:text-[#b0b0c0]" />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">Email address</label>
              <input type="email" required placeholder="you@ietlucknow.ac.in" value={form.email} onChange={update('email')} className="w-full h-[48px] px-4 text-[15px] text-[#1a1a22] bg-[#f9f9fb] border border-black/[0.1] rounded-xl outline-none focus:border-[#534AB7] focus:bg-white focus:ring-2 focus:ring-[#534AB7]/10 transition-all placeholder:text-[#b0b0c0]" />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {['student'].map(role => (
                  <button key={role} type="button" onClick={() => setForm(prev => ({ ...prev, role }))}
                    className={`h-[48px] rounded-xl border text-[15px] font-medium transition-all ${form.role === role ? 'bg-[#534AB7] border-[#534AB7] text-white shadow-md shadow-purple-200' : 'bg-[#f9f9fb] border-black/[0.1] text-[#6a6a82] hover:border-[#534AB7]/40 hover:text-[#534AB7]'}`}>
                    {role === 'student' ? '🎓 Student':null}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required placeholder="Min. 6 characters" value={form.password} onChange={update('password')} className="w-full h-[48px] px-4 pr-12 text-[15px] text-[#1a1a22] bg-[#f9f9fb] border border-black/[0.1] rounded-xl outline-none focus:border-[#534AB7] focus:bg-white focus:ring-2 focus:ring-[#534AB7]/10 transition-all placeholder:text-[#b0b0c0]" />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9ab0] hover:text-[#534AB7] transition-colors p-1">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-[14px] font-medium text-[#1a1a22] mb-1.5">Confirm password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required placeholder="Re-enter your password" value={form.confirmPassword} onChange={update('confirmPassword')} className="w-full h-[48px] px-4 pr-12 text-[15px] text-[#1a1a22] bg-[#f9f9fb] border border-black/[0.1] rounded-xl outline-none focus:border-[#534AB7] focus:bg-white focus:ring-2 focus:ring-[#534AB7]/10 transition-all placeholder:text-[#b0b0c0]" />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9ab0] hover:text-[#534AB7] transition-colors p-1">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {form.confirmPassword && (
                <p className={`text-[13px] mt-1.5 ${form.password === form.confirmPassword ? 'text-[#1D9E75]' : 'text-red-500'}`}>
                  {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="pt-2">
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="w-full h-[52px] bg-[#534AB7] hover:bg-[#6259c9] text-white text-[16px] font-semibold rounded-xl transition-colors shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.div>

          </form>

          <motion.p variants={fadeUp} className="text-center text-[13px] text-[#b0b0c0] mt-6">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-[#534AB7] hover:underline">Terms</Link>
            {' & '}
            <Link to="/privacy" className="text-[#534AB7] hover:underline">Privacy Policy</Link>
          </motion.p>

        </motion.div>
      </div>

    </div>
  )
}