-- Insert sample documents for the listing
INSERT INTO voltmarket_documents (
  listing_id, 
  uploader_id, 
  file_name, 
  file_url, 
  file_type, 
  document_type, 
  description, 
  file_size, 
  is_private
) VALUES 
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  (SELECT id FROM voltmarket_profiles LIMIT 1),
  'Financial_Statement_2024.pdf',
  'https://example.com/docs/financial_statement.pdf',
  'application/pdf',
  'financial',
  'Annual financial statements showing revenue, expenses, and profitability',
  2547000,
  false
),
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  (SELECT id FROM voltmarket_profiles LIMIT 1),
  'Technical_Specifications.pdf',
  'https://example.com/docs/tech_specs.pdf',
  'application/pdf',
  'technical',
  'Detailed technical specifications including power infrastructure and capacity details',
  1890000,
  false
),
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  (SELECT id FROM voltmarket_profiles LIMIT 1),
  'Environmental_Impact_Report.pdf',
  'https://example.com/docs/environmental_report.pdf',
  'application/pdf',
  'environmental',
  'Environmental impact assessment and compliance documentation',
  3200000,
  true
),
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  (SELECT id FROM voltmarket_profiles LIMIT 1),
  'Legal_Compliance_Documents.zip',
  'https://example.com/docs/legal_docs.zip',
  'application/zip',
  'legal',
  'Legal compliance documentation including permits and regulatory approvals',
  5600000,
  true
);