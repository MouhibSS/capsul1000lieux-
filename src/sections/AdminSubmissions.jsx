import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LocationForm from '../components/LocationForm'
import { Eye, Edit2, Check, Trash2, Search, X, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PLACE_TYPES_GROUPED, ARCHITECTURES_GROUPED, DECORATIONS_GROUPED } from '../components/AdvancedSearchBar'

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [viewMode, setViewMode] = useState(null)
  const [toast, setToast] = useState('')
  const [amenitiesOptions, setAmenitiesOptions] = useState([])
  const [emailData, setEmailData] = useState({ subject: 'Submission Confirmed', message: '' })

  useEffect(() => {
    fetchSubmissions()
    fetchAmenities()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('users_locations_listing')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchAmenities = async () => {
    try {
      const { data } = await supabase
        .from('filter_categories')
        .select('key, label')
        .eq('category_type', 'amenity')
      if (data) setAmenitiesOptions(data)
    } catch (err) {
      console.error('Error fetching amenities:', err)
    }
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  const handleApprove = async (submission) => {
    try {
      const { error } = await supabase
        .from('users_locations_listing')
        .update({
          status: 'approved',
          published: true,
        })
        .eq('id', submission.id)

      if (error) throw error

      setSelectedSubmission(prev => ({ ...prev, status: 'approved', published: true }))
      setViewMode('email')
      setEmailData({
        subject: 'Submission Confirmed',
        message: `Dear ${submission.submitted_by_name},\n\nYour space submission "${submission.name}" has been approved!\n\nWe will contact you within 24-48 hours for more information and to schedule a visit.\n\nBest regards,\n216,000 lieux Team`,
      })
      showToast('Submission approved')
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  const handleReject = async (submission) => {
    if (!window.confirm('Are you sure you want to reject this submission?')) return

    try {
      const { error } = await supabase
        .from('users_locations_listing')
        .delete()
        .eq('id', submission.id)

      if (error) throw error

      showToast('Submission rejected and deleted')
      fetchSubmissions()
      setViewMode(null)
      setSelectedSubmission(null)
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  const handleSendEmail = async () => {
    try {
      showToast('Email sent to ' + selectedSubmission.submitted_by_email)
      setViewMode(null)
      fetchSubmissions()
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  const filteredSubmissions = submissions.filter((s) => {
    const query = searchQuery.toLowerCase()
    return (
      s.name.toLowerCase().includes(query) ||
      s.city.toLowerCase().includes(query) ||
      s.submitted_by_email.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return <div className="p-6 text-center">Loading submissions...</div>
  }

  // View Mode
  if (viewMode === 'view' && selectedSubmission) {
    const typeLabel = PLACE_TYPES_GROUPED.flatMap(g => g.options).find(o => o.key === selectedSubmission.type)?.label
    const archLabel = ARCHITECTURES_GROUPED.flatMap(g => g.options).find(o => o.key === selectedSubmission.architecture_style)?.label
    const decoLabel = DECORATIONS_GROUPED.flatMap(g => g.options).find(o => o.key === selectedSubmission.decoration_style)?.label

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-bg border border-outline-variant/50 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between sticky top-0 bg-bg">
            <div>
              <h3 className="text-2xl font-semibold text-on-surface">{selectedSubmission.name}</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                {selectedSubmission.city}, {selectedSubmission.governorate}
                {selectedSubmission.status === 'approved' && (
                  <span className="ml-3 inline-block px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs rounded">✓ Approved</span>
                )}
              </p>
            </div>
            <button onClick={() => setViewMode(null)} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Location */}
            <div>
              <p className="eyebrow-sm text-on-surface-variant mb-3">Location</p>
              <div className="space-y-2">
                {selectedSubmission.address && <p className="text-on-surface">{selectedSubmission.address}</p>}
                {selectedSubmission.google_maps_link && (
                  <a href={selectedSubmission.google_maps_link} target="_blank" rel="noopener noreferrer" className="text-gold text-sm hover:text-gold-light">
                    View on Google Maps →
                  </a>
                )}
              </div>
            </div>

            {/* Main Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="eyebrow-sm text-on-surface-variant mb-1">Type</p>
                <p className="text-on-surface text-sm">{typeLabel || selectedSubmission.type}</p>
              </div>
              <div>
                <p className="eyebrow-sm text-on-surface-variant mb-1">Price</p>
                <p className="text-on-surface font-mono">{selectedSubmission.currency}{selectedSubmission.price}/day</p>
              </div>
              {selectedSubmission.area && (
                <div>
                  <p className="eyebrow-sm text-on-surface-variant mb-1">Area</p>
                  <p className="text-on-surface text-sm">{selectedSubmission.area}m²</p>
                </div>
              )}
              {selectedSubmission.capacity && (
                <div>
                  <p className="eyebrow-sm text-on-surface-variant mb-1">Capacity</p>
                  <p className="text-on-surface text-sm">{selectedSubmission.capacity} people</p>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedSubmission.description && (
              <div>
                <p className="eyebrow-sm text-on-surface-variant mb-2">Description</p>
                <p className="text-on-surface text-sm leading-relaxed">{selectedSubmission.description}</p>
              </div>
            )}

            {/* Styles */}
            {(selectedSubmission.architecture_style || selectedSubmission.decoration_style) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedSubmission.architecture_style && (
                  <div>
                    <p className="eyebrow-sm text-on-surface-variant mb-2">Architecture</p>
                    <p className="text-on-surface text-sm">{archLabel}</p>
                  </div>
                )}
                {selectedSubmission.decoration_style && (
                  <div>
                    <p className="eyebrow-sm text-on-surface-variant mb-2">Decoration</p>
                    <p className="text-on-surface text-sm">{decoLabel}</p>
                  </div>
                )}
              </div>
            )}

            {/* Amenities */}
            {selectedSubmission.amenities && selectedSubmission.amenities.length > 0 && (
              <div>
                <p className="eyebrow-sm text-on-surface-variant mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSubmission.amenities.map(key => (
                    <span key={key} className="text-xs bg-gold/10 text-gold px-3 py-1.5 rounded">
                      {amenitiesOptions.find(a => a.key === key)?.label || key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {selectedSubmission.image_urls && selectedSubmission.image_urls.length > 0 && (
              <div>
                <p className="eyebrow-sm text-on-surface-variant mb-3">{selectedSubmission.image_urls.length} Images</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedSubmission.image_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-20 object-cover rounded hover:opacity-75 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Submitter Info */}
            <div className="border-t border-outline-variant/30 pt-4">
              <p className="eyebrow-sm text-on-surface-variant mb-3">Submitter Information</p>
              <div className="space-y-2 text-sm">
                <p><strong>{selectedSubmission.submitted_by_name}</strong></p>
                <p className="text-on-surface-variant">{selectedSubmission.submitted_by_email}</p>
                {selectedSubmission.submitted_by_phone && <p className="text-on-surface-variant">{selectedSubmission.submitted_by_phone}</p>}
                <p className="text-xs text-on-surface-variant mt-2">Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-outline-variant/30 flex gap-3 justify-end sticky bottom-0 bg-bg">
            <button
              onClick={() => setViewMode(null)}
              className="px-4 py-2 border border-outline-variant rounded text-on-surface hover:bg-surface-low transition-colors"
            >
              Close
            </button>
            {selectedSubmission.status !== 'approved' && (
              <>
                <button
                  onClick={() => handleApprove(selectedSubmission)}
                  className="px-4 py-2 bg-gold text-bg rounded hover:bg-gold-light transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedSubmission)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-500 rounded hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {selectedSubmission.status === 'approved' && (
              <button
                onClick={() => setViewMode('email')}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-500 rounded hover:bg-blue-500/30 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Email Mode
  if (viewMode === 'email' && selectedSubmission) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-bg border border-outline-variant/50 rounded-lg max-w-2xl w-full">
          <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Send Confirmation Email</h3>
            <button onClick={() => setViewMode(null)} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="eyebrow-sm mb-2 block">To</label>
              <input
                type="email"
                value={selectedSubmission.submitted_by_email}
                disabled
                className="w-full px-3 py-2 bg-surface-low border border-outline-variant/30 rounded text-on-surface text-sm"
              />
            </div>

            <div>
              <label className="eyebrow-sm mb-2 block">Subject</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 bg-transparent border border-outline-variant/40 rounded text-on-surface text-sm outline-none focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="eyebrow-sm mb-2 block">Message</label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 bg-transparent border border-outline-variant/40 rounded text-on-surface text-sm outline-none focus:border-gold transition-colors resize-none h-32 font-light"
              />
            </div>
          </div>

          <div className="p-6 border-t border-outline-variant/30 flex gap-3 justify-end">
            <button
              onClick={() => setViewMode(null)}
              className="px-4 py-2 border border-outline-variant rounded text-on-surface hover:bg-surface-low transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 bg-gold text-bg rounded hover:bg-gold-light transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main List View
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">User Submissions</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, city, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-transparent outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-gold/20 border border-gold/50 text-gold rounded text-sm">
          {toast}
        </div>
      )}

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          No submissions found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left py-3 px-4 eyebrow-sm">Space Name</th>
                <th className="text-left py-3 px-4 eyebrow-sm">City</th>
                <th className="text-left py-3 px-4 eyebrow-sm">Price</th>
                <th className="text-left py-3 px-4 eyebrow-sm">Submitter</th>
                <th className="text-left py-3 px-4 eyebrow-sm">Status</th>
                <th className="text-right py-3 px-4 eyebrow-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="border-b border-outline-variant/20 hover:bg-surface-low/50 transition-colors">
                  <td className="py-4 px-4 text-on-surface font-medium">{submission.name}</td>
                  <td className="py-4 px-4 text-on-surface-variant text-sm">{submission.city}</td>
                  <td className="py-4 px-4 text-on-surface-variant text-sm">€{submission.price}/day</td>
                  <td className="py-4 px-4 text-on-surface-variant text-sm">{submission.submitted_by_name}</td>
                  <td className="py-4 px-4 text-sm">
                    {submission.status === 'approved' ? (
                      <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs rounded">✓ Approved</span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded">⏳ Pending</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission)
                        setViewMode('view')
                      }}
                      className="p-2 hover:bg-surface-low rounded transition-colors inline-block"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-on-surface-variant hover:text-on-surface" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
