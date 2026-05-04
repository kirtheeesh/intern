import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterSuccess() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-border p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Thank you for applying to the Aimstorm 15 Days Business Bootcamp. We have received your application and our team will review it shortly.
          </p>
          <p className="text-sm text-slate-500 mb-8 border-t border-b border-border py-4">
            We will contact you via email or phone regarding the next steps in the selection process.
          </p>
          
          <Link href="/">
            <Button size="lg" className="w-full">
              Return to Homepage
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}