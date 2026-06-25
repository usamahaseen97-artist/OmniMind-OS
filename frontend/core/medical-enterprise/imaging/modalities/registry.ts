import type { ImagingModality } from "../types";

export type ModalityDefinition = {
  id: ImagingModality;
  label: string;
  dicomCompatible: boolean;
  supports3D: boolean;
  supportsTiles: boolean;
  aiVisionSlot?: string;
};

export const IMAGING_MODALITY_REGISTRY: ModalityDefinition[] = [
  { id: "dicom", label: "DICOM", dicomCompatible: true, supports3D: true, supportsTiles: true, aiVisionSlot: "dicom-vision" },
  { id: "mri", label: "MRI", dicomCompatible: true, supports3D: true, supportsTiles: true, aiVisionSlot: "mri-copilot" },
  { id: "ct", label: "CT Scan", dicomCompatible: true, supports3D: true, supportsTiles: true, aiVisionSlot: "ct-copilot" },
  { id: "xray", label: "X-Ray", dicomCompatible: true, supports3D: false, supportsTiles: true, aiVisionSlot: "xray-copilot" },
  { id: "ultrasound", label: "Ultrasound", dicomCompatible: true, supports3D: false, supportsTiles: true },
  { id: "pet", label: "PET Scan", dicomCompatible: true, supports3D: true, supportsTiles: true },
  { id: "mammography", label: "Mammography", dicomCompatible: true, supports3D: false, supportsTiles: true },
  { id: "dental", label: "Dental Imaging", dicomCompatible: true, supports3D: true, supportsTiles: true },
  { id: "oct", label: "OCT", dicomCompatible: false, supports3D: false, supportsTiles: true },
  { id: "fundus", label: "Fundus Imaging", dicomCompatible: false, supports3D: false, supportsTiles: true, aiVisionSlot: "fundus-vision" },
  { id: "pathology-slide", label: "Pathology Slides", dicomCompatible: false, supports3D: false, supportsTiles: true, aiVisionSlot: "pathology-vision" },
  { id: "microscopy", label: "Microscopy", dicomCompatible: false, supports3D: false, supportsTiles: true },
  { id: "endoscopy", label: "Endoscopy", dicomCompatible: false, supports3D: false, supportsTiles: true },
  { id: "dermatology", label: "Dermatology Images", dicomCompatible: false, supports3D: false, supportsTiles: true },
  { id: "clinical-photo", label: "Clinical Photos", dicomCompatible: false, supports3D: false, supportsTiles: false },
  { id: "volume-3d", label: "3D Reconstruction", dicomCompatible: true, supports3D: true, supportsTiles: false },
  { id: "ai-vision", label: "AI Vision Models", dicomCompatible: false, supports3D: false, supportsTiles: true },
];

export function getModalityDefinition(id: ImagingModality): ModalityDefinition | undefined {
  return IMAGING_MODALITY_REGISTRY.find((m) => m.id === id);
}
