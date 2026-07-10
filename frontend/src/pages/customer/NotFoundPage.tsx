import { Link } from "react-router-dom";
import { Leaf, Home } from "lucide-react";
import Button from "@/components/common/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-pista-50 flex items-center justify-center mb-6 animate-float-slow">
        <Leaf className="w-9 h-9 text-pista-500" />
      </div>
      <h1 className="font-display text-4xl text-forest-700 mb-2">404</h1>
      <p className="text-brown-500 mb-8 max-w-sm">This page seems to have wandered off the farm. Let's get you back home.</p>
      <Link to="/"><Button icon={<Home className="w-4 h-4" />}>Back to Home</Button></Link>
    </div>
  );
}
