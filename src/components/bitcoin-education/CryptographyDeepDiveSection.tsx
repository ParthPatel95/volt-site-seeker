import { useState } from 'react';
import { Shield, Key, Lock, Hash, Fingerprint, Layers, Zap, Copy, Check, AlertTriangle, BookOpen, Binary } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BitcoinSectionWrapper, BitcoinSectionHeader, BitcoinKeyInsight } from './shared';

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

  const sha256Steps = [
    { step: 1, name: "Message Padding", description: "Pad message to 512-bit blocks, append length", example: "Hello → 48656C6C6F...80...00000028" },
    { step: 2, name: "Initialize Hash Values", description: "Set 8 initial hash values (h0-h7) from square roots of first 8 primes", example: "h0 = 6a09e667, h1 = bb67ae85..." },
    { step: 3, name: "Message Schedule", description: "Expand 16 words to 64 words using σ0 and σ1 functions", example: "W[16] = σ1(W[14]) + W[9] + σ0(W[1]) + W[0]" },
    { step: 4, name: "Compression Function", description: "64 rounds of mixing with Ch, Maj, Σ0, Σ1 functions", example: "T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]" },
    { step: 5, name: "Final Addition", description: "Add compressed values to initial hash", example: "H0 = h0 + a, H1 = h1 + b, ..." },
    { step: 6, name: "Concatenate Output", description: "Combine 8 32-bit words into 256-bit hash", example: "ba7816bf8f01cfea...→ 64 hex characters" }
  ];

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

  const curveParams = [
    { name: "p (Prime)", value: "2²⁵⁶ - 2³² - 977", description: "Field characteristic (prime number defining the finite field)", hex: "FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFC2F" },
    { name: "a", value: "0", description: "Curve coefficient (y² = x³ + ax + b)", hex: "0" },
    { name: "b", value: "7", description: "Curve coefficient (y² = x³ + 7)", hex: "7" },
    { name: "G (Generator)", value: "Base point coordinates", description: "Starting point for all key derivations", hex: "Gx = 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798" },
    { name: "n (Order)", value: "~2²⁵⁶", description: "Number of points on the curve (group order)", hex: "FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C D0364141" },
    { name: "h (Cofactor)", value: "1", description: "Cofactor of the curve", hex: "1" }
  ];

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

  const simulateHash = (input: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, 'a').substring(0, 64);
  };

  return (
    <BitcoinSectionWrapper theme="gradient" id="cryptography">
      <ScrollReveal>
        <BitcoinSectionHeader
          badge="Advanced Module"
          badgeIcon={Shield}
          title="Cryptography Deep Dive"
          description="Master the mathematical foundations that make Bitcoin secure: elliptic curves, digital signatures, and hash functions that would take billions of years to break."
          theme="light"
        />
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
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Hash className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                  SHA-256: The Foundation of Bitcoin Mining
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-base text-foreground leading-relaxed mb-4">
                    SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function that takes any input 
                    and produces a fixed 256-bit (32-byte) output. It's used in Bitcoin for:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-2 text-base">
                    <li className="flex items-center gap-2 text-foreground"><Check className="w-4 h-4 text-[hsl(var(--watt-success))]" /> Proof-of-work mining</li>
                    <li className="flex items-center gap-2 text-foreground"><Check className="w-4 h-4 text-[hsl(var(--watt-success))]" /> Transaction IDs (TXID)</li>
                    <li className="flex items-center gap-2 text-foreground"><Check className="w-4 h-4 text-[hsl(var(--watt-success))]" /> Block header hashing</li>
                    <li className="flex items-center gap-2 text-foreground"><Check className="w-4 h-4 text-[hsl(var(--watt-success))]" /> Merkle tree construction</li>
                    <li className="flex items-center gap-2 text-foreground"><Check className="w-4 h-4 text-[hsl(var(--watt-success))]" /> Address generation</li>
                    <li className="flex items-center gap-2 text-foreground"><Check className="w-4 h-4 text-[hsl(var(--watt-success))]" /> Script hashing (P2SH)</li>
                  </ul>
                </div>

                {/* Interactive Hash Demo */}
                <div className="bg-gradient-to-r from-[hsl(var(--watt-bitcoin)/0.05)] to-[hsl(var(--watt-bitcoin)/0.1)] rounded-xl p-6 border border-[hsl(var(--watt-bitcoin)/0.2)]">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Binary className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                    Interactive Hash Demonstration
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-base text-foreground mb-2 block font-medium">Input Message:</label>
                      <Input 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type anything..."
                        className="font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                      <span className="text-base text-foreground">Even a tiny change creates a completely different hash (avalanche effect)</span>
                    </div>
                    <div>
                      <label className="text-base text-foreground mb-2 block font-medium">SHA-256 Output (simulated):</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background p-3 rounded-lg text-sm font-mono text-[hsl(var(--watt-bitcoin))] break-all border border-border">
                          {simulateHash(inputText)}
                        </code>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(simulateHash(inputText))}
                        >
                          {copied ? <Check className="w-4 h-4 text-[hsl(var(--watt-success))]" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SHA-256 Algorithm Steps */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4 text-lg">SHA-256 Algorithm Steps</h4>
                  <div className="space-y-3">
                    {sha256Steps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">{step.name}</h5>
                          <p className="text-base text-muted-foreground">{step.description}</p>
                          <code className="text-sm text-[hsl(var(--watt-bitcoin)/0.8)] mt-1 block font-mono">{step.example}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Properties */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[hsl(var(--watt-success)/0.1)] rounded-lg p-4 border border-[hsl(var(--watt-success)/0.2)]">
                    <h5 className="font-medium text-[hsl(var(--watt-success))] mb-2">Deterministic</h5>
                    <p className="text-base text-foreground">Same input always produces same output</p>
                  </div>
                  <div className="bg-[hsl(var(--watt-trust)/0.1)] rounded-lg p-4 border border-[hsl(var(--watt-trust)/0.2)]">
                    <h5 className="font-medium text-[hsl(var(--watt-trust))] mb-2">One-Way</h5>
                    <p className="text-base text-foreground">Cannot reverse hash to find input</p>
                  </div>
                  <div className="bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg p-4 border border-[hsl(var(--watt-bitcoin)/0.2)]">
                    <h5 className="font-medium text-[hsl(var(--watt-bitcoin))] mb-2">Collision Resistant</h5>
                    <p className="text-base text-foreground">Infeasible to find two inputs with same hash</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ECDSA Tab */}
          <TabsContent value="ecdsa">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Key className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                  ECDSA & The secp256k1 Curve
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-base text-foreground leading-relaxed">
                    <strong>Elliptic Curve Digital Signature Algorithm (ECDSA)</strong> is the cryptographic algorithm 
                    that secures Bitcoin transactions. It uses the <strong>secp256k1</strong> curve, specifically chosen 
                    for its efficiency and security properties. The name comes from: <em>Standards for Efficient 
                    Cryptography, Prime field, 256-bit, Koblitz curve #1</em>.
                  </p>
                </div>

                {/* Curve Visualization */}
                <div className="bg-gradient-to-br from-[hsl(var(--watt-bitcoin)/0.05)] via-background to-[hsl(var(--watt-bitcoin)/0.1)] rounded-xl p-6 border border-[hsl(var(--watt-bitcoin)/0.2)]">
                  <h4 className="font-semibold text-foreground mb-4 text-lg">The secp256k1 Elliptic Curve</h4>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="aspect-square max-w-[300px] mx-auto bg-background rounded-lg border-2 border-[hsl(var(--watt-bitcoin)/0.3)] p-4 relative overflow-hidden">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <defs>
                            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(var(--watt-bitcoin))" stopOpacity="0.8"/>
                              <stop offset="100%" stopColor="hsl(var(--watt-bitcoin))" stopOpacity="0.3"/>
                            </linearGradient>
                          </defs>
                          <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5"/>
                          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5"/>
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
                          <circle cx="35" cy="35" r="3" fill="hsl(var(--watt-bitcoin))" />
                          <text x="38" y="33" fontSize="6" fill="hsl(var(--watt-bitcoin))">G</text>
                          <circle cx="60" cy="65" r="3" fill="hsl(var(--watt-success))" />
                          <text x="63" y="63" fontSize="6" fill="hsl(var(--watt-success))">K</text>
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        y² = x³ + 7 (mod p)
                      </p>
                    </div>
                    <div className="flex-1 space-y-3">
                      {curveParams.slice(0, 4).map((param, index) => (
                        <div key={index} className="bg-card rounded-lg p-3 border border-border">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-[hsl(var(--watt-bitcoin))]">{param.name}</span>
                            <span className="text-sm font-mono text-foreground">{param.value}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Generation Steps */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4 text-lg">Key Generation Process</h4>
                  <div className="space-y-4">
                    {ecdsaSteps.map((step, index) => (
                      <div key={index} className="bg-card rounded-lg p-4 border border-border">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-foreground mb-1">{step.name}</h5>
                            <p className="text-base text-muted-foreground mb-2">{step.description}</p>
                            <div className="flex flex-wrap gap-4">
                              <code className="text-sm bg-muted px-2 py-1 rounded text-[hsl(var(--watt-bitcoin))]">{step.formula}</code>
                              <span className="text-sm text-[hsl(var(--watt-success))]">🔒 {step.security}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <BitcoinKeyInsight type="insight" title="Why secp256k1?">
                  Bitcoin uses secp256k1 instead of the more common NIST curves because: (1) it wasn't designed by a government agency, reducing fears of backdoors, (2) its simple parameters (a=0, b=7) allow for efficient computation, and (3) it was already well-studied when Bitcoin launched.
                </BitcoinKeyInsight>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Types Tab */}
          <TabsContent value="address">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Fingerprint className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                  Bitcoin Address Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-base text-foreground leading-relaxed">
                    Bitcoin addresses are derived from public keys through a series of hashing steps. 
                    Different address types offer different features, security properties, and transaction fee costs.
                  </p>
                </div>

                <div className="space-y-4">
                  {addressTypes.map((addr, index) => (
                    <div key={index} className="bg-card rounded-xl p-5 border border-border hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="inline-block px-2 py-1 rounded text-sm font-bold bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] mb-2">
                            {addr.type}
                          </span>
                          <p className="text-base text-foreground">{addr.description}</p>
                        </div>
                        <code className="text-sm text-muted-foreground">{addr.prefix}</code>
                      </div>
                      <div className="bg-muted rounded-lg p-3 mb-3">
                        <p className="text-sm text-muted-foreground mb-1">Example Address:</p>
                        <code className="text-xs font-mono text-foreground break-all">{addr.example}</code>
                      </div>
                      <div className="bg-[hsl(var(--watt-bitcoin)/0.05)] rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Script:</p>
                        <code className="text-xs font-mono text-[hsl(var(--watt-bitcoin))]">{addr.script}</code>
                      </div>
                    </div>
                  ))}
                </div>

                <BitcoinKeyInsight type="success" title="Best Practice">
                  Use Taproot (bc1p...) addresses when your wallet supports them. They offer the best privacy, 
                  lowest fees, and future-proof compatibility with Bitcoin's evolving features.
                </BitcoinKeyInsight>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollReveal>

      {/* Schnorr vs ECDSA Comparison */}
      <ScrollReveal delay={150}>
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Layers className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              Schnorr Signatures vs ECDSA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-foreground font-bold">Feature</th>
                    <th className="text-center py-3 px-4 text-foreground font-bold">ECDSA</th>
                    <th className="text-center py-3 px-4 text-foreground font-bold">Schnorr</th>
                  </tr>
                </thead>
                <tbody>
                  {signatureComparison.map((row, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium text-foreground">{row.feature}</td>
                      <td className={`py-3 px-4 text-center ${row.advantage === 'ecdsa' ? 'bg-[hsl(var(--watt-success)/0.1)] font-bold text-[hsl(var(--watt-success))]' : 'text-muted-foreground'}`}>
                        {row.ecdsa}
                      </td>
                      <td className={`py-3 px-4 text-center ${row.advantage === 'schnorr' ? 'bg-[hsl(var(--watt-success)/0.1)] font-bold text-[hsl(var(--watt-success))]' : row.advantage === 'tie' ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {row.schnorr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Section Summary */}
      <ScrollReveal delay={200}>
        <SectionSummary
          title="Cryptography Summary"
          takeaways={[
            "SHA-256 provides the foundation for Bitcoin's proof-of-work and data integrity",
            "ECDSA with secp256k1 secures transactions through mathematically provable signatures",
            "Private keys generate public keys via one-way elliptic curve multiplication",
            "Address types have evolved from P2PKH to P2TR, improving privacy and efficiency",
            "Schnorr signatures (Taproot) offer key aggregation and improved privacy",
            "The cryptographic security is based on problems that would take billions of years to solve"
          ]}
          nextSteps={[{ title: "Consensus & Game Theory", href: "#consensus" }]}
        />
      </ScrollReveal>
    </BitcoinSectionWrapper>
  );
};

export default CryptographyDeepDiveSection;
