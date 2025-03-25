import Link from "next/link";
import { LockIcon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <LockIcon className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="mt-6 text-2xl font-bold text-center text-gray-900">
          Erişim Reddedildi
        </h1>
        
        <p className="mt-3 text-center text-gray-600">
          Bu sayfaya erişmek için gerekli yetkiniz bulunmuyor. Lütfen sistem yöneticinize başvurun.
        </p>
        
        <div className="mt-8 flex justify-center">
          <Button asChild className="flex items-center">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 