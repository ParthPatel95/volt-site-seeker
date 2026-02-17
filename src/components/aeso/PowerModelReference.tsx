import React from 'react';
import { PowerModelAssumptions } from './PowerModelAssumptions';
import { PowerModelRateExplainer } from './PowerModelRateExplainer';
import { PowerModelDataSources } from './PowerModelDataSources';

interface Props {
  recordCount: number;
  dataSource: 'database' | 'upload';
}

export function PowerModelReference({ recordCount, dataSource }: Props) {
  return (
    <div className="space-y-4">
      <PowerModelAssumptions />
      <PowerModelRateExplainer />
      <PowerModelDataSources recordCount={recordCount} dataSource={dataSource} />
    </div>
  );
}
