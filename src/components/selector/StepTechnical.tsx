'use client';
interface Props {
  voltage: '12V' | '24V' | '230V';
  atexRequired: boolean;
  mountType: string;
  standalone: boolean;
  onVoltageChange: (v: '12V' | '24V' | '230V') => void;
  onAtexChange: (v: boolean) => void;
  onMountChange: (v: string) => void;
  onStandaloneChange: (v: boolean) => void;
}
export default function StepTechnical(_props: Props) {
  return <div className="p-8 text-center text-gray-400">Step 2: Technical — Loading...</div>;
}
