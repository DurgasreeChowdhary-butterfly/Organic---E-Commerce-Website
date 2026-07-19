import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Upload, Trash2, AlertCircle } from "lucide-react";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminDeleteLogoThunk, adminUploadLogoThunk, clearBrandingAdminError, fetchBrandingThunk } from "@/features/branding/brandingSlice";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export default function AdminBrandingPage() {
  const dispatch = useAppDispatch();
  const { logoUrl, adminStatus, adminError } = useAppSelector((s) => s.branding);
  const uploading = adminStatus === "loading";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBrandingThunk());
  }, [dispatch]);

  // Revoke the local object URL once it's no longer the active preview.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function openFilePicker() {
    setValidationError(null);
    dispatch(clearBrandingAdminError());
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Please choose a JPEG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError("Image exceeds the 5MB size limit.");
      return;
    }

    setValidationError(null);
    setPreviewUrl(URL.createObjectURL(file));
    await dispatch(adminUploadLogoThunk(file));
    // Whether it succeeded or failed, the persisted logoUrl (or lack of
    // one) is now the source of truth — drop the transient local preview.
    setPreviewUrl(null);
  }

  async function confirmDelete() {
    const result = await dispatch(adminDeleteLogoThunk());
    if (adminDeleteLogoThunk.fulfilled.match(result)) {
      setPreviewUrl(null);
      setDeleteOpen(false);
    }
  }

  const displayUrl = previewUrl ?? resolveImageUrl(logoUrl);
  const error = validationError ?? adminError;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-700">Branding</h1>
        <p className="text-sm text-brown-500">Upload the logo shown in the storefront header.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="rounded-3xl bg-white shadow-soft p-6 sm:p-8 max-w-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-beige flex items-center justify-center overflow-hidden shrink-0 bg-pista-50/40">
            {displayUrl ? (
              <img src={displayUrl} alt="Current logo preview" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="w-8 h-8 text-brown-500/60" />
            )}
          </div>

          <div className="flex-1 w-full">
            <p className="text-sm font-medium text-forest-700 mb-1">
              {logoUrl ? "Current logo" : "No logo uploaded"}
            </p>
            <p className="text-xs text-brown-500 mb-4">
              JPEG, PNG, WEBP, or GIF — up to 5MB. Square images look best.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button icon={<Upload className="w-4 h-4" />} loading={uploading} onClick={openFilePicker}>
                {logoUrl ? "Replace Logo" : "Upload Logo"}
              </Button>
              {logoUrl && (
                <Button
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  disabled={uploading}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete Logo
                </Button>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete logo?"
        description="The storefront header will revert to its default mark."
        confirmLabel="Delete"
        loading={uploading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
