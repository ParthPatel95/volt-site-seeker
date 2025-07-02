
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Shield, 
  MessageSquare, 
  FileText, 
  Wrench, 
  Brain,
  CheckCircle,
  Star,
  Users,
  Building,
  Zap,
  Globe,
  ArrowRight,
  TrendingUp,
  Mail
} from 'lucide-react';

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ 
  end, 
  suffix = '', 
  duration = 2000 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

// Feature Card Component
const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay?: number;
}> = ({ icon, title, description, delay = 0 }) => (
  <Card 
    className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-slate-200 hover:border-blue-300"
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardContent className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 text-blue-600 group-hover:text-blue-700 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

// Testimonial Card Component
const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  title: string;
  company: string;
}> = ({ quote, author, title, company }) => (
  <Card className="bg-white shadow-md">
    <CardContent className="p-6">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-gray-700 mb-4 italic">"{quote}"</blockquote>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">{title}, {company}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const VoltMarketLandingPage: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic would go here
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VoltMarket</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/voltmarket/auth" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link to="/voltmarket/auth">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="outline" className="mb-6 text-blue-700 border-blue-200">
              🚀 Now Live - Join 1,000+ Early Users
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The Global Marketplace for<br />
              <span className="text-blue-600">Data Center & Crypto Sites</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover, list, and transact powered infrastructure assets—all in one place. 
              Connect with verified buyers and sellers in the energy infrastructure space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/voltmarket/auth">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/voltmarket/listings">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg">
                  Browse Listings
                </Button>
              </Link>
            </div>
            
            {/* Hero Visual Mockup */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Texas Data Center</h3>
                          <p className="text-sm text-gray-600">25MW Available</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        For Sale
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Zap className="w-8 h-8 text-purple-600" />
                        <div>
                          <h3 className="font-semibold">Hosting Services</h3>
                          <p className="text-sm text-gray-600">$0.045/kWh</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Available
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Wrench className="w-8 h-8 text-orange-600" />
                        <div>
                          <h3 className="font-semibold">ASIC Miners</h3>
                          <p className="text-sm text-gray-600">S19 Pro Fleet</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        Equipment
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 mb-8 text-lg">
            Trusted by energy developers, miners, brokers, and infrastructure investors
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">PARTNER {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Trade Infrastructure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools and security features needed for successful infrastructure transactions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="w-full h-full" />}
              title="Global Search Engine"
              description="Find sites, hosting services, and equipment with advanced filters for power capacity, location, and pricing."
              delay={0}
            />
            <FeatureCard
              icon={<Shield className="w-full h-full" />}
              title="Secure DD Document Vault"
              description="Share confidential due diligence documents with NDA control and watermarked access tracking."
              delay={100}
            />
            <FeatureCard
              icon={<MessageSquare className="w-full h-full" />}
              title="In-App Messaging"
              description="Communicate directly with verified buyers and sellers through our secure messaging system."
              delay={200}
            />
            <FeatureCard
              icon={<FileText className="w-full h-full" />}
              title="LOI Management"
              description="Submit and manage Letters of Intent directly on the platform with digital signature support."
              delay={300}
            />
            <FeatureCard
              icon={<Wrench className="w-full h-full" />}
              title="Equipment Marketplace"
              description="Buy and sell ASICs, cooling systems, transformers, and other infrastructure equipment."
              delay={400}
            />
            <FeatureCard
              icon={<Brain className="w-full h-full" />}
              title="Expert Consulting"
              description="Access professional deal support and consulting services from industry experts."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powering the Infrastructure Economy
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of professionals already using VoltMarket
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                <AnimatedCounter end={700} suffix="+" />
              </div>
              <p className="text-blue-100">MW of Power Listed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                <AnimatedCounter end={500} suffix="+" />
              </div>
              <p className="text-blue-100">Site Listings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                <AnimatedCounter end={1000} suffix="+" />
              </div>
              <p className="text-blue-100">Registered Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                <AnimatedCounter end={100} suffix="+" />
              </div>
              <p className="text-blue-100">Equipment Listings</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How VoltMarket Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Account</h3>
              <p className="text-gray-600">
                Sign up for free as a buyer or seller. Verify your identity to access premium features and build trust.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">List or Browse</h3>
              <p className="text-gray-600">
                Post your infrastructure assets or search through hundreds of verified listings with detailed specifications.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Close Deals</h3>
              <p className="text-gray-600">
                Message counterparties, share due diligence documents, and submit LOIs to complete transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from infrastructure professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="VoltMarket helped us sell our unused crypto site in under 60 days — the DD access system was a game changer."
              author="Sarah Chen"
              title="Infrastructure Director"
              company="PowerGen Solutions"
            />
            <TestimonialCard
              quote="The platform's verification system gives us confidence when evaluating new hosting partnerships. Highly recommended."
              author="Michael Rodriguez"
              title="Operations Manager"
              company="CryptoMine Corp"
            />
            <TestimonialCard
              quote="Finally, a marketplace built specifically for our industry. The equipment section saved us thousands on our last purchase."
              author="Jennifer Walsh"
              title="Procurement Lead"
              company="DataCenter Dynamics"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Completely Free to Use
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            VoltMarket is 100% free to browse and post listings. We only offer paid consulting 
            services if you need expert help closing a deal.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="border-2 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Access</h3>
                <div className="text-4xl font-bold text-blue-600 mb-6">FREE</div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    Unlimited browsing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    List your assets
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    Secure messaging
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    Basic DD sharing
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Consulting</h3>
                <div className="text-2xl font-bold text-gray-600 mb-6">Custom Pricing</div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    Deal structuring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    Technical DD review
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    Market analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    Transaction support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to List or Discover Your Next Site?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            It takes 30 seconds to sign up and start exploring.
          </p>
          <Link to="/voltmarket/auth">
            <Button size="lg" variant="outline" className="px-12 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100">
              Join VoltMarket Now — It's Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VM</span>
                </div>
                <span className="text-xl font-bold">VoltMarket</span>
              </div>
              <p className="text-gray-400 mb-4">
                The global marketplace for power infrastructure assets.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/voltmarket/listings" className="hover:text-white transition-colors">Browse Listings</Link></li>
                <li><Link to="/voltmarket/auth" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/voltmarket/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Stay Updated</h3>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button type="submit" size="sm" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VoltMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
