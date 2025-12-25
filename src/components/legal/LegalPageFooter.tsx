import { Link } from 'react-router-dom';

export const LegalPageFooter = () => {
  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-16">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} WattByte
          </p>
        </div>
      </div>
    </footer>
  );
};
