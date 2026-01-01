import { MinerFleetTestRunner } from '@/components/datacenter/MinerFleetTestRunner';

export default function MinerFleetTest() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Miner Fleet Management - Test Suite
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive testing for the Hydro Miner Fleet Management system
          </p>
        </div>
        
        <MinerFleetTestRunner />
      </div>
    </div>
  );
}
