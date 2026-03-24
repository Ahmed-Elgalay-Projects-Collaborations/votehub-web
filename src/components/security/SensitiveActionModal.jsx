import React from 'react'
import Modal from '../ui/Modal'

export default function SensitiveActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  summary = [],
  warning = '',
  confirmLabel = 'Confirm',
  submitting = false,
  danger = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {summary.length > 0 && (
        <ul className="security-summary-list">
          {summary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {warning && <p className="modal-warning">{warning}</p>}

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={submitting}
        >
          {submitting ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
