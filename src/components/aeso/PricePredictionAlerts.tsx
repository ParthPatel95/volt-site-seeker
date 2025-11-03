import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, Zap, Clock } from "lucide-react";
import { PricePrediction } from "@/hooks/useAESOPricePrediction";

interface PricePredictionAlertsProps {
  predictions: PricePrediction[];
}

export const PricePredictionAlerts = ({ predictions }: PricePredictionAlertsProps) => {
  if (!predictions.length) return null;

  const alerts = [];

  // Check for price spikes (>$100/MWh)
  const spikes = predictions.filter(p => p.price > 100);
  if (spikes.length > 0) {
    const firstSpike = spikes[0];
    const hoursUntil = Math.round((new Date(firstSpike.timestamp).getTime() - Date.now()) / (1000 * 60 * 60));
    alerts.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Price Spike Alert",
      description: `High prices predicted (${firstSpike.price.toFixed(2)} $/MWh) in ${hoursUntil}h. Consider reducing load.`
    });
  }

  // Check for negative prices (excess renewables)
  const negative = predictions.filter(p => p.price < 0);
  if (negative.length > 0) {
    const firstNegative = negative[0];
    const hoursUntil = Math.round((new Date(firstNegative.timestamp).getTime() - Date.now()) / (1000 * 60 * 60));
    alerts.push({
      type: "success",
      icon: TrendingDown,
      title: "Negative Price Alert",
      description: `Negative prices predicted (${firstNegative.price.toFixed(2)} $/MWh) in ${hoursUntil}h. Excellent time for energy-intensive operations!`
    });
  }

  // Find optimal timing (lowest prices in next 24h)
  const next24h = predictions.slice(0, 24);
  if (next24h.length > 0) {
    const optimal = next24h.reduce((min, p) => p.price < min.price ? p : min, next24h[0]);
    const hoursUntil = Math.round((new Date(optimal.timestamp).getTime() - Date.now()) / (1000 * 60 * 60));
    alerts.push({
      type: "info",
      icon: Clock,
      title: "Optimal Timing",
      description: `Lowest price (${optimal.price.toFixed(2)} $/MWh) predicted in ${hoursUntil}h at ${new Date(optimal.timestamp).toLocaleTimeString()}.`
    });
  }

  // High volatility warning
  const volatility = Math.sqrt(predictions.slice(0, 24).reduce((sum, p) => sum + Math.pow(p.price - predictions[0].price, 2), 0) / 24);
  if (volatility > 50) {
    alerts.push({
      type: "warning",
      icon: Zap,
      title: "High Volatility",
      description: `Expect significant price fluctuations (±${volatility.toFixed(0)} $/MWh). Market uncertainty elevated.`
    });
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <Alert key={idx} variant={alert.type === "warning" ? "destructive" : "default"}>
          <alert.icon className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">{alert.title}:</span> {alert.description}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
