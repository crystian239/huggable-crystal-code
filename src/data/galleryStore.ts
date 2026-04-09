import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GalleryPhoto {
  id: string;
  src: string; // base64 data URL
  caption: string;
  uploadedBy: string; // doctor/admin name
  uploadedAt: string;
}

interface GalleryStore {
  photos: GalleryPhoto[];
  addPhoto: (photo: Omit<GalleryPhoto, "id" | "uploadedAt">) => void;
  removePhoto: (id: string) => void;
  updateCaption: (id: string, caption: string) => void;
}

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set) => ({
      photos: [],

      addPhoto: (photo) =>
        set((s) => ({
          photos: [
            { ...photo, id: crypto.randomUUID(), uploadedAt: new Date().toISOString() },
            ...s.photos,
          ],
        })),

      removePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      updateCaption: (id, caption) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, caption } : p)),
        })),
    }),
    { name: "gallery-storage" }
  )
);
