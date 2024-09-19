export interface CSVData {
  headers: string[];
  data: Record<string, string>[];
}

export interface FileContent {
  content: string;
}

export interface ControlsOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface ControlsOptions {
  min?: number;
  max?: number;
  step?: number;
  choices?: string[];
}

export interface Controls {
  targetVar: string;
  title: string;
  property: string;
  default: string | number;
  value: string;
  units?: string;
  options: ControlsOptions;
}

export interface DynamicElement {
  targetClass: string;
  controls: Controls[];
}

export interface Config {
  dynamicElements: DynamicElement[];
}

export interface ContentMatrixData {
  headers: string[];
  rows: Record<string, string>[];
}
