
import { Landing } from "@/pages/Landing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <Link to="/voltmarket">
          <Button variant="outline" className="bg-white/90 backdrop-blur-sm">
            VoltMarket →
          </Button>
        </Link>
      </div>
      <Landing />
    </div>
  );
};

export default Index;
