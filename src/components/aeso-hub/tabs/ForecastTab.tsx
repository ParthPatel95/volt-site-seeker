import { AESOForecastPanel } from '@/components/intelligence/AESOForecastPanel';

interface ForecastTabProps {
  windSolarForecast: any;
  loading: boolean;
}

export function ForecastTab({ windSolarForecast, loading }: ForecastTabProps) {
  return (
    <div>
      <AESOForecastPanel
        windSolarForecast={windSolarForecast}
        loading={loading}
      />
    </div>
  );
}
