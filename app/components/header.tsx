const Header = () => {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">The Split</h1>
            <p className="text-sm text-muted-foreground">Batch Payment App</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
