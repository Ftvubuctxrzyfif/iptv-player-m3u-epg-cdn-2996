import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tv, Loader2, AlertCircle } from 'lucide-react';
import auth from '@/lib/shared/kliv-auth.js';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (showSignup) {
        // Sign up
        if (!formData.firstName.trim()) {
          setError('Please enter your first name');
          setIsLoading(false);
          return;
        }

        const result = await auth.signUp(
          formData.email,
          formData.password,
          `${formData.firstName} ${formData.lastName}`.trim()
        );

        toast.success('Account created successfully!');
        navigate('/app');
      } else {
        // Sign in
        await auth.signIn(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate('/app');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const message = error.message || 'Authentication failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setShowSignup(!showSignup);
    setError(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500/20 p-4 rounded-full">
              <Tv className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            IPTV Smarters Pro Style
          </CardTitle>
          <CardDescription className="text-gray-400">
            {showSignup
              ? 'Create your account to start watching'
              : 'Sign in to access your channels'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showSignup && (
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">Name</Label>
                <Input
                  id="firstName"
                  placeholder="Your Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isLoading}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                required
                minLength={8}
              />
              {!showSignup && (
                <p className="text-xs text-gray-400">
                  Forgot password? Check your email for reset link
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {showSignup ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                showSignup ? 'Create Account' : 'Sign In'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showSignup
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;