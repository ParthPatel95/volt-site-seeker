-- Add sample due diligence documents for testing
INSERT INTO public.voltmarket_due_diligence_documents (
  listing_id, 
  document_name, 
  document_type, 
  document_url, 
  file_size, 
  is_confidential, 
  requires_nda, 
  sort_order
) VALUES 
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  'Financial Statements 2023',
  'financial',
  'https://example.com/financial-2023.pdf',
  2048000,
  true,
  true,
  1
),
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  'Environmental Impact Assessment',
  'environmental', 
  'https://example.com/environmental-impact.pdf',
  5120000,
  false,
  false,
  2
),
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  'Technical Specifications',
  'technical',
  'https://example.com/tech-specs.pdf',
  1024000,
  true,
  true,
  3
),
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  'Legal Due Diligence Report',
  'legal',
  'https://example.com/legal-report.pdf',
  3072000,
  true,
  true,
  4
),
(
  '73bdd9be-3000-43b5-aca0-a40aaa2b1d48',
  'Regulatory Compliance Certificate',
  'regulatory',
  'https://example.com/regulatory-cert.pdf',
  512000,
  false,
  false,
  5
);