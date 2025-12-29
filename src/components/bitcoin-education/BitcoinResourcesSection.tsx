import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileText, 
  Code, 
  GraduationCap,
  ExternalLink,
  Youtube,
  Headphones,
  Github,
  Globe,
  ScrollText,
  Lightbulb,
  Award,
  Users,
  Zap
} from 'lucide-react';

export default function BitcoinResourcesSection() {
  const essentialBooks = [
    {
      title: 'The Bitcoin Standard',
      author: 'Saifedean Ammous',
      year: 2018,
      description: 'Economic history of money and Bitcoin\'s role as sound money. Essential for understanding Bitcoin\'s monetary properties.',
      level: 'Beginner',
      category: 'Economics'
    },
    {
      title: 'Mastering Bitcoin',
      author: 'Andreas M. Antonopoulos',
      year: 2017,
      description: 'Comprehensive technical guide to Bitcoin. Covers cryptography, transactions, mining, and development.',
      level: 'Intermediate',
      category: 'Technical'
    },
    {
      title: 'Programming Bitcoin',
      author: 'Jimmy Song',
      year: 2019,
      description: 'Learn Bitcoin development from scratch. Build a Bitcoin library in Python to understand the protocol.',
      level: 'Advanced',
      category: 'Development'
    },
    {
      title: 'Inventing Bitcoin',
      author: 'Yan Pritzker',
      year: 2019,
      description: 'Short, accessible introduction to how Bitcoin works. Perfect first book for newcomers.',
      level: 'Beginner',
      category: 'Technical'
    },
    {
      title: 'The Blocksize War',
      author: 'Jonathan Bier',
      year: 2021,
      description: 'Historical account of the 2015-2017 scaling debate. Essential for understanding Bitcoin governance.',
      level: 'Intermediate',
      category: 'History'
    },
    {
      title: 'Grokking Bitcoin',
      author: 'Kalle Rosenbaum',
      year: 2019,
      description: 'Visual, intuitive explanation of Bitcoin concepts with excellent diagrams.',
      level: 'Beginner',
      category: 'Technical'
    }
  ];

  const academicPapers = [
    {
      title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
      author: 'Satoshi Nakamoto',
      year: 2008,
      description: 'The original Bitcoin whitepaper. Only 9 pages but introduces all core concepts.',
      link: 'https://bitcoin.org/bitcoin.pdf',
      importance: 'Essential'
    },
    {
      title: 'Majority is not Enough: Bitcoin Mining is Vulnerable',
      author: 'Eyal & Sirer',
      year: 2013,
      description: 'Introduces selfish mining attack showing 51% threshold isn\'t necessary for attacks.',
      link: 'https://arxiv.org/abs/1311.0243',
      importance: 'Important'
    },
    {
      title: 'Eclipse Attacks on Bitcoin\'s Peer-to-Peer Network',
      author: 'Heilman et al.',
      year: 2015,
      description: 'Demonstrates how attackers can monopolize victim\'s connections to manipulate their view.',
      link: 'https://eprint.iacr.org/2015/263.pdf',
      importance: 'Important'
    },
    {
      title: 'The Bitcoin Lightning Network',
      author: 'Poon & Dryja',
      year: 2016,
      description: 'Proposes payment channels and HTLCs for scalable off-chain payments.',
      link: 'https://lightning.network/lightning-network-paper.pdf',
      importance: 'Essential'
    },
    {
      title: 'Simple Schnorr Multi-Signatures with Applications to Bitcoin',
      author: 'Maxwell et al.',
      year: 2018,
      description: 'MuSig protocol enabling key aggregation for Taproot\'s Schnorr signatures.',
      link: 'https://eprint.iacr.org/2018/068.pdf',
      importance: 'Important'
    },
    {
      title: 'Erlay: Efficient Transaction Relay for Bitcoin',
      author: 'Naumenko et al.',
      year: 2019,
      description: 'Proposes bandwidth-efficient transaction relay using set reconciliation.',
      link: 'https://arxiv.org/abs/1905.10518',
      importance: 'Research'
    }
  ];

  const keyBIPs = [
    {
      number: 'BIP 32',
      title: 'Hierarchical Deterministic Wallets',
      description: 'Standard for deriving many keys from a single seed. Foundation for HD wallets.',
      status: 'Final'
    },
    {
      number: 'BIP 39',
      title: 'Mnemonic Code for Generating Deterministic Keys',
      description: 'The 12/24-word seed phrase standard used by most wallets.',
      status: 'Proposed'
    },
    {
      number: 'BIP 44',
      title: 'Multi-Account Hierarchy for Deterministic Wallets',
      description: 'Standard derivation paths for different coin types and accounts.',
      status: 'Proposed'
    },
    {
      number: 'BIP 141',
      title: 'Segregated Witness (Consensus layer)',
      description: 'SegWit soft fork fixing transaction malleability and increasing block capacity.',
      status: 'Final'
    },
    {
      number: 'BIP 174',
      title: 'Partially Signed Bitcoin Transaction Format',
      description: 'PSBT format for coordinating signing between multiple wallets/devices.',
      status: 'Proposed'
    },
    {
      number: 'BIP 340',
      title: 'Schnorr Signatures for secp256k1',
      description: 'Schnorr signature scheme enabling key aggregation and batch verification.',
      status: 'Final'
    },
    {
      number: 'BIP 341',
      title: 'Taproot: SegWit version 1 spending rules',
      description: 'Taproot output structure combining Schnorr with MAST.',
      status: 'Final'
    },
    {
      number: 'BIP 342',
      title: 'Validation of Taproot Scripts',
      description: 'New script validation rules for Tapscript.',
      status: 'Final'
    }
  ];

  const developerResources = [
    {
      name: 'Bitcoin Developer Documentation',
      url: 'https://developer.bitcoin.org',
      description: 'Official developer documentation covering RPC, protocol, and best practices.',
      icon: Globe
    },
    {
      name: 'Learning Bitcoin from Command Line',
      url: 'https://github.com/BlockchainCommons/Learning-Bitcoin-from-the-Command-Line',
      description: 'Comprehensive tutorial using bitcoin-cli. Great for understanding the protocol.',
      icon: Github
    },
    {
      name: 'Bitcoin Core Source Code',
      url: 'https://github.com/bitcoin/bitcoin',
      description: 'The reference implementation. Reading the code is the ultimate learning resource.',
      icon: Code
    },
    {
      name: 'Bitcoin Stack Exchange',
      url: 'https://bitcoin.stackexchange.com',
      description: 'Q&A site for Bitcoin development questions. Excellent archive of technical discussions.',
      icon: Users
    },
    {
      name: 'Bitcoin Optech',
      url: 'https://bitcoinops.org',
      description: 'Weekly newsletter covering Bitcoin technical developments. Essential for staying current.',
      icon: Lightbulb
    },
    {
      name: 'BTC Study',
      url: 'https://bitcoiner.guide',
      description: 'Curated guides on running nodes, privacy, Lightning, and more.',
      icon: GraduationCap
    }
  ];

  const videoResources = [
    {
      name: 'MIT Blockchain & Money Course',
      creator: 'Gary Gensler (MIT OpenCourseWare)',
      description: 'Full MIT course covering blockchain technology, finance, and regulation.',
      platform: 'YouTube',
      length: '24 lectures'
    },
    {
      name: 'Bitcoin & Cryptocurrency Technologies',
      creator: 'Princeton (Coursera)',
      description: 'Academic course on Bitcoin technology and cryptography fundamentals.',
      platform: 'Coursera',
      length: '11 weeks'
    },
    {
      name: 'Andreas Antonopoulos Talks',
      creator: 'aantonop',
      description: 'Hundreds of educational talks on Bitcoin, privacy, and decentralization.',
      platform: 'YouTube',
      length: '500+ videos'
    },
    {
      name: 'What Bitcoin Did',
      creator: 'Peter McCormack',
      description: 'Long-form interviews with Bitcoin developers, economists, and thinkers.',
      platform: 'Podcast',
      length: 'Weekly'
    },
    {
      name: 'Stephan Livera Podcast',
      creator: 'Stephan Livera',
      description: 'Technical and economic Bitcoin podcast with developer interviews.',
      platform: 'Podcast',
      length: 'Weekly'
    },
    {
      name: 'Bitcoin Audible',
      creator: 'Guy Swann',
      description: 'Narrated Bitcoin articles and essays. Perfect for learning on the go.',
      platform: 'Podcast',
      length: 'Daily'
    }
  ];

  const practicalTools = [
    {
      name: 'mempool.space',
      url: 'https://mempool.space',
      description: 'Open-source block explorer with mempool visualization. Run your own instance.',
      category: 'Explorer'
    },
    {
      name: 'Sparrow Wallet',
      url: 'https://sparrowwallet.com',
      description: 'Full-featured desktop wallet with coin control, PSBT, and hardware wallet support.',
      category: 'Wallet'
    },
    {
      name: 'Bitcoin Core',
      url: 'https://bitcoincore.org',
      description: 'The reference implementation. Run a full node to support the network.',
      category: 'Node'
    },
    {
      name: 'Umbrel',
      url: 'https://umbrel.com',
      description: 'User-friendly node OS with Bitcoin Core, Lightning, and apps.',
      category: 'Node'
    },
    {
      name: 'Polar',
      url: 'https://lightningpolar.com',
      description: 'One-click Lightning Network regtest for development and testing.',
      category: 'Development'
    },
    {
      name: 'Bitcoin Testnet Faucet',
      url: 'https://bitcoinfaucet.uo1.net',
      description: 'Get testnet coins for development without risking real bitcoin.',
      category: 'Development'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          <BookOpen className="w-3 h-3 mr-1" />
          Learning Resources
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Bitcoin Learning Resources
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Curated collection of the best books, papers, courses, and tools for 
          continuing your Bitcoin education journey from beginner to expert.
        </p>
      </div>

      {/* Essential Books */}
      <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Essential Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {essentialBooks.map((book, i) => (
              <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/50 hover:border-amber-500/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-sm">{book.title}</h5>
                  <Badge variant="outline" className={`text-xs ${
                    book.level === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                    book.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {book.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {book.author} ({book.year})
                </p>
                <p className="text-sm text-muted-foreground">{book.description}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {book.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Papers */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Academic Papers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {academicPapers.map((paper, i) => (
            <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/50 hover:border-purple-500/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-sm">{paper.title}</h5>
                    <Badge variant="outline" className={`text-xs ${
                      paper.importance === 'Essential' ? 'bg-red-500/10 text-red-400' :
                      paper.importance === 'Important' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {paper.importance}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {paper.author} ({paper.year})
                  </p>
                  <p className="text-sm text-muted-foreground">{paper.description}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                  <a href={paper.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key BIPs */}
      <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-green-400" />
            Bitcoin Improvement Proposals (BIPs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            BIPs are the formal process for proposing changes to Bitcoin. Understanding key BIPs 
            is essential for developers and anyone following Bitcoin's technical evolution.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {keyBIPs.map((bip, i) => (
              <div key={i} className="bg-background/50 rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 font-mono">
                    {bip.number}
                  </Badge>
                  <span className="font-medium text-sm">{bip.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{bip.description}</p>
                <Badge variant="outline" className={`text-xs ${
                  bip.status === 'Final' ? 'bg-green-500/10 text-green-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {bip.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <a href="https://github.com/bitcoin/bips" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                View All BIPs on GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Developer Resources */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Developer Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {developerResources.map((resource, i) => (
              <a 
                key={i} 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-background/50 rounded-lg p-4 border border-border/50 hover:border-blue-500/30 transition-colors block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <resource.icon className="w-5 h-5 text-blue-400" />
                  <h5 className="font-medium text-sm">{resource.name}</h5>
                </div>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-400">
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video & Audio Resources */}
      <Card className="bg-gradient-to-br from-red-500/5 to-pink-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-400" />
            Video & Audio Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoResources.map((resource, i) => (
              <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  {resource.platform === 'YouTube' && <Youtube className="w-4 h-4 text-red-400" />}
                  {resource.platform === 'Coursera' && <GraduationCap className="w-4 h-4 text-blue-400" />}
                  {resource.platform === 'Podcast' && <Headphones className="w-4 h-4 text-purple-400" />}
                  <Badge variant="outline" className="text-xs">{resource.platform}</Badge>
                </div>
                <h5 className="font-medium text-sm mb-1">{resource.name}</h5>
                <p className="text-xs text-muted-foreground mb-1">by {resource.creator}</p>
                <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                <Badge variant="outline" className="text-xs bg-muted/50">
                  {resource.length}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practical Tools */}
      <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Practical Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practicalTools.map((tool, i) => (
              <a 
                key={i} 
                href={tool.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-background/50 rounded-lg p-4 border border-border/50 hover:border-yellow-500/30 transition-colors block"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{tool.name}</h5>
                  <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-yellow-400">
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Path */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            Recommended Learning Path
          </h4>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: 1, title: 'Foundation', items: ['Read "Inventing Bitcoin"', 'Watch MIT Blockchain course', 'Set up a testnet wallet'] },
              { step: 2, title: 'Intermediate', items: ['Read "Mastering Bitcoin"', 'Read the Whitepaper', 'Run a Bitcoin Core node'] },
              { step: 3, title: 'Advanced', items: ['Read "Programming Bitcoin"', 'Study key BIPs (141, 340-342)', 'Contribute to open source'] },
              { step: 4, title: 'Expert', items: ['Read academic papers', 'Lightning Network development', 'Bitcoin Core review'] }
            ].map((phase, i) => (
              <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    {phase.step}
                  </div>
                  <span className="font-medium">{phase.title}</span>
                </div>
                <ul className="space-y-1">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
