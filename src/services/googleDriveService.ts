/**
 * Google Drive integration service for archiving quotations
 * Dedicated Target Folder: https://drive.google.com/drive/folders/1-v3wP04bfjKzvAuBavWGy59m-svhGDf0?usp=sharing
 * Folder ID: 1-v3wP04bfjKzvAuBavWGy59m-svhGDf0
 */

export const TARGET_DRIVE_FOLDER_ID = '1-v3wP04bfjKzvAuBavWGy59m-svhGDf0';
export const TARGET_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1-v3wP04bfjKzvAuBavWGy59m-svhGDf0?usp=sharing';
export const DRIVE_FOLDER_NAME = 'Historial Cotizaciones RBCOMUNICACIONES';
export const DEFAULT_OAUTH_CLIENT_ID = '307498160667-5aqmrnsdpiblko2ajsre60dnvarh29kk.apps.googleusercontent.com';
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

export interface DriveFileRecord {
  id: string;
  quotationCode: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  driveFolder: string;
  driveFolderId?: string;
  driveFileId?: string;
  driveUrl?: string;
  type: 'generada' | 'firmada';
  status: 'archivado' | 'local_pendiente' | 'error';
}

const STORAGE_KEY_TOKEN = 'rb_gdrive_access_token';
const STORAGE_KEY_FOLDER_ID = 'rb_gdrive_folder_id';
const STORAGE_KEY_RECORDS = 'rb_gdrive_archived_records';
const STORAGE_KEY_CLIENT_ID = 'rb_gdrive_client_id';

export function getStoredDriveToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem(STORAGE_KEY_TOKEN);
}

export function setStoredDriveToken(token: string) {
  sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
}

export function clearStoredDriveToken() {
  sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
}

export function getStoredFolderId(): string {
  return localStorage.getItem(STORAGE_KEY_FOLDER_ID) || TARGET_DRIVE_FOLDER_ID;
}

export function setStoredFolderId(folderId: string) {
  localStorage.setItem(STORAGE_KEY_FOLDER_ID, folderId || TARGET_DRIVE_FOLDER_ID);
}

export function getStoredClientId(): string {
  return (
    localStorage.getItem(STORAGE_KEY_CLIENT_ID) ||
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
    DEFAULT_OAUTH_CLIENT_ID
  );
}

export function setStoredClientId(clientId: string) {
  localStorage.setItem(STORAGE_KEY_CLIENT_ID, (clientId || DEFAULT_OAUTH_CLIENT_ID).trim());
}

export function getArchivedRecords(): DriveFileRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveArchivedRecord(record: DriveFileRecord) {
  const current = getArchivedRecords();
  const existingIdx = current.findIndex(r => r.id === record.id || (r.quotationCode === record.quotationCode && r.type === record.type));
  let updated: DriveFileRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = record;
  } else {
    updated = [record, ...current];
  }
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
}

export function clearArchivedRecords() {
  try {
    localStorage.removeItem(STORAGE_KEY_RECORDS);
  } catch (_) {}
}

/**
 * Load Google Identity Services script if not already present
 */
export function loadGisScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('google-gis-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Requests an OAuth access token using Google Identity Services Token Client
 */
export async function requestDriveAccessToken(clientId?: string): Promise<string> {
  const activeClientId = clientId || getStoredClientId();
  
  if (!activeClientId) {
    throw new Error('Se requiere un ID de Cliente de Google OAuth para conectar con Google Drive.');
  }

  await loadGisScript();

  if (!(window as any).google?.accounts?.oauth2) {
    throw new Error('No se pudo cargar la librería de Google Identity Services.');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: DRIVE_SCOPE,
        callback: (resp: any) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          if (resp.access_token) {
            setStoredDriveToken(resp.access_token);
            resolve(resp.access_token);
          } else {
            reject(new Error('No se recibió token de acceso de Google.'));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Ensures the target Drive folder exists and returns its ID
 * Prioritizes the user's dedicated folder: 1-v3wP04bfjKzvAuBavWGy59m-svhGDf0
 */
export async function getOrCreateDriveFolder(accessToken: string): Promise<string> {
  const folderId = getStoredFolderId();
  if (folderId) {
    return folderId;
  }
  return TARGET_DRIVE_FOLDER_ID;
}

/**
 * Uploads a PDF blob directly to the user's target Google Drive folder:
 * https://drive.google.com/drive/folders/1-v3wP04bfjKzvAuBavWGy59m-svhGDf0?usp=sharing
 */
export async function uploadQuotationToDrive(
  fileBlob: Blob,
  fileName: string,
  quotationCode: string,
  type: 'generada' | 'firmada' = 'generada',
  accessTokenOverride?: string
): Promise<{ fileId: string; webViewLink?: string; driveUrl?: string }> {
  const token = accessTokenOverride || getStoredDriveToken();
  const folderId = TARGET_DRIVE_FOLDER_ID;
  
  if (!token) {
    // Record locally as pending Drive sync
    const localRecord: DriveFileRecord = {
      id: `local-${Date.now()}-${quotationCode}`,
      quotationCode,
      fileName,
      fileSize: fileBlob.size,
      uploadedAt: new Date().toLocaleString('es-EC'),
      driveFolder: DRIVE_FOLDER_NAME,
      driveFolderId: folderId,
      type,
      status: 'local_pendiente',
    };
    saveArchivedRecord(localRecord);
    throw new Error('NO_TOKEN');
  }

  // Prepare multipart upload targeting folder 1-v3wP04bfjKzvAuBavWGy59m-svhGDf0
  const metadata = {
    name: fileName,
    parents: [folderId],
    description: `Cotización ${quotationCode} de RBCOMUNICACIONES archivada en carpeta oficial - Tipo: ${type}`,
    properties: {
      quotationCode,
      type,
      company: 'RBCOMUNICACIONES',
      targetFolder: folderId,
    },
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', fileBlob);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!uploadRes.ok) {
    if (uploadRes.status === 401) {
      clearStoredDriveToken();
      throw new Error('TOKEN_EXPIRED');
    }
    throw new Error(`Error al subir archivo a Drive (${uploadRes.status}): ${uploadRes.statusText}`);
  }

  const uploadData = await uploadRes.json();
  const driveUrl = uploadData.webViewLink || `https://drive.google.com/file/d/${uploadData.id}/view`;

  // Save successful record
  const record: DriveFileRecord = {
    id: uploadData.id,
    quotationCode,
    fileName,
    fileSize: fileBlob.size,
    uploadedAt: new Date().toLocaleString('es-EC'),
    driveFolder: DRIVE_FOLDER_NAME,
    driveFolderId: folderId,
    driveFileId: uploadData.id,
    driveUrl,
    type,
    status: 'archivado',
  };
  saveArchivedRecord(record);

  return {
    fileId: uploadData.id,
    webViewLink: uploadData.webViewLink,
    driveUrl,
  };
}

/**
 * Automatically archives a quotation PDF to Google Drive in folder
 * "https://drive.google.com/drive/folders/1-v3wP04bfjKzvAuBavWGy59m-svhGDf0?usp=sharing"
 */
export async function archiveQuotationToDrive(
  fileBlob: Blob,
  fileName: string,
  _mimeType: string = 'application/pdf',
  quotationCode: string,
  type: 'generada' | 'firmada' = 'generada'
): Promise<{ fileId?: string; driveUrl?: string }> {
  try {
    return await uploadQuotationToDrive(fileBlob, fileName, quotationCode, type);
  } catch (err: any) {
    if (err.message === 'NO_TOKEN') {
      return {};
    }
    console.warn('Google Drive archiving warning:', err);
    return {};
  }
}
