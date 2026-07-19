import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-5 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-forest-700 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl text-forest-700 mb-1">Choose a new password</h1>
          <p className="text-sm text-brown-500">Make it strong — you&apos;ll use it to log in from now on.</p>
        </div>
        <div className="rounded-3xl bg-white shadow-soft p-5 sm:p-8">
          <ResetPasswordForm />
        </div>
        <p className="text-center text-sm text-brown-500 mt-4 sm:mt-6">
          <Link to="/login" className="font-semibold text-pista-700 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
