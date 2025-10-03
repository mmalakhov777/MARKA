export const enTranslations = {
  "app.title": "Marka",
  "app.description": "Blockchain content authentication for creators. Register and verify content on TON.",

  "home.heading": "Proof of Authenticity",
  "home.subtitle": "Upload a file to hash it and anchor the proof on the TON mainnet.",
  "home.fileLabel": "Select a file",
  "home.supported": "Supports images, documents, audio, and video files.",
  "home.uploadButton": "Upload & Register",
  "home.uploading": "Preparing file…",
  "home.registering": "Submitting to TON…",
  "home.successNavigate": "View proof",

  "result.title": "Proof Registered",
  "result.hashLabel": "File hash",
  "result.transactionLabel": "TON transaction",
  "result.shareButton": "Share proof",
  "result.copyFallback": "Copy link",
  "result.copied": "Link copied",
  "result.shareError": "Unable to share right now",
  "result.backHome": "Back to upload",
  "result.statusPending": "Verifying on blockchain...",
  "result.statusConfirmed": "Confirmed on blockchain",
  "result.statusFailed": "Verification failed",
  "result.verifying": "Checking blockchain...",
  "result.qrCodeTitle": "QR Code",
  "result.downloadQrButton": "Download QR Code",
  "result.showQrButton": "Show QR Code",
  "result.hideQrButton": "Hide QR Code",

  "status.error": "Something went wrong. Please try again.",
  "status.noResult": "We could not find that proof.",
};

export type TranslationKey = keyof typeof enTranslations;

