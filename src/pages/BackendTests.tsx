import { BackendTestRunner } from '@/components/aeso/BackendTestRunner';

export default function BackendTests() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <BackendTestRunner />
      </div>
    </div>
  );
}
