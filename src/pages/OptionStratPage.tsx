import { useState } from "react";
import "../styles/OptionStrategy.css";

import { optionStratTemplates } from "../components/optionStratTemplates";
import OptionStrategyTemplateSelector from "../components/OptionStratTemplateSelector";
import OptionLegTable from "../components/OptionLegTable";
import OptionStrategySummary from "../components/OptionStrategySummary";
import OptionPLChart from "../components/OptionPLChart";
import type { Leg } from "../components/optionStratTemplates";

const OptionStrategyPage = () => {
  const [legs, setLegs] = useState<Leg[]>([]);

  const applyTemplate = (templateName: string) => {
    const selected = optionStratTemplates.find(t => t.name === templateName);
    if (selected) setLegs(selected.legs);
  };

  return (
    <div className="option-strategy-page">
      <h2>Option Strategy Builder</h2>

      <OptionStrategyTemplateSelector
        templates={optionStratTemplates}
        onSelect={applyTemplate}
      />

      <div className="builder-layout">
        <div className="left-panel">
          <OptionLegTable legs={legs} setLegs={setLegs} />
          <OptionStrategySummary legs={legs} />
        </div>
        <div className="right-panel">
          <OptionPLChart legs={legs} />
        </div>
      </div>
    </div>
  );
};

export default OptionStrategyPage;
