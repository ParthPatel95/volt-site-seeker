import { useState } from 'react';
import { Code, Lock, Unlock, Key, FileCode, Layers, ArrowRight, Play, CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const BitcoinScriptingSection = () => {
  const [selectedOpcode, setSelectedOpcode] = useState<string | null>(null);
  const [scriptStep, setScriptStep] = useState(0);

  const learningObjectives = [
    "Understand Bitcoin's stack-based scripting language",
    "Learn common transaction types: P2PKH, P2SH, P2WPKH, P2TR",
    "Explore advanced scripts: multisig, timelocks, HTLCs",
    "Understand the UTXO model and transaction structure",
    "See how Taproot enables private complex contracts",
    "Trace script execution step-by-step"
  ];

  // Common opcodes
  const opcodes = [
    { name: 'OP_DUP', hex: '0x76', description: 'Duplicate the top stack item', category: 'Stack' },
    { name: 'OP_HASH160', hex: '0xa9', description: 'SHA256 + RIPEMD160 hash of top item', category: 'Crypto' },
    { name: 'OP_EQUALVERIFY', hex: '0x88', description: 'Check equality and fail if not equal', category: 'Logic' },
    { name: 'OP_CHECKSIG', hex: '0xac', description: 'Verify signature against public key', category: 'Crypto' },
    { name: 'OP_CHECKMULTISIG', hex: '0xae', description: 'Verify m-of-n multisig', category: 'Crypto' },
    { name: 'OP_IF / OP_ELSE', hex: '0x63/0x67', description: 'Conditional execution', category: 'Flow' },
    { name: 'OP_CHECKLOCKTIMEVERIFY', hex: '0xb1', description: 'Fail if locktime not reached (CLTV)', category: 'Timelock' },
    { name: 'OP_CHECKSEQUENCEVERIFY', hex: '0xb2', description: 'Relative timelock (CSV)', category: 'Timelock' },
    { name: 'OP_RETURN', hex: '0x6a', description: 'Mark output as unspendable (data storage)', category: 'Other' },
    { name: 'OP_EQUAL', hex: '0x87', description: 'Check if top two items are equal', category: 'Logic' }
  ];

  // Transaction types
  const transactionTypes = [
    {
      name: 'P2PKH',
      fullName: 'Pay to Public Key Hash',
      prefix: '1...',
      description: 'Original Bitcoin address format. Requires signature matching the public key hash.',
      lockingScript: 'OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG',
      unlockingScript: '<sig> <pubKey>',
      size: '~148 vbytes',
      pros: ['Universal support', 'Simple to understand'],
      cons: ['Larger transaction size', 'No script flexibility']
    },
    {
      name: 'P2SH',
      fullName: 'Pay to Script Hash',
      prefix: '3...',
      description: 'Sender pays to hash of a script. Enables multisig and complex conditions.',
      lockingScript: 'OP_HASH160 <scriptHash> OP_EQUAL',
      unlockingScript: '<signatures...> <redeemScript>',
      size: '~297 vbytes (2-of-3)',
      pros: ['Enables multisig', 'Complex scripts possible', 'Receiver bears script complexity cost'],
      cons: ['Larger than native SegWit', 'Script revealed on spend']
    },
    {
      name: 'P2WPKH',
      fullName: 'Pay to Witness Public Key Hash',
      prefix: 'bc1q...',
      description: 'Native SegWit single-sig. Signature data in witness, reducing fees.',
      lockingScript: '0 <20-byte-pubKeyHash>',
      unlockingScript: 'witness: <sig> <pubKey>',
      size: '~68 vbytes',
      pros: ['~40% smaller than P2PKH', 'Lower fees', 'Malleability fixed'],
      cons: ['Not all wallets support']
    },
    {
      name: 'P2TR',
      fullName: 'Pay to Taproot',
      prefix: 'bc1p...',
      description: 'Taproot output. Key spend looks identical to script spend for privacy.',
      lockingScript: '1 <32-byte-output-key>',
      unlockingScript: 'witness: <signature> (key path) OR <script> <control-block>',
      size: '~57.5 vbytes (key path)',
      pros: ['Most private', 'Smallest size', 'Complex scripts look simple', 'Schnorr signatures'],
      cons: ['Newest - some services don\'t support yet']
    }
  ];

  // P2PKH script execution example
  const p2pkhExecution = [
    { step: 0, operation: 'Initial Stack', stack: ['<sig>', '<pubKey>'], script: 'OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG' },
    { step: 1, operation: 'OP_DUP', stack: ['<sig>', '<pubKey>', '<pubKey>'], script: 'OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG' },
    { step: 2, operation: 'OP_HASH160', stack: ['<sig>', '<pubKey>', '<pubKeyHash>'], script: '<pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG' },
    { step: 3, operation: 'Push <pubKeyHash>', stack: ['<sig>', '<pubKey>', '<pubKeyHash>', '<expected-pubKeyHash>'], script: 'OP_EQUALVERIFY OP_CHECKSIG' },
    { step: 4, operation: 'OP_EQUALVERIFY', stack: ['<sig>', '<pubKey>'], script: 'OP_CHECKSIG' },
    { step: 5, operation: 'OP_CHECKSIG', stack: ['TRUE'], script: '(empty)' }
  ];

  // Advanced script examples
  const advancedScripts = [
    {
      name: '2-of-3 Multisig',
      description: 'Requires 2 signatures from 3 possible signers. Common for shared custody.',
      script: 'OP_2 <pubKey1> <pubKey2> <pubKey3> OP_3 OP_CHECKMULTISIG',
      useCase: 'Shared business accounts, inheritance planning, escrow'
    },
    {
      name: 'Hash Time-Locked Contract (HTLC)',
      description: 'Funds claimable with secret (hashlock) OR after timeout. Foundation of Lightning.',
      script: 'OP_IF OP_HASH160 <hash> OP_EQUALVERIFY <receiverPubKey> OP_ELSE <timeout> OP_CLTV OP_DROP <senderPubKey> OP_ENDIF OP_CHECKSIG',
      useCase: 'Atomic swaps, Lightning payments, trustless trading'
    },
    {
      name: 'Timelock (CLTV)',
      description: 'Funds locked until a specific block height or timestamp.',
      script: '<locktime> OP_CHECKLOCKTIMEVERIFY OP_DROP <pubKey> OP_CHECKSIG',
      useCase: 'Vesting schedules, inheritance, time-delayed spending'
    },
    {
      name: 'Relative Timelock (CSV)',
      description: 'Funds locked for a period after the UTXO was created.',
      script: '<relative-blocks> OP_CHECKSEQUENCEVERIFY OP_DROP <pubKey> OP_CHECKSIG',
      useCase: 'Lightning channel revocation, delayed recovery paths'
    }
  ];

  // UTXO model explanation
  const utxoExplanation = [
    { concept: 'Unspent Transaction Output', description: 'Every bitcoin exists as an unspent output from a previous transaction' },
    { concept: 'No "Balance"', description: 'Wallets sum up UTXOs they can spend — there is no account balance in Bitcoin' },
    { concept: 'Full Consumption', description: 'UTXOs must be spent entirely — "change" goes to a new output you control' },
    { concept: 'Parallel Verification', description: 'UTXOs can be validated independently, enabling parallel processing' }
  ];

  return (
    <section id="scripting" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
              <Code className="w-4 h-4" />
              Advanced Module
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bitcoin Script & Transactions
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore Bitcoin's stack-based programming language — the simple yet powerful scripting system 
              that enables everything from basic payments to complex smart contracts.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <LearningObjectives 
            objectives={learningObjectives}
            estimatedTime="45-55 minutes"
            prerequisites={[
              { title: "Cryptography Deep Dive", href: "#cryptography" },
              { title: "Network Architecture", href: "#network" }
            ]}
          />
        </ScrollReveal>

        {/* UTXO Model */}
        <ScrollReveal delay={100}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                The UTXO Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  Unlike account-based systems (like Ethereum or your bank), Bitcoin uses the 
                  <strong className="text-foreground"> Unspent Transaction Output (UTXO)</strong> model. 
                  Think of UTXOs like physical coins — you can't "send half a coin," you spend the whole thing 
                  and receive change.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {utxoExplanation.map((item, index) => (
                  <div key={index} className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-foreground mb-2">{item.concept}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>

              {/* Visual UTXO Example */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-4">Example: Spending UTXOs</h4>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30 text-center">
                      <p className="text-xs text-muted-foreground">Input UTXO #1</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">0.5 BTC</p>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30 text-center">
                      <p className="text-xs text-muted-foreground">Input UTXO #2</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">0.3 BTC</p>
                    </div>
                  </div>
                  <div className="text-4xl text-primary">→</div>
                  <div className="bg-primary/20 rounded-lg p-4 border border-primary/30 text-center">
                    <p className="text-xs text-muted-foreground">Transaction</p>
                    <p className="text-sm font-medium text-primary">Spending 0.8 BTC</p>
                    <p className="text-xs text-muted-foreground mt-1">Fee: 0.0001 BTC</p>
                  </div>
                  <div className="text-4xl text-primary">→</div>
                  <div className="flex flex-col gap-2">
                    <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30 text-center">
                      <p className="text-xs text-muted-foreground">Output: Recipient</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">0.6 BTC</p>
                    </div>
                    <div className="bg-amber-500/20 rounded-lg p-3 border border-amber-500/30 text-center">
                      <p className="text-xs text-muted-foreground">Output: Change</p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">0.1999 BTC</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Transaction Types */}
        <ScrollReveal delay={150}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                Transaction Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="P2PKH">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {transactionTypes.map((type) => (
                    <TabsTrigger key={type.name} value={type.name}>
                      {type.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {transactionTypes.map((type) => (
                  <TabsContent key={type.name} value={type.name}>
                    <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{type.fullName}</h3>
                          <p className="text-sm text-muted-foreground">Address prefix: <code className="text-primary">{type.prefix}</code></p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{type.size}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{type.description}</p>

                      <div className="space-y-3 mb-4">
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locking Script (scriptPubKey)
                          </p>
                          <code className="text-xs font-mono text-primary break-all">{type.lockingScript}</code>
                        </div>
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Unlocking Script (scriptSig / witness)
                          </p>
                          <code className="text-xs font-mono text-green-600 dark:text-green-400 break-all">{type.unlockingScript}</code>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">Advantages</p>
                          <ul className="space-y-1">
                            {type.pros.map((pro, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" /> {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">Considerations</p>
                          <ul className="space-y-1">
                            {type.cons.map((con, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-amber-500" /> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Script Execution Visualization */}
        <ScrollReveal delay={200}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-500" />
                Script Execution: P2PKH Step-by-Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 border border-border mb-6">
                <p className="text-sm text-muted-foreground">
                  Bitcoin Script is a stack-based language. Operations push data onto the stack or pop 
                  values off to perform computations. A script succeeds if it leaves a non-zero value on top.
                </p>
              </div>

              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {p2pkhExecution.map((step, index) => (
                  <Button
                    key={index}
                    variant={scriptStep === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScriptStep(index)}
                    className="flex-shrink-0"
                  >
                    {index === 0 ? 'Start' : `Step ${index}`}
                  </Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg p-5 border border-border">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Stack
                  </h4>
                  <div className="space-y-2">
                    {p2pkhExecution[scriptStep].stack.slice().reverse().map((item, index) => (
                      <div 
                        key={index} 
                        className={`bg-primary/10 border border-primary/20 rounded p-2 text-sm font-mono text-primary text-center ${
                          index === 0 ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                    {p2pkhExecution[scriptStep].stack.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">(empty)</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-5 border border-border">
                    <h4 className="font-medium text-foreground mb-2">Current Operation</h4>
                    <p className="text-lg font-mono text-primary">{p2pkhExecution[scriptStep].operation}</p>
                  </div>
                  <div className="bg-card rounded-lg p-5 border border-border">
                    <h4 className="font-medium text-foreground mb-2">Remaining Script</h4>
                    <code className="text-xs font-mono text-muted-foreground break-all">
                      {p2pkhExecution[scriptStep].script || '(execution complete)'}
                    </code>
                  </div>
                  {scriptStep === p2pkhExecution.length - 1 && (
                    <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="font-medium text-green-600 dark:text-green-400">Script Valid!</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stack contains TRUE — the signature is valid and the funds can be spent.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Opcodes Reference */}
        <ScrollReveal delay={250}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Common Opcodes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {opcodes.map((opcode, index) => (
                  <div 
                    key={index} 
                    className="bg-card rounded-lg p-3 border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOpcode(selectedOpcode === opcode.name ? null : opcode.name)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono font-bold text-primary">{opcode.name}</code>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{opcode.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{opcode.description}</p>
                    <code className="text-xs text-muted-foreground/60">{opcode.hex}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Advanced Scripts */}
        <ScrollReveal delay={300}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Advanced Script Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {advancedScripts.map((script, index) => (
                <div key={index} className="bg-card rounded-xl p-5 border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      {script.name.includes('Multisig') && <Users className="w-5 h-5 text-blue-500" />}
                      {script.name.includes('HTLC') && <Lock className="w-5 h-5 text-purple-500" />}
                      {script.name.includes('CLTV') && <Clock className="w-5 h-5 text-amber-500" />}
                      {script.name.includes('CSV') && <Clock className="w-5 h-5 text-green-500" />}
                      <h4 className="font-medium text-foreground">{script.name}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{script.description}</p>
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <code className="text-xs font-mono text-primary break-all">{script.script}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Use cases:</strong> {script.useCase}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Taproot Benefits */}
        <ScrollReveal delay={350}>
          <div className="bg-gradient-to-br from-purple-500/10 via-background to-primary/10 rounded-2xl p-8 border border-purple-500/20 mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Layers className="w-6 h-6 text-purple-500" />
              Taproot: The Future of Bitcoin Smart Contracts
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-2">Key Path Spending</h4>
                  <p className="text-sm text-muted-foreground">
                    When all parties agree, a simple Schnorr signature spends the output. Complex scripts 
                    remain hidden — the transaction looks like any simple payment.
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-2">Script Path Spending</h4>
                  <p className="text-sm text-muted-foreground">
                    If consensus fails, reveal only the script branch used. Unused branches stay private, 
                    reducing blockchain bloat and preserving privacy.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Privacy Gains</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multisig looks identical to single-sig</li>
                    <li>• Complex contracts look like simple payments</li>
                    <li>• Only used script path revealed</li>
                  </ul>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Efficiency Gains</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Schnorr signatures are smaller</li>
                    <li>• Key aggregation for multisig</li>
                    <li>• Batch verification speeds up validation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <SectionSummary
            takeaways={[
              "Bitcoin uses the UTXO model — coins are 'spent' entirely with change returned to you",
              "Bitcoin Script is a stack-based language with ~100 opcodes for expressing spending conditions",
              "P2PKH, P2SH, P2WPKH, P2TR represent the evolution of Bitcoin transaction types",
              "Advanced scripts enable multisig, timelocks, and Hash Time-Locked Contracts (HTLCs)",
              "Taproot combines Schnorr signatures with MAST trees for privacy and efficiency",
              "The best-case (key path) in Taproot looks identical to a simple single-sig transaction"
            ]}
            proTip="When building applications, always use P2TR (Taproot) addresses. They're the smallest, most private, and most future-proof. Even for simple payments, you benefit from the reduced fees."
            nextSteps={[
              { title: "Lightning Network", href: "#lightning" },
              { title: "Bitcoin Privacy", href: "#privacy" }
            ]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BitcoinScriptingSection;
