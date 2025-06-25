import React from "react";
import type { OptionStratTemplate } from "./optionStratTemplates";

interface Props {
  templates: OptionStratTemplate[];
  onSelect: (templateName: string) => void;
}

const OptionStratTemplateSelector: React.FC<Props> = ({ templates, onSelect }) => {
  return (
    <div className="template-selector">
      <label htmlFor="template">Select Strategy Template:</label>
      <select
        id="template"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          -- Choose a strategy --
        </option>
        {templates.map((template) => (
          <option key={template.name} value={template.name}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OptionStratTemplateSelector;
