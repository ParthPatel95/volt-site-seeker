import { Zap, Building, FileText, Clock, Phone, Shield } from 'lucide-react';

interface PowerInfraAnalysisProps {
  analysis: {
    estimated_power_capacity_mw?: number | null;
    voltage_available?: string | null;
    nearest_substation?: string | null;
    substation_distance_miles?: number | null;
    transmission_access?: boolean;
    utility_provider?: string | null;
    power_application_process?: {
      utility_contact?: string | null;
      typical_timeline_months?: number | null;
      required_documents?: string[];
      estimated_interconnection_cost?: string | null;
      process_steps?: string[];
    };
    grid_interconnection_notes?: string | null;
    cooling_potential?: string | null;
    redundancy_options?: string | null;
  };
}

export function PowerInfraAnalysis({ analysis }: PowerInfraAnalysisProps) {
  const process = analysis.power_application_process;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
      <h5 className="font-semibold text-sm flex items-center gap-2 text-yellow-800">
        <Zap className="w-4 h-4" />
        Power Infrastructure Analysis
      </h5>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {analysis.voltage_available && (
          <div>
            <span className="font-medium text-yellow-700">Voltage:</span>
            <span className="ml-1 text-foreground">{analysis.voltage_available}</span>
          </div>
        )}
        {analysis.nearest_substation && (
          <div>
            <span className="font-medium text-yellow-700">Nearest Substation:</span>
            <span className="ml-1 text-foreground">{analysis.nearest_substation}</span>
          </div>
        )}
        {analysis.substation_distance_miles != null && (
          <div>
            <span className="font-medium text-yellow-700">Substation Distance:</span>
            <span className="ml-1 text-foreground">{analysis.substation_distance_miles} mi</span>
          </div>
        )}
        {analysis.utility_provider && (
          <div>
            <span className="font-medium text-yellow-700">Utility:</span>
            <span className="ml-1 text-foreground">{analysis.utility_provider}</span>
          </div>
        )}
        <div>
          <span className="font-medium text-yellow-700">Transmission:</span>
          <span className="ml-1 text-foreground">{analysis.transmission_access ? '✅ Yes' : '❌ No'}</span>
        </div>
        {analysis.estimated_power_capacity_mw != null && (
          <div>
            <span className="font-medium text-yellow-700">Capacity:</span>
            <span className="ml-1 text-foreground font-bold">{analysis.estimated_power_capacity_mw} MW</span>
          </div>
        )}
      </div>

      {analysis.cooling_potential && (
        <div className="text-xs">
          <span className="font-medium text-yellow-700">Cooling:</span>
          <span className="ml-1 text-muted-foreground">{analysis.cooling_potential}</span>
        </div>
      )}

      {analysis.redundancy_options && (
        <div className="text-xs">
          <Shield className="w-3 h-3 inline mr-1 text-yellow-600" />
          <span className="font-medium text-yellow-700">Redundancy:</span>
          <span className="ml-1 text-muted-foreground">{analysis.redundancy_options}</span>
        </div>
      )}

      {analysis.grid_interconnection_notes && (
        <div className="text-xs bg-yellow-100 rounded p-2">
          <span className="font-medium text-yellow-800">Grid Notes:</span>
          <span className="ml-1 text-yellow-900">{analysis.grid_interconnection_notes}</span>
        </div>
      )}

      {/* Power Application Process */}
      {process && (
        <div className="border-t border-yellow-200 pt-3 space-y-2">
          <h6 className="font-semibold text-xs text-yellow-800 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Power Application Process
          </h6>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {process.utility_contact && (
              <div className="flex items-start gap-1">
                <Phone className="w-3 h-3 mt-0.5 text-yellow-600" />
                <div>
                  <span className="font-medium text-yellow-700">Contact:</span>
                  <span className="ml-1 text-foreground">{process.utility_contact}</span>
                </div>
              </div>
            )}
            {process.typical_timeline_months != null && (
              <div className="flex items-start gap-1">
                <Clock className="w-3 h-3 mt-0.5 text-yellow-600" />
                <div>
                  <span className="font-medium text-yellow-700">Timeline:</span>
                  <span className="ml-1 text-foreground">{process.typical_timeline_months} months</span>
                </div>
              </div>
            )}
            {process.estimated_interconnection_cost && (
              <div className="flex items-start gap-1">
                <Building className="w-3 h-3 mt-0.5 text-yellow-600" />
                <div>
                  <span className="font-medium text-yellow-700">Est. Cost:</span>
                  <span className="ml-1 text-foreground">{process.estimated_interconnection_cost}</span>
                </div>
              </div>
            )}
          </div>

          {process.process_steps && process.process_steps.length > 0 && (
            <div className="text-xs">
              <span className="font-medium text-yellow-700">Steps:</span>
              <ol className="list-decimal list-inside ml-2 text-muted-foreground space-y-0.5">
                {process.process_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {process.required_documents && process.required_documents.length > 0 && (
            <div className="text-xs">
              <span className="font-medium text-yellow-700">Required Docs:</span>
              <ul className="list-disc list-inside ml-2 text-muted-foreground">
                {process.required_documents.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
