
export const formatCurrency = (value?: number) => {
  if (!value || value === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatPercentage = (value?: number) => {
  if (value === undefined || value === null) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
};

export const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

export const getHealthColor = (score?: number) => {
  if (!score) return 'bg-gray-500';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getDistressColor = (level: number) => {
  if (level >= 80) return 'bg-red-500';
  if (level >= 60) return 'bg-orange-500';
  return 'bg-yellow-500';
};

export const getOpportunityScore = (company: any) => {
  if (!company.financial_health_score) return 'N/A';
  
  if (company.distress_signals && company.distress_signals.length > 0) {
    return Math.min(100 - company.financial_health_score, 85);
  }
  
  return company.financial_health_score > 80 ? 'Low' : 'Medium';
};

export const getRiskLevel = (company: any) => {
  if (!company.financial_health_score) return 'Unknown';
  
  if (company.financial_health_score < 40) return 'High';
  if (company.financial_health_score < 70) return 'Medium';
  return 'Low';
};
