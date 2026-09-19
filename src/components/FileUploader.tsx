import { useCallback, useRef, useState } from 'react'
import { FileUp, X } from 'lucide-react'
import { cx, formatBytes } from '../lib/utils'

export interface UploadedFile {
  file: File
  url: string
  size: number
  type: string
}

export function FileUploader({
  accept,
  multiple = false,
  maxSizeMB = 20,
  onFiles,
  label = 'Drop file here',
  buttonText = 'Choose File',
  hint,
}: {
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  onFiles: (files: UploadedFile[]) => void
  label?: string
  buttonText?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

    const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const accepted: UploadedFile[] = []
      for (const file of Array.from(files)) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`This file is larger than the ${maxSizeMB} MB limit.`)
          continue
        }
        accepted.push({
          file,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
        })
      }
      if (accepted.length > 0) {
        setError(null)
        onFiles(accepted)
      } else if (error === null) {
        setError('No valid files were selected.')
      }
    },
    [maxSizeMB, onFiles, error],
  )

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${label} or ${buttonText}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cx(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
          dragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
            : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60',
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <FileUp className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            or <span className="font-medium text-brand-600 dark:text-brand-400">{buttonText}</span>
          </p>
        </div>
        {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          <X className="h-4 w-4" aria-hidden /> {error}
        </p>
      )}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function FileChip({
  file,
  index,
  onRemove,
  onReplace,
}: {
  file: UploadedFile
  index?: number
  onRemove?: (index: number) => void
  onReplace?: () => void
}) {
  const isImageFile = file.type.startsWith('image/')
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      {isImageFile ? (
        <img
          src={file.url}
          alt=""
          className="h-10 w-10 rounded-lg object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <FileUp className="h-5 w-5" aria-hidden />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.file.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatBytes(file.size)}
          {file.type ? ` · ${file.type.split('/')[1]?.toUpperCase()}` : ''}
        </p>
      </div>
      {onReplace && (
        <button
          onClick={onReplace}
          className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
        >
          Replace
        </button>
      )}
      {onRemove && (
        <button
          onClick={() => onRemove(index ?? 0)}
          aria-label={`Remove ${file.file.name}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  )
}