
import Landing from "@/pages/Landing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Link to="/voltmarket">
          <Button variant="outline" className="bg-white/90 backdrop-blur-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            VoltMarket →
          </Button>
        </Link>
        <Link to="/app">
          <Button variant="outline" className="bg-white/90 backdrop-blur-sm">
            VoltScout →
          </Button>
        </Link>
      </div>
      <Landing />
    </div>
  );
};

export default Index;
