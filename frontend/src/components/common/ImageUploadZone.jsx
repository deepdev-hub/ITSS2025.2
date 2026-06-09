import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';

const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageUploadZone({
  previewSrc = null,
  onFileSelected,
  onUpload,
  uploading = false,
  label = 'Thêm ảnh',
  hint = 'JPEG, PNG, WebP, GIF — tối đa 5MB',
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 5,
  variant = 'default',
  fallbackLabel = '',
  showRemove = false,
  onRemove,
  onError,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);

  const displaySrc = localPreview || previewSrc;
  const showImage = displaySrc && failedSrc !== displaySrc;

  useEffect(() => () => {
    if (localPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
  }, [localPreview]);

  const validateAndProcess = async (file) => {
    if (!file) return;

    if (!accept.includes(file.type)) {
      onError?.('Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, WebP hoặc GIF).');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      onError?.(`Ảnh phải nhỏ hơn ${maxSizeMb}MB.`);
      return;
    }

    onError?.('');

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview((previous) => {
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    setFailedSrc(null);

    if (onUpload) {
      try {
        await onUpload(file);
        setLocalPreview((previous) => {
          if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
          return null;
        });
      } catch {
        setLocalPreview((previous) => {
          if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
          return null;
        });
      }
    } else {
      onFileSelected?.(file);
    }
  };

  const handleInputChange = (event) => {
    validateAndProcess(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    validateAndProcess(event.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setLocalPreview((previous) => {
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
      return null;
    });
    setFailedSrc(null);
    onFileSelected?.(null);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  const openPicker = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  if (variant === 'avatar') {
    return (
      <div className={`image-upload-avatar ${uploading ? 'is-uploading' : ''}`}>
        <button
          type="button"
          className="image-upload-avatar-trigger"
          onClick={openPicker}
          disabled={disabled || uploading}
          aria-label={label}
        >
          {showImage ? (
            <img
              src={displaySrc}
              alt="Avatar"
              onError={() => setFailedSrc(displaySrc)}
            />
          ) : (
            <span className="image-upload-avatar-fallback">
              {fallbackLabel || <Camera size={28} aria-hidden="true" />}
            </span>
          )}
          <span className="image-upload-avatar-badge">
            {uploading ? <Loader2 size={16} className="spin-icon" /> : <Camera size={16} />}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          className="image-upload-input"
          onChange={handleInputChange}
          disabled={disabled || uploading}
        />
      </div>
    );
  }

  return (
    <div className="image-upload-zone-wrap">
      <div
        className={`image-upload-zone ${dragOver ? 'drag-over' : ''} ${showImage ? 'has-preview' : ''} ${uploading ? 'is-uploading' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={!showImage ? openPicker : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
        role="button"
        tabIndex={disabled || uploading ? -1 : 0}
      >
        {showImage ? (
          <div className="image-upload-preview">
            <img
              src={displaySrc}
              alt="Preview"
              onError={() => setFailedSrc(displaySrc)}
            />
            {uploading ? (
              <div className="image-upload-overlay">
                <Loader2 size={28} className="spin-icon" />
                <span>Đang tải lên...</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="image-upload-empty">
            <span className="image-upload-icon-ring">
              {uploading ? <Loader2 size={26} className="spin-icon" /> : <ImagePlus size={26} />}
            </span>
            <strong>{label}</strong>
            <p>{hint}</p>
            <span className="image-upload-cta">
              <Upload size={16} aria-hidden="true" />
              Nhấn hoặc kéo thả ảnh vào đây
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          className="image-upload-input"
          onChange={handleInputChange}
          disabled={disabled || uploading}
        />
      </div>

      {showImage ? (
        <div className="image-upload-actions">
          <button type="button" className="button button-secondary" disabled={uploading} onClick={openPicker}>
            <Camera size={16} aria-hidden="true" />
            Đổi ảnh
          </button>
          {showRemove ? (
            <button type="button" className="button button-danger" disabled={uploading} onClick={handleRemove}>
              <Trash2 size={16} aria-hidden="true" />
              Xóa
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
