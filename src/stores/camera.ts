import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CameraModel } from '@/types/camera-schema';

type CameraStore = {
  cameraModel: CameraModel;
  setCameraModel: (model: CameraModel) => void;
};

const useCameraStore = create<CameraStore>()(
  persist(
    (set) => ({
      cameraModel: 'X100V',
      setCameraModel: (model: CameraModel) => set({ cameraModel: model }),
    }),
    {
      name: 'camera-storage',
    }
  )
);

export default useCameraStore;
