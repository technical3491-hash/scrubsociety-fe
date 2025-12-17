import CMECard from '../CMECard';

export default function CMECardExample() {
  return (
    <div className="p-4 max-w-sm">
      <CMECard
        title="Advanced Cardiac Life Support (ACLS)"
        description="Comprehensive training on emergency cardiovascular care protocols and procedures for healthcare professionals."
        duration="4 hours"
        credits={4}
        category="Cardiology"
      />
    </div>
  );
}
