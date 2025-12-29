import { useState } from 'react';
import { Shield, Key, Lock, Hash, Fingerprint, Layers, Zap, Copy, Check, AlertTriangle, BookOpen, Binary } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CryptographyDeepDiveSection = () => {
  const [inputText, setInputText] = useState('Hello, Bitcoin!');
  const [copied, setCopied] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState<'ecdsa' | 'sha256' | 'address'>('sha256');

  const learningObjectives = [
    "Understand SHA-256 hashing and its role in Bitcoin's proof-of-work",
    "Master Elliptic Curve Digital Signature Algorithm (ECDSA) fundamentals",
    "Learn how secp256k1 curve parameters provide Bitcoin's security",
    "Trace the complete path from private key to Bitcoin address",
    "Understand Schnorr signatures and Taproot improvements",
    "Recognize why cryptographic security is computationally unbreakable"
  ];

  // Simulated SHA-256 visualization steps
  const sha256Steps = [
    { step: 1, name: "Message Padding", description: "Pad message to 512-bit blocks, append length", example: "Hello → 48656C6C6F...80...00000028" },
    { step: 2, name: "Initialize Hash Values", description: "Set 8 initial hash values (h0-h7) from square roots of first 8 primes", example: "h0 = 6a09e667, h1 = bb67ae85..." },
    { step: 3, name: "Message Schedule", description: "Expand 16 words to 64 words using σ0 and σ1 functions", example: "W[16] = σ1(W[14]) + W[9] + σ0(W[1]) + W[0]" },
    { step: 4, name: "Compression Function", description: "64 rounds of mixing with Ch, Maj, Σ0, Σ1 functions", example: "T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]" },
    { step: 5, name: "Final Addition", description: "Add compressed values to initial hash", example: "H0 = h0 + a, H1 = h1 + b, ..." },
    { step: 6, name: "Concatenate Output", description: "Combine 8 32-bit words into 256-bit hash", example: "ba7816bf8f01cfea...→ 64 hex characters" }
  ];

  // ECDSA key generation steps
  const ecdsaSteps = [
    { 
      step: 1, 
      name: "Generate Random Private Key", 
      description: "Select random 256-bit number k where 1 < k < n (curve order)",
      formula: "k ∈ {1, 2, ..., n-1}",
      security: "2^256 possible keys ≈ atoms in observable universe"
    },
    { 
      step: 2, 
      name: "Elliptic Curve Point Multiplication", 
      description: "Multiply generator point G by private key k to get public key K",
      formula: "K = k × G (on secp256k1 curve)",
      security: "Easy to compute forward, infeasible to reverse (ECDLP)"
    },
    { 
      step: 3, 
      name: "Public Key Compression", 
      description: "512-bit public key (x,y coordinates) can be compressed to 264 bits",
      formula: "K = 02/03 || x-coordinate (prefix indicates y parity)",
      security: "y² = x³ + 7 allows recovery of y from x"
    },
    { 
      step: 4, 
      name: "Hash Public Key", 
      description: "Apply SHA-256 then RIPEMD-160 to create public key hash",
      formula: "PKH = RIPEMD160(SHA256(K))",
      security: "160-bit hash provides address space of 2^160"
    },
    { 
      step: 5, 
      name: "Add Version & Checksum", 
      description: "Prepend version byte, append 4-byte checksum",
      formula: "address = Base58Check(version || PKH || checksum)",
      security: "Checksum detects typos with 99.99998% accuracy"
    }
  ];

  // secp256k1 curve parameters
  const curveParams = [
    { name: "p (Prime)", value: "2²⁵⁶ - 2³² - 977", description: "Field characteristic (prime number defining the finite field)", hex: "FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFC2F" },
    { name: "a", value: "0", description: "Curve coefficient (y² = x³ + ax + b)", hex: "0" },
    { name: "b", value: "7", description: "Curve coefficient (y² = x³ + 7)", hex: "7" },
    { name: "G (Generator)", value: "Base point coordinates", description: "Starting point for all key derivations", hex: "Gx = 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798" },
    { name: "n (Order)", value: "~2²⁵⁶", description: "Number of points on the curve (group order)", hex: "FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C D0364141" },
    { name: "h (Cofactor)", value: "1", description: "Cofactor of the curve", hex: "1" }
  ];

  // Schnorr vs ECDSA comparison
  const signatureComparison = [
    { feature: "Signature Size", ecdsa: "~71-72 bytes (DER encoded)", schnorr: "64 bytes (fixed)", advantage: "schnorr" },
    { feature: "Batch Verification", ecdsa: "Not possible", schnorr: "Aggregated verification", advantage: "schnorr" },
    { feature: "Key Aggregation", ecdsa: "Complex (MuSig)", schnorr: "Native support (MuSig2)", advantage: "schnorr" },
    { feature: "Linearity", ecdsa: "Non-linear", schnorr: "Linear (enables aggregation)", advantage: "schnorr" },
    { feature: "Security Proof", ecdsa: "Random Oracle Model", schnorr: "Standard Model possible", advantage: "schnorr" },
    { feature: "Bitcoin Support", ecdsa: "Since genesis (2009)", schnorr: "Since Taproot (Nov 2021)", advantage: "tie" }
  ];

  const addressTypes = [
    { 
      type: "P2PKH", 
      prefix: "1...", 
      example: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
      description: "Pay to Public Key Hash - Original address format",
      script: "OP_DUP OP_HASH160 <PKH> OP_EQUALVERIFY OP_CHECKSIG"
    },
    { 
      type: "P2SH", 
      prefix: "3...", 
      example: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
      description: "Pay to Script Hash - Enables multisig and complex scripts",
      script: "OP_HASH160 <ScriptHash> OP_EQUAL"
    },
    { 
      type: "P2WPKH", 
      prefix: "bc1q...", 
      example: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      description: "Native SegWit - Lower fees, better security",
      script: "0 <20-byte-key-hash>"
    },
    { 
      type: "P2TR", 
      prefix: "bc1p...", 
      example: "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0",
      description: "Taproot - Privacy, complex scripts look like simple payments",
      script: "1 <32-byte-output-key>"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate a simple hash visualization
  const simulateHash = (input: string) => {
    // This is a simplified visualization, not actual SHA-256
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, 'a').substring(0, 64);
  };

  return (
    <section id="cryptography" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Advanced Module
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cryptography Deep Dive
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Master the mathematical foundations that make Bitcoin secure: elliptic curves, 
              digital signatures, and hash functions that would take billions of years to break.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <LearningObjectives 
            objectives={learningObjectives}
            estimatedTime="45-60 minutes"
            prerequisites={[
              { title: "What is Bitcoin?", href: "#what-is-bitcoin" },
              { title: "How Bitcoin Works", href: "#how-it-works" }
            ]}
          />
        </ScrollReveal>

        {/* Interactive Visualization Tabs */}
        <ScrollReveal delay={100}>
          <Tabs defaultValue="sha256" className="mb-12" onValueChange={(v) => setActiveVisualization(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="sha256" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                SHA-256 Hashing
              </TabsTrigger>
              <TabsTrigger value="ecdsa" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                ECDSA & Keys
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Address Types
              </TabsTrigger>
            </TabsList>

            {/* SHA-256 Tab */}
            <TabsContent value="sha256">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-primary" />
                    SHA-256: The Foundation of Bitcoin Mining
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function that takes any input 
                      and produces a fixed 256-bit (32-byte) output. It's used in Bitcoin for:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Proof-of-work mining</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Transaction IDs (TXID)</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Block header hashing</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Merkle tree construction</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Address generation</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Script hashing (P2SH)</li>
                    </ul>
                  </div>

                  {/* Interactive Hash Demo */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Binary className="w-5 h-5 text-primary" />
                      Interactive Hash Demonstration
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Input Message:</label>
                        <Input 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Type anything..."
                          className="font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Even a tiny change creates a completely different hash (avalanche effect)</span>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">SHA-256 Output (simulated):</label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-background p-3 rounded-lg text-xs font-mono text-primary break-all border border-border">
                            {simulateHash(inputText)}
                          </code>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => copyToClipboard(simulateHash(inputText))}
                          >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SHA-256 Algorithm Steps */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">SHA-256 Algorithm Steps</h4>
                    <div className="space-y-3">
                      {sha256Steps.map((step, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground">{step.name}</h5>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            <code className="text-xs text-primary/80 mt-1 block font-mono">{step.example}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Properties */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <h5 className="font-medium text-green-600 dark:text-green-400 mb-2">Deterministic</h5>
                      <p className="text-sm text-muted-foreground">Same input always produces same output</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                      <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">One-Way</h5>
                      <p className="text-sm text-muted-foreground">Cannot reverse hash to find input</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                      <h5 className="font-medium text-purple-600 dark:text-purple-400 mb-2">Collision Resistant</h5>
                      <p className="text-sm text-muted-foreground">Infeasible to find two inputs with same hash</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ECDSA Tab */}
            <TabsContent value="ecdsa">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    ECDSA & The secp256k1 Curve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Elliptic Curve Digital Signature Algorithm (ECDSA)</strong> is the cryptographic algorithm 
                      that secures Bitcoin transactions. It uses the <strong>secp256k1</strong> curve, specifically chosen 
                      for its efficiency and security properties. The name comes from: <em>Standards for Efficient 
                      Cryptography, Prime field, 256-bit, Koblitz curve #1</em>.
                    </p>
                  </div>

                  {/* Curve Visualization */}
                  <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-xl p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-4">The secp256k1 Elliptic Curve</h4>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="aspect-square max-w-[300px] mx-auto bg-background rounded-lg border-2 border-primary/30 p-4 relative overflow-hidden">
                          {/* Simplified curve visualization */}
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                              </linearGradient>
                            </defs>
                            {/* Axes */}
                            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5"/>
                            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5"/>
                            {/* Curve approximation y² = x³ + 7 */}
                            <path 
                              d="M 20,50 Q 25,20 35,15 T 60,50 Q 65,80 75,85 T 95,50" 
                              fill="none" 
                              stroke="url(#curveGrad)" 
                              strokeWidth="2"
                            />
                            <path 
                              d="M 20,50 Q 25,80 35,85 T 60,50 Q 65,20 75,15 T 95,50" 
                              fill="none" 
                              stroke="url(#curveGrad)" 
                              strokeWidth="2"
                            />
                            {/* Generator point G */}
                            <circle cx="35" cy="30" r="3" fill="hsl(var(--primary))" />
                            <text x="40" y="28" className="text-[6px] fill-primary font-bold">G</text>
                            {/* Public key point K */}
                            <circle cx="70" cy="35" r="3" fill="hsl(142, 76%, 36%)" />
                            <text x="75" y="33" className="text-[6px] fill-green-600 font-bold">K</text>
                          </svg>
                          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                            y² = x³ + 7 (mod p)
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          The curve equation <code className="text-primary">y² = x³ + 7</code> over a finite field 
                          creates a set of points that form a mathematical group. Point multiplication on this 
                          curve is easy to compute forward but practically impossible to reverse.
                        </p>
                        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                              <strong className="text-amber-600 dark:text-amber-400">Security basis:</strong> Given K = k × G, 
                              finding k from K and G is the <em>Elliptic Curve Discrete Logarithm Problem (ECDLP)</em> — 
                              believed to require ~2¹²⁸ operations (computationally infeasible).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Curve Parameters */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">secp256k1 Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Parameter</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Value</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {curveParams.map((param, index) => (
                            <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-2 px-3 font-mono text-primary">{param.name}</td>
                              <td className="py-2 px-3">{param.value}</td>
                              <td className="py-2 px-3 text-muted-foreground hidden md:table-cell">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Generation Steps */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Key Generation Process</h4>
                    <div className="space-y-4">
                      {ecdsaSteps.map((step, index) => (
                        <div key={index} className="relative pl-8 pb-4 border-l-2 border-primary/30 last:border-l-0">
                          <div className="absolute -left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {step.step}
                          </div>
                          <div className="bg-card rounded-lg p-4 border border-border ml-2">
                            <h5 className="font-medium text-foreground mb-1">{step.name}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                            <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono block mb-2">
                              {step.formula}
                            </code>
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {step.security}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schnorr vs ECDSA */}
                  <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl p-6 border border-purple-500/20">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-500" />
                      Schnorr Signatures (Taproot Upgrade)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Bitcoin's Taproot upgrade (November 2021) introduced Schnorr signatures alongside ECDSA, 
                      offering improved efficiency, privacy, and enabling advanced smart contract capabilities.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Feature</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">ECDSA</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Schnorr</th>
                          </tr>
                        </thead>
                        <tbody>
                          {signatureComparison.map((row, index) => (
                            <tr key={index} className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium">{row.feature}</td>
                              <td className={`py-2 px-3 ${row.advantage === 'ecdsa' ? 'text-green-600 dark:text-green-400' : ''}`}>
                                {row.ecdsa}
                              </td>
                              <td className={`py-2 px-3 ${row.advantage === 'schnorr' ? 'text-green-600 dark:text-green-400' : ''}`}>
                                {row.schnorr}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Types Tab */}
            <TabsContent value="address">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    Bitcoin Address Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                      Bitcoin addresses have evolved through four generations, each improving on efficiency, 
                      security, or functionality. Understanding address types helps you identify transaction 
                      types and optimize fees.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {addressTypes.map((addr, index) => (
                      <div key={index} className="bg-card rounded-xl p-5 border border-border hover:border-primary/30 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-shrink-0">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-mono font-bold ${
                              index === 0 ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                              index === 1 ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                              index === 2 ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                              'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                            }`}>
                              {addr.type}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground font-medium mb-1">{addr.description}</p>
                            <p className="text-xs text-muted-foreground">Prefix: <span className="font-mono text-primary">{addr.prefix}</span></p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Example Address:</p>
                          <code className="text-xs font-mono text-primary/80 bg-primary/5 px-2 py-1 rounded block break-all">
                            {addr.example}
                          </code>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Locking Script:</p>
                          <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded block">
                            {addr.script}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address Evolution Timeline */}
                  <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-4">Address Evolution</h4>
                    <div className="flex items-center justify-between text-sm overflow-x-auto pb-2">
                      <div className="text-center px-4">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mx-auto mb-2"></div>
                        <p className="font-medium">2009</p>
                        <p className="text-xs text-muted-foreground">P2PKH</p>
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500"></div>
                      <div className="text-center px-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-2"></div>
                        <p className="font-medium">2012</p>
                        <p className="text-xs text-muted-foreground">P2SH (BIP 16)</p>
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
                      <div className="text-center px-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2"></div>
                        <p className="font-medium">2017</p>
                        <p className="text-xs text-muted-foreground">SegWit (BIP 141)</p>
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-purple-500"></div>
                      <div className="text-center px-4">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mx-auto mb-2"></div>
                        <p className="font-medium">2021</p>
                        <p className="text-xs text-muted-foreground">Taproot (BIP 341)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollReveal>

        {/* Security Analysis */}
        <ScrollReveal delay={150}>
          <div className="bg-gradient-to-br from-green-500/10 via-background to-blue-500/10 rounded-2xl p-8 border border-green-500/20 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-green-500" />
              Why Bitcoin's Cryptography is Unbreakable
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-2">Private Key Space</h4>
                  <p className="text-3xl font-bold text-primary mb-2">2²⁵⁶</p>
                  <p className="text-sm text-muted-foreground">
                    Possible private keys — more than atoms in the observable universe (≈10⁸⁰)
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-2">Brute Force Time</h4>
                  <p className="text-3xl font-bold text-primary mb-2">10⁶⁰+ years</p>
                  <p className="text-sm text-muted-foreground">
                    With all computers on Earth working together
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-2">Hash Collision</h4>
                  <p className="text-3xl font-bold text-primary mb-2">2¹²⁸ ops</p>
                  <p className="text-sm text-muted-foreground">
                    Birthday attack on SHA-256 (still computationally infeasible)
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-2">Quantum Threat</h4>
                  <p className="text-3xl font-bold text-amber-500 mb-2">Distant</p>
                  <p className="text-sm text-muted-foreground">
                    Would need ~1,500+ error-corrected qubits (current: ~1,000 noisy qubits)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Academic Resources */}
        <ScrollReveal delay={200}>
          <div className="bg-muted/30 rounded-xl p-6 border border-border mb-8">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Further Reading
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground mb-2">Academic Papers:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Nakamoto, S. (2008). "Bitcoin: A Peer-to-Peer Electronic Cash System"</li>
                  <li>• Koblitz, N. (1987). "Elliptic Curve Cryptosystems"</li>
                  <li>• FIPS 180-4: Secure Hash Standard (SHA-256 specification)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Recommended Books:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "Mastering Bitcoin" by Andreas Antonopoulos (Ch. 4)</li>
                  <li>• "Programming Bitcoin" by Jimmy Song</li>
                  <li>• "Bitcoin and Cryptocurrency Technologies" (Princeton)</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={250}>
          <SectionSummary
            takeaways={[
              "SHA-256 produces a unique 256-bit fingerprint of any data — mining involves finding hashes below a target",
              "ECDSA uses the secp256k1 elliptic curve to create unforgeable digital signatures from private keys",
              "Private keys are 256-bit random numbers; public keys are derived via one-way point multiplication",
              "Bitcoin addresses evolved from P2PKH (1...) to P2TR (bc1p...) for better efficiency and privacy",
              "Schnorr signatures (Taproot) enable key aggregation, batch verification, and advanced scripting",
              "Breaking Bitcoin's cryptography would require more computational power than exists in the universe"
            ]}
            proTip="Always use Taproot (bc1p...) addresses when possible — they offer the best privacy, lowest fees, and future-proof your transactions for advanced features."
            nextSteps={[
              { title: "Consensus & Game Theory", href: "#consensus" },
              { title: "Network Architecture", href: "#network" }
            ]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CryptographyDeepDiveSection;
