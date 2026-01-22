import logoAuth from "@/assets/logo-auth.png";

export const BrandedLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="logo-loader">
      <img 
        src={logoAuth} 
        alt="Loading..." 
        className="w-16 h-16 sm:w-20 sm:h-20"
      />
    </div>
  </div>
);
