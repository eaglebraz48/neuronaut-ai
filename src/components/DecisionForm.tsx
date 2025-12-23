import { useState } from 'react';
import { evaluateCareerPivot } from '../engines';

const DecisionForm = () => {
  const [inputs, setInputs] = useState({
    incomePressure: 'medium',
    skillRelevance: 'stagnant',
    fearSource: 'money',
    optionality: 'low',
  });

  const handleSubmit = () => {
    const result = evaluateCareerPivot(inputs);
    console.log(result);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Income Pressure</label>
        <select
          value={inputs.incomePressure}
          onChange={(e) => setInputs({ ...inputs, incomePressure: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Repeat for other inputs: skillRelevance, fearSource, optionality */}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default DecisionForm;

