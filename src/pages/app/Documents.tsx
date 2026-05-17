import { useState } from 'react';
import { FileText, ExternalLink, ChevronDown, ChevronRight, Shield, BookOpen, Receipt } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  type: string;
  date?: string;
}

const REQUIRED_DISCLOSURES: Document[] = [
  { id: '1', title: 'Form CRS – Client Relationship Summary', category: 'disclosures', description: 'Required summary of the advisory relationship, services, fees, conflicts, and your right to ask questions.', type: 'PDF', date: 'Jan 2026' },
  { id: '2', title: 'Form ADV Part 2A – Firm Brochure', category: 'disclosures', description: 'Detailed disclosure of business practices, fees, advisory services, and material conflicts of interest.', type: 'PDF', date: 'Jan 2026' },
  { id: '3', title: 'Privacy Notice', category: 'disclosures', description: 'How we collect, use, and share your personal information, and your choices.', type: 'PDF', date: 'Jan 2026' },
  { id: '4', title: 'Advisory Agreement', category: 'disclosures', description: 'The agreement governing our advisory relationship, services, and fees.', type: 'PDF', date: 'Jan 2026' },
  { id: '5', title: 'Fee Schedule', category: 'disclosures', description: 'Complete breakdown of advisory fees, how they are calculated, and when they are charged.', type: 'PDF', date: 'Jan 2026' },
  { id: '6', title: 'Risk Disclosure', category: 'disclosures', description: 'Material risks associated with automated investing, including market risk and technology risk.', type: 'PDF', date: 'Jan 2026' },
];

const PRODUCT_EXPLANATIONS: Document[] = [
  { id: '7', title: 'How recommendations are generated', category: 'explanations', description: 'A plain-English explanation of the software models and inputs used to create your personalized recommendations.', type: 'Article' },
  { id: '8', title: 'How rebalancing works', category: 'explanations', description: 'When and why we recommend rebalancing, and how drift thresholds are determined.', type: 'Article' },
  { id: '9', title: 'What happens during market volatility', category: 'explanations', description: 'How the system behaves during significant market moves and what we communicate to you.', type: 'Article' },
  { id: '10', title: 'Tax considerations for your account', category: 'explanations', description: 'Overview of the tax implications of investing activity in your account type.', type: 'Article' },
];

const ACCOUNT_DOCS: Document[] = [
  { id: '11', title: 'Statement – April 2026', category: 'account', description: 'Monthly account statement for April 2026.', type: 'PDF', date: 'May 1, 2026' },
  { id: '12', title: 'Statement – March 2026', category: 'account', description: 'Monthly account statement for March 2026.', type: 'PDF', date: 'Apr 1, 2026' },
];

const SECTIONS = [
  { id: 'disclosures', label: 'Required disclosures', icon: Shield, docs: REQUIRED_DISCLOSURES, desc: 'Regulatory documents required for our advisory relationship.' },
  { id: 'explanations', label: 'Product explanations', icon: BookOpen, docs: PRODUCT_EXPLANATIONS, desc: 'How the product works, in plain English.' },
  { id: 'account', label: 'Account documents', icon: Receipt, docs: ACCOUNT_DOCS, desc: 'Statements, confirmations, and tax forms.' },
];

function DocRow({ doc }: { doc: Document }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-charcoal-border last:border-0 group">
      <div className="w-8 h-8 bg-charcoal-light border border-charcoal-border rounded-app flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-white group-hover:text-mint transition-colors cursor-pointer">{doc.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{doc.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {doc.date && <span className="text-xs text-gray-600">{doc.date}</span>}
            <span className="text-xs bg-charcoal-light border border-charcoal-border px-2 py-0.5 rounded-app text-gray-500">{doc.type}</span>
            <button className="text-gray-600 hover:text-mint transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ section }: { section: typeof SECTIONS[0] }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;

  return (
    <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-charcoal-light/30 transition-colors"
      >
        <Icon className="w-4 h-4 text-mint" />
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white">{section.label}</p>
          <p className="text-xs text-gray-500">{section.desc}</p>
        </div>
        <span className="text-xs text-gray-500 mr-2">{section.docs.length} document{section.docs.length !== 1 ? 's' : ''}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>

      {open && (
        <div className="px-5 border-t border-charcoal-border">
          {section.docs.map(doc => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Documents() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-1">Documents</h1>
        <p className="text-sm text-gray-500">Required disclosures, account statements, and product explanations.</p>
      </div>

      <div className="bg-mint/5 border border-mint/15 rounded-app-md p-4 mb-6 flex items-start gap-3">
        <Shield className="w-4 h-4 text-mint mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-mint mb-1">Important disclosures</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            As a digital investment adviser, we are required to provide you with clear disclosure of our services, fees, and conflicts of interest. The documents below are always available and never hidden. If you have questions about any document, contact our support team.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map(section => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
