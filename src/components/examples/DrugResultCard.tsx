import DrugResultCard from '../DrugResultCard';

export default function DrugResultCardExample() {
  return (
    <div className="p-4 max-w-2xl space-y-4">
      <DrugResultCard
        drugName="Aspirin"
        genericName="Acetylsalicylic Acid"
        safetyStatus="safe"
        indication="Pain relief, fever reduction, anti-inflammatory"
        warnings={["May cause stomach irritation", "Avoid in children with viral infections"]}
      />
      <DrugResultCard
        drugName="Warfarin"
        genericName="Coumadin"
        safetyStatus="caution"
        indication="Anticoagulant for preventing blood clots"
        warnings={["Regular INR monitoring required", "Drug interactions common", "Avoid with pregnancy"]}
      />
      <DrugResultCard
        drugName="Metformin"
        genericName="Glucophage"
        safetyStatus="contraindicated"
        indication="Type 2 diabetes management"
        warnings={["Contraindicated in renal impairment", "Risk of lactic acidosis", "Withhold before surgery"]}
      />
    </div>
  );
}
