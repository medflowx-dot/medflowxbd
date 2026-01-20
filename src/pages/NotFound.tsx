import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import logoAuth from '@/assets/logo-auth.png';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="text-center">
        <Link to="/" className="inline-block mb-6">
          <img src={logoAuth} alt="MedFlowx" className="h-16 w-16 mx-auto" />
        </Link>
        <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">পেজটি খুঁজে পাওয়া যায়নি</p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
