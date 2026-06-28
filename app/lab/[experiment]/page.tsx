import LabExperimentPageClient from "./LabExperimentPageClient";

const LAB_IDS = [
  "lab-torque", "lab-circular", "lab-pendulum", "lab-waves", "lab-resonance",
  "lab-optics", "lab-engine", "lab-kirchhoff", "lab-meters",
  "lab-charges", "lab-coulomb", "lab-electric-field", "lab-circuit",
  "lab-ohm", "lab-magnetic-field", "lab-em-induction", "lab-photoelectric",
];

export function generateStaticParams() {
  return LAB_IDS.map(id => ({ experiment: id }));
}

export default async function LabExperimentPage({ params }: { params: Promise<{ experiment: string }> }) {
  const { experiment: experimentId } = await params;
  return <LabExperimentPageClient experimentId={experimentId} />;
}
