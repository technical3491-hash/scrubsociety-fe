import CaseCard from '../CaseCard';

export default function CaseCardExample() {
  return (
    <div className="p-4 max-w-2xl">
      <CaseCard
        id="1"
        doctorName="Dr. Priya Sharma"
        doctorSpecialty="Cardiologist"
        timeAgo="2 hours ago"
        title="Complex Arrhythmia Case - Seeking Opinions"
        content="58-year-old male presenting with intermittent palpitations. ECG shows atrial fibrillation with rapid ventricular response. Patient has a history of hypertension and diabetes. Considering catheter ablation vs. medical management. Would appreciate insights from electrophysiologists."
        tags={["Cardiology", "Arrhythmia", "Case Discussion"]}
        likes={24}
        comments={8}
      />
    </div>
  );
}
