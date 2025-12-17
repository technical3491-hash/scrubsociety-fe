import Navbar from '../Navbar';

export default function NavbarExample() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2 px-4">Logged in state:</p>
        <Navbar isLoggedIn={true} />
      </div>
      <div className="mt-20">
        <p className="text-sm text-muted-foreground mb-2 px-4">Logged out state:</p>
        <Navbar isLoggedIn={false} />
      </div>
    </div>
  );
}
