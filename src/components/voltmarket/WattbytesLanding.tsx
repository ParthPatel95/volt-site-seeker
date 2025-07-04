import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  BarChart3,
  MessageSquare,
  Search,
  DollarSign,
  Award,
  PlayCircle,
  MapPin,
  Calculator,
  Clock,
  Eye,
  Sparkles,
  ChevronDown,
  Battery,
  Lightbulb,
  Target
} from 'lucide-react';

export const WattbytesLanding: React.FC = () => {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    solutions: false,
    testimonials: false,
    cta: false
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target.getAttribute('data-section');
            if (target) {
              setIsVisible(prev => ({ ...prev, [target]: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      document.querySelectorAll('[data-section]').forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Battery,
      title: "Energy Analytics",
      description: "Real-time monitoring and optimization of power infrastructure with AI-driven insights",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Building2,
      title: "Smart Infrastructure",
      description: "Intelligent building management systems that reduce energy consumption by up to 40%",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Lightbulb,
      title: "Innovation Hub",
      description: "Cutting-edge solutions for renewable energy integration and grid optimization",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Shield,
      title: "Secure Operations",
      description: "Enterprise-grade security for critical energy infrastructure and data protection",
      color: "from-green-500 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Performance Metrics",
      description: "Comprehensive dashboards and reporting for energy efficiency optimization",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Target,
      title: "Strategic Planning",
      description: "Long-term energy strategy development with predictive modeling and forecasting",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  const stats = [
    { number: "40%", label: "Energy Savings", icon: Battery },
    { number: "500+", label: "Projects Completed", icon: Building2 },
    { number: "150+", label: "Enterprise Clients", icon: Users },
    { number: "24/7", label: "Monitoring", icon: Shield }
  ];

  const solutions = [
    {
      icon: Search,
      title: "Energy Auditing",
      description: "Comprehensive energy assessments to identify optimization opportunities and cost savings.",
      link: "/voltmarket/auth",
      buttonText: "Start Audit",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Grid Integration",
      description: "Seamless integration of renewable energy sources with existing power infrastructure.",
      link: "/voltmarket/auth",
      buttonText: "Learn More",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Building2,
      title: "Smart Buildings",
      description: "Intelligent automation systems for optimal energy management in commercial properties.",
      link: "/voltmarket/auth",
      buttonText: "Get Started",
      color: "from-green-500 to-green-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "GreenTech Industries",
      quote: "Wattbytes transformed our energy infrastructure, reducing costs by 35% while improving sustainability metrics across all facilities.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150"
    },
    {
      name: "Michael Rodriguez",
      company: "Urban Development Corp",
      quote: "The smart building solutions provided by Wattbytes have revolutionized how we manage our commercial properties.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    {
      name: "Emily Johnson",
      company: "Renewable Energy Partners",
      quote: "Outstanding analytics and monitoring capabilities. The platform provides insights we never had access to before.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-watt-gradient rounded-xl shadow-watt-glow">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-watt-primary">Wattbytes</span>
                  <span className="text-xs text-gray-500 -mt-1">Energy Intelligence</span>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#solutions" className="text-gray-600 hover:text-watt-primary transition-colors">Solutions</a>
              <a href="#features" className="text-gray-600 hover:text-watt-primary transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-watt-primary transition-colors">Testimonials</a>
              <Link to="/voltmarket/auth">
                <Button variant="outline" className="border-watt-primary text-watt-primary hover:bg-watt-primary hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/voltmarket/auth">
                <Button className="bg-watt-gradient hover:opacity-90 text-white shadow-watt-glow">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden" data-section="hero">
        <div className="absolute inset-0 bg-gradient-to-br from-watt-primary/5 via-watt-secondary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Animated Hero Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="p-6 bg-watt-gradient rounded-3xl shadow-2xl animate-glow">
                  <Battery className="w-16 h-16 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-watt-accent animate-bounce" />
              </div>
            </div>

            <Badge className="mb-6 bg-watt-primary/10 text-watt-primary border-watt-primary/20 hover:bg-watt-primary/20 transition-all duration-300">
              <Lightbulb className="w-4 h-4 mr-2" />
              Intelligent Energy Solutions
            </Badge>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Power Your</span>
              <br />
              <span className="bg-watt-gradient bg-clip-text text-transparent">
                Energy Future
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your energy infrastructure with AI-driven analytics, smart automation, 
              and sustainable solutions that reduce costs while maximizing efficiency.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search energy solutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-watt-primary transition-all duration-300"
                />
                {searchQuery && (
                  <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-watt-gradient hover:opacity-90">
                    Search
                  </Button>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/voltmarket/auth">
                <Button size="lg" className="group bg-watt-gradient hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-watt-glow hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-watt-primary text-watt-primary hover:bg-watt-primary hover:text-white font-semibold px-8 py-4 text-lg transition-all duration-300">
                Watch Demo
                <PlayCircle className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <Icon className="w-8 h-8 text-watt-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white" data-section="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-watt-secondary/10 text-watt-secondary border-watt-secondary/20">
              <Star className="w-4 h-4 mr-2" />
              Advanced Technology
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Intelligent Energy Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge solutions powered by AI and machine learning to optimize your energy infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 shadow-lg overflow-hidden ${isVisible.features ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardHeader className="text-center pb-4 relative">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-watt-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-gradient-to-r from-gray-50 to-blue-50" data-section="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.solutions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-watt-accent/10 text-watt-accent border-watt-accent/20">
              <Target className="w-4 h-4 mr-2" />
              Tailored Solutions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Solutions That Drive Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive energy solutions designed for modern businesses and infrastructure needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible.solutions ? 'animate-slide-in-left' : 'opacity-0'}`} style={{ animationDelay: `${index * 0.2}s` }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-3 bg-gradient-to-br ${solution.color} rounded-xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6 leading-relaxed">{solution.description}</p>
                    <Link to={solution.link}>
                      <Button className="w-full bg-watt-gradient hover:opacity-90 text-white group-hover:scale-105 transition-transform">
                        {solution.buttonText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white" data-section="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-green-100 text-green-600">
              <Star className="w-4 h-4 mr-2" />
              Client Success
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See how Wattbytes transforms energy management for businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={`hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible.testimonials ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-watt-gradient relative overflow-hidden" data-section="cta">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-1000 ${isVisible.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Energy Future?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join hundreds of companies already optimizing their energy infrastructure with Wattbytes
            </p>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-8 mb-8 flex-wrap">
              <div className="flex items-center text-white/90">
                <Shield className="w-5 h-5 mr-2" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center text-white/90">
                <Clock className="w-5 h-5 mr-2" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center text-white/90">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Proven Results</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/voltmarket/auth">
                <Button size="lg" className="bg-white text-watt-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-watt-primary font-semibold px-8 py-4 text-lg transition-all duration-300">
                Schedule Demo
              </Button>
            </div>
            
            <p className="text-blue-200 text-sm mt-6">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <Battery className="w-8 h-8 text-watt-accent mr-3" />
                <div>
                  <span className="text-2xl font-bold">Wattbytes</span>
                  <div className="text-gray-400 text-sm">Energy Intelligence</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Transforming energy infrastructure with intelligent solutions. 
                Empowering businesses to optimize performance and sustainability.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors cursor-pointer">Energy Auditing</div>
                <div className="hover:text-white transition-colors cursor-pointer">Grid Integration</div>
                <div className="hover:text-white transition-colors cursor-pointer">Smart Buildings</div>
                <div className="hover:text-white transition-colors cursor-pointer">Analytics</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors cursor-pointer">About Us</div>
                <div className="hover:text-white transition-colors cursor-pointer">Careers</div>
                <div className="hover:text-white transition-colors cursor-pointer">Contact</div>
                <Link to="/voltmarket/auth" className="block hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Wattbytes. All rights reserved. Powering the future of energy infrastructure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};