import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  useIonToast,
} from '@ionic/react';
import { addOutline, cloudUploadOutline, closeOutline } from 'ionicons/icons';
import { connect } from '../data/connect';
import { setMenuEnabled } from '../data/sessions/sessions.actions';
import { useTranslation } from '../i18n';
import './PhotoDonation.scss';

type DonationEntry = {
  id: number;
  speciesSlug: string;
};

type FileItem = {
  key: string;
  file: File;
  url: string;
};

type SpeciesOption = {
  label: string;
  latin: string;
  slug: string;
};

const SPECIES_OPTIONS: SpeciesOption[] = [
  { label: 'Bar', latin: 'Dicentrarchus labrax', slug: 'dicentrarchus_labrax' },
  { label: 'Sparaillon', latin: 'Diplodus annularis', slug: 'diplodus_annularis' },
  { label: 'Sar à museau pointu', latin: 'Diplodus puntazzo', slug: 'diplodus_puntazzo' },
  { label: 'Sar commun', latin: 'Diplodus sargus', slug: 'diplodus_sargus' },
  { label: 'Sar à tête noire', latin: 'Diplodus vulgaris', slug: 'diplodus_vulgaris' },
  { label: 'Anchois', latin: 'Engraulis encrasicolus', slug: 'engraulis_encrasicolus' },
  { label: 'Mérou Royal', latin: 'Mycteroperca rubra', slug: 'mycteroperca_rubra' },
  { label: 'Marbré', latin: 'Lithognathus mormyrus', slug: 'lithognathus_mormyrus' },
  { label: 'Merlu commun', latin: 'Merluccius merluccius', slug: 'merluccius_merluccius' },
  { label: 'Rouget Barbet de roche', latin: 'Mullus surmuletus', slug: 'mullus_surmuletus' },
  { label: 'Pageot acarné', latin: 'Pagellus acarne', slug: 'pagellus_acarne' },
  { label: 'Dorade rose', latin: 'Pagellus bogaraveo', slug: 'pagellus_bogaraveo' },
  { label: 'Pageot commun', latin: 'Pagellus erythrinus', slug: 'pagellus_erythrinus' },
  { label: 'Pagre commun', latin: 'Pagrus pagrus', slug: 'pagrus_pagrus' },
  { label: 'Cernier atlantique', latin: 'Polyprion americanus', slug: 'polyprion_americanus' },
  { label: 'Sardine', latin: 'Sardina pilchardus', slug: 'sardina_pilchardus' },
  { label: 'Maquereau', latin: 'Scomber scombrus', slug: 'scomber_scombrus' },
  { label: 'Sole commune', latin: 'Solea vulgaris', slug: 'solea_vulgaris' },
  { label: 'Dorade royale', latin: 'Sparus aurata', slug: 'sparus_aurata' },
  { label: 'Chinchard', latin: 'Trachurus trachurus', slug: 'trachurus_trachurus' },
];

const SPECIES_BY_SLUG = new Map(
  SPECIES_OPTIONS.map((option) => [option.slug, option])
);

const UPLOAD_ENDPOINT = '/photo-donation.php';
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 30 * 1024 * 1024 * 1024;
const BATCH_SIZE = 50;

interface DispatchProps {
  setMenuEnabled: typeof setMenuEnabled;
}

const PhotoDonation: React.FC<DispatchProps> = ({ setMenuEnabled }) => {
  const { t } = useTranslation();
  const [present] = useIonToast();
  const nextId = useRef(0);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});
  const fileStoreRef = useRef<Record<number, FileItem[]>>({});
  const lightboxStartY = useRef<number | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const panStartTranslate = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const formStartedAt = useRef(Date.now());
  const [entries, setEntries] = useState<DonationEntry[]>([
    { id: nextId.current++, speciesSlug: '' },
  ]);
  const [fileStore, setFileStore] = useState<Record<number, FileItem[]>>({});
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(
    null
  );
  const [lightboxOffset, setLightboxOffset] = useState(0);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxTranslate, setLightboxTranslate] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(1);

  const getFileCount = (id: number) => fileStore[id]?.length ?? 0;
  const getSpeciesLabel = (slug: string) =>
    SPECIES_BY_SLUG.get(slug)?.label || slug;

  const lastEntry = entries[entries.length - 1];
  const canAddAnother = lastEntry ? getFileCount(lastEntry.id) > 0 : false;
  const hasAnyFiles = entries.some((entry) => getFileCount(entry.id) > 0);
  const progressPercent = Math.round((isUploading ? uploadProgress : 1) * 100);

  useEffect(() => {
    setMenuEnabled(false);
    return () => {
      setMenuEnabled(true);
    };
  }, [setMenuEnabled]);

  useEffect(() => {
    fileStoreRef.current = fileStore;
  }, [fileStore]);

  useEffect(() => {
    return () => {
      Object.values(fileStoreRef.current).forEach((items) => {
        items.forEach((item) => URL.revokeObjectURL(item.url));
      });
    };
  }, []);

  const handleSpeciesChange = (id: number, value: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, speciesSlug: value } : entry
      )
    );
  };

  const handleFilesChange = (id: number, files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const incoming = Array.from(files);
    let oversized = 0;
    setFileStore((prev) => {
      const current = prev[id] || [];
      const existingKeys = new Set(current.map((item) => item.key));
      const nextItems = [...current];

      incoming.forEach((file) => {
        if (file.size > MAX_FILE_BYTES) {
          oversized += 1;
          return;
        }
        const key = `${file.name}::${file.size}::${file.lastModified}`;
        if (existingKeys.has(key)) {
          return;
        }
        existingKeys.add(key);
        nextItems.push({
          key,
          file,
          url: URL.createObjectURL(file),
        });
      });

      if (nextItems.length === current.length) {
        return prev;
      }

      return { ...prev, [id]: nextItems };
    });

    if (fileInputs.current[id]) {
      fileInputs.current[id]!.value = '';
    }

    if (oversized > 0) {
      present({
        message: t('photoDonationFileTooLarge', { count: oversized }),
        duration: 3200,
      });
    }
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: nextId.current++, speciesSlug: '' },
    ]);
  };

  const onUploadClick = (id: number) => {
    fileInputs.current[id]?.click();
  };

  const removeFile = (entryId: number, key: string) => {
    setFileStore((prev) => {
      const current = prev[entryId] || [];
      const nextItems = current.filter((item) => item.key !== key);
      const removed = current.find((item) => item.key === key);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      if (nextItems.length === 0) {
        const { [entryId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [entryId]: nextItems };
    });
  };

  const openLightbox = (url: string, alt: string) => {
    setLightbox({ url, alt });
    setLightboxOffset(0);
    setLightboxScale(1);
    setLightboxTranslate({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightbox(null);
    setLightboxOffset(0);
    setLightboxScale(1);
    setLightboxTranslate({ x: 0, y: 0 });
    lightboxStartY.current = null;
    pinchStartDistance.current = null;
    pinchStartScale.current = 1;
    panStart.current = null;
    panStartTranslate.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    if (!lightbox) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        closeLightbox();
      }
    };
    const handleAndroidBack = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (
        !customEvent.detail ||
        typeof customEvent.detail.register !== 'function'
      ) {
        return;
      }
      customEvent.detail.register(1000, () => {
        closeLightbox();
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('ionBackButton', handleAndroidBack as EventListener);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener(
        'ionBackButton',
        handleAndroidBack as EventListener
      );
    };
  }, [lightbox]);

  const handleLightboxTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (event.touches.length === 2) {
      const touchA = event.touches.item(0);
      const touchB = event.touches.item(1);
      if (!touchA || !touchB) {
        return;
      }
      const distance = Math.hypot(
        touchA.clientX - touchB.clientX,
        touchA.clientY - touchB.clientY
      );
      pinchStartDistance.current = distance;
      pinchStartScale.current = lightboxScale;
      return;
    }

    if (lightboxScale > 1.01) {
      const touch = event.touches.item(0);
      if (!touch) {
        return;
      }
      panStart.current = { x: touch.clientX, y: touch.clientY };
      panStartTranslate.current = { ...lightboxTranslate };
      return;
    }

    lightboxStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleLightboxTouchMove = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (event.touches.length === 2 && pinchStartDistance.current != null) {
      const touchA = event.touches.item(0);
      const touchB = event.touches.item(1);
      if (!touchA || !touchB) {
        return;
      }
      const distance = Math.hypot(
        touchA.clientX - touchB.clientX,
        touchA.clientY - touchB.clientY
      );
      const nextScale = Math.min(
        3,
        Math.max(1, (pinchStartScale.current * distance) / pinchStartDistance.current)
      );
      setLightboxScale(nextScale);
      if (nextScale <= 1.01) {
        setLightboxTranslate({ x: 0, y: 0 });
        panStart.current = null;
        panStartTranslate.current = { x: 0, y: 0 };
      }
      return;
    }

    if (lightboxScale > 1.01) {
      const touch = event.touches.item(0);
      if (!touch || !panStart.current) {
        return;
      }
      const deltaX = touch.clientX - panStart.current.x;
      const deltaY = touch.clientY - panStart.current.y;
      const maxShift = 220 * lightboxScale;
      const nextX = Math.max(
        -maxShift,
        Math.min(maxShift, panStartTranslate.current.x + deltaX)
      );
      const nextY = Math.max(
        -maxShift,
        Math.min(maxShift, panStartTranslate.current.y + deltaY)
      );
      setLightboxTranslate({ x: nextX, y: nextY });
      return;
    }

    if (lightboxStartY.current == null) {
      return;
    }
    const currentY = event.touches[0]?.clientY ?? lightboxStartY.current;
    const delta = currentY - lightboxStartY.current;
    if (delta > 0) {
      setLightboxOffset(delta);
    }
  };

  const handleLightboxTouchEnd = () => {
    pinchStartDistance.current = null;
    if (lightboxScale > 1.01) {
      panStart.current = null;
      return;
    }
    if (lightboxOffset > 120) {
      closeLightbox();
      return;
    }
    setLightboxOffset(0);
    lightboxStartY.current = null;
  };

  const isHeicFile = (file: File) => {
    const name = file.name.toLowerCase();
    return (
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      name.endsWith('.heic') ||
      name.endsWith('.heif')
    );
  };

  const isJpegFile = (file: File) => {
    const name = file.name.toLowerCase();
    return (
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg')
    );
  };

  const isPngFile = (file: File) => {
    const name = file.name.toLowerCase();
    return file.type === 'image/png' || name.endsWith('.png');
  };

  const convertHeicToPng = async (file: File): Promise<File | null> => {
    try {
      const module = await import('heic2any');
      const heic2any = (module as { default?: any }).default || module;
      const result = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 1,
      });
      const blob = Array.isArray(result) ? result[0] : result;
      if (!(blob instanceof Blob)) {
        return null;
      }
      const baseName = file.name.replace(/\.(heic|heif)$/i, '');
      return new File([blob], `${baseName}.png`, { type: 'image/png' });
    } catch (error) {
      console.error('HEIC conversion failed', error);
      return null;
    }
  };

  const convertImageToPng = async (file: File): Promise<File | null> => {
    try {
      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await createImageBitmap(file);
      } catch (error) {
        console.error('Image bitmap creation failed', error);
        return null;
      }

      let blob: Blob | null = null;
      if ('OffscreenCanvas' in window) {
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          bitmap.close();
          return null;
        }
        ctx.drawImage(bitmap, 0, 0);
        blob = await canvas.convertToBlob({ type: 'image/png' });
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          bitmap.close();
          return null;
        }
        ctx.drawImage(bitmap, 0, 0);
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        );
      }

      bitmap.close();
      if (!blob) {
        return null;
      }

      const baseName = file.name.replace(/\.(jpg|jpeg|heic|heif|png)$/i, '');
      return new File([blob], `${baseName}.png`, { type: 'image/png' });
    } catch (error) {
      console.error('PNG conversion failed', error);
      return null;
    }
  };

  const normalizeFile = async (file: File): Promise<File | null> => {
    if (isHeicFile(file)) {
      const converted = await convertHeicToPng(file);
      return converted && converted.size <= MAX_FILE_BYTES ? converted : null;
    }
    if (isJpegFile(file)) {
      const converted = await convertImageToPng(file);
      return converted && converted.size <= MAX_FILE_BYTES ? converted : null;
    }
    if (isPngFile(file)) {
      return file.size <= MAX_FILE_BYTES ? file : null;
    }
    return null;
  };

  const uploadBatch = (
    speciesSlug: string,
    files: File[],
    onProgress: (ratio: number) => void
  ) =>
    new Promise<{
      saved: number;
      duplicates: number;
      rejected: number;
    }>((resolve, reject) => {
      const formData = new FormData();
      formData.append('species', speciesSlug);
      formData.append('form_started', formStartedAt.current.toString());
      formData.append('website', '');
      files.forEach((file) => {
        formData.append('photos[]', file, file.name);
      });

      const xhr = new XMLHttpRequest();
      xhr.open('POST', UPLOAD_ENDPOINT, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded / event.total);
        }
      };
      xhr.onload = () => {
        try {
          const payload = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300 && payload?.ok) {
            resolve({
              saved: payload.saved || 0,
              duplicates: payload.duplicates || 0,
              rejected: payload.rejected || 0,
            });
            return;
          }
          reject({ status: xhr.status, payload });
        } catch (error) {
          reject({ status: xhr.status, error });
        }
      };
      xhr.onerror = () => reject({ status: xhr.status });
      xhr.send(formData);
    });

  const uploadWithRetry = async (
    speciesSlug: string,
    files: File[],
    onProgress: (ratio: number) => void
  ) => {
    const delays = [0, 2000, 5000, 8000];
    let lastError: unknown;
    for (let attempt = 0; attempt < delays.length; attempt += 1) {
      if (delays[attempt] > 0) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }
      try {
        return await uploadBatch(speciesSlug, files, onProgress);
      } catch (error: any) {
        lastError = error;
        if (error?.status === 429 || error?.status === 503) {
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  };

  const handleSubmit = async () => {
    if (isUploading) {
      return;
    }

    const fileEntries = entries
      .filter((entry) => entry.speciesSlug)
      .map((entry) => ({
        entry,
        files: fileStore[entry.id] || [],
      }))
      .filter((item) => item.files.length > 0);

    if (fileEntries.length === 0) {
      return;
    }

    const totalBytes = fileEntries.reduce(
      (sum, item) =>
        sum + item.files.reduce((inner, file) => inner + file.file.size, 0),
      0
    );

    if (totalBytes > MAX_TOTAL_BYTES) {
      present({
        message: t('photoDonationTotalTooLarge'),
        duration: 3200,
      });
      return;
    }

    const globalKeys = new Set<string>();
    const queued: { speciesSlug: string; files: FileItem[] }[] = [];
    let duplicateCount = 0;

    fileEntries.forEach(({ entry, files }) => {
      const deduped = files.filter((file) => {
        if (globalKeys.has(file.key)) {
          duplicateCount += 1;
          return false;
        }
        globalKeys.add(file.key);
        return true;
      });
      if (deduped.length) {
        queued.push({ speciesSlug: entry.speciesSlug, files: deduped });
      }
    });

    const totalFiles = queued.reduce((sum, item) => sum + item.files.length, 0);
    if (totalFiles === 0) {
      present({
        message: t('photoDonationNoFiles'),
        duration: 2600,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let uploadedFiles = 0;
    let savedTotal = 0;
    let duplicateServerTotal = 0;
    let rejectedTotal = 0;
    let invalidTotal = 0;

    try {
      for (const batchGroup of queued) {
        const { speciesSlug, files } = batchGroup;
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const slice = files.slice(i, i + BATCH_SIZE);
          const normalized: File[] = [];
          let invalidInSlice = 0;

          for (const item of slice) {
            const normalizedFile = await normalizeFile(item.file);
            if (!normalizedFile) {
              invalidTotal += 1;
              invalidInSlice += 1;
              continue;
            }
            normalized.push(normalizedFile);
          }

          if (normalized.length === 0) {
            uploadedFiles += invalidInSlice;
            setUploadProgress(uploadedFiles / totalFiles);
            continue;
          }

          const result = await uploadWithRetry(
            speciesSlug,
            normalized,
            (ratio) => {
              const partial = uploadedFiles + invalidInSlice + ratio * normalized.length;
              setUploadProgress(Math.min(1, partial / totalFiles));
            }
          );

          uploadedFiles += normalized.length + invalidInSlice;
          savedTotal += result.saved;
          duplicateServerTotal += result.duplicates;
          rejectedTotal += result.rejected;
          setUploadProgress(Math.min(1, uploadedFiles / totalFiles));
        }
      }

      present({
        message: t('photoDonationUploadComplete', {
          saved: savedTotal,
          duplicates: duplicateServerTotal + duplicateCount,
          rejected: rejectedTotal + invalidTotal,
        }),
        duration: 4000,
      });
    } catch (error) {
      console.error('Upload failed', error);
      present({
        message: t('photoDonationUploadFailed'),
        duration: 3600,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(1);
    }
  };

  const entryTitles = useMemo(
    () =>
      entries.map((entry, index) => ({
        id: entry.id,
        label: t('photoDonationEntryTitle', { index: index + 1 }),
      })),
    [entries, t]
  );

  return (
    <IonPage id="photo-donation-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('navPhotoDonation')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="photo-donation">
          {entries.map((entry, index) => (
            <IonCard key={entry.id} className="photo-donation__card">
              <IonCardHeader>
                <IonCardTitle>{entryTitles[index]?.label}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  <IonItem>
                    <IonLabel>{t('photoDonationSpeciesLabel')}</IonLabel>
                    <IonSelect
                      value={entry.speciesSlug}
                      interface="popover"
                      placeholder={t('photoDonationSpeciesPlaceholder')}
                      disabled={isUploading}
                      onIonChange={(e) =>
                        handleSpeciesChange(entry.id, e.detail.value as string)
                      }
                    >
                      {SPECIES_OPTIONS.map((option) => (
                        <IonSelectOption key={option.slug} value={option.slug}>
                          {option.label} ({option.latin})
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonList>

                {entry.speciesSlug && (
                  <div className="photo-donation__upload">
                    <input
                      ref={(el) => {
                        fileInputs.current[entry.id] = el;
                      }}
                      className="photo-donation__file"
                      type="file"
                      accept="image/jpeg,image/png,image/heic,image/heif"
                      multiple
                      onChange={(e) =>
                        handleFilesChange(entry.id, e.currentTarget.files)
                      }
                    />
                    <IonButton
                      type="button"
                      disabled={isUploading}
                      onClick={() => onUploadClick(entry.id)}
                    >
                      <IonIcon slot="start" icon={cloudUploadOutline} />
                      {t('photoDonationUploadButton')}
                    </IonButton>
                    <p className="photo-donation__hint">
                      {getFileCount(entry.id) > 0
                        ? t('photoDonationFilesSelected', {
                            count: getFileCount(entry.id),
                            species: getSpeciesLabel(entry.speciesSlug),
                          })
                        : t('photoDonationNoFiles')}
                    </p>
                    {fileStore[entry.id]?.length ? (
                      <div className="photo-donation__preview-track">
                        {fileStore[entry.id].map((item, index) => (
                          <div
                            key={item.key}
                            className="photo-donation__preview-wrapper"
                          >
                            <img
                              className="photo-donation__preview"
                              src={item.url}
                              alt={t('photoDonationPreviewAlt', {
                                index: index + 1,
                              })}
                              onClick={() =>
                                openLightbox(
                                  item.url,
                                  t('photoDonationPreviewAlt', {
                                    index: index + 1,
                                  })
                                )
                              }
                            />
                            <button
                              type="button"
                              className="photo-donation__preview-remove"
                              disabled={isUploading}
                              onClick={(event) => {
                                event.stopPropagation();
                                removeFile(entry.id, item.key);
                              }}
                              aria-label={t('photoDonationRemovePhoto')}
                            >
                              <IonIcon icon={closeOutline} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          ))}

          {canAddAnother && (
            <IonButton
              className="photo-donation__add"
              fill="outline"
              disabled={isUploading}
              onClick={addEntry}
            >
              <IonIcon slot="start" icon={addOutline} />
              {t('photoDonationAddAnother')}
            </IonButton>
          )}

          <IonButton
            className="photo-donation__submit"
            expand="block"
            disabled={!hasAnyFiles || isUploading}
            onClick={handleSubmit}
            style={
              {
                '--progress': `${progressPercent}%`,
              } as React.CSSProperties
            }
          >
            <div className="photo-donation__submit-label">
              <span>
                {isUploading
                  ? t('photoDonationUploading')
                  : t('photoDonationSubmit')}
              </span>
              <span className="photo-donation__submit-sub">
                {isUploading
                  ? t('photoDonationUploadingSub')
                  : t('photoDonationSubmitThanks')}
              </span>
            </div>
          </IonButton>
        </div>

        {lightbox && (
          <div
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            onClick={closeLightbox}
            tabIndex={-1}
          >
            <button
              type="button"
              className="photo-lightbox__close"
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              aria-label={t('commonClose')}
            >
              <IonIcon icon={closeOutline} />
            </button>
            <div
              className="photo-lightbox__content"
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={handleLightboxTouchEnd}
              style={{
                transform: `translateY(${lightboxOffset}px)`,
              }}
            >
              <img
                src={lightbox.url}
                alt={lightbox.alt}
                style={{
                  transform: `translate(${lightboxTranslate.x}px, ${lightboxTranslate.y}px) scale(${lightboxScale})`,
                  transformOrigin: 'center',
                }}
              />
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default connect<{}, {}, DispatchProps>({
  mapDispatchToProps: {
    setMenuEnabled,
  },
  component: PhotoDonation,
});
