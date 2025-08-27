import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { LogOut, Check } from "lucide-react";

const Header = () => {
  const { user, handleLogOut } = useDynamicContext();

  return (
    <header className="w-full py-6 px-2 sm:px-6">
      <div className=" flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user && (
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-primary">The Split</h1>
            {user ? (
              <p className="text-sm text-muted-foreground">
                Smart wallet connected
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Batch payment app</p>
            )}
          </div>
        </div>
        {user && (
          <Button variant="ghost" size="sm" onClick={handleLogOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
